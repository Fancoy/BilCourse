from rest_framework import serializers
from api import models

class ChatPrivateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ChatPrivate
        fields = ['id', 'title', 'user1', 'user2']