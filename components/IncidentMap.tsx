"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { incidentPoint, type IncidentRecord } from "@/lib/incidents";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function markerIcon(deadAndMissing: number): L.DivIcon {
  const color = deadAndMissing >= 25 ? "#f87171" : deadAndMissing >= 10 ? "#fdba74" : "#f5d0a9";
  return L.divIcon({
    className: "incident-marker",
    html: `<span style="display:block;width:14px;height:14px;border-radius:999px;background:${color};border:2px solid #1c1917;box-shadow:0 0 0 1px rgba(255,255,255,0.35)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

function popupHtml(incident: IncidentRecord): string {
  const source = incident.sourceUrl
    ? `<a href="${escapeHtml(incident.sourceUrl)}" target="_blank" rel="noopener noreferrer">عرض التقرير الأصلي</a>`
    : `<span>لا يوجد رابط عام</span>`;
  return `
    <div dir="rtl" style="max-width:min(240px,70vw);font-family:Cairo,Segoe UI,sans-serif;text-align:right;word-break:break-word">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.04em;color:#a8a29e">حادثة</p>
      <p style="margin:0 0 8px"><strong>تاريخ الحادثة</strong><br>${escapeHtml(incident.date ?? "غير معروف")}</p>
      <p style="margin:0 0 8px"><strong>المسار</strong><br>${escapeHtml(incident.migrationRoute ?? "غير معروف")}</p>
      <p style="margin:0 0 8px"><strong>سبب الوفاة</strong><br>${escapeHtml(incident.causeOfDeath ?? "غير مذكور")}</p>
      <p style="margin:0 0 8px"><strong>الوفيات والمفقودين</strong><br>${incident.deadAndMissing.toLocaleString("en-US")}</p>
      <p style="margin:0 0 8px"><strong>المصدر الموثق</strong><br>${escapeHtml(incident.sourceOrg)}</p>
      <p style="margin:0 0 8px"><a href="/incidents/${escapeHtml(incident.id)}">ملف الحادثة</a></p>
      ${source}
    </div>
  `;
}

function IncidentClusters({ incidents }: { incidents: IncidentRecord[] }) {
  const map = useMap();

  useEffect(() => {
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 46,
      spiderfyOnMaxZoom: true,
    });

    for (const incident of incidents) {
      const point = incidentPoint(incident);
      if (!point) continue;
      const marker = L.marker([point.lat, point.lng], {
        icon: markerIcon(incident.deadAndMissing),
        title: incident.location ?? incident.migrationRoute ?? "حادثة",
      });
      marker.bindPopup(popupHtml(incident));
      group.addLayer(marker);
    }

    map.addLayer(group);
    const bounds = group.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.18));
    }

    return () => {
      map.removeLayer(group);
    };
  }, [incidents, map]);

  return null;
}

export default function IncidentMap({
  incidents,
  className = "h-[min(480px,70vh)] min-h-64",
}: {
  incidents: IncidentRecord[];
  className?: string;
}) {
  return (
    <div className={`incident-map relative isolate z-0 max-w-full overflow-hidden rounded-xl border border-zinc-700 ${className}`}>
      <MapContainer
        center={[34.5, 18]}
        zoom={4}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <IncidentClusters incidents={incidents} />
      </MapContainer>
    </div>
  );
}
