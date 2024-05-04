from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from django.db.models.signals import m2m_changed
from django.dispatch import receiver

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

class ForumMessage(models.Model):
    sender = models.ForeignKey('User', on_delete=models.CASCADE, related_name='sent_messages')
    forum_title = models.CharField(max_length=255)
    created_time = models.DateTimeField(default=timezone.now)
    content = models.TextField()
    header = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.header} by {self.sender.email}"

class Forum(models.Model):
    course = models.ForeignKey('Course', on_delete=models.CASCADE, related_name='forums')
    title = models.CharField(max_length=255)
    forum_messages = models.ManyToManyField(ForumMessage, related_name='forums', blank=True)

    def __str__(self):
        return self.title

class Course(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    instructor = models.ForeignKey('User', on_delete=models.CASCADE, related_name='taught_courses')
    assistants = models.ManyToManyField('User', related_name='assisted_courses', blank=True)
    students = models.ManyToManyField('User', related_name='enrolled_courses', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    capacity = models.IntegerField(default=10,validators=[MinValueValidator(1)])
       
    def __str__(self):
        return self.title

# extending django's default user model. So that we can use mail as the unique identifier instead of username.
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

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email
