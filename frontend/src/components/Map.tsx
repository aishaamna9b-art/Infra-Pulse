"use client"
import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix Leaflet's default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], 
    iconAnchor: [12, 41], 
    popupAnchor: [1, -34], 
    shadowSize: [41, 41]
  });
};

const redIcon = createIcon('red');
const orangeIcon = createIcon('orange');
const blueIcon = createIcon('blue');

function MapUpdater({ tickets }: { tickets: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (tickets.length > 0) {
      const avgLat = tickets.reduce((s, t) => s + t.latitude, 0) / tickets.length;
      const avgLon = tickets.reduce((s, t) => s + t.longitude, 0) / tickets.length;
      map.setView([avgLat, avgLon], 12);
    }
  }, [tickets, map]);
  return null;
}

export default function MapView({ tickets }: { tickets: any[] }) {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden relative z-0">
      <MapContainer center={[11.0168, 76.9558]} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater tickets={tickets} />
        {tickets.map(t => (
          <Marker 
            key={t.id} 
            position={[t.latitude, t.longitude]} 
            icon={t.severity === 'HIGH' ? redIcon : t.severity === 'MEDIUM' ? orangeIcon : blueIcon}
          >
            <Popup>
              <div className="font-sans text-sm">
                <b>Ticket #{t.id}</b><br/>
                Type: <span className="uppercase">{t.category}</span><br/>
                Severity: <b>{t.severity}</b>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
