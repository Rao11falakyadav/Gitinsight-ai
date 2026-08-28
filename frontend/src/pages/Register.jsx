import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BrandMark } from "../components/Icons";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    github_username: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setError("Please complete all required fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(" ") : val}`)
          .join(" | ");
        setError(messages || "Registration failed");
      } else {
        setError("Registration failed. Please check your network connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <div className="auth-header">
          <div
            style={{
              width: 36,
              height: 36,
              background: "#1e293b",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#60a5fa",
              marginBottom: "1rem",
            }}
          >
            <BrandMark size={20} />
          </div>
          <h1>Create Account</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Set up your GitInsight AI developer profile.
          </p>
        </div>

        {error && <div className="alert-banner alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">GitHub Username (Optional)</label>
            <input
              placeholder="e.g. torvalds"
              value={form.github_username}
              onChange={(e) => setForm({ ...form, github_username: e.target.value })}
            />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating Account...
              </>
            ) : (
              <>Create Account</>
            )}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: 500 }}>
            Sign In →
          </Link>
        </p>
      </div>
    </div>
  );
}
