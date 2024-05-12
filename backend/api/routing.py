# chat/routing.py
from django.urls import re_path, path
from .consumers import ChatConsumer, ChatPrivateConsumer

websocket_urlpatterns = [
    #path('ws/chat/', ChatConsumer.as_asgi()),
    re_path(r"ws/chat/(?P<room_name>\w+)/$", ChatConsumer.as_asgi()),
    re_path(r'ws/chat/private/(?P<room_name>[^/]+)/$', ChatPrivateConsumer.as_asgi()),
] 