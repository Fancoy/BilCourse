# Generated by Django 5.0.4 on 2024-04-07 13:26

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_course_capacity'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='capacity',
            field=models.IntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)]),
        ),
    ]
