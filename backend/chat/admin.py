from django.contrib import admin
from .models import ChatRoom, Message, FileAttachment, UserStatus

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'room_type', 'created_by', 'created_at', 'is_active']
    list_filter = ['room_type', 'is_active', 'created_at']
    search_fields = ['name', 'created_by__username']
    filter_horizontal = ['participants']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'room', 'message_type', 'timestamp', 'is_edited']
    list_filter = ['message_type', 'is_edited', 'timestamp']
    search_fields = ['content', 'sender__username']
    readonly_fields = ['timestamp', 'edited_at']

@admin.register(FileAttachment)
class FileAttachmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'file_name', 'file_type', 'file_size', 'uploaded_at']
    list_filter = ['file_type', 'uploaded_at']
    search_fields = ['file_name']
    readonly_fields = ['uploaded_at', 'file_size']

@admin.register(UserStatus)
class UserStatusAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'last_seen']
    list_filter = ['status', 'last_seen']
    search_fields = ['user__username']
    readonly_fields = ['last_seen']
