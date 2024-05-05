from datetime import datetime
import json

from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connected user:", self.scope["user"])
        if self.scope["user"].is_authenticated:
            print("Authenticated User:", self.scope["user"].username)
        else:
            print("User is Anonymous")
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        user = self.scope['user']
        if user.is_authenticated:
            sender = user.username
        else:
            sender = "Anonymous"

        timestamp = datetime.now().isoformat()  # ISO 8601 format timestamp

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {
                "type": "chat.message",
                "message": message,
                "sender": sender,
                "timestamp": timestamp
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]
        sender = event["sender"]
        timestamp = event["timestamp"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "message": message,
            "sender": sender,
            "timestamp": timestamp
        }))
