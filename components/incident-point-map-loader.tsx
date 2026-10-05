"use client";

import dynamic from "next/dynamic";

const IncidentPointMap = dynamic(() => import("@/components/incident-point-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-44 place-items-center rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-zinc-400">
      جارٍ تحميل الخريطة…
    </div>
  ),
});

export function IncidentPointMapLoader({ lat, lng }: { lat: number; lng: number }) {
  return <IncidentPointMap lat={lat} lng={lng} />;
}
