from django.db.utils import IntegrityError
from rest_framework import viewsets, exceptions
from rest_framework.response import Response
from api import models, serializers

class AssignmentViewSet(viewsets.ModelViewSet):
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