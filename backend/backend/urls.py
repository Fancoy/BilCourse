from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from api.views import CreateUserView, UserAccountTypeView, UserProfileView, UserDetailView, SearchCourseView, SearchUserView, UserProfileCard,UserCourseDetailView, assignment_pdf_report
from api.views_api.chat_views_api import CreatePrivateChatView, ListUserChatsView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular import views as spectacular_views
from django.conf.urls.static import static
from api.views import chat_with_ai

urlpatterns = [
    path('user/details/', UserCourseDetailView.as_view(), name='user-details'),
    path('assignments/<int:assignment_id>/pdf/', assignment_pdf_report, name='assignment_pdf_report'),
    path('admin/', admin.site.urls),
    path("api/user/register/" , CreateUserView.as_view(), name="register"),
    path('api/user/account-type/', UserAccountTypeView.as_view(), name='user-account-type'),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),  # Include the urls from the api app
    path('api/user/', UserDetailView.as_view(), name='user-detail'),  
    path('api/users/<str:email>/', UserProfileCard.as_view(), name='user-profile-card'), 
    path('api/search-course/', SearchCourseView.as_view(), name='search-course'),
    path('api/search-user/', SearchUserView.as_view(), name='search-user'),

    path('docs/default/',
         spectacular_views.SpectacularAPIView.as_view(),
         name='schema'),
    path('docs/redoc/', spectacular_views.SpectacularRedocView.as_view(url_name='schema'),
         name='redoc'),
    path('docs/', spectacular_views.SpectacularSwaggerView.as_view(url_name='schema'),
         name='swagger-ui'),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    
    path('api/user_chats/', ListUserChatsView.as_view(), name='user_chats'),
    path('api/create_private_chat/', CreatePrivateChatView.as_view(), name='create_private_chat'),
    path("api/", include("api.urls")),  # Include the urls from the api app
    path('api/chat', chat_with_ai, name='chat_with_ai'),

    # Add a catch-all pattern
    #re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='home'), 
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS)
