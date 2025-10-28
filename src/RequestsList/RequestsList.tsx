import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./RequestsList.module.css";
import { getStatusMeta, STATUS_META } from "../Types/Status";
import type { RequestDto } from "../Types/Dtos";
import { Request } from "../Request/Request";

export function RequestsList() {
  const [data, setData] = useState<RequestDto[] | null>(null);
  const [query, setQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("token");

  const fetchRequests = useCallback(
    async (signal?: AbortSignal | null) => {
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
    },
    [token]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    fetchRequests(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchRequests]);

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data
      .filter((r) => (status === "all" ? true : String(r.status) === status))
      .filter((r) =>
        q
          ? [r.title, r.description, getStatusMeta(r.status).label].some((v) =>
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
            {Object.entries(STATUS_META).map(([value, meta]) => (
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

            {!loading && rows.map((r) => <Request {...r} />)}

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
