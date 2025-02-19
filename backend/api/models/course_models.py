from django.core.validators import MinValueValidator
from django.db import models
from django.utils.text import slugify

class Course(models.Model):
    title = models.CharField(max_length=100, unique = True)
    slug = models.SlugField(unique=True, blank = True)
    description = models.TextField()
    instructor = models.ForeignKey('User', on_delete=models.CASCADE, related_name='taught_courses')
    assistants = models.ManyToManyField('User', related_name='assisted_courses', blank=True)
    students = models.ManyToManyField('User', related_name='enrolled_courses', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    capacity = models.IntegerField(default=10,validators=[MinValueValidator(1)])
       
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super(Course, self).save()
        
class Activity(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, verbose_name="Related Course")
    title = models.CharField(max_length=100, verbose_name="Activity Title")
    description = models.TextField()
    date = models.DateTimeField()

    class Meta:
        unique_together = ('course', 'title')  # Ensuring the combination of course and title is unique

    def __str__(self):
        return f"{self.title} in {self.course.title}"

    def save(self, *args, **kwargs):
        super(Activity, self).save(*args, **kwargs)