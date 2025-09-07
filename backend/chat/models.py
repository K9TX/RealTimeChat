import os
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import FileExtensionValidator

def upload_to_chat(instance, filename):
    """Upload chat files to organized directory structure."""
    return f'chat_files/{instance.message.room.id}/{timezone.now().strftime("%Y/%m/%d")}/{filename}'

class ChatRoom(models.Model):
    ROOM_TYPES = (
        ('private', 'Private'),
        ('group', 'Group'),
    )
    
    name = models.CharField(max_length=100, blank=True, null=True)
    room_type = models.CharField(max_length=10, choices=ROOM_TYPES, default='private')
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='created_rooms'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        if self.name:
            return self.name
        # For private chats, show participants
        participants = list(self.participants.all()[:2])
        if len(participants) == 2:
            return f"{participants[0].username} & {participants[1].username}"
        return f"Room {self.id}"
    
    @property
    def last_message(self):
        return self.messages.first()
    
    def get_other_participant(self, user):
        """Get the other participant in a private chat."""
        if self.room_type == 'private':
            return self.participants.exclude(id=user.id).first()
        return None

class Message(models.Model):
    MESSAGE_TYPES = (
        ('text', 'Text'),
        ('file', 'File'),
        ('image', 'Image'),
        ('system', 'System'),
    )
    
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sent_messages'
    )
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    content = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    
    # Message status tracking
    is_read = models.BooleanField(default=False)
    read_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        through='MessageRead', 
        related_name='read_messages'
    )
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}..."
    
    def mark_as_read(self, user):
        """Mark message as read by a specific user."""
        MessageRead.objects.get_or_create(
            message=self,
            user=user,
            defaults={'read_at': timezone.now()}
        )

class MessageRead(models.Model):
    """Track which users have read which messages."""
    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('message', 'user')

class FileAttachment(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(
        upload_to=upload_to_chat,
        validators=[
            FileExtensionValidator(
                allowed_extensions=['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'zip', 'rar']
            )
        ]
    )
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()  # Size in bytes
    file_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.file_name} ({self.get_file_size_display()})"
    
    def get_file_size_display(self):
        """Return human-readable file size."""
        if self.file_size < 1024:
            return f"{self.file_size} B"
        elif self.file_size < 1024**2:
            return f"{self.file_size/1024:.1f} KB"
        elif self.file_size < 1024**3:
            return f"{self.file_size/(1024**2):.1f} MB"
        else:
            return f"{self.file_size/(1024**3):.1f} GB"
    
    def save(self, *args, **kwargs):
        # Auto-populate metadata if not set and file exists
        if self.file and not self.file_name:
            if hasattr(self.file, 'name'):
                self.file_name = self.file.name
        
        if self.file and not self.file_size:
            if hasattr(self.file, 'size'):
                self.file_size = self.file.size
        
        if self.file and not self.file_type:
            # Try to get content type from uploaded file
            if hasattr(self.file, 'content_type'):
                self.file_type = self.file.content_type or 'application/octet-stream'
            else:
                # Fallback: guess from file extension
                import mimetypes
                self.file_type = mimetypes.guess_type(self.file_name or '')[0] or 'application/octet-stream'
        
        # Validate file size (10MB max)
        if self.file_size and self.file_size > 10 * 1024 * 1024:  # 10MB in bytes
            raise ValueError("File size cannot exceed 10MB")
        
        super().save(*args, **kwargs)

class UserStatus(models.Model):
    """Track user online status."""
    STATUS_CHOICES = (
        ('online', 'Online'),
        ('away', 'Away'),
        ('offline', 'Offline'),
    )
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='chat_status'
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='offline')
    last_seen = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.status}"
