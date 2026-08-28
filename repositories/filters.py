import django_filters
from django.db.models import Q

from .models import Repository


class RepositoryFilter(django_filters.FilterSet):
    language = django_filters.CharFilter(field_name="language", lookup_expr="iexact")
    min_stars = django_filters.NumberFilter(field_name="stars", lookup_expr="gte")
    search = django_filters.CharFilter(method="filter_search")
    ordering = django_filters.OrderingFilter(
        fields=(
            ("stars", "stars"),
            ("forks", "forks"),
            ("repo_name", "name"),
            ("updated_at_github", "updated"),
            ("created_at_github", "created"),
        ),
    )

    class Meta:
        model = Repository
        fields = ["language", "min_stars", "search", "is_fork", "is_archived"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(repo_name__icontains=value)
            | Q(description__icontains=value)
            | Q(language__icontains=value)
        )
