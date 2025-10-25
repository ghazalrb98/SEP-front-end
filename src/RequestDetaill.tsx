import { useNavigate, useParams } from "react-router-dom";
import styles from "./RequestDetail.module.css";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { DATE, ROLES, SEK, STATUS, type RequestDto } from "./Types/Requests";

export function RequestDetail() {
  function getUser() {
    const raw = sessionStorage.getItem("user");

    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function setData(data: RequestDto) {
    setItem(data);
    setTitle(data.title || "");
    setDescription(data.description || "");
    setStatus(data.status ?? 1);
    setBudgetEstimate(
      Number.isFinite(data.budgetEstimate) ? data.budgetEstimate : ""
    );
    setApprovalBudget(
      Number.isFinite(data.approvedBudget) ? data.approvedBudget : ""
    );
  }

  const AUTHORIZED_ROLES_Edit = new Set(["CS", "SCS"]);
  const AUTHORIZED_ROLES_APPROVAL_BUDGET = new Set(["FM"]);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const user = getUser();
  const role = user && ROLES[Number(user.role)]?.role;
  const canEdit = role && AUTHORIZED_ROLES_Edit.has(role);
  const ApprovalBudgetVisible =
    user && AUTHORIZED_ROLES_APPROVAL_BUDGET.has(role);

  const [item, setItem] = useState<RequestDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<number>(1);
  const [budgetEstimate, setBudgetEstimate] = useState<number | "">("");
  const [approvedBudget, setApprovalBudget] = useState<number | "">("");

  const meta = useMemo(() => (item ? STATUS[item.status] : null), [item]);

  const load = useCallback(
    async (signal?: AbortSignal | null) => {
      if (!id) return;

      setIsLoading(true);
      setError("");

      try {
        const res = await fetch(`/events/${id}`, {
          method: "GET",
          headers: {
            Accept: "text/plain",
            Authorization: `Bearer ${token}`,
          },
          signal: signal ?? null,
        });

        if (!res.ok)
          throw new Error(`Failed to load event request ${res.status}`);

        const data: RequestDto = await res.json();
        setData(data);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [token, id]
  );

  async function handleSave(e: FormEvent) {
    e.preventDefault();

    if (!id) return;

    setIsLoading(true);
    setError("");

    try {
      const updatedData: RequestDto = {
        id,
        title: title.trim(),
        description: description.trim(),
        status,
        submittedAt: item?.submittedAt || "",
        budgetEstimate: budgetEstimate || 0,
        approvedBudget: approvedBudget || 0,
      };

      const res = await fetch(`/events/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error(`Failed to save request ${res.status}`);

      const updated: boolean = await res.json();

      if (!updated) return;

      setData(updatedData);
      setEditMode(false);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel() {
    if (!item) return;
    setData(item);
    setEditMode(false);
  }

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  if (isLoading && !item) return <div className={styles.page}>Loading...</div>;
  if (error && !item)
    return (
      <div className={styles.page}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  if (!item) return <div className={styles.page}>Not found.</div>;

  const tone = meta?.tone ?? "gray";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button onClick={() => navigate("/dashboard/requests")}>← Back</button>
        <h2 className={styles.title}>Request #{item.id.slice(0, 8)}...</h2>
        <span className={`{styles.badge} ${styles[tone]}`}>
          {STATUS[item.status]?.label}
        </span>
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
      {ApprovalBudgetVisible && (
        <form className={styles.form} onSubmit={handleSave}>
          <label className={styles.field}>
            Approved Budget (SEK)
            <input
              className={styles.input}
              type="number"
              value={approvedBudget}
              onChange={(e) =>
                setApprovalBudget(
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
