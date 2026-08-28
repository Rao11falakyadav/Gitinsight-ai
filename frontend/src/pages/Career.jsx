import { useEffect, useState } from "react";
import { analysisAPI } from "../services/api";
import {
  CheckCircleIcon,
  LightbulbIcon,
} from "../components/Icons";

export default function Career() {
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumeText, setResumeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeResult, setResumeResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    analysisAPI.career()
      .then((res) => setCareer(res.data))
      .catch((err) => console.error("Career API failed", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAnalyzeResume = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setErrorMsg("Please enter or paste your resume text before running analysis.");
      return;
    }
    setAnalyzing(true);
    setErrorMsg("");
    try {
      const res = await analysisAPI.resume(resumeText);
      setResumeResult(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSampleResume = () => {
    setResumeText(
      `Full Stack Software Engineer with deep background in Python, Django, REST APIs, and React.\n` +
      `Implemented scalable backend services, JWT authentication, and automated GitHub integrations.\n` +
      `Focus on clean architecture, ORM query optimization, and developer workflow tooling.`
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="skeleton" style={{ height: 60 }}></div>
        <div className="grid-2">
          <div className="skeleton" style={{ height: 200 }}></div>
          <div className="skeleton" style={{ height: 200 }}></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Career Insights & Resume Alignment</h1>
          <p className="page-subtitle">
            Engineering skill profiling and GitHub consistency verification.
          </p>
        </div>
        <span className="badge badge-neutral">Portfolio Insights</span>
      </div>

      {/* Profile Level & Roadmap */}
      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
        {/* Current Standing */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h2>Developer Profile Level</h2>
            <span className="badge badge-blue">Profile Assessment</span>
          </div>

          <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            {career?.profile_level || "Active Developer"}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            Derived from repository count, language variety, and project maintenance frequency.
          </p>

          <div>
            <h3 style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              Demonstrated Skills
            </h3>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {(career?.strongest_skills || []).map((skill, i) => (
                <span key={i} className="badge badge-neutral" style={{ fontSize: "0.75rem" }}>
                  {skill}
                </span>
              ))}
              {(!career?.strongest_skills || career.strongest_skills.length === 0) && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>Sync repositories to detect core skills.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Skill Roadmap */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h2>Target Skill Roadmap</h2>
            <span className="badge badge-purple">High Leverage</span>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            Suggested technologies to expand your portfolio coverage for engineering roles:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {(career?.recommended_next_skills || []).map((skill, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.55rem 0.85rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8125rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>#{i + 1}</span>
                  <span style={{ fontWeight: 500 }}>{skill}</span>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>Recommended</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Analyzer */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h2>Resume Alignment Check</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Verify claims in your resume text against your real GitHub codebase repository data.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleSampleResume} type="button">
            Load Sample Text
          </button>
        </div>

        {errorMsg && <div className="alert-banner alert-error">{errorMsg}</div>}

        <form onSubmit={handleAnalyzeResume}>
          <div className="form-group">
            <textarea
              rows={5}
              placeholder="Paste your project descriptions or resume bullet points..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={analyzing}>
            {analyzing ? (
              <>
                <div className="spinner"></div>
                Analyzing Consistency...
              </>
            ) : (
              <>Run Consistency Analysis</>
            )}
          </button>
        </form>

        {/* Output */}
        {resumeResult && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0 }}>Analysis Results</h3>
              <span className="badge badge-emerald">Verified</span>
            </div>

            <div className="grid-2" style={{ marginBottom: "1rem" }}>
              <div style={{ background: "var(--bg-surface)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)" }}>
                <span className="stat-label">Resume Strength</span>
                <div style={{ fontSize: "1.85rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {resumeResult.resume_score} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 400 }}>/ 100</span>
                </div>
              </div>

              <div style={{ background: "var(--bg-surface)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)" }}>
                <span className="stat-label">GitHub Consistency Match</span>
                <div style={{ fontSize: "1.85rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#10b981" }}>
                  {resumeResult.github_consistency}%
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Targeted Suggestions
              </h4>
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {(resumeResult.recommendations || []).map((rec, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      background: "rgba(255, 255, 255, 0.01)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      marginBottom: "0.4rem",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <LightbulbIcon size={14} style={{ color: "#60a5fa", flexShrink: 0, marginTop: 2 }} />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
