import { useEffect, useMemo, useState } from "react";
import styles from "./RequestsList.module.css";

export type RequestDto = {
  id: string;
  title: string;
  description: string;
  status: number;
  submittedAt: string;
  budgetEstimate: number;
  approvedBudget: number;
};

const STATUS: Record<
  number,
  { label: string; tone: "blue" | "amber" | "green" | "gray" | "red" }
> = {
  1: { label: "Open", tone: "blue" },
  2: { label: "In Progress", tone: "amber" },
  3: { label: "Closed", tone: "green" },
  4: { label: "Archived", tone: "gray" },
  5: { label: "Rejected", tone: "red" },
};

const SEK = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});
const DATE = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("sv-SE", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

export function RequestsList() {
  const [data, setData] = useState<RequestDto[] | null>(null);
  const [query, setQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("token");

  async function fetchRequests(signal?: AbortSignal | null) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/events", {
        headers: { Accept: "text/plain", Authorization: `Bearer ${token}` },
        signal: signal ?? null,
      });

      if (!res.ok) throw new Error(`Failed to load requests (${res.status})`);

      const dataJson: RequestDto[] = await res.json();
      setData(dataJson);
    } catch (e: any) {
      if (e.name !== "AbortError") setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ctrl = new AbortController();
    fetchRequests(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data
      .filter((r) => (status === "all" ? true : String(r.status) === status))
      .filter((r) =>
        q
          ? [r.title, r.description, STATUS[r.status]?.label].some((v) =>
              v?.toLowerCase().includes(q)
            )
          : true
      )
      .sort((a, b) =>
        a.submittedAt && b.submittedAt
          ? a.submittedAt < b.submittedAt
            ? 1
            : -1
          : 0
      );
  }, [data, query, status]);

  return (
    <div className={styles.wrap}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h2 className={styles.h2}>Event Requests</h2>
          <p className={styles.sub}>Incoming and draft requests</p>
        </div>
        <div className={styles.actions}>
          <input
            className={styles.search}
            placeholder="Search title, description, status…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className={styles.select}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
          <button className={styles.refresh} onClick={() => fetchRequests()}>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <div>⚠️ {error}</div>
          <button className={styles.linkBtn} onClick={() => fetchRequests()}>
            Try again
          </button>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Submitted</th>
              <th className={styles.right}>Budget</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`} className={styles.skeletonRow}>
                    <td colSpan={5}>
                      <div className={styles.skeleton} />
                    </td>
                  </tr>
                ))}
              </>
            )}

            {!loading &&
              rows.map((r) => {
                const meta = STATUS[r.status] || {
                  label: `Unknown (${r.status})`,
                  tone: "gray" as const,
                };
                const budget =
                  r.approvedBudget && r.approvedBudget > 0
                    ? `${SEK.format(r.approvedBudget)} · Approved`
                    : r.budgetEstimate && r.budgetEstimate > 0
                    ? `${SEK.format(r.budgetEstimate)} · Estimate`
                    : "—";
                return (
                  <tr key={r.id}>
                    <td className={styles.titleCell}>
                      {r.title || "Untitled"}
                    </td>
                    <td className={styles.descCell}>{r.description || "—"}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[meta.tone]}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td>{DATE(r.submittedAt)}</td>
                    <td className={styles.right}>{budget}</td>
                  </tr>
                );
              })}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className={styles.hint}>
        Tip: Click Refresh if you just created a new request in another tab.
      </p>
    </div>
  );
}
