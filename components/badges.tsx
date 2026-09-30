import { sourceCountLabel } from "@/lib/format";
import { isVitalStatus, statusBadgeClass, statusDotClass, statusLabel, type VitalStatus } from "@/lib/status";

export function StatusBadge({ status }: { status: VitalStatus | string }) {
  const known = isVitalStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        known ? statusBadgeClass[status] : "bg-stone-200 text-stone-800 ring-stone-500/20"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${known ? statusDotClass[status] : "bg-stone-500"}`}
        aria-hidden
      />
      {statusLabel(status)}
    </span>
  );
}

export function ConflictBadge({ prominent = false }: { prominent?: boolean }) {
  return (
    <p
      className={
        prominent
          ? "bg-warn-soft px-4 py-2.5 text-sm font-semibold text-warn"
          : "inline-flex rounded-full bg-warn-soft px-2.5 py-1 text-xs font-semibold text-warn ring-1 ring-inset ring-warn/20"
      }
    >
      تعارض بين المصادر
    </p>
  );
}

export function SourceCountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-ink ring-1 ring-inset ring-line">
      عدد المصادر: {sourceCountLabel(count)}
    </span>
  );
}
