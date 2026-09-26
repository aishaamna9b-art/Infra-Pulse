"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getSeverityColor = (severity: string) => {
  if (severity === 'HIGH') return '#dc2626'; // red-600
  if (severity === 'MEDIUM') return '#f97316'; // orange-500
  return '#3b82f6'; // blue-500
};

export default function AdminMap({ reports, mapType }: { reports: any[], mapType: 'standard' | 'heatmap' }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>;

  const center = reports.length > 0 && reports[0].latitude
    ? [reports[0].latitude, reports[0].longitude]
    : [13.0827, 80.2707]; // Default to Chennai roughly

  return (
    <MapContainer center={center as [number, number]} zoom={12} className="w-full h-full rounded-xl" style={{ zIndex: 1 }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.map((report) => {
        if (!report.latitude || !report.longitude) return null;
        
        if (mapType === 'heatmap') {
          return (
            <CircleMarker
              key={report.id}
              center={[report.latitude, report.longitude]}
              radius={report.severity === 'HIGH' ? 30 : report.severity === 'MEDIUM' ? 20 : 15}
              fillColor={getSeverityColor(report.severity)}
              fillOpacity={0.6}
              stroke={false}
            />
          );
        }

        // Custom div icon for standard markers to show colors without external images
        const color = getSeverityColor(report.severity);
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        return (
          <Marker 
            key={report.id} 
            position={[report.latitude, report.longitude]}
            icon={customIcon}
          >
            <Popup>
              <strong>Ticket #{report.id}</strong><br />
              Category: {report.category}<br />
              Severity: {report.severity}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
