from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from datetime import time

FREQUENCY_CHOICES = [
    ("once", "Once"),
    ("daily", "Daily"),
    ("weekdays", "Weekdays"),
    ("weekends", "Weekends"),
    ("weekly", "Weekly"),
    ("monthly", "Monthly"),
    ("custom_dates", "Custom Dates"),
]

PRIORITY_CHOICES = [
    ("none", "None"),
    ("low", "Low"),
    ("medium", "Medium"),
    ("high", "High"),
]


def get_default_end_time():
    return time(23, 59)  # 11:59PM


def get_default_end_date():
    return timezone.now() + timedelta(days=7)


class Category(models.Model):
    name = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name


class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)

    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="tasks", null=True, blank=True
    )
    frequency = models.CharField(
        max_length=20, choices=FREQUENCY_CHOICES, default="once"
    )
    frequency_days = models.JSONField(default=list, blank=True)

    person = models.CharField(max_length=200, default="Unassigned")

    start_date = models.DateField(default=timezone.now)

    end_date = models.DateField(default=get_default_end_date)

    end_time = models.TimeField(default=get_default_end_time)
    
    custom_dates = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="none")
    order = models.PositiveIntegerField(default=0)
