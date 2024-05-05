from datetime import datetime
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from api.models import User, Chat, ChatMessage, Course
from django.utils import timezone

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"
        user = self.scope["user"]

        # Check if user is authenticated
        if not user.is_authenticated:
            await self.close(code=403)
            return

        # Check if user is part of the course linked with the chat
        if not await self.is_user_allowed(user, self.room_name):
            await self.close(code=403)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Load and send previous messages
        messages = await self.load_messages(self.room_name)
        for message in messages:
            await self.send(text_data=json.dumps({
                'message': message['content'],
                'sender': message['sender_email'],
                'timestamp': message['created_time'].isoformat()
            }))

    @database_sync_to_async
    def is_user_allowed(self, user, room_name):
        # Get the course from the room_name assuming room_name is directly related to the course title
        try:
            course = Course.objects.get(chats__title=room_name)  # Assuming the Chat model has a FK to Course
            return course.students.filter(id=user.id).exists() or \
                   course.assistants.filter(id=user.id).exists() or \
                   course.instructor == user
        except Course.DoesNotExist:
            return False
            
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        user = self.scope['user']

        if user.is_authenticated:
            sender = user.email
            timestamp = timezone.now()
            await self.save_message(user, self.room_name, message, timestamp)

            # Broadcast message to the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                    "sender": sender,
                    "timestamp": timestamp.isoformat()
                }
            )
        else:
            print("Anonymous user attempted to send a message.")

    @database_sync_to_async
    def load_messages(self, room_name):
        try:
            chat = Chat.objects.get(title=room_name)
            # Include fetching the sender's email in the database call
            messages = chat.chat_messages.select_related('sender').all().order_by('created_time')[:50]
            return [
                {
                    "content": message.content,
                    "sender_email": message.sender.email,
                    "created_time": message.created_time
                }
                for message in messages
            ]
        except Chat.DoesNotExist:
            return []
        
    @database_sync_to_async
    def save_message(self, user, room_name, content, timestamp):
        if user.is_authenticated:
            try:
                chat = Chat.objects.get(title=room_name)
                ChatMessage.objects.create(
                    sender=user,
                    chat=chat,
                    content=content,
                    created_time=timestamp
                )
            except Chat.DoesNotExist:
                print(f"No chat found with title {room_name}. Message not saved.")

    # Handler for the chat_message type from the group_send
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "sender": event["sender"],
            "timestamp": event["timestamp"]
        }))
