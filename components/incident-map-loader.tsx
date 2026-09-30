"use client";

import dynamic from "next/dynamic";
import type { IncidentRecord } from "@/lib/incidents";

const IncidentMap = dynamic(() => import("@/components/IncidentMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-48 place-items-center rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-zinc-400">
      جارٍ تحميل الخريطة…
    </div>
  ),
});

export function IncidentMapLoader({
  incidents,
  className = "h-[480px]",
}: {
  incidents: IncidentRecord[];
  className?: string;
}) {
  return <IncidentMap incidents={incidents} className={className} />;
}
