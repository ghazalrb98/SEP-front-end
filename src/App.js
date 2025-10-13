import { useState } from "react";

export default function App() {
  return <Login />;
}

const styles = {
  wrapper: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    background: "#f6f7fb",
  },
  card: {
    width: 360,
    maxWidth: "92vw",
    padding: 28,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    display: "grid",
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
  },
  label: {
    display: "grid",
    gap: 6,
    fontSize: 14,
    color: "#374151",
  },
  input: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #ccd1e1",
    outline: "none",
    width: "100%",
    fontSize: 14,
    color: "#111827",
    background: "#fff",
  },
  passwordWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccd1e1",
    borderRadius: 10,
    overflow: "hidden",
    background: "#fff",
  },
  passwordInput: {
    flex: 1,
    padding: "12px 14px",
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#111827",
    background: "transparent",
  },
  showBtn: {
    padding: "10px 14px",
    border: "none",
    borderLeft: "1px solid #ccd1e1",
    background: "#f8f9ff",
    cursor: "pointer",
    fontSize: 13,
    color: "#4f46e5",
    fontWeight: 500,
    height: "100%",
    transition: "background 0.2s ease",
  },
  showBtnHover: {
    background: "#eef0ff",
  },
  button: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 15,
    transition: "background 0.25s ease",
  },
  buttonHover: {
    background: "#4338ca",
  },
  success: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "#ecfdf5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
    fontSize: 14,
  },
  error: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "#fff1f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    fontSize: 14,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
    marginTop: 4,
  },
  helper: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
  },
};

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (ev) => {
    setForm((f) => ({ ...f, [ev.target.name]: ev.target.value }));
    setMessage("");
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    // UI-only: pretend success
    setMessage("✅ Signed in (UI-only demo). No network request sent.");
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card} noValidate>
        <h1 style={styles.title}>Sign in</h1>

        {message && <div style={styles.success}>{message}</div>}
        {errors.form && <div style={styles.error}>{errors.form}</div>}

        <label style={styles.label}>
          Email
          <input
            style={styles.input}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={validate}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          {errors.email && <span style={styles.errorText}>{errors.email}</span>}
        </label>

        <label style={styles.label}>
          Password
          <div style={styles.passwordWrapper}>
            <input
              style={styles.passwordInput}
              type={showPw ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={validate}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={styles.showBtn}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <span style={styles.errorText}>{errors.password}</span>
          )}
        </label>

        <button type="submit" style={styles.button}>
          Sign in
        </button>

        <p style={styles.helper}>SEP - Swedish Event Planner</p>
      </form>
    </div>
  );
}
