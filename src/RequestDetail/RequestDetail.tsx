import { useNavigate, useParams } from "react-router-dom";
import styles from "./RequestDetail.module.css";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { getStatusMeta, isInProgress, isOpen } from "../Types/Status";
import type { RequestDto } from "../Types/Dtos";
import { ROLES } from "../Types/Roles";
import { DATE, SEK } from "../Utils/formatters";
import RequestReview from "../RequestReview/RequestReview";

export function RequestDetail() {
  // ---- Utils ----
  function getUser() {
    const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function applyData(data: RequestDto) {
    setItem(data);
    setTitle(data.title || "");
    setDescription(data.description || "");
    setBudgetEstimate(
      Number.isFinite(data.budgetEstimate) ? data.budgetEstimate : ""
    );
    setApprovedBudget(
      Number.isFinite(data.approvedBudget) ? data.approvedBudget : ""
    );
  }

  // ---- Auth / role gates ----
  const AUTHORIZED_ROLES_REVIEW = new Set(["CSO", "SCS"]); // who can approve/reject
  const AUTHORIZED_ROLES_EDIT = new Set(["CS", "SCS"]); // who can edit fields
  const AUTHORIZED_ROLES_FIN = new Set(["FM"]); // who can set approved budget

  // ---- Routing / auth ----
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  const user = getUser();
  const role = user ? ROLES[Number(user.role)]?.role : undefined;

  const canEdit = !!role && AUTHORIZED_ROLES_EDIT.has(role);
  const canReview = !!role && AUTHORIZED_ROLES_REVIEW.has(role);
  const canSeeApprovedBudget = !!role && AUTHORIZED_ROLES_FIN.has(role);

  // ---- Local state ----
  const [item, setItem] = useState<RequestDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetEstimate, setBudgetEstimate] = useState<number | "">("");
  const [approvedBudget, setApprovedBudget] = useState<number | "">("");

  const meta = useMemo(
    () => (item ? getStatusMeta(item.status) : null),
    [item]
  );

  // ---- Load one request ----
  const load = useCallback(
    async (signal?: AbortSignal | null) => {
      if (!id) return;
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(`/events/${id}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          signal: signal ?? null,
        });
        if (!res.ok)
          throw new Error(`Failed to load event request (${res.status})`);
        const data: RequestDto = await res.json();
        applyData(data);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [token, id]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  // ---- Save edits ----
  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!id) return;

    setIsLoading(true);
    setError("");
    try {
      const payload: RequestDto = {
        id,
        title: title.trim(),
        description: description.trim(),
        status: item?.status || 0,
        submittedAt: item?.submittedAt || "",
        budgetEstimate: budgetEstimate || 0,
        approvedBudget: approvedBudget || 0,
      };

      const res = await fetch(`/events/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to save request (${res.status})`);

      // If API returns boolean, we just trust and apply local payload.
      // If API returns entity, prefer: const updated = await res.json(); applyData(updated);
      const ok: boolean = await res.json();
      if (!ok) return;

      applyData(payload);
      setEditMode(false);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel() {
    if (!item) return;
    applyData(item);
    setEditMode(false);
  }

  // ---- Guarded renders ----
  if (isLoading && !item) return <div className={styles.page}>Loading...</div>;
  if (error && !item)
    return (
      <div className={styles.page}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  if (!item) return <div className={styles.page}>Not found.</div>;

  const tone = meta?.tone ?? "gray";
  const statusForView = item.status;
  const canEditApprovedBudget =
    canSeeApprovedBudget && isInProgress(statusForView); // finance + in-progress

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button onClick={() => navigate("/dashboard/requests")}>← Back</button>
        <h2 className={styles.title}>Request #{item.id.slice(0, 8)}...</h2>
        <span className={`${styles.badge} ${styles[tone]}`}>{meta?.label}</span>
        <div className={styles.spacer} />
        {canEdit && !editMode && (
          <button className={styles.primary} onClick={() => setEditMode(true)}>
            Edit
          </button>
        )}
      </header>

      {!editMode ? (
        <section className={styles.viewBox}>
          <div className={styles.row}>
            <div className={styles.label}>Title</div>
            <div className={styles.value}>{item.title || "—"}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>Description</div>
            <div className={styles.value}>{item.description || "—"}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>Submitted</div>
            <div className={styles.value}>{DATE(item.submittedAt)}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>Budget Estimate</div>
            <div className={styles.value}>
              {item.budgetEstimate ? SEK.format(item.budgetEstimate) : "—"}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.label}>Approved Budget</div>
            <div className={styles.value}>
              {item.approvedBudget ? SEK.format(item.approvedBudget) : "—"}
            </div>
          </div>
        </section>
      ) : (
        <form className={styles.form} onSubmit={handleSave}>
          {error && <div className={styles.error}>{error}</div>}

          <label className={styles.field}>
            Title
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            Description
            <textarea
              className={styles.textarea}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            Budget Estimate (SEK)
            <input
              className={styles.input}
              type="number"
              value={budgetEstimate}
              onChange={(e) =>
                setBudgetEstimate(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              min={0}
            />
          </label>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primary}
              disabled={isLoading}
            >
              {isLoading ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <RequestReview
        requestId={id}
        canEdit={canReview && isOpen(statusForView)}
        onStatusChange={(statusCode) =>
          setItem((prev) => (prev ? { ...prev, status: statusCode } : prev))
        }
      />

      {canEditApprovedBudget && isInProgress(statusForView) && (
        <form className={styles.form} onSubmit={handleSave}>
          <label className={styles.field}>
            Approved Budget (SEK)
            <input
              className={styles.input}
              type="number"
              value={approvedBudget}
              onChange={(e) =>
                setApprovedBudget(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              min={0}
            />
          </label>
          <div className={styles.actions}>
            <button className={styles.primary} disabled={isLoading}>
              {isLoading ? "Update…" : "Update"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
