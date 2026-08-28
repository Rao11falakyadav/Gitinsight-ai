from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    github_username = models.CharField(max_length=100, blank=True, null=True)
    github_id = models.CharField(max_length=100, blank=True, null=True)
    profile_image = models.URLField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    followers = models.PositiveIntegerField(default=0)
    following = models.PositiveIntegerField(default=0)
    public_repositories = models.PositiveIntegerField(default=0)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.username
