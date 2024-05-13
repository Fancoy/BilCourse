from django.urls import path
from . import views_api
from api import views
from rest_framework import routers
from api.views import CreateUserView, VerifyEmailView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = routers.SimpleRouter(trailing_slash=False)
router.register(r'courses', views_api.CourseModelViewSet, basename='courses')
router.register(r'assignments', views_api.AssignmentViewSet, basename='assignments')
router.register(r'student-assignments', views.StudentAssignmentViewSet, basename='student-assignments')
router.register('forums', views_api.ForumViewSet, basename='forums')
router.register('calendar', views_api.EventViewSet, basename='calendar')

urlpatterns = [
    path('user/register/', CreateUserView.as_view(), name='register'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

urlpatterns += router.urls
