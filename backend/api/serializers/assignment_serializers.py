from rest_framework import serializers
from api import models
from django.contrib.auth import get_user_model

class AssignmentCreateSerializer(serializers.ModelSerializer):
    course = serializers.SlugRelatedField(slug_field='slug', queryset=models.Course.objects.all())
    class Meta:
        model = models.Assignment
        fields = '__all__'

class AssignmentRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Assignment
        fields = '__all__'

class AssignmentListSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Assignment
        fields = '__all__'

class AssignmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Assignment
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Assignment
        fields = '__all__'
    
    def create(self, validated_data):
        return models.Assignment.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.semester = validated_data.get('semester', instance.semester)
        instance.year = validated_data.get('year', instance.year)
        instance.start_time = validated_data.get('start_time', instance.start_time)
        instance.assignment_file = validated_data.get('assignment_file', instance.assignment_file)
        instance.solution_key_file = validated_data.get('solution_key_file', instance.solution_key_file)
        instance.is_solution_key_available = validated_data.get('is_solution_key_file_available', instance.is_solution_key_available)
        instance.save()
        return instance

    def validate(self, data):
        request = self.context.get('request')
        if request and request.user.account_type != get_user_model().INSTRUCTOR:
            raise serializers.ValidationError("Only instructors can create or update assignments.")
        return data

class StudentAssignmentSerializer(serializers.ModelSerializer):
    student_email = serializers.EmailField(source='student.email', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    class Meta:
        model = models.StudentAssignment
        fields = '__all__'
    
