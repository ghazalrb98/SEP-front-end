import { useState, type FormEvent } from "react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import type { UserDto } from "../Types/Dtos";

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function validateEmail(email: string) {
    if (!email) return "Email is Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email.";
    return "";
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setMessage("");
    setError("");

    const emailValidationError = validateEmail(email);
    if (emailValidationError) return setError(emailValidationError);

    setLoading(true);

    try {
      const res = await fetch("/users", {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw Error("Could not connect the server");

      const users = await res.json();
      const user = users.find((u: UserDto) => u.email === email.trim());

      if (!user) throw Error("Couldn't find any user with this email.");

      const userLoginRes = await fetch(`/login?userId=${user.id}`, {
        method: "POST",
      });

      if (!userLoginRes.ok) throw Error("Couldn't login. Try again later");

      const data = await userLoginRes.json();
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          name: user.name,
          role: user.role,
        })
      );

      setMessage(`Welcome ${user.name || "back"}!`);
      navigate("/dashboard", { state: { user } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.card} noValidate>
        <h1 className={styles.title}>Sign in</h1>

        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className={styles.helper}>SEP - Swedish Event Planner</p>
      </form>
    </div>
  );
}
