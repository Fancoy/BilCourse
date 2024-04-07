from django.contrib import admin
from django.urls import include, path
from api.views import CreateUserView, UserAccountTypeView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/" , CreateUserView.as_view(), name="register"),
    path('api/user/account-type/', UserAccountTypeView.as_view(), name='user-account-type'),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls"))  # Include the urls from the api app
]
