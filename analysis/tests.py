from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User
from repositories.models import Repository


class AnalysisTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="analysisuser",
            email="analysis@example.com",
            password="securepass123",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(self.user).access_token}"
        )
        self.repo = Repository.objects.create(
            owner=self.user,
            github_id=99999,
            repo_name="AnalysisRepo",
            description="Project for analysis",
            language="Python",
            stars=5,
            forks=2,
            html_url="https://github.com/analysisuser/AnalysisRepo",
            license="MIT",
            topics=["python", "django"],
        )

    def test_career_insights(self):
        response = self.client.get(reverse("career-insights"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("strongest_skills", response.data)

    def test_repository_analysis(self):
        response = self.client.post(reverse("repository-analysis", kwargs={"pk": self.repo.pk}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("overall_score", response.data)

    def test_resume_analysis(self):
        response = self.client.post(reverse("resume-analysis"), {
            "resume_text": (
                "Experienced Python developer with Django and REST API experience. "
                "Built multiple web applications using React and PostgreSQL."
            ),
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("resume_score", response.data)

    def test_unauthenticated_cannot_access_analysis(self):
        self.client.credentials()
        response = self.client.get(reverse("career-insights"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
