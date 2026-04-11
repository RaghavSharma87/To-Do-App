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
from datetime import timedelta, datetime
# Create your views here.

def next_weekday(date):
    next_date=date+timedelta(days=1)
    while next_date.weekday() >= 5:
        next_date+=timedelta(days=1)
    return next_date

def next_weekend(date):
    next_date = date + timedelta(days=1)
    while next_date.weekday() not in [5, 6]:
        next_date += timedelta(days=1)
    return next_date

def next_custom_day(date, selected_days):
    """
    selected_days:
    Monday=0 ... Sunday=6
    """
    next_date = date + timedelta(days=1)

    while next_date.weekday() not in selected_days:
        next_date += timedelta(days=1)

    return next_date

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
        user = User.objects.create_user(username=username, password=password)
        return Response(
            {"message": "User created successfully"}, status=status.HTTP_201_CREATED
        )


class LoginAPIView(TokenObtainPairView):
    pass


class CategoryDeleteAPIView(APIView):
    def delete(self, request, pk):
        try:
            category = Category.objects.get(pk=pk, user=request.user)
        except Category.DoesNotExist:
            return Response({"error": "Not Found"}, status=404)

        general, _ = Category.objects.get_or_create(name="General")
        Task.objects.filter(category=category).update(category=general)
        category.delete()
        return Response({"message": "Category Deleted"})


class CategoryListCreateAPIView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        categories = Category.objects.filter(user=request.user)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors)


class TaskListCreateAPIView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request):
        archived=request.GET.get("archived")
        if archived == "true":
            tasks=Task.objects.filter(user=request.user, archived=True).order_by('order')
        else:
            tasks=Task.objects.filter(user=request.user, archived=False).order_by('order')
        # filters
        category = request.GET.get("category")
        person = request.GET.get("person")
        date = request.GET.get("date")
        if category:
            tasks = tasks.filter(category__name__icontains=category)

        if person:
            tasks = tasks.filter(person__icontains=person)

        if date:
            tasks = tasks.filter(end_date=date)

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
        task = self.get_object(pk, user=request.user)
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    def put(self, request, pk):
        task = self.get_object(pk)
        serializer = TaskSerializer(task, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def patch(self, request, pk):
        task = self.get_object(pk)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        task = self.get_object(pk, user=request.user)
        task.delete()
        return Response({"message": "Deleted"}, status=204)

class TaskReorderAPIView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        for item in request.data:
            Task.objects.filter(id=item['id'], user=request.user).update(order=item['order'])
        return Response({'status':'ok'})
        
    
class TaskCompleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk, user=request.user)

        # complete current occurrence
        task.completed = True
        task.archived = True
        task.save()

        # one-time task → stop here
        if task.frequency == "once":
            return Response({"message": "Task archived"})

        current_date = task.end_date

        # determine next date
        if task.frequency == "daily":
            next_date = current_date + timedelta(days=1)

        elif task.frequency == "weekdays":
            next_date = next_weekday(current_date)

        elif task.frequency == "weekends":
            next_date = next_weekend(current_date)

        elif task.frequency == "custom":
            next_date = next_custom_day(current_date, task.frequency_days)

        else:
            next_date = current_date + timedelta(days=1)

        # create next occurrence
        Task.objects.create(
            user=task.user,
            title=task.title,
            category=task.category,
            person=task.person,
            priority=task.priority,
            frequency=task.frequency,
            frequency_days=task.frequency_days,
            start_date=next_date,
            end_date=next_date,
            end_time=task.end_time,
            completed=False,
            archived=False,
            order=task.order,
        )

        return Response({"message": "Recurring task completed"})