from django.urls import path
from .views import (
    GitHubRepositoriesView,
    GitHubSyncView,
    GitHubProfileView,
    RepositoryListView,
    RepositoryDetailView,
    RepositoryAnalyticsView,
    GitHubScoreView,
    DashboardView,
    ContributionAnalyticsView,
    RepositoryHealthView,
)

urlpatterns = [
    path("", RepositoryListView.as_view(), name="repository-list"),
    path("<int:pk>/", RepositoryDetailView.as_view(), name="repository-detail"),
    path(
        "github/<str:username>/",
        GitHubRepositoriesView.as_view(),
        name="github-repositories",
    ),
    path("analytics/", RepositoryAnalyticsView.as_view(), name="repository-analytics"),
    path("score/", GitHubScoreView.as_view(), name="github-score"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path(
        "<int:pk>/health/",
        RepositoryHealthView.as_view(),
        name="repository-health",
    ),
]

github_urlpatterns = [
    path("sync/", GitHubSyncView.as_view(), name="github-sync"),
    path("profile/", GitHubProfileView.as_view(), name="github-profile"),
]

analytics_urlpatterns = [
    path(
        "contributions/",
        ContributionAnalyticsView.as_view(),
        name="contribution-analytics",
    ),
]
