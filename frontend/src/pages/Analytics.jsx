import { useEffect, useState } from "react";
import { repoAPI } from "../services/api";
import {
  RepoIcon,
  StarIcon,
  ForkIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "../components/Icons";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [resAnalytics, resScore] = await Promise.all([
          repoAPI.analytics(),
          repoAPI.score(),
        ]);
        setAnalytics(resAnalytics.data);
        setScore(resScore.data);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="skeleton" style={{ height: 60 }}></div>
        <div className="grid-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 110 }}></div>
          ))}
        </div>
        <div className="skeleton" style={{ height: 260 }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Analytics & Benchmarks</h1>
          <p className="page-subtitle">
            Portfolio metrics, code activity, and engineering profile quality score.
          </p>
        </div>
        <span className="badge badge-emerald">Live Analysis</span>
      </div>

      {/* Metric Grid */}
      <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Repositories</span>
            <RepoIcon size={16} />
          </div>
          <div className="stat-value">{analytics?.total_repositories ?? 0}</div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.35rem" }}>
            Total synchronized projects
          </p>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Stars Accrued</span>
            <StarIcon size={16} />
          </div>
          <div className="stat-value">{analytics?.total_stars ?? 0}</div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.35rem" }}>
            Across all repositories
          </p>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Forks</span>
            <ForkIcon size={16} />
          </div>
          <div className="stat-value">{analytics?.total_forks ?? 0}</div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.35rem" }}>
            Community project forks
          </p>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <span className="stat-label">Primary Language</span>
            <span className="badge badge-blue">{analytics?.most_used_language || "None"}</span>
          </div>
          <div className="stat-value" style={{ fontSize: "1.4rem" }}>
            {analytics?.most_used_language || "N/A"}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.35rem" }}>
            Highest codebase frequency
          </p>
        </div>
      </div>

      {/* Detailed Score Breakdown */}
      <div className="grid-2">
        {/* Score Card */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2>Quality Benchmark Score</h2>
            <span className="badge badge-emerald">Grade {score?.grade || "N/A"}</span>
          </div>

          <div style={{ padding: "1.25rem 0" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span style={{ fontSize: "2.75rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {score?.github_score ?? 0}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>/ 100</span>
            </div>

            <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden", margin: "1rem 0" }}>
              <div
                style={{
                  width: `${score?.github_score ?? 0}%`,
                  height: "100%",
                  background: "#10b981",
                  transition: "width 0.6s ease",
                }}
              />
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Top project: <strong style={{ color: "var(--text-primary)" }}>{analytics?.top_repository || "None"}</strong>
            </p>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="card">
          <h2>Evaluation Summary</h2>
          
          <div style={{ marginTop: "1rem" }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#10b981", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <CheckCircleIcon size={14} /> Profile Strengths
            </div>
            {(score?.strengths || []).map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "0.5rem 0.75rem",
                  background: "rgba(16, 185, 129, 0.05)",
                  border: "1px solid rgba(16, 185, 129, 0.15)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "0.4rem",
                  fontSize: "0.8125rem",
                  color: "#6ee7b7",
                }}
              >
                {s}
              </div>
            ))}
            {(!score?.strengths || score.strengths.length === 0) && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>No current strengths recorded.</p>
            )}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#f59e0b", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <AlertCircleIcon size={14} /> Growth Opportunities
            </div>
            {(score?.improvements || []).map((imp, i) => (
              <div
                key={i}
                style={{
                  padding: "0.5rem 0.75rem",
                  background: "rgba(245, 158, 11, 0.05)",
                  border: "1px solid rgba(245, 158, 11, 0.15)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "0.4rem",
                  fontSize: "0.8125rem",
                  color: "#fde68a",
                }}
              >
                {imp}
              </div>
            ))}
            {(!score?.improvements || score.improvements.length === 0) && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>No major improvement areas detected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
