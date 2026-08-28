import { Routes, Route, Navigate, NavLink, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Repositories from "./pages/Repositories";
import Analytics from "./pages/Analytics";
import Career from "./pages/Career";
import Profile from "./pages/Profile";
import {
  BrandMark,
  DashboardIcon,
  RepoIcon,
  AnalyticsIcon,
  CareerIcon,
  ProfileIcon,
  PulseDot,
} from "./components/Icons";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="main-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ width: 28, height: 28, margin: "0 auto 1rem", borderWidth: 2 }}></div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Loading GitInsight...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header className="navbar">
      <Link to="/dashboard" className="nav-brand">
        <div className="brand-icon-wrapper">
          <BrandMark size={16} />
        </div>
        <span>GitInsight <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>AI</span></span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <DashboardIcon size={16} /> Dashboard
        </NavLink>
        <NavLink to="/repositories" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <RepoIcon size={16} /> Repositories
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <AnalyticsIcon size={16} /> Analytics
        </NavLink>
        <NavLink to="/career" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <CareerIcon size={16} /> Career Insights
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <ProfileIcon size={16} /> Profile
        </NavLink>
      </nav>

      <div className="nav-actions">
        <Link to="/profile" className="user-badge" title="View Profile">
          <PulseDot color={user.github_username ? "#10b981" : "#64748b"} size={6} />
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="user-avatar-sm" />
          ) : (
            <div className="user-avatar-sm" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "0.7rem", fontWeight: 600 }}>
              {user.username.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span style={{ color: "var(--text-primary)" }}>{user.username}</span>
        </Link>

        <button className="btn btn-ghost btn-sm" onClick={logout} title="Sign out of account">
          Sign out
        </button>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/repositories" element={<PrivateRoute><Repositories /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="/career" element={<PrivateRoute><Career /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}
