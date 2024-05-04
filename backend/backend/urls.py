from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from api.views import CreateUserView, UserAccountTypeView, UserProfileView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular import views as spectacular_views
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/" , CreateUserView.as_view(), name="register"),
    path('api/user/account-type/', UserAccountTypeView.as_view(), name='user-account-type'),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),  # Include the urls from the api app

    path('docs/default/',
         spectacular_views.SpectacularAPIView.as_view(),
         name='schema'),
    path('docs/redoc/', spectacular_views.SpectacularRedocView.as_view(url_name='schema'),
         name='redoc'),
    path('docs/', spectacular_views.SpectacularSwaggerView.as_view(url_name='schema'),
         name='swagger-ui'),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path("api/", include("api.urls")),  # Include the urls from the api app

    # Add a catch-all pattern
    #re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='home'), 
]

if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
else:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS)
