import { useState } from "react";
import styles from "./Login.module.css";

export function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(ev) {
    setForm((f) => ({ ...f, [ev.target.name]: ev.target.value }));
    setMessage("");
  }

  function handleSubmit(ev) {
    ev.preventDefault();

    if (!validate()) return;

    handleLogin();
  }

  async function handleLogin() {
    setLoading(true);

    try {
      const res = await fetch("/users", {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw Error("Could not connect the server");

      const users = await res.json();
      const user = users.find((u) => u.email === form.email.trim());

      if (user) {
        setMessage(`Welcome ${user.name || "back"}!`);
      } else {
        throw Error("No account found with that email.");
      }
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.card} noValidate>
        <h1 className={styles.title}>Sign in</h1>

        {message && <div className={styles.success}>{message}</div>}
        {errors.form && <div className={styles.error}>{errors.form}</div>}

        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={validate}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          {errors.email && (
            <span className={styles.errorText}>{errors.email}</span>
          )}
        </label>

        <label className={styles.label}>
          Password
          <div className={styles.passwordWrapper}>
            <input
              className={styles.passwordInput}
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
              className={styles.showBtn}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <span className={styles.errorText}>{errors.password}</span>
          )}
        </label>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Checking..." : "Login"}
        </button>

        <p className={styles.helper}>SEP - Swedish Event Planner</p>
      </form>
    </div>
  );
}
