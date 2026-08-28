from django.http import HttpResponse
from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import User
from .serializers import RegisterSerializer


def home(request):
    return HttpResponse("Welcome to GitInsight AI 🚀")


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "github_username": request.user.github_username,
            "bio": request.user.bio or "",
            "followers": request.user.followers,
            "following": request.user.following,
            "avatar_url": request.user.avatar_url or "",
        })
