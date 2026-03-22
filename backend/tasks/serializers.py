from rest_framework import serializers
from .models import Task,Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model=Category
        fields='__all__'

class TaskSerializer(serializers.ModelSerializer):
    category_name=serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = Task
        fields = '__all__'