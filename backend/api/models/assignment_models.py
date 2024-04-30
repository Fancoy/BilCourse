from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify

class Assignment(models.Model):
      
    # semester choices
    FALL = 'fall'
    SPRING = 'spring'
    SUMMER = 'summer'
    SEMESTER_CHOICES = [
        (FALL, 'Fall'),
        (SPRING, 'Spring'),
        (SUMMER, 'Summer')
    ]

    course =  models.ForeignKey('api.Course', on_delete=models.PROTECT, related_name='course_assignments')
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank = True)
    description = models.TextField()
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES, blank=True, null=True)
    year = models.IntegerField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    assignment_file = models.FileField(upload_to='assignment_files/%Y/%m/%d')
    solution_key_file = models.FileField(upload_to='solution_key_files/%Y/%m/%d')
    is_solution_key_available = models.BooleanField(default=False)

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super(Assignment, self).save()

class StudentAssignment(models.Model):

    # semester choices
    FALL = 'fall'
    SPRING = 'spring'
    SUMMER = 'summer'
    SEMESTER_CHOICES = [
        (FALL, 'Fall'),
        (SPRING, 'Spring'),
        (SUMMER, 'Summer')
    ]

    student = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='student_assignments')
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='assignment_students')
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES, blank=True, null=True)
    year = models.IntegerField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    result_file = models.FileField(upload_to='student_assignment_results/')

    def __str__(self):
        return f"{self.assignment.title} by {self.student.email}"