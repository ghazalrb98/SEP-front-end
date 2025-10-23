import { useState, type FormEvent } from "react";
import styles from "./CreateRequest.module.css";
import { useNavigate } from "react-router-dom";

export function CreateRequest() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(0);

  const token = sessionStorage.getItem("token");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!title.trim()) return setError("Title is required");

    const newRequest = {
      title: title.trim(),
      description: description.trim(),
      budget: budget,
    };

    setIsLoading(true);
    try {
      const res = await fetch("/events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRequest),
      });

      if (!res.ok) throw new Error(`Failed to create event (${res.status})`);
      setMessage("Event request created successfully");
      setTimeout(() => {
        navigate("/dashboard/requests");
      }, 1000);
    } catch (e: any) {
      setError(e.message || "Unknown Error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Create New Event Request</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}

        <label className={styles.label}>
          Title
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Product Launch Party"
            required
          />
        </label>
        <label className={styles.label}>
          Description
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the event..."
            rows={4}
          />
        </label>
        <label className={styles.label}>
          Offered Budget (SEK)
          <input
            type="number"
            className={styles.input}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
        </label>
        <div className={styles.buttons}>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Create Request"}
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => navigate("/dashboard/requests")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
