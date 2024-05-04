from rest_framework import serializers
from api import models


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Badge
        fields = '__all__'