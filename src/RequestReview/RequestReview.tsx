import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { ReviewDto } from "../Types/Dtos";
import styles from "./RequestReview.module.css";
import { STATUS_CODE, type StatusCode } from "../Types/Status";

export default function RequestReview({
  requestId,
  canEdit,
  onStatusChange,
}: {
  requestId: string | undefined;
  canEdit: boolean;
  onStatusChange: (nextStatus: StatusCode) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");

  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  const load = useCallback(
    async (signal?: AbortSignal | null) => {
      if (!requestId) return;
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(`/reviews/`, {
          method: "GET",
          headers: {
            Accept: "text/plain",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) throw new Error(`couldn't get the reviews ${res.status}`);

        const reviews: ReviewDto[] = await res.json();
        const requestReview = reviews.find(
          (review) => review.eventId === requestId
        );
        setComment(requestReview?.comments || "");
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [requestId, token]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  async function handleApprove(e: FormEvent) {
    e.preventDefault();
    if (!requestId) return;

    try {
      setError("");
      setIsLoading(true);

      const res = await fetch(`/reviews/approve/${requestId}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(comment),
      });

      if (!res.ok) throw new Error(`Failed to approve request (${res.status})`);

      onStatusChange(STATUS_CODE.IN_PROGRESS);

      // Reload entity
      const ctrl = new AbortController();
      await load(ctrl.signal);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReject() {
    if (!requestId) return;

    try {
      setError("");
      setIsLoading(true);

      const res = await fetch(`/reviews/reject/${requestId}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(comment),
      });

      if (!res.ok) throw new Error(`Failed to reject request (${res.status})`);

      onStatusChange(STATUS_CODE.REJECTED);

      const ctrl = new AbortController();
      await load(ctrl.signal);
      setComment("");
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading)
    return (
      <div className={styles.row}>
        <div className={styles.label}>Comment</div>
        <div className={styles.value}>Loading...</div>
      </div>
    );
  return canEdit ? (
    <form className={styles.form} onSubmit={handleApprove}>
      {error && <div className={styles.error}>{error}</div>}
      <label className={styles.field}>
        Comment
        <textarea
          className={styles.textarea}
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </label>
      <div className={styles.actions}>
        <button type="submit">Approve</button>
        <button type="button" onClick={handleReject}>
          Reject
        </button>
      </div>
    </form>
  ) : (
    <div className={styles.row}>
      <div className={styles.label}>Comment</div>
      <div className={styles.value}>{comment || "-"}</div>
    </div>
  );
}
