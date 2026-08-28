from rest_framework import serializers
from .models import Repository


class RepositorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Repository
        fields = "__all__"
        read_only_fields = ["owner", "github_id", "created_at"]
