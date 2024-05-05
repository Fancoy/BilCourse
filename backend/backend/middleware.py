from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from api.models import User
from rest_framework_simplejwt.authentication import JWTAuthentication
from urllib.parse import parse_qs

class TokenAuthMiddleware(BaseMiddleware):
    """
    Custom token auth middleware for Django Channels to extract token from query string.
    """

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            # Validate the token and get the user
            validated_token = JWTAuthentication().get_validated_token(token)
            user = JWTAuthentication().get_user(validated_token)
            return user
        except Exception as e:
            # Handle exceptions or invalid token cases
            print("Authentication error:", e)
            return AnonymousUser()

    async def __call__(self, scope, receive, send):
        # Parse query string to get the token
        query_string = parse_qs(scope['query_string'].decode())
        token = query_string.get('token', [None])[0]
        
        if token:
            scope['user'] = await self.get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)