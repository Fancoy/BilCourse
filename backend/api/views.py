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
from django.db.models import Count, F

class AssignTA(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id, format=None):
        user = request.user
        if user.account_type != 'instructor':
            raise PermissionDenied(detail="Only instructors can assign TAs.")

        # Retrieve the course object, ensuring the current user is the instructor
        course = get_object_or_404(Course, id=course_id, instructor=user)

        # Extract TA email from the request data
        ta_email = request.data.get('email')
        if not ta_email:
            return Response({'error': 'Email address is required.'}, status=400)

        # Find the user with the given email and ensure they are a student
        ta_user = get_object_or_404(User, email=ta_email)
        if ta_user.account_type != 'student':
            return Response({'error': 'TA must be a student.'}, status=400)

        # Assign the student as a TA if not already assigned
        if ta_user in course.assistants.all():
            return Response({'error': 'This student is already a TA for this course.'}, status=400)

        course.assistants.add(ta_user)
        course.save()

        return Response({'success': f'{ta_email} has been assigned as a TA for {course.title}.'}, status=200)

class LeaveCourse(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id, format=None):
        user = request.user
        if user.account_type != 'student':
            raise PermissionDenied(detail="Only students can leave courses.")
        
        course = get_object_or_404(Course, id=course_id)
        if not course.students.filter(id=user.id).exists():
            return Response({'error': 'Student is not enrolled in this course.'}, status=400)
        
        course.students.remove(user)
        return Response({'success': f'{user.email} has left {course.title}.'}, status=200)

class EnrollStudent(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id, format=None):
        user = request.user
        if user.account_type != User.STUDENT:
            raise PermissionDenied(detail="Only students can enroll in courses.")
        
        course = get_object_or_404(Course, id=course_id)
        if course.students.filter(id=user.id).exists():
            return Response({'error': 'Student already enrolled in this course.'}, status=400)
        
        if course.students.count() >= course.capacity:
            return Response({'error': 'Course is already at full capacity.'}, status=400)
        
        course.students.add(user)
        course.save()
        return Response({'success': f'{user.email} has been enrolled in {course.title}.'})

class AvailableCourses(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Filter out courses where the current user is already enrolled
        return Course.objects.annotate(
            enrolled_students_count=Count('students')
        ).exclude(
            students=user
        ).filter(
            enrolled_students_count__lt=F('capacity')
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({'available_courses': serializer.data})

        serializer = self.get_serializer(queryset, many=True)
        return Response({'available_courses': serializer.data})


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
    