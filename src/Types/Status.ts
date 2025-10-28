export const STATUS_CODE = {
  OPEN: 1,
  IN_PROGRESS: 2,
  CLOSED: 3,
  ARCHIVED: 4,
  REJECTED: 5,
} as const;

export type StatusCode = (typeof STATUS_CODE)[keyof typeof STATUS_CODE];

type Tone = "blue" | "amber" | "green" | "gray" | "red";

export const STATUS_META: Record<StatusCode, { label: string; tone: Tone }> = {
  [STATUS_CODE.OPEN]: { label: "Open", tone: "blue" },
  [STATUS_CODE.IN_PROGRESS]: { label: "In Progress", tone: "amber" },
  [STATUS_CODE.CLOSED]: { label: "Closed", tone: "green" },
  [STATUS_CODE.ARCHIVED]: { label: "Archived", tone: "gray" },
  [STATUS_CODE.REJECTED]: { label: "Rejected", tone: "red" },
};

export const KNOWN_STATUS_CODES = new Set<StatusCode>([
  STATUS_CODE.OPEN,
  STATUS_CODE.IN_PROGRESS,
  STATUS_CODE.CLOSED,
  STATUS_CODE.ARCHIVED,
  STATUS_CODE.REJECTED,
]);

export function getStatusMeta(code: number) {
  if (KNOWN_STATUS_CODES.has(code as StatusCode)) {
    return STATUS_META[code as StatusCode];
  }
  return { label: `Status ${code}`, tone: "gray" as const };
}

export const isInProgress = (code: number) => code === STATUS_CODE.IN_PROGRESS;

export const isOpen = (code: number) => code === STATUS_CODE.OPEN;
