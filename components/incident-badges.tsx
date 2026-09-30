export function CasualtyBadge({ count }: { count: number }) {
  const tone =
    count >= 25
      ? "bg-red-950 text-red-200 ring-red-800/80"
      : count >= 10
        ? "bg-orange-950 text-orange-200 ring-orange-800/80"
        : "bg-amber-950 text-amber-100 ring-amber-800/70";
  const label = count >= 25 ? "بالغ" : count >= 10 ? "مرتفع" : "ملحوظ";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`}>
      <span className="tabular-nums">{count.toLocaleString("en-US")}</span>
      <span className="font-medium">{label}</span>
    </span>
  );
}

export function ReliabilityPill({ score }: { score: number }) {
  const percent = Math.round(score * 100);
  const tone =
    percent >= 85
      ? "bg-emerald-950 text-emerald-200 ring-emerald-800/80"
      : percent >= 70
        ? "bg-amber-950 text-amber-100 ring-amber-800/70"
        : "bg-rose-950 text-rose-200 ring-rose-800/80";

  return (
    <span
      title="نسبة الموثوقية"
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset ${tone}`}
    >
      <span className="sr-only">نسبة الموثوقية </span>
      {percent}%
    </span>
  );
}
