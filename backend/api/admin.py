from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Course  # Import your custom user model

class UserAdmin(BaseUserAdmin):
    # Define custom display columns in the admin list view
    list_display = ('email', 'first_name', 'last_name', 'is_staff')
    # Define fieldsets for the user edit page in admin
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'account_type',
                                       'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')},
         ),
    )
    # Define fields for the create user form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'created_at', 'capacity')  # Customize as needed
    search_fields = ('title', 'description', 'instructor__email')  # Adjust according to your needs

# Register your models here
admin.site.register(User, UserAdmin)  # This line is already there for the User model
admin.site.register(Course, CourseAdmin)  # Add this line to register Course with the CourseAdmin options