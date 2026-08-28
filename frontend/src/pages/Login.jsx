import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BrandMark } from "../components/Icons";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Invalid username or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
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
          <h1>Sign In</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Enter your GitInsight AI account credentials.
          </p>
        </div>

        {error && <div className="alert-banner alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Signing in...
              </>
            ) : (
              <>Sign In</>
            )}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ fontWeight: 500 }}>
            Create an account →
          </Link>
        </p>
      </div>
    </div>
  );
}
