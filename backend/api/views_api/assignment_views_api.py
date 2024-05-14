from django.db.utils import IntegrityError
from rest_framework import viewsets, exceptions, mixins
from rest_framework.response import Response
from api import models, serializers
from django.core.mail import send_mail
from django.conf import settings

class AssignmentViewSet(mixins.CreateModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.UpdateModelMixin,
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    queryset = models.Assignment.objects.all()
    serializer_class = serializers.AssignmentUpdateSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)  # Set partial=True for PATCH requests
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()
        
    def get_serializer_class(self):
        if self.action == 'create':
            return serializers.AssignmentCreateSerializer
        elif self.action == 'retrieve':
            return serializers.AssignmentRetrieveSerializer
        elif self.action == 'update':
            return serializers.AssignmentUpdateSerializer
        else:
            return serializers.AssignmentRetrieveSerializer
        
    def perform_create(self, serializer):
        try:
            assignment = serializer.save()
            course = assignment.course
            #course = models.Course.objects.all().filter(id=courseId)
            emails = [student.email for student in course.students.all()] + \
            [assistant.email for assistant in course.assistants.all()] + \
            [course.instructor.email]
            send_mail(
                f'An assignment has been created for your course {course.title}',
                f'New assignment: {assignment.title} for course {course.title} with deadline {assignment.end_time}',
                settings.EMAIL_HOST_USER,
                emails,
                fail_silently=False,
            )
        except IntegrityError:
            raise exceptions.APIException('Böyle bir kayıt zaten var')