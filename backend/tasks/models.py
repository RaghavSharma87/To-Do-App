from django.db import models
from django.utils import timezone
from datetime import timedelta


def get_default_category():
    category, created = Category.objects.get_or_create(name="General")
    return category.id


def get_default_end_date():
    return timezone.now() + timedelta(days=7)


class Category(models.Model):
    name = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.name


class Task(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="tasks",
        default=get_default_category,
    )

    person = models.CharField(max_length=200, default="Unassigned")

    start_date = models.DateField(default=timezone.now)

    end_date = models.DateField(default=get_default_end_date)

    created_at = models.DateTimeField(auto_now_add=True)
