from rest_framework import viewsets, exceptions, mixins
from api import models, serializers


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
        else:
            return serializers.ForumRetrieveSerializer
    
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        forum = self.get_object()
        user = self.request.user

        # Check if the user is the instructor of the course
        if forum.instructor != user:
            raise exceptions.PermissionDenied(detail="You do not have permission to delete this forum.")
        
        return super().destroy(request, *args, **kwargs)
