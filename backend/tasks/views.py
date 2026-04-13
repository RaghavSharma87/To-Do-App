from django.shortcuts import render
from .models import Task, Category
from django.contrib.auth.models import User
from .serializers import TaskSerializer, CategorySerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
import calendar
from datetime import timedelta, date


# ──────────────────────────────────────────────────────────────────────────────
# Frequency helpers
# ──────────────────────────────────────────────────────────────────────────────

def next_month_same_date(current_date):
    """Return the same day-of-month in the next calendar month (clamped to last day)."""
    year = current_date.year
    month = current_date.month + 1
    if month > 12:
        month = 1
        year += 1
    # BUG FIX: was `min(current_date, last_day)` — current_date is a date object,
    # not an int.  Must use current_date.day.
    last_day = calendar.monthrange(year, month)[1]
    day = min(current_date.day, last_day)
    return date(year, month, day)


def next_weekday(current_date):
    """Return the next Mon–Fri date after *current_date*."""
    next_date = current_date + timedelta(days=1)
    while next_date.weekday() >= 5:          # 5=Sat, 6=Sun
        next_date += timedelta(days=1)
    return next_date


def next_weekend(current_date):
    """Return the next Sat or Sun after *current_date*."""
    next_date = current_date + timedelta(days=1)
    while next_date.weekday() not in (5, 6):
        next_date += timedelta(days=1)
    return next_date


def next_custom_day(current_date, selected_days):
    """
    Return the next date (after *current_date*) whose weekday is in
    *selected_days* (Mon=0 … Sun=6).

    BUG FIX: if selected_days is empty we would loop forever; guard against it
    by returning current_date + 1 as a safe fallback.
    """
    if not selected_days:
        return current_date + timedelta(days=1)
    next_date = current_date + timedelta(days=1)
    while next_date.weekday() not in selected_days:
        next_date += timedelta(days=1)
    return next_date


def next_custom_date(current_date, custom_dates):
    """
    For the 'custom_dates' frequency: pick the nearest future date from the
    stored list.  If none is left, return None (caller should archive the task
    without creating a successor).
    """
    future = sorted(d for d in custom_dates if d > str(current_date))
    if not future:
        return None
    return date.fromisoformat(future[0])


# ──────────────────────────────────────────────────────────────────────────────
# Auth
# ──────────────────────────────────────────────────────────────────────────────

class RegisterUserAPIView(APIView):

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Username and password required!"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST
            )
        User.objects.create_user(username=username, password=password)
        return Response(
            {"message": "User created successfully"}, status=status.HTTP_201_CREATED
        )


class LoginAPIView(TokenObtainPairView):
    pass


# ──────────────────────────────────────────────────────────────────────────────
# Categories
# ──────────────────────────────────────────────────────────────────────────────

class CategoryListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = Category.objects.filter(user=request.user)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDeleteAPIView(APIView):
    # BUG FIX: added IsAuthenticated – the original had no permission class,
    # so any anonymous user could delete categories.
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            category = Category.objects.get(pk=pk, user=request.user)
        except Category.DoesNotExist:
            return Response({"error": "Not Found"}, status=status.HTTP_404_NOT_FOUND)

        # Reassign orphaned tasks to a per-user "General" category instead of a
        # shared global one (avoids cross-user data leakage).
        general, _ = Category.objects.get_or_create(
            name="General", user=request.user
        )
        Task.objects.filter(category=category, user=request.user).update(
            category=general
        )
        category.delete()
        return Response({"message": "Category Deleted"}, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────────────────────────────────────
# Tasks
# ──────────────────────────────────────────────────────────────────────────────

class TaskListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        include_archived = request.GET.get("include_archived")
        archived = request.GET.get("archived")

        if include_archived == "true":
            tasks = Task.objects.filter(user=request.user).order_by("order")
        elif archived == "true":
            tasks = Task.objects.filter(user=request.user, archived=True).order_by("order")
        else:
            tasks = Task.objects.filter(user=request.user, archived=False).order_by("order")

        # Optional filters
        category = request.GET.get("category")
        person = request.GET.get("person")
        filter_date = request.GET.get("date")

        if category:
            tasks = tasks.filter(category__name__icontains=category)
        if person:
            tasks = tasks.filter(person__icontains=person)
        if filter_date:
            tasks = tasks.filter(end_date=filter_date)

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Task, pk=pk, user=self.request.user)

    def get(self, request, pk):
        task = self.get_object(pk)
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    def put(self, request, pk):
        task = self.get_object(pk)
        serializer = TaskSerializer(task, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        task = self.get_object(pk)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        task = self.get_object(pk)
        task.delete()
        return Response({"message": "Deleted"}, status=status.HTTP_204_NO_CONTENT)


class TaskReorderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        for item in request.data:
            Task.objects.filter(id=item["id"], user=request.user).update(
                order=item["order"]
            )
        return Response({"status": "ok"})


class TaskCompleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk, user=request.user)

        # Archive / complete the current occurrence
        task.completed = True
        task.archived = True
        task.save()

        # ── One-time task: nothing more to do ────────────────────────────────
        if task.frequency == "once":
            return Response({"message": "Task archived"})

        current_date = task.end_date

        # ── Determine next occurrence date ────────────────────────────────────
        if task.frequency == "daily":
            next_date = current_date + timedelta(days=1)

        elif task.frequency == "weekdays":
            next_date = next_weekday(current_date)

        elif task.frequency == "weekends":
            next_date = next_weekend(current_date)

        elif task.frequency == "weekly":
            # BUG FIX: "weekly" uses frequency_days (selected weekdays).
            # Guard against an empty list to avoid an infinite loop.
            next_date = next_custom_day(current_date, task.frequency_days)

        elif task.frequency == "monthly":
            next_date = next_month_same_date(current_date)

        elif task.frequency == "custom_dates":
            # NEW: pick the next date from the stored list; if exhausted, stop.
            next_date = next_custom_date(current_date, task.custom_dates)
            if next_date is None:
                return Response({"message": "All custom dates completed"})

        else:
            # Unknown frequency – treat as daily as a safe default
            next_date = current_date + timedelta(days=1)

        # ── Create the next occurrence ────────────────────────────────────────
        Task.objects.create(
            user=task.user,
            title=task.title,
            category=task.category,
            person=task.person,
            priority=task.priority,
            frequency=task.frequency,
            frequency_days=task.frequency_days,
            custom_dates=task.custom_dates,   # carry forward for custom_dates tasks
            start_date=next_date,
            end_date=next_date,
            end_time=task.end_time,
            completed=False,
            archived=False,
            order=task.order,
        )

<<<<<<< HEAD
        return Response({"message": "Recurring task completed"})
=======
        return Response({"message": "Recurring task completed, next occurrence created"})
>>>>>>> d05937f (Major Fixes Done)
