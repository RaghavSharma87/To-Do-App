from rest_framework import serializers
from .models import Task,Category
from django.contrib.auth.models import User

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model=Category
        fields='__all__'

class TaskSerializer(serializers.ModelSerializer):
    category_name=serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields=["user"]

class RegisterSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True)
    
    class Meta:
        model : User
        fields = ["id","username","password"]
    
    def create(self, validated_data):
        user=User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"]
        )
        return User
     