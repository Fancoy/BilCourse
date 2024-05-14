from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from . import models, serializers  # Ensure these are imported correctly
from .serializers import UserSerializer, VerifyEmailSerializer
from .models import User
from rest_framework.permissions import AllowAny
import logging
from rest_framework import viewsets, filters, permissions
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import StudentAssignment
from .serializers import StudentAssignmentSerializer
from rest_framework.decorators import action

def award_heavy_load_badge(user):
    courses_taken = models.Course.objects.filter(students=user).count()
    heavy_loader_badge, created = models.Badge.objects.get_or_create(name="Heavy Loader", description="Awarded to students who have taken more than 4 courses.")
    print(f"User {user.email} has taken {courses_taken} courses.")
    if courses_taken > 4:
        heavy_loader_badge.users.add(user)

class UserProfileView(APIView):
    def get(self, request, format=None):
        user = request.user
        user_data = UserSerializer(user).data
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

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_data = UserSerializer(user).data
        return Response(user_data)
    
class UserProfileCard(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, email, *args, **kwargs):
        user = get_object_or_404(models.User, email=email)
        serializer = serializers.UserSerializer(user)
        return Response(serializer.data)

class UserAccountTypeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = serializers.UserAccountTypeSerializer(user)
        return Response(serializer.data)

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

logger = logging.getLogger(__name__)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = VerifyEmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            verification_code = serializer.validated_data['verification_code']
            try:
                user = User.objects.get(email=email)
                if user.verification_code == verification_code:
                    user.is_verified = True
                    user.verification_code = None  # Clear the verification code after successful verification
                    user.save()
                    return Response({'message': 'Email verified successfully!'}, status=status.HTTP_200_OK)
                else:
                    return Response({'error': 'Invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AssignmentListCreateView(generics.ListCreateAPIView):
    queryset = models.Assignment.objects.all()
    serializer_class = serializers.AssignmentSerializer

    def perform_create(self, serializer):
        course_id = serializer.validated_data.get('course').id
        course = get_object_or_404(models.Course, id=course_id)
        if self.request.user == course.instructor:
            serializer.save()
        else:
            raise PermissionDenied("You are not authorized to create an assignment for this course.")

class AssignmentUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Assignment.objects.all()
    serializer_class = serializers.AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def check_object_permissions(self, request, obj):
        if request.user != obj.course.instructor:
            raise PermissionDenied("You are not authorized to update or delete this assignment.")
        super().check_object_permissions(request, obj)

class StudentAssignmentListCreateView(generics.ListCreateAPIView):
    queryset = models.StudentAssignment.objects.all()
    serializer_class = serializers.StudentAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        assignment_id = serializer.validated_data.get('assignment').id
        assignment = get_object_or_404(models.Assignment, id=assignment_id)
        if self.request.user in assignment.course.students.all():
            serializer.save(student=self.request.user)
        else:
            raise PermissionDenied("You are not authorized to create a student assignment for this course.")

class StudentAssignmentUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.StudentAssignment.objects.all()
    serializer_class = serializers.StudentAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        course = self.get_object()
        user = self.request.user
        if course.instructor != user:
            raise PermissionDenied(detail="You do not have permission to delete this course.")
        return super().delete(request, *args, **kwargs)

class SearchCourseView(generics.ListAPIView):
    queryset = models.Course.objects.all()
    serializer_class = serializers.CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            return models.Course.objects.filter(title__icontains=query)
        return models.Course.objects.all()
    
class SearchUserView(generics.ListAPIView):
    queryset = models.User.objects.all()
    serializer_class = serializers.UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            return models.User.objects.filter(
                email__icontains=query
            )
        return models.User.objects.all()
    

#class StudentAssignmentPagination(PageNumberPagination):
 #   page_size = 10  # Number of assignments per page

class StudentAssignmentViewSet(viewsets.ModelViewSet):
    queryset = StudentAssignment.objects.all()
    serializer_class = StudentAssignmentSerializer
    #pagination_class = StudentAssignmentPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'assignment', 'grade']
    search_fields = ['student__email', 'assignment__title']
    ordering_fields = ['upload_time', 'grade']
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, url_path='details', methods=['get'])
    def get_student_assignment_details(self, request, pk=None):
        """
        Retrieve details of a specific student assignment using its PK.
        """
        student_assignment = get_object_or_404(StudentAssignment, pk=pk)
        serializer = self.get_serializer(student_assignment)
        return Response(serializer.data)
    
    # Custom action to get assignments for a specific student
    @action(detail=False, methods=['get'], url_path='student-assignments/(?P<student_id>\d+)')
    def get_assignments_by_student(self, request, student_id=None):
        assignments = self.queryset.filter(student_id=student_id)
        page = self.paginate_queryset(assignments)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)
    
    # Custom action to edit grade
    @action(detail=True, methods=['patch'], url_path='edit-grade')
    def edit_grade(self, request, pk=None):
        assignment = self.get_object()
        grade = request.data.get('grade')
        if grade is not None:
            assignment.grade = grade
            assignment.save()
            return Response({'status': 'grade updated', 'grade': grade}, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'bad request', 'message': 'Grade not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Custom action to edit grade
    @action(detail=True, methods=['patch'], url_path='edit')
    def edit_submission(self, request, pk=None):
        assignment = self.get_object()
        result_file = request.FILES.get('result_file')
        
        # Log the incoming data for debugging
        logger.debug('Received file: %s', result_file)
        if result_file is not None:
            assignment.result_file = result_file
            assignment.save()
            return Response({'status': 'submission updated', 'result_file': assignment.result_file.url}, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'bad request', 'message': 'File not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['patch'], url_path='add-feedback')
    def edit_submission(self, request, pk=None):
        assignment = self.get_object()
        feedback_file = request.FILES.get('feedback_file')
        
        # Log the incoming data for debugging
        logger.debug('Received file: %s', feedback_file)
        if feedback_file is not None:
            assignment.feedback_file = feedback_file
            assignment.save()
            return Response({'status': 'feedback submitted', 'feedback_file': assignment.feedback_file.url}, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'bad request', 'message': 'File not provided'}, status=status.HTTP_400_BAD_REQUEST)

    # Custom action to get assignments by course
    @action(detail=False, methods=['get'], url_path='course-assignments/(?P<course_id>\d+)')
    def get_assignments_by_course(self, request, course_id=None):
        assignments = self.queryset.filter(assignment__course_id=course_id)
        page = self.paginate_queryset(assignments)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)
    
    # Custom action to get assignments by student and course
    @action(detail=False, methods=['get'], url_path='student-course-assignments/(?P<student_id>\d+)/(?P<course_id>\d+)')
    def get_assignments_by_student_and_course(self, request, student_id=None, course_id=None):
        assignments = self.queryset.filter(student_id=student_id, assignment__course_id=course_id)
        page = self.paginate_queryset(assignments)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_submission(self, request, pk=None):
        assignment = self.get_object()
        assignment.delete()
        return Response({'status': 'submission deleted'}, status=status.HTTP_204_NO_CONTENT)
