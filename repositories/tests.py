from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User
from .models import Repository


class RepositoryTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="repouser",
            email="repo@example.com",
            password="securepass123",
            github_username="repouser",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(self.user).access_token}"
        )
        self.repo = Repository.objects.create(
            owner=self.user,
            github_id=12345,
            repo_name="TestRepo",
            description="A test repository",
            language="Python",
            stars=10,
            forks=3,
            html_url="https://github.com/repouser/TestRepo",
        )

    def test_list_repositories(self):
        response = self.client.get(reverse("repository-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_retrieve_repository(self):
        response = self.client.get(reverse("repository-detail", kwargs={"pk": self.repo.pk}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["repo_name"], "TestRepo")

    def test_delete_repository(self):
        response = self.client.delete(reverse("repository-detail", kwargs={"pk": self.repo.pk}))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Repository.objects.filter(pk=self.repo.pk).exists())

    def test_filter_by_language(self):
        response = self.client.get(reverse("repository-list"), {"language": "Python"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_filter_by_min_stars(self):
        response = self.client.get(reverse("repository-list"), {"min_stars": 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_search_repositories(self):
        response = self.client.get(reverse("repository-list"), {"search": "Test"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_analytics_endpoint(self):
        response = self.client.get(reverse("repository-analytics"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_repositories"], 1)

    def test_score_endpoint(self):
        response = self.client.get(reverse("github-score"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("github_score", response.data)

    def test_dashboard_endpoint(self):
        response = self.client.get(reverse("dashboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("languages", response.data)

    def test_health_score_endpoint(self):
        response = self.client.get(reverse("repository-health", kwargs={"pk": self.repo.pk}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("score", response.data)

    def test_unauthenticated_cannot_access_repositories(self):
        self.client.credentials()
        response = self.client.get(reverse("repository-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_contribution_analytics(self):
        response = self.client.get(reverse("contribution-analytics"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("contribution_score", response.data)
