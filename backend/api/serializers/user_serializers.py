# backend/api/serializers/user_serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
import random

User = get_user_model()

class UserSerializerForCourse(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "mobile_number", "account_type", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        verification_code = str(random.randint(100000, 999999))
        user.verification_code = verification_code
        user.save()
        send_mail(
            'Verify your email',
            f'Your verification code is {verification_code}',
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )
        return user

class UserAccountTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['account_type']  # Assuming 'account_type' is the field name


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    verification_code = serializers.CharField(max_length=6)
