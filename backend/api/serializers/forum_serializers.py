from rest_framework import serializers
from api import models

class ForumCreateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = models.Forum
        exclude = ('forum_messages',)

class ForumRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Forum
        fields = '__all__'

class ForumListSerializer(serializers.ModelSerializer):
    course = serializers.StringRelatedField()
    
    class Meta:
        model = models.Forum
        fields = '__all__'

class ForumUpdateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = models.Forum
        fields = ('title',)