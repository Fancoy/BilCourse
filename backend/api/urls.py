from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'calendar', views.EventViewSet, basename='calendar')

urlpatterns = [
    path("", include(router.urls)),  # Include router URLs
    path("courses/", views.CourseListCreate.as_view(), name="course-list"),
    path("courses/delete/<int:pk>/", views.CourseDelete.as_view(), name="delete-course"),
    path("courses/edit/<int:pk>/", views.CourseEdit.as_view(), name="edit-course"),
    path("courses/available/", views.AvailableCourses.as_view(), name='available-courses'),
    path("courses/enroll/<int:course_id>/", views.EnrollStudent.as_view(), name='enroll-student'),
    path('courses/leave/<int:course_id>/', views.LeaveCourse.as_view(), name='leave-course'),
    path('courses/<int:course_id>/assign-ta/', views.AssignTA.as_view(), name='assign-ta'),
    path('courses/<int:course_id>/create-forum/', views.CreateForum.as_view(), name='create-forum'),
]
