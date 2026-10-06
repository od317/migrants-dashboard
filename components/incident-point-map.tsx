"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
  className: "incident-marker",
  html: `<span style="display:block;width:16px;height:16px;border-radius:999px;background:#f87171;border:2px solid #1c1917;box-shadow:0 0 0 1px rgba(255,255,255,0.35)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function IncidentPointMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="incident-map relative isolate z-0 h-44 overflow-hidden rounded-xl border border-zinc-700">
      <MapContainer
        center={[lat, lng]}
        zoom={8}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={markerIcon} />
      </MapContainer>
    </div>
  );
}
