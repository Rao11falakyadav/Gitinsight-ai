from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Repository
from .serializers import RepositorySerializer
from .filters import RepositoryFilter
from .services import (
    sync_repositories,
    sync_github_profile,
    calculate_analytics,
    calculate_github_score,
    calculate_dashboard,
    calculate_contributions,
    calculate_repository_health,
)


class RepositoryListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RepositorySerializer
    filterset_class = RepositoryFilter

    def get_queryset(self):
        return Repository.objects.filter(owner=self.request.user)


class RepositoryDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RepositorySerializer

    def get_queryset(self):
        return Repository.objects.filter(owner=self.request.user)


class GitHubRepositoriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        result, error = sync_repositories(request.user, username)
        if error:
            return Response({"error": error["error"]}, status=error["status"])

        repositories = Repository.objects.filter(owner=request.user)
        serializer = RepositorySerializer(repositories, many=True)
        return Response(serializer.data)


class GitHubSyncView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get("username") or request.user.github_username
        if not username:
            return Response(
                {"error": "GitHub username is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result, error = sync_repositories(request.user, username)
        if error:
            return Response({"error": error["error"]}, status=error["status"])

        request.user.github_username = username
        request.user.save(update_fields=["github_username"])

        return Response(result)


class GitHubProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.github_username
        if not username:
            return Response(
                {"error": "No GitHub username linked to your account"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile, error = sync_github_profile(request.user, username)
        if error:
            return Response({"error": error["error"]}, status=error["status"])

        return Response(profile)


class RepositoryAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(calculate_analytics(request.user))


class GitHubScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(calculate_github_score(request.user))


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(calculate_dashboard(request.user))


class ContributionAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(calculate_contributions(request.user))


class RepositoryHealthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            repository = Repository.objects.get(pk=pk, owner=request.user)
        except Repository.DoesNotExist:
            return Response(
                {"error": "Repository not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(calculate_repository_health(repository))
