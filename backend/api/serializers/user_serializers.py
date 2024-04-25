from rest_framework import serializers
from django.contrib.auth import get_user_model

class UserSerializerForCourse(serializers.ModelSerializer):
    class Meta:
        model =get_user_model()
        fields = ['email']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["id", "first_name", "last_name", "email", "mobile_number", "account_type", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = get_user_model().objects.create_user(**validated_data)
        return user
  
class UserAccountTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['account_type']  # Assuming 'account_type' is the field name
        