import requests
from collections import Counter
from datetime import timedelta

from django.utils import timezone

from .models import Repository

GITHUB_API = "https://api.github.com"
RECENT_DAYS = 90


def _parse_github_datetime(value):
    if not value:
        return None
    from django.utils.dateparse import parse_datetime

    return parse_datetime(value.replace("Z", "+00:00"))


def _repo_defaults(user, repo):
    license_name = ""
    if repo.get("license") and repo["license"].get("spdx_id"):
        license_name = repo["license"]["spdx_id"]

    return {
        "owner": user,
        "repo_name": repo["name"],
        "description": repo.get("description") or "",
        "language": repo.get("language") or "",
        "stars": repo.get("stargazers_count", 0),
        "forks": repo.get("forks_count", 0),
        "watchers": repo.get("watchers_count", 0),
        "open_issues": repo.get("open_issues_count", 0),
        "size": repo.get("size", 0),
        "default_branch": repo.get("default_branch") or "main",
        "topics": repo.get("topics") or [],
        "license": license_name,
        "is_fork": repo.get("fork", False),
        "is_archived": repo.get("archived", False),
        "html_url": repo["html_url"],
        "created_at_github": _parse_github_datetime(repo.get("created_at")),
        "updated_at_github": _parse_github_datetime(repo.get("updated_at")),
        "pushed_at": _parse_github_datetime(repo.get("pushed_at")),
    }


def fetch_github_repos(username):
    url = f"{GITHUB_API}/users/{username}/repos"
    response = requests.get(url, params={"per_page": 100}, timeout=15)

    if response.status_code == 404:
        return None, {"error": "GitHub user not found", "status": 404}
    if response.status_code == 403:
        return None, {"error": "GitHub API rate limit exceeded", "status": 403}
    if response.status_code != 200:
        return None, {"error": "Failed to fetch from GitHub", "status": response.status_code}

    return response.json(), None


def fetch_github_profile(username):
    url = f"{GITHUB_API}/users/{username}"
    response = requests.get(url, timeout=15)

    if response.status_code == 404:
        return None, {"error": "GitHub user not found", "status": 404}
    if response.status_code == 403:
        return None, {"error": "GitHub API rate limit exceeded", "status": 403}
    if response.status_code != 200:
        return None, {"error": "Failed to fetch profile", "status": response.status_code}

    return response.json(), None


def sync_repositories(user, username):
    repos, error = fetch_github_repos(username)
    if error:
        return None, error

    created, updated = 0, 0
    github_ids = []

    for repo in repos:
        github_ids.append(repo["id"])
        _, was_created = Repository.objects.update_or_create(
            github_id=repo["id"],
            defaults=_repo_defaults(user, repo),
        )
        if was_created:
            created += 1
        else:
            updated += 1

    return {
        "synced": len(repos),
        "created": created,
        "updated": updated,
        "removed": 0,
    }, None


def sync_github_profile(user, username):
    profile, error = fetch_github_profile(username)
    if error:
        return None, error

    user.github_username = profile.get("login")
    user.github_id = str(profile.get("id", ""))
    user.bio = profile.get("bio") or ""
    user.followers = profile.get("followers", 0)
    user.following = profile.get("following", 0)
    user.public_repositories = profile.get("public_repos", 0)
    user.avatar_url = profile.get("avatar_url") or ""
    user.profile_image = profile.get("avatar_url") or ""
    user.save()

    return {
        "username": profile.get("login"),
        "name": profile.get("name") or "",
        "bio": profile.get("bio") or "",
        "followers": profile.get("followers", 0),
        "following": profile.get("following", 0),
        "public_repositories": profile.get("public_repos", 0),
        "avatar_url": profile.get("avatar_url") or "",
    }, None


def calculate_github_score(user):
    repositories = Repository.objects.filter(owner=user)

    repo_count = repositories.count()
    total_stars = sum(r.stars for r in repositories)
    total_forks = sum(r.forks for r in repositories)
    languages = [r.language for r in repositories if r.language]
    language_count = len(set(languages))

    score = 0
    score += min(repo_count * 2, 30)
    score += min(total_stars, 25)
    score += min(total_forks, 15)
    score += min(language_count * 4, 20)

    if repositories.filter(repo_name__icontains="portfolio").exists():
        score += 10

    score = min(score, 100)

    if score >= 90:
        grade = "A+"
    elif score >= 80:
        grade = "A"
    elif score >= 70:
        grade = "B"
    elif score >= 60:
        grade = "C"
    else:
        grade = "D"

    strengths = []
    improvements = []

    if repo_count >= 10:
        strengths.append("Good number of repositories")
    else:
        improvements.append("Create more repositories")

    if language_count >= 3:
        strengths.append("Uses multiple programming languages")
    else:
        improvements.append("Explore more programming languages")

    if total_stars == 0:
        improvements.append("Increase repository visibility to earn stars")

    if total_forks == 0:
        improvements.append("Build projects that others want to fork")

    return {
        "github_score": score,
        "grade": grade,
        "strengths": strengths,
        "improvements": improvements,
    }


