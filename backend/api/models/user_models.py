from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from django.db.models import UniqueConstraint
class ChatPrivate(models.Model):
    user1 = models.ForeignKey('User', on_delete=models.CASCADE, related_name='chatprivate_user1')
    user2 = models.ForeignKey('User', on_delete=models.CASCADE, related_name='chatprivate_user2')
    title = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=['user1', 'user2'], name='unique_chatprivate')
        ]

    def save(self, *args, **kwargs):
        # Ensure user1 is always the user with the lower id
        if self.user1_id > self.user2_id:
            self.user1_id, self.user2_id = self.user2_id, self.user1_id
        super().save(*args, **kwargs)
        
class ChatMessagePrivate(models.Model):
    sender = models.ForeignKey('User', on_delete=models.CASCADE, related_name='sent_chat_private_messages')
    chat = models.ForeignKey('ChatPrivate', on_delete=models.CASCADE, related_name='chat_private_messages')
    created_time = models.DateTimeField(default=timezone.now)
    content = models.TextField()
class ChatMessage(models.Model):
    sender = models.ForeignKey('User', on_delete=models.CASCADE, related_name='sent_chat_messages')
    chat = models.ForeignKey('Chat', on_delete=models.CASCADE, related_name='chat_messages')
    created_time = models.DateTimeField(default=timezone.now)
    content = models.TextField()

    def __str__(self):
        return f"Message from {self.sender.email} in {self.chat.title}"

class Chat(models.Model):
    title = models.CharField(max_length=255)
    course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name='chats')
    
    def __str__(self):
        return self.title
    
class Badge(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    users = models.ManyToManyField('User', related_name='badges')
    user_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name='calendar_event')

    def __str__(self):
        return self.title

@receiver(m2m_changed, sender=Badge.users.through)
def update_user_count(sender, instance, action, **kwargs):
    if action == "post_add" or action == "post_remove":
        instance.user_count = instance.users.count()
        instance.save()

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    date_joined = models.DateTimeField(default=timezone.now)
    
    # account_type choices
    STUDENT = 'student'
    INSTRUCTOR = 'instructor'
    ACCOUNT_TYPE_CHOICES = [
        (STUDENT, 'Student'),
        (INSTRUCTOR, 'Instructor'),
    ]
    
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    mobile_number = models.CharField(max_length=10, blank=True, null=True)
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPE_CHOICES, blank=True, null=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    verification_code = models.CharField(max_length=6, blank=True, null=True)  # Added field
    is_verified = models.BooleanField(default=False)  # Added field

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email
    
