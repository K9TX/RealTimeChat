from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    # Chat rooms
    path('rooms/', views.ChatRoomListView.as_view(), name='chat-room-list'),
    path('rooms/<int:pk>/', views.ChatRoomDetailView.as_view(), name='chat-room-detail'),
    path('rooms/private/', views.create_private_chat, name='create-private-chat'),
    
    # Messages
    path('rooms/<int:room_id>/messages/', views.MessageListView.as_view(), name='message-list'),
    path('rooms/<int:room_id>/messages/read/', views.mark_messages_read, name='mark-messages-read'),
    
    # File uploads
    path('rooms/<int:room_id>/upload/', views.upload_file, name='upload-file'),
    path('files/<int:pk>/', views.FileAttachmentView.as_view(), name='file-attachment-detail'),
    
    # User search
    path('users/search/', views.search_users, name='search-users'),
]
