from rest_framework import serializers
from api import models
from api.serializers.user_serializers import UserSerializerForCourse
from api.serializers.forum_serializers import ForumRetrieveSerializer
from django.contrib.auth import get_user_model

class CourseListSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Course
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    #instructor = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    instructor = UserSerializerForCourse(read_only=True)
    assistants = UserSerializerForCourse(many=True, read_only=True)
    students = UserSerializerForCourse(many=True, read_only=True)
    
    forums = ForumRetrieveSerializer(many=True, read_only=True)  # Use 'many=True' for reverse ForeignKey relations
    
    class Meta:
        model = models.Course
        fields = '__all__'
        extra_kwargs = {"created_at": {"read_only": True}}
        
    def validate(self, data):
        # Validate instructor
        instructor = data.get('instructor')
        if instructor and instructor.account_type != get_user_model().INSTRUCTOR:
            raise serializers.ValidationError("The instructor must have an 'instructor' account type.")

        # Validate assistants
        assistants = data.get('assistants', [])
        for assistant in assistants:
            if assistant.account_type != get_user_model().STUDENT:
                raise serializers.ValidationError("All assistants must have a 'student' account type.")

        # Validate students
        students = data.get('students', [])
        for student in students:
            if student.account_type != get_user_model().STUDENT:
                raise serializers.ValidationError("All students must have a 'student' account type.")

        return data