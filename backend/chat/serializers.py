from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message, FileAttachment, UserStatus

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'status']
        read_only_fields = ['email']
    
    def get_status(self, obj):
        try:
            return obj.chat_status.status
        except UserStatus.DoesNotExist:
            return 'offline'

class FileAttachmentSerializer(serializers.ModelSerializer):
    file_size_display = serializers.CharField(source='get_file_size_display', read_only=True)
    
    class Meta:
        model = FileAttachment
        fields = ['id', 'file', 'file_name', 'file_size', 'file_size_display', 'file_type', 'uploaded_at']
        read_only_fields = ['uploaded_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    attachments = FileAttachmentSerializer(many=True, read_only=True)
    is_read_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'room', 'sender', 'message_type', 'content', 'timestamp',
            'is_edited', 'edited_at', 'attachments', 'is_read_by_user'
        ]
        read_only_fields = ['room', 'sender', 'timestamp', 'is_edited', 'edited_at']
    
    def get_is_read_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.read_by.filter(id=request.user.id).exists()
        return False
    
    def validate(self, data):
        """Custom validation for message data."""
        message_type = data.get('message_type', 'text')
        content = data.get('content', '').strip()
        
        # For text messages, content cannot be empty
        if message_type == 'text' and not content:
            raise serializers.ValidationError({
                'content': 'Content cannot be empty for text messages.'
            })
        
        return data

class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'room_type', 'participants', 'created_by',
            'created_at', 'updated_at', 'is_active', 'last_message',
            'unread_count', 'other_participant'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.exclude(
                read_by=request.user
            ).exclude(
                sender=request.user
            ).count()
        return 0
    
    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and obj.room_type == 'private':
            other_user = obj.get_other_participant(request.user)
            if other_user:
                return UserSerializer(other_user).data
        return None

class CreateChatRoomSerializer(serializers.ModelSerializer):
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = ChatRoom
        fields = ['name', 'room_type', 'participant_ids']
    
    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        user = self.context['request'].user
        
        # Create the chat room
        chat_room = ChatRoom.objects.create(
            created_by=user,
            **validated_data
        )
        
        # Add creator to participants
        chat_room.participants.add(user)
        
        # Add other participants
        if participant_ids:
            participants = User.objects.filter(id__in=participant_ids)
            chat_room.participants.add(*participants)
        
        return chat_room

class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = ['email']
