# chat/routing.py
from django.urls import re_path, path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    #path('ws/chat/', ChatConsumer.as_asgi()),
    re_path(r"ws/chat/(?P<room_name>\w+)/$", ChatConsumer.as_asgi()),
] 