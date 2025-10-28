import { getStatusMeta } from "../Types/Status";
import styles from "./Request.module.css";
import { Link, useNavigate } from "react-router-dom";
import { DATE, SEK } from "../Utils/formatters";
import type { RequestDto } from "../Types/Dtos";

export function Request({
  id,
  status,
  title,
  description,
  approvedBudget,
  budgetEstimate,
  submittedAt,
}: RequestDto) {
  const meta = getStatusMeta(status) || {
    label: `Unknown (${status})`,
    tone: "gray" as const,
  };
  const budget =
    approvedBudget && approvedBudget > 0
      ? `${SEK.format(approvedBudget)} · Approved`
      : budgetEstimate && budgetEstimate > 0
      ? `${SEK.format(budgetEstimate)} · Estimate`
      : "—";

  const navigate = useNavigate();

  return (
    <tr key={id} onClick={() => navigate(`/dashboard/requests/${id}`)}>
      <td className={styles.titleCell}>
        <Link to={`/dashboard/requests/${id}`}>{title || "Untitled"}</Link>
      </td>
      <td className={styles.descCell}>{description || "—"}</td>
      <td>
        <span className={`${styles.badge} ${styles[meta.tone]}`}>
          {meta.label}
        </span>
      </td>
      <td>{DATE(submittedAt)}</td>
      <td>{budget}</td>
    </tr>
  );
}
