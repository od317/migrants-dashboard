export const VITAL_STATUSES = [
  "ALIVE",
  "MISSING",
  "DECEASED",
  "DETAINED",
  "DECEASED_OR_MISSING",
  "CONFLICT_EVENT",
  "FATALITY_EVENT",
  "UNKNOWN",
] as const;

export type VitalStatus = (typeof VITAL_STATUSES)[number];

export const STATUS_LABELS: Record<VitalStatus, string> = {
  ALIVE: "على قيد الحياة",
  MISSING: "مفقود",
  DECEASED: "متوفى / شهيد",
  DETAINED: "معتقل",
  DECEASED_OR_MISSING: "متوفى أو مفقود",
  CONFLICT_EVENT: "حدث أمني / قصف",
  FATALITY_EVENT: "حادثة وفاة",
  UNKNOWN: "غير معروف",
};

export const CONFLICT_EVENT_LABEL = STATUS_LABELS.CONFLICT_EVENT;

export const STATUS_FILTERS: { value: VitalStatus; label: string }[] = VITAL_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

export const statusBadgeClass: Record<VitalStatus, string> = {
  ALIVE: "bg-emerald-100 text-emerald-900 ring-emerald-800/15",
  MISSING: "bg-amber-100 text-amber-950 ring-amber-800/20",
  DECEASED: "bg-red-100 text-red-900 ring-red-800/15",
  DETAINED: "bg-purple-100 text-purple-950 ring-purple-800/20",
  DECEASED_OR_MISSING: "bg-red-100 text-red-900 ring-red-800/15",
  CONFLICT_EVENT: "bg-orange-100 text-orange-950 ring-orange-800/20",
  FATALITY_EVENT: "bg-orange-100 text-orange-950 ring-orange-800/20",
  UNKNOWN: "bg-stone-200 text-stone-800 ring-stone-500/20",
};

export const statusDotClass: Record<VitalStatus, string> = {
  ALIVE: "bg-emerald-600",
  MISSING: "bg-amber-500",
  DECEASED: "bg-red-600",
  DETAINED: "bg-purple-700",
  DECEASED_OR_MISSING: "bg-red-600",
  CONFLICT_EVENT: "bg-orange-600",
  FATALITY_EVENT: "bg-orange-700",
  UNKNOWN: "bg-stone-500",
};

export function isVitalStatus(value: string): value is VitalStatus {
  return (VITAL_STATUSES as readonly string[]).includes(value);
}

export function statusLabel(value: string): string {
  return isVitalStatus(value) ? STATUS_LABELS[value] : value;
}
