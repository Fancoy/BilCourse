from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from api import models, serializers
from api.models import Chat, User
from django.db.models import Count, F, Q
from django.contrib.auth import get_user_model
from rest_framework.exceptions import PermissionDenied
from ..views import award_heavy_load_badge


class CourseModelViewSet(viewsets.ModelViewSet):
    queryset = models.Course.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return serializers.CourseSerializer
        elif self.action == 'retrieve':
            return serializers.CourseSerializer
        elif self.action == 'list':
            return serializers.CourseListSerializer
        elif self.action == 'update':
            return serializers.CourseSerializer
        elif self.action == 'partial_update':
            return serializers.CourseSerializer
        elif self.action == 'available':
            return serializers.CourseListSerializer
        elif self.action == 'enroll_course':
            return serializers.CourseSerializer
        elif self.action == 'leave_course':
            return serializers.CourseSerializer
        elif self.action == 'assign_TA':
            return serializers.CourseSerializer
        elif self.action == 'create_forum':
            return serializers.ForumCreateSerializer
        elif self.action =='list_forum':
            return serializers.ForumListSerializer
        else:
            return serializers.CourseSerializer
    
    def get_object(self):
        # This method ensures that the course exists and the current user is the instructor
        course = get_object_or_404(models.Course, pk=self.kwargs.get('pk'))
        return course
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        if serializer.is_valid(): 
            if self.request.user.account_type == User.INSTRUCTOR:
                course = serializer.save(instructor=self.request.user)
                # Automatically create a chat for the newly created course
                Chat.objects.create(
                    title=f"{course.title}",
                    course=course
                ) 
            else:
                print("Only instructors can create courses.")
                # Raise a permission denied exception
                raise PermissionDenied(detail="Only instructors can create courses.")
        else:
            print(serializer.errors)
            raise PermissionDenied(detail="Invalid data for course creation.")

    
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if request.user.account_type == request.user.INSTRUCTOR: # error here
            queryset =  models.Course.objects.filter(instructor=request.user)
        elif request.user.account_type == get_user_model().STUDENT:
            queryset=  models.Course.objects.filter(Q(students=request.user) | Q(assistants=request.user))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        course = self.get_object()
        # Additional checks can be added here if necessary
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        course = self.get_object()
        user = self.request.user

        # Check if the user is the instructor of the course
        if course.instructor != user:
            raise exceptions.PermissionDenied(detail="You do not have permission to delete this course.")
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, url_path='available', methods=['GET'])
    def available(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        # Filter out courses where the current user is already enrolled
        queryset = queryset.annotate(
            enrolled_students_count=Count('students')
        ).exclude(
            students=self.request.user
        ).filter(
            enrolled_students_count__lt=F('capacity')
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({'available_courses': serializer.data})

        serializer = self.get_serializer(queryset, many=True)
        return Response({'available_courses': serializer.data})
    
    @action(detail=True, url_path = 'enroll', methods=['POST'] )
    def enroll_course(self, request, pk, format=None):
        user = request.user
        if user.account_type != get_user_model().STUDENT:
            raise exceptions.PermissionDenied(detail="Only students can enroll in courses.")
        
        course = get_object_or_404(models.Course, id=pk)
        if course.students.filter(id=user.id).exists():
            return Response({'error': 'Student already enrolled in this course.'}, status=400)
        
        if course.students.count() >= course.capacity:
            return Response({'error': 'Course is already at full capacity.'}, status=400)
        
        course.students.add(user)
        award_heavy_load_badge(user)
        course.save()
        return Response({'success': f'{user.email} has been enrolled in {course.title}.'})
    
    @action(detail=True, url_path = 'leave', methods=['POST'])
    def leave_course(self, request, pk, *args, **kwargs):
        user = request.user
        if user.account_type != 'student':
            raise exceptions.PermissionDenied(detail="Only students can leave courses.")
        
        course = get_object_or_404(models.Course, id=pk)
        if not course.students.filter(id=user.id).exists():
            return Response({'error': 'Student is not enrolled in this course.'}, status=400)
        
        course.students.remove(user)
        return Response({'success': f'{user.email} has left {course.title}.'}, status=200)

    @action(detail=True, url_path = 'assign-ta', methods=['POST'])
    def assign_TA(self, request, pk, format=None):
        user = request.user
        if user.account_type != 'instructor':
            raise exceptions.PermissionDenied(detail="Only instructors can assign TAs.")

        # Retrieve the course object, ensuring the current user is the instructor
        course = get_object_or_404(models.Course, id=pk, instructor=user)

        # Extract TA email from the request data
        ta_email = request.data.get('email')
        if not ta_email:
            return Response({'error': 'Email address is required.'}, status=400)

        # Find the user with the given email and ensure they are a student
        ta_user = get_object_or_404(get_user_model(), email=ta_email)
        if ta_user.account_type != 'student':
            return Response({'error': 'TA must be a student.'}, status=400)

        # Assign the student as a TA if not already assigned
        if ta_user in course.assistants.all():
            return Response({'error': 'This student is already a TA for this course.'}, status=400)

        course.assistants.add(ta_user)
        course.save()

        return Response({'success': f'{ta_email} has been assigned as a TA for {course.title}.'}, status=200)
 
    @action(detail=True, url_path = 'forum-list', methods=['GET'] )
    def list_forum(self, request, pk, format=None):
        forum_queryset = self.get_object().forums.all()
        page = self.paginate_queryset(forum_queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(forum_queryset, many=True)
        return Response( serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, url_path = 'forum-create', methods=['POST'] )
    def create_forum(self, request, pk, format=None):
        data = request.data
        data['course'] = pk
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        






        