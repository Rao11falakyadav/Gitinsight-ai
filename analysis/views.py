from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from repositories.models import Repository
from .serializers import ReadmeAnalysisSerializer, ResumeAnalysisSerializer
from .services import analyze_readme, analyze_repository, analyze_career, analyze_resume


class ReadmeAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReadmeAnalysisSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            repository = Repository.objects.get(
                pk=serializer.validated_data["repository_id"],
                owner=request.user,
            )
        except Repository.DoesNotExist:
            return Response(
                {"error": "Repository not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(analyze_readme(repository))


class RepositoryAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            repository = Repository.objects.get(pk=pk, owner=request.user)
        except Repository.DoesNotExist:
            return Response(
                {"error": "Repository not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(analyze_repository(repository))


class CareerInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(analyze_career(request.user))


class ResumeAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ResumeAnalysisSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = analyze_resume(request.user, serializer.validated_data["resume_text"])
        return Response(result)
