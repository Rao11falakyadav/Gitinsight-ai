from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

from repositories.urls import github_urlpatterns, analytics_urlpatterns

urlpatterns = [
    path("", RedirectView.as_view(url="/api/docs/", permanent=False), name="home-redirect"),
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),
    path("api/repositories/", include("repositories.urls")),
    path("api/github/", include(github_urlpatterns)),
    path("api/analytics/", include(analytics_urlpatterns)),
    path("api/analysis/", include("analysis.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
