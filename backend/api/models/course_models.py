from django.core.validators import MinValueValidator
from django.db import models

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