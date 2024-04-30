from django.urls import path
from . import views_api
from rest_framework import routers

router = routers.SimpleRouter(trailing_slash=False)
router.register('courses', views_api.CourseModelViewSet)
router.register('forums',views_api.ForumViewSet)
router.register('assignments', views_api.AssignmentViewSet)

urlpatterns = []

urlpatterns += router.urls
