import { useEffect, useState } from "react";
import { repoAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  RepoIcon,
  StarIcon,
  ForkIcon,
  SearchIcon,
  RefreshIcon,
  ExternalLinkIcon,
  TrashIcon,
  AlertCircleIcon,
  ShieldIcon,
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

export default function Repositories() {
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [syncUser, setSyncUser] = useState(user?.github_username || "");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState("");
  const [activeHealthModal, setActiveHealthModal] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const loadRepositories = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (language) params.language = language;

      const res = await repoAPI.list(params);
      setRepos(res.data.results || res.data || []);
      setTotalCount(res.data.count || (res.data.results ? res.data.results.length : res.data.length));
    } catch (err) {
      console.error("Failed to load repositories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepositories();
  }, [language]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadRepositories();
  };

  const handleSync = async (e) => {
    e.preventDefault();
    if (!syncUser.trim()) return;
    setIsSyncing(true);
    setSyncFeedback("");
    try {
      const res = await repoAPI.sync(syncUser.trim());
      setSyncFeedback(`Successfully synced ${res.data?.count || ""} repositories`);
      loadRepositories();
      setTimeout(() => setSyncFeedback(""), 3500);
    } catch (err) {
      setSyncFeedback(err.response?.data?.error || "Sync failed. Check username and rate limit.");
    } finally {
      setIsSyncing(false);
    }
  };

  const checkHealth = async (repoId) => {
    setHealthLoading(true);
    try {
      const res = await repoAPI.health(repoId);
      setActiveHealthModal(res.data);
    } catch (err) {
      console.error("Failed to fetch repository health", err);
    } finally {
      setHealthLoading(false);
    }
  };

  const handleDelete = async (repoId) => {
    if (!window.confirm("Remove this repository from GitInsight AI tracking?")) return;
    try {
      await repoAPI.delete(repoId);
      setRepos(repos.filter((r) => r.id !== repoId));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to delete repository", err);
    }
  };

  const uniqueLanguages = Array.from(
    new Set(repos.map((r) => r.language).filter(Boolean))
  );

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Repositories</h1>
          <p className="page-subtitle">
            Synchronized repository catalog with health checks and metrics.
          </p>
        </div>
        <span className="badge badge-neutral">{totalCount} Total</span>
      </div>

      {/* Sync and Filter Bar */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "1.25rem" }}>
        <form onSubmit={handleSync} style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
          <div style={{ flex: "1 1 240px" }}>
            <input
              style={{ marginBottom: 0 }}
              placeholder="GitHub username (e.g. torvalds)"
              value={syncUser}
              onChange={(e) => setSyncUser(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={isSyncing}>
            <RefreshIcon size={14} className={isSyncing ? "spinner" : ""} />
            {isSyncing ? "Syncing..." : "Sync GitHub Account"}
          </button>
        </form>

        {syncFeedback && (
          <div
            className={`alert-banner ${syncFeedback.includes("Successfully") ? "alert-success" : "alert-error"}`}
            style={{ marginBottom: "1rem" }}
          >
            {syncFeedback}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)" }}>
          <form onSubmit={handleSearchSubmit} style={{ flex: "2 1 260px", display: "flex", gap: "0.5rem" }}>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                style={{ marginBottom: 0, paddingLeft: "2.2rem" }}
                placeholder="Filter repositories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <SearchIcon
                size={14}
                style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
              />
            </div>
            <button className="btn btn-secondary" type="submit">
              Search
            </button>
          </form>

          <div style={{ flex: "1 1 160px" }}>
            <select
              style={{ marginBottom: 0 }}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="">All Languages</option>
              {uniqueLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {(search || language) && (
            <button
              className="btn btn-ghost"
              onClick={() => {
                setSearch("");
                setLanguage("");
                loadRepositories();
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid of Repositories */}
      {loading ? (
        <div className="grid-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ height: 180 }}></div>
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3.5rem 1.5rem" }}>
          <RepoIcon size={32} style={{ color: "var(--text-muted)", margin: "0 auto 0.75rem" }} />
          <h2>No repositories matched</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {search || language
              ? "Try resetting your search query or language filter."
              : "Enter a GitHub username above to sync your public repositories."}
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {repos.map((repo) => {
            const langColor = LANGUAGE_COLORS[repo.language] || "#6366f1";
            return (
              <div key={repo.id} className="card card-hover" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", minWidth: 0 }}>
                      <RepoIcon size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                      <h3 style={{ margin: 0, fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {repo.repo_name}
                      </h3>
                    </div>
                    {repo.language && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-secondary)", flexShrink: 0 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: langColor }} />
                        {repo.language}
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.8125rem",
                      marginBottom: "0.85rem",
                      minHeight: "2.4rem",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {repo.description || "No description provided."}
                  </p>

                  {/* Topics */}
                  {Array.isArray(repo.topics) && repo.topics.length > 0 && (
                    <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
                      {repo.topics.slice(0, 3).map((topic, idx) => (
                        <span key={idx} className="badge badge-neutral" style={{ fontSize: "0.7rem", padding: "0.1rem 0.45rem" }}>
                          {topic}
                        </span>
                      ))}
                      {repo.topics.length > 3 && (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", alignSelf: "center" }}>
                          +{repo.topics.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metrics */}
                  <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.85rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      <StarIcon size={13} /> {repo.stars}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      <ForkIcon size={13} /> {repo.forks}
                    </span>
                    {repo.open_issues > 0 && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#f87171" }}>
                        <AlertCircleIcon size={13} /> {repo.open_issues}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => checkHealth(repo.id)}
                      disabled={healthLoading}
                    >
                      <ShieldIcon size={13} /> Health
                    </button>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      GitHub <ExternalLinkIcon size={12} />
                    </a>
                  </div>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(repo.id)}
                    title="Remove repository"
                    style={{ color: "var(--text-muted)", padding: "0.3rem 0.5rem" }}
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Health Check Modal */}
      {activeHealthModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
          onClick={() => setActiveHealthModal(null)}
        >
          <div
            className="card"
            style={{ maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Health Evaluation</h2>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveHealthModal(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", marginBottom: "1.25rem" }}>
              <div>
                <span className="stat-label">Overall Health</span>
                <div style={{ fontSize: "1.85rem", fontWeight: 700, color: "#10b981", fontVariantNumeric: "tabular-nums" }}>
                  {activeHealthModal.score} <span style={{ fontSize: "0.95rem", color: "var(--text-muted)", fontWeight: 400 }}>/ 100</span>
                </div>
              </div>
              <span className="badge badge-emerald">Grade {activeHealthModal.grade}</span>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "0.875rem", marginBottom: "0.75rem", color: "var(--text-secondary)" }}>Category Metrics</h3>
              {Object.entries(activeHealthModal.categories || {}).map(([cat, score]) => (
                <div key={cat} style={{ marginBottom: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.2rem" }}>
                    <span style={{ textTransform: "capitalize" }}>{cat}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-secondary)" }}>{score}%</span>
                  </div>
                  <div style={{ height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${score}%`, height: "100%", background: "#10b981" }} />
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setActiveHealthModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
