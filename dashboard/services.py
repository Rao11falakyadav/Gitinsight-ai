from repositories.services import (
    calculate_dashboard,
    calculate_analytics,
    calculate_github_score,
    calculate_contributions,
    sync_github_profile,
)
from analysis.services import analyze_career


def build_unified_dashboard(user):
    dashboard_data = calculate_dashboard(user)

    profile = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "github_username": user.github_username,
        "bio": user.bio or "",
        "followers": user.followers,
        "following": user.following,
        "avatar_url": user.avatar_url or user.profile_image or "",
    }

    github = {}
    if user.github_username:
        github_data, _ = sync_github_profile(user, user.github_username)
        if github_data:
            github = github_data

    return {
        "profile": profile,
        "github": github,
        "repositories": dashboard_data,
        "analytics": calculate_analytics(user),
        "score": calculate_github_score(user),
        "contributions": calculate_contributions(user),
        "career": analyze_career(user),
        "ai_insights": {
            "portfolio_strength": dashboard_data["portfolio_strength"],
            "recommendations": dashboard_data["recommendations"][:5],
        },
    }
