import json
import base64
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone
from django.core.files.base import ContentFile
from .models import ChatRoom, Message, FileAttachment, UserStatus
from accounts.models import User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        
        # Check if user is authenticated
        if self.scope['user'] == AnonymousUser():
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Update user status to online
        await self.update_user_status('online')
        
        # Notify others that user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status',
                'user_id': self.scope['user'].id,
                'username': self.scope['user'].username,
                'status': 'online'
            }
        )
    
    async def disconnect(self, close_code):
        # Update user status to offline
        if hasattr(self, 'scope') and self.scope['user'] != AnonymousUser():
            await self.update_user_status('offline')
            
            # Notify others that user left
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status',
                    'user_id': self.scope['user'].id,
                    'username': self.scope['user'].username,
                    'status': 'offline'
                }
            )
        
        # Leave room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'file_message':
                await self.handle_file_message(data)
            elif message_type == 'typing_start':
                await self.handle_typing_indicator(data, True)
            elif message_type == 'typing_stop':
                await self.handle_typing_indicator(data, False)
            elif message_type == 'mark_read':
                await self.handle_mark_read(data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
    
    async def handle_chat_message(self, data):
        message_content = data['message']
        
        # Save message to database
        message = await self.save_message(
            content=message_content,
            message_type='text'
        )
        
        if message:
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message_id': message.id,
                    'message': message_content,
                    'sender': self.scope['user'].username,
                    'sender_id': self.scope['user'].id,
                    'timestamp': message.timestamp.isoformat(),
                    'message_type': 'text'
                }
            )
    
    async def handle_file_message(self, data):
        try:
            file_data = data['file_data']  # base64 encoded file
            file_name = data['file_name']
            file_type = data.get('file_type', 'application/octet-stream')
            
            # Decode base64 file
            file_content = base64.b64decode(file_data)
            
            # Check file size (10MB limit)
            if len(file_content) > 10 * 1024 * 1024:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'File size exceeds 10MB limit'
                }))
                return
            
            # Save message and file
            message = await self.save_message(
                content=f"Shared a file: {file_name}",
                message_type='file'
            )
            
            if message:
                # Save file attachment
                file_attachment = await self.save_file_attachment(
                    message, file_content, file_name, file_type
                )
                
                # Send file message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'file_message',
                        'message_id': message.id,
                        'message': message.content,
                        'sender': self.scope['user'].username,
                        'sender_id': self.scope['user'].id,
                        'timestamp': message.timestamp.isoformat(),
                        'file_name': file_name,
                        'file_size': len(file_content),
                        'file_type': file_type,
                        'file_url': file_attachment.file.url if file_attachment else None,
                        'message_type': 'file'
                    }
                )
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error processing file: {str(e)}'
            }))
    
    async def handle_typing_indicator(self, data, is_typing):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': self.scope['user'].id,
                'username': self.scope['user'].username,
                'is_typing': is_typing
            }
        )
    
    async def handle_mark_read(self, data):
        message_id = data.get('message_id')
        if message_id:
            await self.mark_message_as_read(message_id)
    
    # Event handlers for group messages
    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))
    
    async def file_message(self, event):
        await self.send(text_data=json.dumps(event))
    
    async def user_status(self, event):
        await self.send(text_data=json.dumps(event))
    
    async def typing_indicator(self, event):
        # Don't send typing indicator back to the sender
        if event['user_id'] != self.scope['user'].id:
            await self.send(text_data=json.dumps(event))
    
    async def user_update(self, event):
        # Send user update to all participants
        await self.send(text_data=json.dumps(event))
    
    async def user_profile_update(self, event):
        # Send user profile update to all participants
        await self.send(text_data=json.dumps(event))
    
    # Database operations
    @database_sync_to_async
    def save_message(self, content, message_type):
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            message = Message.objects.create(
                room=room,
                sender=self.scope['user'],
                content=content,
                message_type=message_type
            )
            # Update room's updated_at timestamp
            room.save()
            return message
        except ChatRoom.DoesNotExist:
            return None
    
    @database_sync_to_async
    def save_file_attachment(self, message, file_content, file_name, file_type):
        try:
            # Create ContentFile from binary data
            django_file = ContentFile(file_content, name=file_name)
            
            file_attachment = FileAttachment(
                message=message,
                file_type=file_type
            )
            file_attachment.file.save(file_name, django_file, save=True)
            return file_attachment
        except Exception as e:
            print(f"Error saving file: {e}")
            return None
    
    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        try:
            message = Message.objects.get(id=message_id)
            message.mark_as_read(self.scope['user'])
        except Message.DoesNotExist:
            pass
    
    @database_sync_to_async
    def update_user_status(self, status):
        user_status, created = UserStatus.objects.get_or_create(
            user=self.scope['user'],
            defaults={'status': status}
        )
        if not created:
            user_status.status = status
            user_status.save()


class ChatListConsumer(AsyncWebsocketConsumer):
    """Consumer for real-time chat list updates."""
    
    async def connect(self):
        if self.scope['user'] == AnonymousUser():
            await self.close()
            return
        
        self.user_group_name = f'user_{self.scope["user"].id}'
        
        # Join user's personal group for chat list updates
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        # Handle any client messages if needed
        pass
    
    # Event handlers
    async def chat_list_update(self, event):
        await self.send(text_data=json.dumps(event))
