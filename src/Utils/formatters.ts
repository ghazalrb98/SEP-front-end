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
