from rest_framework import serializers
from api import models

class ForumMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ForumMessage
        fields = '__all__'