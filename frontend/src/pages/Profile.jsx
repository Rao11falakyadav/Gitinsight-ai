import { useAuth } from "../context/AuthContext";
import { ExternalLinkIcon, ProfileIcon, PulseDot } from "../components/Icons";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Account & Profile</h1>
          <p className="page-subtitle">
            Developer identity and connected GitHub account metadata.
          </p>
        </div>
        <span className="badge badge-neutral">Active Account</span>
      </div>

      <div className="grid-2">
        {/* Profile Card */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  border: "1px solid var(--border-default)",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#1e293b",
                  border: "1px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                {user.username.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{user.username}</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{user.email}</p>
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.35rem" }}>
                <span className="badge badge-emerald" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <PulseDot color="#10b981" size={5} /> Active
                </span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Username</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{user.username}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Email</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{user.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Linked GitHub</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {user.github_username ? `@${user.github_username}` : "None"}
              </span>
            </div>
          </div>
        </div>

        {/* GitHub Footprint */}
        <div className="card">
          <h2>GitHub Footprint</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            Profile data synchronized from GitHub REST API.
          </p>

          <div className="grid-2" style={{ marginBottom: "1.25rem" }}>
            <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)", textAlign: "center" }}>
              <div style={{ fontSize: "1.45rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {user.followers || 0}
              </div>
              <span className="stat-label">Followers</span>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)", textAlign: "center" }}>
              <div style={{ fontSize: "1.45rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {user.following || 0}
              </div>
              <span className="stat-label">Following</span>
            </div>
          </div>

          {user.bio && (
            <div style={{ marginBottom: "1.25rem", padding: "0.75rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
              <span className="stat-label" style={{ display: "block", marginBottom: "0.2rem" }}>Bio</span>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{user.bio}</p>
            </div>
          )}

          {user.github_username && (
            <a
              href={`https://github.com/${user.github_username}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Open GitHub Profile <ExternalLinkIcon size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
