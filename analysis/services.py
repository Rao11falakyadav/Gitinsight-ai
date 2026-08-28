import base64
import re

import requests

from collections import Counter

from repositories.models import Repository
from repositories.services import calculate_github_score, calculate_repository_health

GITHUB_API = "https://api.github.com"

README_SECTIONS = [
    "installation",
    "usage",
    "features",
    "screenshots",
    "tech stack",
    "contributing",
    "testing",
    "license",
    "api",
    "documentation",
]

SKILL_MAP = {
    "python": ["Django", "Flask", "FastAPI", "Data Science"],
    "javascript": ["React", "Node.js", "Express", "TypeScript"],
    "typescript": ["React", "Node.js", "Angular"],
    "java": ["Spring Boot", "Android", "Microservices"],
    "html": ["Frontend Development", "CSS", "Responsive Design"],
    "css": ["Frontend Development", "UI/UX", "Tailwind"],
    "go": ["Microservices", "Cloud Native", "Docker"],
    "rust": ["Systems Programming", "Performance"],
    "c++": ["Systems Programming", "Algorithms"],
    "c#": [".NET", "ASP.NET", "Unity"],
    "ruby": ["Rails", "Web Development"],
    "php": ["Laravel", "WordPress"],
    "kotlin": ["Android", "Spring Boot"],
    "swift": ["iOS Development", "Mobile Apps"],
    "dart": ["Flutter", "Mobile Development"],
}

RECOMMENDED_SKILLS = [
    "Docker",
    "PostgreSQL",
    "Redis",
    "AWS",
    "System Design",
    "CI/CD",
    "Kubernetes",
    "GraphQL",
]


def fetch_readme(owner, repo_name):
    url = f"{GITHUB_API}/repos/{owner}/{repo_name}/readme"
    response = requests.get(url, timeout=15)
    if response.status_code != 200:
        return None
    data = response.json()
    content = data.get("content", "")
    if data.get("encoding") == "base64":
        return base64.b64decode(content).decode("utf-8", errors="ignore")
    return content


def analyze_readme_content(readme_text):
    if not readme_text:
        return {
            "score": 20,
            "summary": "No README found. Adding one significantly improves project visibility.",
            "missing_sections": README_SECTIONS[:6],
            "recommendations": [
                "Create a README file",
                "Add project description",
                "Include installation instructions",
            ],
        }

    readme_lower = readme_text.lower()
    found_sections = []
    missing_sections = []

    for section in README_SECTIONS:
        if section in readme_lower:
            found_sections.append(section.title())
        else:
            missing_sections.append(section.title())

    score = min(30 + len(found_sections) * 8, 100)

    recommendations = []
    if "installation" in [s.lower() for s in missing_sections]:
        recommendations.append("Add installation instructions")
    if "usage" in [s.lower() for s in missing_sections]:
        recommendations.append("Add usage examples")
    if "testing" in [s.lower() for s in missing_sections]:
        recommendations.append("Add testing documentation")
    if "screenshots" in [s.lower() for s in missing_sections]:
        recommendations.append("Add screenshots or demo GIFs")
    if len(readme_text) < 200:
        recommendations.append("Expand README with more project details")

    summary = (
        f"README contains {len(found_sections)} of {len(README_SECTIONS)} "
        f"recommended sections. "
        + ("Well structured documentation." if score >= 70 else "Needs improvement.")
    )

    return {
        "score": score,
        "summary": summary,
        "found_sections": found_sections,
        "missing_sections": [s.title() for s in missing_sections[:5]],
        "recommendations": recommendations or ["README looks good!"],
    }


def analyze_readme(repository):
    owner = repository.owner.github_username or repository.owner.username
    readme_text = fetch_readme(owner, repository.repo_name)
    return analyze_readme_content(readme_text)


