export type RequestDto = {
  id: string;
  title: string;
  description: string;
  status: number;
  submittedAt: string;
  budgetEstimate: number;
  approvedBudget: number;
};

export const STATUS: Record<
  number,
  { label: string; tone: "blue" | "amber" | "green" | "gray" | "red" }
> = {
  1: { label: "Open", tone: "blue" },
  2: { label: "In Progress", tone: "amber" },
  3: { label: "Closed", tone: "green" },
  4: { label: "Archived", tone: "gray" },
  5: { label: "Rejected", tone: "red" },
};

export const ROLES: Record<number, { role: string; label: string }> = {
  1: { role: "CS", label: "Customer Service" },
  2: { role: "SCS", label: "Senior Customer Serive Officer" },
  3: { role: "AM", label: "Administration Manager" },
  4: { role: "FM", label: "FinancialManager" },
  5: { role: "PM", label: "Product Manager" },
  6: { role: "SM", label: "Service Manager" },
  7: { role: "HR", label: "Human Resources" },
  8: { role: "MM", label: "Marketing Manager" },
  9: { role: "VP", label: "Vice President" },
};

export const SEK = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

export const DATE = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("sv-SE", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";
