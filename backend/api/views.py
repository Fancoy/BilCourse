from django.shortcuts import render
from rest_framework import generics
from api import models, serializers
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response



def award_heavy_load_badge(user):
    courses_taken = models.Course.objects.filter(students=user).count()
    heavy_loader_badge, created = models.Badge.objects.get_or_create(name="Heavy Loader", description="Awarded to students who have taken more than 4 courses.")
    print(f"User {user.email} has taken {courses_taken} courses.")
    if courses_taken > 4:
        heavy_loader_badge.users.add(user)

class UserProfileView(APIView):
    def get(self, request, format=None):
        user = request.user
        user_data = serializers.UserSerializer(user).data
        user_courses = serializers.CourseSerializer(models.Course.objects.filter(students=user), many=True).data
        user_assisting = serializers.CourseSerializer(models.Course.objects.filter(assistants=user), many=True).data
        user_teaching = serializers.CourseSerializer(models.Course.objects.filter(instructor=user), many=True).data
        user_badges = serializers.BadgeSerializer(user.badges.all(), many=True).data
        return Response({
            'user': user_data,
            'courses': user_courses,
            'teaching': user_teaching,
            'assisting': user_assisting,
            'badges': user_badges
        })

class UserAccountTypeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = serializers.UserAccountTypeSerializer(user)
        return Response(serializer.data)

class CreateUserView(generics.CreateAPIView):
    queryset = models.User.objects.all()
    serializer_class = serializers.UserSerializer
    permission_classes = [AllowAny]
    
class AssignmentListCreateView(generics.ListCreateAPIView):
    queryset = models.Assignment.objects.all()
    serializer_class = serializers.AssignmentSerializer

    def perform_create(self, serializer):
        # Get the course from the serializer's validated data
        course_id = serializer.validated_data.get('course').id
        course = get_object_or_404(models.Course, id=course_id)

        # Check if the current user is the instructor of the course
        if self.request.user == course.instructor:
            serializer.save()
        else:
            # If not the instructor, raise a permission denied response
            raise PermissionDenied("You are not authorized to create an assignment for this course.")

class AssignmentUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Assignment.objects.all()
    serializer_class = serializers.AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def check_object_permissions(self, request, obj):
        # Check if the current user is the instructor of the course
        if request.user != obj.course.instructor:
            # If not the instructor, raise a permission denied response
            raise PermissionDenied("You are not authorized to update or delete this assignment.")
        super().check_object_permissions(request, obj)

class StudentAssignmentListCreateView(generics.ListCreateAPIView):
    queryset = models.StudentAssignment.objects.all()
    serializer_class = serializers.StudentAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Get the assignment from the serializer's validated data
        assignment_id = serializer.validated_data.get('assignment').id
        assignment = get_object_or_404(models.Assignment, id=assignment_id)

        # Check if the current user is a student of the course
        if self.request.user in assignment.course.students.all():
            serializer.save(student=self.request.user)
        else:
            # If not a student, raise a permission denied response
            raise PermissionDenied("You are not authorized to create a student assignment for this course.")

class StudentAssignmentUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.StudentAssignment.objects.all()
    serializer_class = serializers.StudentAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        course = self.get_object()
        user = self.request.user

        # Check if the user is the instructor of the course
        if course.instructor != user:
            raise PermissionDenied(detail="You do not have permission to delete this course.")
        
        return super().delete(request, *args, **kwargs)

class CreateUserView(generics.CreateAPIView):
    queryset = models.User.objects.all()
    serializer_class = serializers.UserSerializer
    permission_classes = [AllowAny]

