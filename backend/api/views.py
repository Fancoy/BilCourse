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
import os
import logging
import openai
import pandas as pd
import matplotlib.pyplot as plt
from django.http import JsonResponse
from rest_framework.decorators import api_view
from io import BytesIO
import base64
from .serializers import UserSerializer, VerifyEmailSerializer, CourseSerializer, ActivitySerializer, ForumListSerializer, ForumMessageSerializer, AssignmentSerializer, StudentAssignmentSerializer

logger = logging.getLogger(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY")

class UserCourseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        courses = models.Course.objects.filter(students=user)
        activities = models.Activity.objects.filter(course__in=courses)
        forums = models.Forum.objects.filter(course__in=courses)
        forumMessages = models.ForumMessage.objects.filter(forum__in=forums)
        assignments = models.Assignment.objects.filter(course__in=courses)
        studentAssignments = models.StudentAssignment.objects.filter(assignment__in=assignments, student=user)

        data = {
            'courses': CourseSerializer(courses, many=True).data,
            'activities': ActivitySerializer(activities, many=True).data,
            'forums': ForumListSerializer(forums, many=True).data,
            'forumMessages': ForumMessageSerializer(forumMessages, many=True).data,
            'assignments': AssignmentSerializer(assignments, many=True).data,
            'studentAssignments': StudentAssignmentSerializer(studentAssignments, many=True).data
        }
        return Response(data)

@api_view(['POST'])
def chat_with_ai(request):
    user_message = request.data.get('message', '')
    if not user_message:
        return JsonResponse({'error': 'No message provided'}, status=400)

    # Fetch user-specific data
    user = request.user
    response_data = UserCourseDetailView().get(request).data

    courses = response_data['courses']
    activities = response_data['activities']
    forums = response_data['forums']
    forumMessages = response_data['forumMessages']
    assignments = response_data['assignments']
    studentAssignments = response_data['studentAssignments']

    # Prepare the data for AI input
    assignment_info = "\n".join([
        f"Assignment {assignment['id']}: {assignment['title']} - {assignment['description']} (Start: {assignment['start_time']}, End: {assignment['end_time']})"
        for assignment in assignments
    ])

    try:
        logger.debug("Received message from user: %s", user_message)

        grades = [int(s) for s in user_message.split() if s.isdigit()]

        if "graph" in user_message.lower() and grades:
            data = {
                "Assignment": [f"Assignment {i+1}" for i in range(len(grades))],
                "Score": grades
            }
            df = pd.DataFrame(data)

            plt.figure(figsize=(10, 6))
            df.plot(kind='bar', x='Assignment', y='Score', legend=False)
            plt.title("Assignment Scores")
            plt.ylabel("Scores")

            buffer = BytesIO()
            plt.savefig(buffer, format='png')
            buffer.seek(0)
            image_png = buffer.getvalue()
            buffer.close()

            graph_data = base64.b64encode(image_png).decode('utf-8')

            return JsonResponse({'message': f"Graph for grades {grades} generated.", 'graph': graph_data})

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"You are a helpful assistant. Here is the list of assignments:\n{assignment_info}"},
                {"role": "user", "content": user_message},
            ],
            max_tokens=150,
            n=1,
            temperature=0.7,
        )

        logger.debug("OpenAI response: %s", response)

        ai_message = response['choices'][0]['message']['content'].strip()
        return JsonResponse({'message': ai_message})
    except Exception as e:
        logger.error("Error during OpenAI API call: %s", e)
        return JsonResponse({'error': str(e)}, status=500)

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
