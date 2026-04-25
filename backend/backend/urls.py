"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from tasks.views import (
    TaskListCreateAPIView,
    TaskDetailAPIView,
    CategoryListCreateAPIView,
    CategoryDeleteAPIView,
    RegisterUserAPIView,
    LoginAPIView,
    TaskReorderAPIView,
    TaskCompleteAPIView,
    TaskAutoDeleteArchiveAPIView
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/register/", RegisterUserAPIView.as_view()),
    path("api/login/", LoginAPIView.as_view()),
    path("api/categories/", CategoryListCreateAPIView.as_view()),
    path("api/categories/<int:pk>/", CategoryDeleteAPIView.as_view()),
    path("api/tasks/", TaskListCreateAPIView.as_view()),
    path("tasks/auto-delete-archive/", TaskAutoDeleteArchiveAPIView.as_view()),
    path("api/tasks/<int:pk>/", TaskDetailAPIView.as_view()),
    path("api/tasks/reorder/", TaskReorderAPIView.as_view()),
    path("api/tasks/<int:pk>/complete/", TaskCompleteAPIView.as_view()),
    
]