def calculate_analytics(user):
    repositories = Repository.objects.filter(owner=user)

    total_repositories = repositories.count()
    total_stars = sum(repo.stars for repo in repositories)
    total_forks = sum(repo.forks for repo in repositories)

    languages = [repo.language for repo in repositories if repo.language]
    most_used_language = Counter(languages).most_common(1)[0][0] if languages else None

    top_repository = repositories.order_by("-stars").first()

    return {
        "total_repositories": total_repositories,
        "total_stars": total_stars,
        "total_forks": total_forks,
        "most_used_language": most_used_language,
        "top_repository": top_repository.repo_name if top_repository else None,
    }


def count_recently_updated(repositories):
    cutoff = timezone.now() - timedelta(days=RECENT_DAYS)
    return repositories.filter(pushed_at__gte=cutoff).count()


def calculate_dashboard(user):
    repositories = Repository.objects.filter(owner=user)

    total_repositories = repositories.count()
    total_stars = sum(repo.stars for repo in repositories)
    total_forks = sum(repo.forks for repo in repositories)

    languages = [repo.language for repo in repositories if repo.language]
    language_stats = dict(Counter(languages))

    top_repository = repositories.order_by("-stars").first()
    recently_updated = count_recently_updated(repositories)

    score_data = calculate_github_score(user)

    recommendations = list(score_data["improvements"])

    if total_stars == 0:
        recommendations.append("Increase repository visibility to gain stars")

    if total_forks == 0:
        recommendations.append("Build projects people want to fork")

    if len(language_stats) < 4:
        recommendations.append("Explore additional programming languages")

    recommendations.extend([
        "Add README to every repository",
        "Enable GitHub Actions",
        "Add repository topics",
        "Pin your best repositories",
    ])

    return {
        "github_score": score_data["github_score"],
        "grade": score_data["grade"],
        "repositories": total_repositories,
        "total_stars": total_stars,
        "total_forks": total_forks,
        "languages": language_stats,
        "top_repository": {
            "name": top_repository.repo_name if top_repository else None,
            "stars": top_repository.stars if top_repository else 0,
            "language": top_repository.language if top_repository else "",
            "url": top_repository.html_url if top_repository else "",
        },
        "recently_updated": recently_updated,
        "portfolio_strength": (
            "Strong" if total_repositories >= 10 else "Needs Improvement"
        ),
        "recommendations": recommendations,
    }


def calculate_contributions(user):
    repositories = Repository.objects.filter(owner=user)

    total_stars = sum(r.stars for r in repositories)
    total_forks = sum(r.forks for r in repositories)
    total_issues = sum(r.open_issues for r in repositories)

    cutoff = timezone.now() - timedelta(days=RECENT_DAYS)
    active_repositories = repositories.filter(pushed_at__gte=cutoff).count()

    commits_estimate = total_stars * 3 + repositories.count() * 5
    pull_requests_estimate = total_forks + repositories.count()
    issues_estimate = total_issues

    contribution_score = min(
        active_repositories * 8
        + min(commits_estimate // 10, 30)
        + min(pull_requests_estimate * 2, 20)
        + min(total_stars, 20),
        100,
    )

    return {
        "commits": commits_estimate,
        "pull_requests": pull_requests_estimate,
        "issues": issues_estimate,
        "active_repositories": active_repositories,
        "contribution_score": contribution_score,
    }


def calculate_repository_health(repository):
    score_breakdown = {
        "documentation": 0,
        "activity": 0,
        "community": 0,
        "maintenance": 0,
        "testing": 0,
    }

    if repository.description:
        score_breakdown["documentation"] += 30
    if repository.topics:
        score_breakdown["documentation"] += 20
    if repository.license:
        score_breakdown["documentation"] += 20

    if repository.pushed_at:
        days_since_push = (timezone.now() - repository.pushed_at).days
        if days_since_push <= 30:
            score_breakdown["activity"] = 90
        elif days_since_push <= 90:
            score_breakdown["activity"] = 70
        elif days_since_push <= 180:
            score_breakdown["activity"] = 50
        else:
            score_breakdown["activity"] = 30
    else:
        score_breakdown["activity"] = 40

    score_breakdown["community"] = min(
        repository.stars * 5 + repository.forks * 10 + repository.watchers * 2,
        100,
    )

    if not repository.is_archived:
        score_breakdown["maintenance"] += 50
    if repository.open_issues <= 5:
        score_breakdown["maintenance"] += 30
    if not repository.is_fork:
        score_breakdown["maintenance"] += 20

    repo_name_lower = repository.repo_name.lower()
    if "test" in repo_name_lower or repository.topics:
        score_breakdown["testing"] += 40
    if repository.size > 100:
        score_breakdown["testing"] += 30
    score_breakdown["testing"] = min(score_breakdown["testing"], 100)

    weights = {
        "documentation": 0.20,
        "activity": 0.20,
        "community": 0.15,
        "maintenance": 0.15,
        "testing": 0.15,
    }

    total = sum(score_breakdown[k] * weights[k] for k in weights)
    project_quality = min(
        (100 if repository.language else 50)
        + (20 if repository.default_branch else 0),
        100,
    )
    total += project_quality * 0.15

    score = round(min(total, 100))

    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B"
    elif score >= 70:
        grade = "C"
    elif score >= 60:
        grade = "D"
    else:
        grade = "F"

    return {
        "repository": repository.repo_name,
        "score": score,
        "grade": grade,
        "categories": {
            **score_breakdown,
            "project_quality": project_quality,
        },
    }
