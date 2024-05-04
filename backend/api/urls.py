from django.urls import path
from . import views_api
from rest_framework import routers

router = routers.SimpleRouter(trailing_slash=False)
router.register('courses', views_api.CourseModelViewSet, basename='courses')
router.register('forums',views_api.ForumViewSet, basename='forums')
router.register('assignments', views_api.AssignmentViewSet, basename='assignments')
router.register('calendar', views_api.EventViewSet, basename='calendar')

urlpatterns = []

urlpatterns += router.urls
