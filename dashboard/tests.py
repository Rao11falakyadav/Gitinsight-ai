from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User
from repositories.models import Repository


class DashboardTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="dashuser",
            email="dash@example.com",
            password="securepass123",
            github_username="dashuser",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(self.user).access_token}"
        )
        Repository.objects.create(
            owner=self.user,
            github_id=11111,
            repo_name="DashRepo",
            language="Python",
            stars=3,
            html_url="https://github.com/dashuser/DashRepo",
        )

    def test_unified_dashboard(self):
        response = self.client.get(reverse("unified-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("profile", response.data)
        self.assertIn("repositories", response.data)
        self.assertIn("score", response.data)
        self.assertIn("career", response.data)

    def test_unauthenticated_cannot_access_dashboard(self):
        self.client.credentials()
        response = self.client.get(reverse("unified-dashboard"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
