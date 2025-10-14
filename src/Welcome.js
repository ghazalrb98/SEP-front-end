import { Navigate, useLocation, useNavigate } from "react-router-dom";

export function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();

  const stateUser = location.state?.user;
  const storedUser = !stateUser
    ? JSON.parse(sessionStorage.getItem("user") || null)
    : null;

  const user = stateUser || storedUser;

  if (!user) return <Navigate to="/" replace />;

  function handleLogOut() {
    sessionStorage.removeItem("user");
    navigate("/", { replace: true });
  }

  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
      <div
        style={{
          padding: 24,
          borderRadius: 12,
          background: "#fff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Welcome, {user.name || user.email} 👋</h1>
        <p>You’re signed in for the demo.</p>
        <button
          onClick={handleLogOut}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            background: "#4f46e5",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
