from django.db.utils import IntegrityError
from rest_framework import viewsets, exceptions
from api import models, serializers

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = models.Assignment.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return serializers.AssignmentCreateSerializer
        elif self.action == 'retrieve':
            return serializers.AssignmentRetrieveSerializer
        elif self.action == 'list':
            return serializers.AssignmentListSerializer
        elif self.action == 'update':
            return serializers.AssignmentUpdateSerializer
        else:
            return serializers.AssignmentRetrieveSerializer
        
    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError:
            raise exceptions.APIException('Böyle bir kayıt zaten var')