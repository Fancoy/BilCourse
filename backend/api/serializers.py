from rest_framework import serializers
from .models import User, Course, Forum, ForumMessage, Badge  # Make sure to import your custom User model
from .models import Event

class ForumMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumMessage
        fields = '__all__'
    
    def create(self, validated_data):
        return ForumMessage.objects.create(**validated_data)

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'

class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        fields = '__all__'
    
    def create(self, validated_data):
        return Forum.objects.create(**validated_data)

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
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user
  
class UserAccountTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['account_type']  # Assuming 'account_type' is the field name
        
class CourseSerializer(serializers.ModelSerializer):
    #instructor = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    instructor = UserSerializerForCourse(read_only=True)
    assistants = UserSerializerForCourse(many=True, read_only=True)
    students = UserSerializerForCourse(many=True, read_only=True)
    
    forums = ForumSerializer(many=True, read_only=True)  # Use 'many=True' for reverse ForeignKey relations
    
    class Meta:
        model = Course
        fields = '__all__'
        extra_kwargs = {"created_at": {"read_only": True}}
        
    def validate(self, data):
        # Validate instructor
        instructor = data.get('instructor')
        if instructor and instructor.account_type != User.INSTRUCTOR:
            raise serializers.ValidationError("The instructor must have an 'instructor' account type.")

        # Validate assistants
        assistants = data.get('assistants', [])
        for assistant in assistants:
            if assistant.account_type != User.STUDENT:
                raise serializers.ValidationError("All assistants must have a 'student' account type.")

        # Validate students
        students = data.get('students', [])
        for student in students:
            if student.account_type != User.STUDENT:
                raise serializers.ValidationError("All students must have a 'student' account type.")

        return data

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
