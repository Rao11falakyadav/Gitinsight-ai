import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardAPI, repoAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  StarIcon,
  ForkIcon,
  RepoIcon,
  RefreshIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  LightbulbIcon,
  PulseDot,
} from "../components/Icons";

const LANGUAGE_COLORS = {
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  Shell: "#89e051",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const loadData = async () => {
    try {
      const res = await dashboardAPI.unified();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickSync = async () => {
    const ghUser = user?.github_username;
    if (!ghUser) {
      setSyncMessage("Please link your GitHub username in your Profile first.");
      return;
    }
    setSyncing(true);
    setSyncMessage("");
    try {
      await repoAPI.sync(ghUser);
      await loadData();
      setSyncMessage(`Synced repositories for @${ghUser}`);
      setTimeout(() => setSyncMessage(""), 3500);
    } catch (err) {
      setSyncMessage(err.response?.data?.error || "Sync failed. Check username or rate limit.");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="skeleton" style={{ height: 60 }}></div>
        <div className="grid-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 110 }}></div>
          ))}
        </div>
        <div className="skeleton" style={{ height: 220 }}></div>
      </div>
    );
  }

  const repos = data?.repositories || {};
  const profile = data?.profile || {};
  const totalLangRepos = Object.values(repos.languages || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <h1>Portfolio Overview</h1>
            <span className="badge badge-neutral">
              {repos.portfolio_strength || "Active Portfolio"}
            </span>
          </div>
          <p className="page-subtitle">
            {profile.github_username ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <PulseDot color="#10b981" size={6} /> Connected to GitHub as <strong>@{profile.github_username}</strong>
              </span>
            ) : (
              "No GitHub account connected. Link your profile to track repositories."
            )}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            className="btn btn-primary"
            onClick={handleQuickSync}
            disabled={syncing}
          >
            <RefreshIcon size={14} className={syncing ? "spinner" : ""} />
            {syncing ? "Syncing..." : "Sync Repositories"}
          </button>
          <Link to="/repositories" className="btn btn-secondary">
            View All ({repos.repositories || 0})
          </Link>
        </div>
      </div>

      {syncMessage && (
        <div
          className={`alert-banner ${syncMessage.includes("Synced") ? "alert-success" : "alert-error"}`}
        >
          {syncMessage}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
        {/* Score */}
        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">GitHub Score</span>
            <span className="badge badge-emerald">Grade {repos.grade || "N/A"}</span>
          </div>
          <div className="stat-value">{repos.github_score ?? 0} <span style={{ fontSize: "0.95rem", color: "var(--text-muted)", fontWeight: 400 }}>/ 100</span></div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.35rem" }}>
            Composite quality benchmark
          </p>
        </div>

        {/* Repositories */}
        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Repositories</span>
            <RepoIcon size={16} className="text-secondary" />
          </div>
          <div className="stat-value">{repos.repositories ?? 0}</div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.35rem" }}>
            {repos.recently_updated || 0} active in the last 90 days
          </p>
        </div>

        {/* Stars */}
        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Stars</span>
            <StarIcon size={16} />
          </div>
          <div className="stat-value">{repos.total_stars ?? 0}</div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.35rem" }}>
            Community engagement metric
          </p>
        </div>

        {/* Forks */}
        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Forks</span>
            <ForkIcon size={16} />
          </div>
          <div className="stat-value">{repos.total_forks ?? 0}</div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.35rem" }}>
            Downstream reuse count
          </p>
        </div>
      </div>

      {/* Language Composition & Spotlight */}
      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
        {/* Language Composition */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Language Composition</h2>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              {Object.keys(repos.languages || {}).length} Languages
            </span>
          </div>

          <div className="lang-distribution-bar">
            {Object.entries(repos.languages || {}).map(([lang, count]) => {
              const pct = (count / totalLangRepos) * 100;
              const color = LANGUAGE_COLORS[lang] || "#6366f1";
              return (
                <div
                  key={lang}
                  className="lang-bar-segment"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                  title={`${lang}: ${count} repos (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          <div className="lang-legend">
            {Object.entries(repos.languages || {}).map(([lang, count]) => {
              const pct = ((count / totalLangRepos) * 100).toFixed(1);
              const color = LANGUAGE_COLORS[lang] || "#6366f1";
              return (
                <div key={lang} className="lang-legend-item">
                  <div className="lang-dot" style={{ backgroundColor: color }} />
                  <span style={{ color: "var(--text-primary)" }}>{lang}</span>
                  <span style={{ color: "var(--text-muted)" }}>{pct}%</span>
                </div>
              );
            })}
            {Object.keys(repos.languages || {}).length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No language data available yet.</p>
            )}
          </div>
        </div>

        {/* Featured Repository */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
            <h2>Featured Repository</h2>
            <span className="badge badge-neutral">Top Starred</span>
          </div>

          {repos.top_repository?.name ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <RepoIcon size={18} />
                <h3 style={{ margin: 0 }}>{repos.top_repository.name}</h3>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                Highest community engagement and star count across your repositories.
              </p>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.25rem" }}>
                {repos.top_repository.language && (
                  <span className="badge badge-blue">
                    {repos.top_repository.language}
                  </span>
                )}
                <span className="badge badge-neutral" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <StarIcon size={13} /> {repos.top_repository.stars} stars
                </span>
              </div>
              {repos.top_repository.url && (
                <a
                  href={repos.top_repository.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ alignSelf: "flex-start", marginTop: "0.5rem" }}
                >
                  View on GitHub <ExternalLinkIcon size={13} />
                </a>
              )}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No starred repositories tracked.</p>
          )}
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
          <h2>Profile Optimization Items</h2>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
            {(repos.recommendations || []).length} suggestions
          </span>
        </div>

        <div>
          {(repos.recommendations || []).map((rec, i) => (
            <div key={i} className="rec-item">
              <LightbulbIcon size={16} style={{ color: "#60a5fa", flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, color: "var(--text-primary)" }}>{rec}</div>
              <span className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>Actionable</span>
            </div>
          ))}

          {(!repos.recommendations || repos.recommendations.length === 0) && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No optimization items needed at this time.</p>
          )}
        </div>
      </div>
    </div>
  );
}
