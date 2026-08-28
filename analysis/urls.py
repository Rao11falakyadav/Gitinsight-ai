from django.urls import path
from .views import (
    ReadmeAnalysisView,
    RepositoryAnalysisView,
    CareerInsightsView,
    ResumeAnalysisView,
)

urlpatterns = [
    path("readme/", ReadmeAnalysisView.as_view(), name="readme-analysis"),
    path(
        "repository/<int:pk>/",
        RepositoryAnalysisView.as_view(),
        name="repository-analysis",
    ),
    path("career/", CareerInsightsView.as_view(), name="career-insights"),
    path("resume/", ResumeAnalysisView.as_view(), name="resume-analysis"),
]
