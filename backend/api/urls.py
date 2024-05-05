from django.urls import path
from . import views

urlpatterns = [
    path("courses/", views.CourseListCreate.as_view(), name="course-list"),
    path("courses/delete/<int:pk>/", views.CourseDelete.as_view(), name="delete-course"),
    path("courses/edit/<int:pk>/", views.CourseEdit.as_view(), name="edit-course"),
    path("courses/available/", views.AvailableCourses.as_view(), name='available-courses'),
    path("courses/enroll/<int:course_id>/", views.EnrollStudent.as_view(), name='enroll-student'),
    path('courses/leave/<int:course_id>/', views.LeaveCourse.as_view(), name='leave-course'),
    path('courses/<int:course_id>/assign-ta/', views.AssignTA.as_view(), name='assign-ta'),
    path('courses/<int:course_id>/create-forum/', views.CreateForum.as_view(), name='create-forum'),
    path("<str:room_name>/", views.room, name="room"),
]
"""path('chats/<int:chat_id>/', views.ChatMessagesView.as_view(), name='chat-detail'),
    path('chats/send-message/', views.SendMessageView.as_view(), name='send-message'),
    path('chats/create/', views.CreateChatView.as_view(), name='create-chat'),
    path('chats/', views.ChatListView.as_view(), name='chat-list'),
    
    path("chat/", views.index, name="index"),
    path("<str:room_name>/", views.room, name="room"),
    """


