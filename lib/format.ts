const recordDateFormatter = new Intl.DateTimeFormat("ar", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
  numberingSystem: "latn",
});

export function formatRecordDate(isoDate: string): string {
  const date = isoDate.length <= 10 ? new Date(`${isoDate}T00:00:00Z`) : new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return recordDateFormatter.format(date);
}

export function reliabilityPercent(score: number): number {
  if (!Number.isFinite(score)) return 0;
  const percent = score <= 1 ? score * 100 : score;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

export function eventYear(isoDate: string): number {
  return Number(isoDate.slice(0, 4));
}

export function sourceCountLabel(count: number): string {
  if (count === 1) return "مصدر واحد";
  if (count === 2) return "مصدران";
  return `${count} مصادر`;
}

export function confidenceBand(score: number): string {
  if (score >= 80) return "عالية";
  if (score >= 60) return "متوسطة";
  return "منخفضة";
}

export function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[‐‑–—-]/g, " ")
    .replace(/\s+/g, " ");
}
