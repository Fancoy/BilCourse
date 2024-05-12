from rest_framework import viewsets, exceptions, mixins
from api import models, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status

class ForumViewSet(mixins.RetrieveModelMixin,
                   mixins.UpdateModelMixin,
                   mixins.DestroyModelMixin,
                   viewsets.GenericViewSet):
    queryset = models.Forum.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return serializers.ForumRetrieveSerializer
        elif self.action == 'update':
            return serializers.ForumUpdateSerializer
        elif self.action == 'partial_update':
            return serializers.ForumUpdateSerializer
        elif self.action == 'destroy':
            return serializers.ForumDeleteSerializer
        elif self.action == 'send_message':
            return serializers.ForumMessageSerializer
        elif self.action == 'list_messages':
            return serializers.ForumMessageSerializer
        else:
            return serializers.ForumRetrieveSerializer
    
    @action(methods=['post'], detail=True, url_path='send-message')
    def send_message(self, request, pk=None):
        """Send a message to the specified forum."""
        forum = self.get_object()
        user = request.user
        if not (forum.course.instructor == user or user in forum.course.assistants.all() or user in forum.course.students.all()):
            raise exceptions.PermissionDenied(detail="You do not have permission to send messages to this forum.")
        data = request.data
        data['sender'] = user.id
        data['forum'] = forum.id
        
        serializer = serializers.ForumMessageSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(methods=['get'], detail=True, url_path='list-messages')
    def list_messages(self, request, pk=None):
        """List all messages for a specific forum."""
        forum = self.get_object()
        user = request.user
        if not (forum.course.instructor == user or user in forum.course.assistants.all() or user in forum.course.students.all()):
            raise exceptions.PermissionDenied(detail="You do not have permission to view this forum.")
        messages = forum.forums_messages.all()
        serializer = serializers.ForumMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        forum = self.get_object()
        user = request.user
        if not (forum.course.instructor == user or user in forum.course.assistants.all()):
            raise exceptions.PermissionDenied(detail="You do not have permission to delete this forum.")
        return super().destroy(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        forum = self.get_object()
        user = request.user

        if not (forum.course.instructor == user or user in forum.course.assistants.all()):
            raise exceptions.PermissionDenied(detail="You do not have permission to delete this forum.")
        
        return super().destroy(request, *args, **kwargs)
