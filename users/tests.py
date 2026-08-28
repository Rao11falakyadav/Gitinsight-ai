from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class AuthTests(APITestCase):

    def test_user_can_register(self):
        response = self.client.post(reverse("register"), {
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepass123",
            "github_username": "testgh",
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="testuser").exists())

    def test_user_can_login(self):
        User.objects.create_user(
            username="loginuser",
            email="login@example.com",
            password="securepass123",
        )
        response = self.client.post(reverse("login"), {
            "username": "loginuser",
            "password": "securepass123",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_unauthenticated_user_cannot_access_profile(self):
        response = self.client.get(reverse("profile"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_access_profile(self):
        user = User.objects.create_user(
            username="profileuser",
            email="profile@example.com",
            password="securepass123",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(user).access_token}"
        )
        response = self.client.get(reverse("profile"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "profileuser")
