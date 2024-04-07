from django.urls import path
from . import views

urlpatterns = [
    path("courses/", views.CourseListCreate.as_view(), name="course-list"),
    path("courses/delete/<int:pk>/", views.CourseDelete.as_view(), name="delete-course"),
    path("courses/edit/<int:pk>/", views.CourseEdit.as_view(), name="edit-course"),
]
