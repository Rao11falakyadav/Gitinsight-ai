from django.db import models
from users.models import User


class Repository(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="repositories",
    )
    github_id = models.BigIntegerField(unique=True)
    repo_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    language = models.CharField(max_length=100, blank=True)
    stars = models.PositiveIntegerField(default=0)
    forks = models.PositiveIntegerField(default=0)
    watchers = models.PositiveIntegerField(default=0)
    open_issues = models.PositiveIntegerField(default=0)
    size = models.PositiveIntegerField(default=0)
    default_branch = models.CharField(max_length=100, blank=True, default="main")
    topics = models.JSONField(default=list, blank=True)
    license = models.CharField(max_length=100, blank=True)
    is_fork = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    html_url = models.URLField()
    created_at_github = models.DateTimeField(null=True, blank=True)
    updated_at_github = models.DateTimeField(null=True, blank=True)
    pushed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-stars", "-updated_at_github"]

    def __str__(self):
        return self.repo_name
