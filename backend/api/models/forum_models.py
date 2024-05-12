from django.db import models
from django.utils import timezone

class ForumMessage(models.Model):
    sender = models.ForeignKey('User', on_delete=models.CASCADE, related_name='sent_messages')
    forum = models.ForeignKey('Forum', on_delete=models.CASCADE, related_name='forums_messages')
    # forum_title = models.CharField(max_length=255)
    created_time = models.DateTimeField(default=timezone.now)
    content = models.TextField()
    header = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.header} by {self.sender.email}"

class Forum(models.Model):
    course = models.ForeignKey('api.Course', on_delete=models.CASCADE, related_name='forums')
    title = models.CharField(max_length=255)
    forum_messages = models.ManyToManyField('ForumMessage', related_name='forums', blank=True)

    def __str__(self):
        return self.title