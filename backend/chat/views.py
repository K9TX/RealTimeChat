from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.db.models import Q, Max
from django.shortcuts import get_object_or_404
from .models import ChatRoom, Message, FileAttachment
from .serializers import (
    ChatRoomSerializer, CreateChatRoomSerializer, MessageSerializer,
    FileAttachmentSerializer, UserSearchSerializer
)

User = get_user_model()

class ChatRoomListView(generics.ListCreateAPIView):
    """List user's chat rooms or create a new chat room."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateChatRoomSerializer
        return ChatRoomSerializer
    
    def get_queryset(self):
        return ChatRoom.objects.filter(
            participants=self.request.user,
            is_active=True
        ).prefetch_related(
            'participants', 'messages', 'messages__sender'
        ).order_by('-updated_at')

class ChatRoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a chat room."""
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChatRoom.objects.filter(
            participants=self.request.user,
            is_active=True
        ).prefetch_related('participants', 'messages')

class MessageListView(generics.ListCreateAPIView):
    """List messages in a chat room or send a new message."""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        room_id = self.kwargs['room_id']
        # Verify user is participant in the room
        room = get_object_or_404(
            ChatRoom,
            id=room_id,
            participants=self.request.user
        )
        
        return Message.objects.filter(
            room=room
        ).select_related('sender').prefetch_related(
            'attachments', 'read_by'
        ).order_by('-timestamp')[:50]  # Limit to last 50 messages
    
    def perform_create(self, serializer):
        room_id = self.kwargs['room_id']
        room = get_object_or_404(
            ChatRoom,
            id=room_id,
            participants=self.request.user
        )
        serializer.save(sender=self.request.user, room=room)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_private_chat(request):
    """Create or get existing private chat between two users."""
    other_user_id = request.data.get('user_id')
    
    if not other_user_id:
        return Response(
            {'error': 'user_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if private chat already exists
    existing_room = ChatRoom.objects.filter(
        room_type='private',
        participants=request.user
    ).filter(
        participants=other_user
    ).first()
    
    if existing_room:
        serializer = ChatRoomSerializer(existing_room, context={'request': request})
        return Response(serializer.data)
    
    # Create new private chat
    chat_room = ChatRoom.objects.create(
        room_type='private',
        created_by=request.user
    )
    chat_room.participants.add(request.user, other_user)
    
    serializer = ChatRoomSerializer(chat_room, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_file(request, room_id):
    """Upload a file to a chat room."""
    # Verify user is participant in the room
    room = get_object_or_404(
        ChatRoom,
        id=room_id,
        participants=request.user
    )
    
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    uploaded_file = request.FILES['file']
    
    # Check file size (10MB limit)
    if uploaded_file.size > 10 * 1024 * 1024:
        return Response(
            {'error': 'File size cannot exceed 10MB'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create message for the file
    message = Message.objects.create(
        room=room,
        sender=request.user,
        content=f"Shared a file: {uploaded_file.name}",
        message_type='file'
    )
    
    # Create file attachment with proper metadata
    file_attachment = FileAttachment(
        message=message,
        file=uploaded_file,
        file_name=uploaded_file.name,
        file_size=uploaded_file.size,
        file_type=getattr(uploaded_file, 'content_type', 'application/octet-stream')
    )
    file_attachment.save()
    
    # Return the message with attachment
    message_serializer = MessageSerializer(message, context={'request': request})
    return Response(message_serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_users(request):
    """Search for users by username or name."""
    query = request.GET.get('q', '').strip()
    
    if not query:
        return Response({'users': []})
    
    # Exclude current user from search results
    users = User.objects.filter(
        Q(username__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query)
    ).exclude(
        id=request.user.id
    )[:10]  # Limit to 10 results
    
    serializer = UserSearchSerializer(users, many=True)
    return Response({'users': serializer.data})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_read(request, room_id):
    """Mark all messages in a room as read by the current user."""
    room = get_object_or_404(
        ChatRoom,
        id=room_id,
        participants=request.user
    )
    
    # Get all unread messages in the room
    unread_messages = Message.objects.filter(
        room=room
    ).exclude(
        sender=request.user
    ).exclude(
        read_by=request.user
    )
    
    # Mark all as read
    for message in unread_messages:
        message.mark_as_read(request.user)
    
    return Response({'status': 'Messages marked as read'})

class FileAttachmentView(generics.RetrieveAPIView):
    """Retrieve file attachment details."""
    serializer_class = FileAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only allow access to files in rooms where user is a participant
        return FileAttachment.objects.filter(
            message__room__participants=self.request.user
        )
