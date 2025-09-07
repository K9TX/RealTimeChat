from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/chat/<str:room_id>/', consumers.ChatConsumer.as_asgi()),
    path('ws/chat/', consumers.ChatListConsumer.as_asgi()),
]