def analyze_repository(repository):
    health = calculate_repository_health(repository)
    readme = analyze_readme(repository)

    overall_score = round((health["score"] + readme["score"]) / 2)

    strengths = []
    weaknesses = []
    recommendations = list(readme.get("recommendations", []))

    if repository.description:
        strengths.append("Has project description")
    else:
        weaknesses.append("Missing project description")
        recommendations.append("Add a clear project description")

    if repository.stars >= 5:
        strengths.append("Good community engagement")
    elif repository.stars == 0:
        weaknesses.append("No stars yet")
        recommendations.append("Share your project to gain visibility")

    if repository.topics:
        strengths.append("Uses repository topics")
    else:
        weaknesses.append("No topics configured")
        recommendations.append("Add relevant GitHub topics")

    if repository.license:
        strengths.append("Has an open source license")
    else:
        weaknesses.append("No license specified")
        recommendations.append("Add an open source license")

    if repository.language:
        strengths.append(f"Primary language: {repository.language}")

    if not strengths:
        strengths.append("Repository exists and is tracked")

    return {
        "overall_score": overall_score,
        "code_quality": health["categories"].get("project_quality", 50),
        "documentation": readme["score"],
        "portfolio_value": min(overall_score + (10 if repository.stars > 0 else 0), 100),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations[:5],
    }


def analyze_career(user):
    repositories = Repository.objects.filter(owner=user)

    languages = [r.language for r in repositories if r.language]
    language_counts = Counter(languages)

    strengths = []
    for lang, count in language_counts.most_common(5):
        related = SKILL_MAP.get(lang.lower(), [])
        strengths.append(f"{lang} ({count} repos)")
        strengths.extend(related[:2])

    strengths = list(dict.fromkeys(strengths))[:8]

    user_skills = set()
    for lang in languages:
        user_skills.add(lang.lower())
        user_skills.update(s.lower() for s in SKILL_MAP.get(lang.lower(), []))

    missing_skills = [s for s in RECOMMENDED_SKILLS if s.lower() not in user_skills]

    repo_count = repositories.count()
    if repo_count >= 15:
        profile_level = "Advanced"
    elif repo_count >= 8:
        profile_level = "Intermediate"
    else:
        profile_level = "Beginner"

    return {
        "profile_level": profile_level,
        "strongest_skills": strengths,
        "recommended_next_skills": missing_skills[:5],
        "total_repositories": repo_count,
        "language_distribution": dict(language_counts),
    }


def analyze_resume(user, resume_text):
    resume_lower = resume_text.lower()

    repositories = Repository.objects.filter(owner=user)
    github_languages = {r.language.lower() for r in repositories if r.language}
    github_projects = {r.repo_name.lower() for r in repositories}

    resume_skills_found = []
    all_skills = set(SKILL_MAP.keys())
    for skill in all_skills:
        if skill in resume_lower:
            resume_skills_found.append(skill.title())

    for lang in github_languages:
        if lang in resume_lower:
            resume_skills_found.append(lang.title())

    resume_skills_found = list(dict.fromkeys(resume_skills_found))

    github_in_resume = sum(
        1 for project in github_projects if project in resume_lower
    )

    consistency_score = 0
    if resume_skills_found:
        matched = sum(
            1 for s in resume_skills_found if s.lower() in github_languages
            or any(s.lower() in sk.lower() for sk in github_languages)
        )
        consistency_score = min(int(matched / max(len(resume_skills_found), 1) * 100), 100)

    missing_skills = [
        s for s in RECOMMENDED_SKILLS
        if s.lower() not in resume_lower
    ]

    resume_score = min(
        len(resume_skills_found) * 10
        + github_in_resume * 15
        + (20 if len(resume_text) > 500 else 0),
        100,
    )

    recommendations = []
    if github_in_resume == 0:
        recommendations.append("Mention your GitHub projects in your resume")
    if consistency_score < 50:
        recommendations.append("Align resume skills with your GitHub repositories")
    if missing_skills:
        recommendations.append(f"Consider learning: {', '.join(missing_skills[:3])}")
    if not recommendations:
        recommendations.append("Resume and GitHub profile are well aligned")

    return {
        "resume_score": resume_score,
        "github_consistency": consistency_score,
        "skills_found": resume_skills_found,
        "projects_matched": github_in_resume,
        "missing_skills": missing_skills[:5],
        "recommendations": recommendations,
    }
