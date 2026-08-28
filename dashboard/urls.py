from django.urls import path
from .views import UnifiedDashboardView

urlpatterns = [
    path("", UnifiedDashboardView.as_view(), name="unified-dashboard"),
]
