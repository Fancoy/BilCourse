from django.shortcuts import render
from .models import User, Course  # Make sure to import your custom User model
from rest_framework import generics
from .serializers import UserSerializer, CourseSerializer, UserAccountTypeSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import UpdateAPIView
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response

class UserAccountTypeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = UserAccountTypeSerializer(user)
        return Response(serializer.data)


class CourseEdit(UpdateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # This method ensures that the course exists and the current user is the instructor
        course = get_object_or_404(Course, pk=self.kwargs.get('pk'), instructor=self.request.user)
        return course

    def update(self, request, *args, **kwargs):
        course = self.get_object()
        # Additional checks can be added here if necessary
        return super().update(request, *args, **kwargs)
    
    
class CourseListCreate(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated] # change this back to IsAuthenticated
        
    def get_queryset(self):
        user = self.request.user
        if user.account_type == User.INSTRUCTOR: # error here
            return Course.objects.filter(instructor=user)
        elif user.account_type == User.STUDENT:
            return Course.objects.filter(Q(students=user) | Q(assistants=user))
    
    def perform_create(self, serializer):
        if serializer.is_valid(): 
            if self.request.user.account_type == User.INSTRUCTOR:
                serializer.save(instructor=self.request.user)
            else:
                print("Only instructors can create courses.")
                # Raise a permission denied exception
                raise PermissionDenied(detail="Only instructors can create courses.")
        else:
            print(serializer.errors)
            raise PermissionDenied(detail="Invalid data for course creation.")

class CourseDelete(generics.DestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        course = self.get_object()
        user = self.request.user

        # Check if the user is the instructor of the course
        if course.instructor != user:
            raise PermissionDenied(detail="You do not have permission to delete this course.")
        
        return super().delete(request, *args, **kwargs)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
