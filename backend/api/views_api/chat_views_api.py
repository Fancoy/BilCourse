from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework import status
from api.models import ChatPrivate
from django.db import IntegrityError, transaction
from api.serializers.chat_serializers import ChatPrivateSerializer

User = get_user_model()

class ListUserChatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the current user from the request
        user = request.user
        # Filter ChatPrivate instances where the current user is either user1 or user2
        chats = ChatPrivate.objects.filter(user1=user).union(ChatPrivate.objects.filter(user2=user))
        # Serialize the data
        serializer = ChatPrivateSerializer(chats, many=True)
        return Response(serializer.data)

class CreatePrivateChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user1_email = request.data.get('user1_email')
        user2_email = request.data.get('user2_email')
        
        if not user1_email or not user2_email:
            return Response({"error": "Missing user email(s)."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user1 = User.objects.get(email=user1_email)
            user2 = User.objects.get(email=user2_email)

            # Ensure user1 is always the user with the lower ID
            if user1.id < user2.id:
                user_a, user_b = user1, user2
            else:
                user_a, user_b = user2, user1

            # Use a transaction to handle potential race conditions
            with transaction.atomic():
                chat, created = ChatPrivate.objects.get_or_create(
                    user1=user_a,
                    user2=user_b,
                    defaults={'title': f'{user_a.email} and {user_b.email}'}
                )
            return Response({
                "chat_id": chat.id,
                "title": chat.title,
                "created": created
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "One or both users do not exist."}, status=status.HTTP_404_NOT_FOUND)
        except IntegrityError:
            # Handle the case where the chat might already exist due to a race condition
            chat = ChatPrivate.objects.get(user1=user_a, user2=user_b)
            return Response({
                "chat_id": chat.id,
                "title": chat.title,
                "created": False
            }, status=status.HTTP_200_OK)
