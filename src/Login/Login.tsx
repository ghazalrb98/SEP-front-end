import { useEffect, useState, type FormEvent } from "react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import type { UserDto } from "../Types/Dtos";

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);

  function validateEmail(email: string) {
    if (!email) return "Email is Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email.";
    return "";
  }

  async function loadUsers() {
    try {
      setMessage("");
      setError("");
      const res = await fetch("/users", {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw Error("Could not connect to server");

      const users = await res.json();
      setUsers(users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();

    try {
      setMessage("");
      setError("");

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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }

    const emailValidationError = validateEmail(email);
    if (emailValidationError) return setError(emailValidationError);

    setLoading(true);
  }

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.card} noValidate>
        <h1 className={styles.title}>Sign in</h1>

        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>
          Email
          <select
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          >
            <option value="">Select an email</option>
            {users.map((user) => (
              <option key={user.id} value={user.email}>
                {user.email}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className={styles.helper}>SEP - Swedish Event Planner</p>
      </form>
    </div>
  );
}
