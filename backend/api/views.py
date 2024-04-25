from django.shortcuts import render
from .models import User, Course, Forum, Assignment, StudentAssignment  # Make sure to import your custom User model
from rest_framework import generics
from api import serializers
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import  CreateAPIView
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, F

class UserAccountTypeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = serializers.UserAccountTypeSerializer(user)
        return Response(serializer.data)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer
    permission_classes = [AllowAny]
    
class AssignmentListCreateView(generics.ListCreateAPIView):
    queryset = Assignment.objects.all()
    serializer_class = serializers.AssignmentSerializer

    def perform_create(self, serializer):
        # Get the course from the serializer's validated data
        course_id = serializer.validated_data.get('course').id
        course = get_object_or_404(Course, id=course_id)

        # Check if the current user is the instructor of the course
        if self.request.user == course.instructor:
            serializer.save()
        else:
            # If not the instructor, raise a permission denied response
            raise PermissionDenied("You are not authorized to create an assignment for this course.")

class AssignmentUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Assignment.objects.all()
    serializer_class = serializers.AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def check_object_permissions(self, request, obj):
        # Check if the current user is the instructor of the course
        if request.user != obj.course.instructor:
            # If not the instructor, raise a permission denied response
            raise PermissionDenied("You are not authorized to update or delete this assignment.")
        super().check_object_permissions(request, obj)

class StudentAssignmentListCreateView(generics.ListCreateAPIView):
    queryset = StudentAssignment.objects.all()
    serializer_class = serializers.StudentAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Get the assignment from the serializer's validated data
        assignment_id = serializer.validated_data.get('assignment').id
        assignment = get_object_or_404(Assignment, id=assignment_id)

        # Check if the current user is a student of the course
        if self.request.user in assignment.course.students.all():
            serializer.save(student=self.request.user)
        else:
            # If not a student, raise a permission denied response
            raise PermissionDenied("You are not authorized to create a student assignment for this course.")

class StudentAssignmentUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentAssignment.objects.all()
    serializer_class = serializers.StudentAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def check_object_permissions(self, request, obj):
        # Check if the current user is the student of the assignment
        if request.user != obj.student:
            # If not the student, raise a permission denied response
            raise PermissionDenied("You are not authorized to update or delete this student assignment.")
        super().check_object_permissions(request, obj)
