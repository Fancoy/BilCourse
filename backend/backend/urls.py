from django.contrib import admin
from django.urls import include, path
from api.views import CreateUserView, UserAccountTypeView, UserProfileView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.views.generic import TemplateView
from django.urls import re_path

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/" , CreateUserView.as_view(), name="register"),
    path('api/user/account-type/', UserAccountTypeView.as_view(), name='user-account-type'),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path("api/", include("api.urls")),  # Include the urls from the api app

    # Add a catch-all pattern
    #re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='home'), 
]
