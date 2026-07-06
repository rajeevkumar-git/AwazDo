'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon issues in Next.js/Leaflet
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  city: string;
}

// Center coordinates for pilot cities
const CITY_CENTERS: Record<string, [number, number]> = {
  delhi: [28.6139, 77.2090],
  ghaziabad: [28.6692, 77.4538]
};

// Component to dynamically adjust map center on city change
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

export default function MapView({ city }: MapViewProps) {
  const center = CITY_CENTERS[city.toLowerCase()] || [28.6139, 77.2090];
  const [complaints, setComplaints] = useState<any[]>([]);

  // Fetch complaints in background to populate map
  useEffect(() => {
    // For demo purposes, we add some mock locations near the centers
    const mockComplaints = [
      { id: 1, title: 'Broken Road / टूटी सड़क', lat: center[0] + 0.01, lng: center[1] - 0.01, category: 'Roads' },
      { id: 2, title: 'Water Leakage / पानी का रिसाव', lat: center[0] - 0.015, lng: center[1] + 0.02, category: 'Water' },
      { id: 3, title: 'Garbage Heap / कचरे का ढेर', lat: center[0] + 0.005, lng: center[1] + 0.015, category: 'Sanitation' }
    ];
    setComplaints(mockComplaints);
  }, [center]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden min-h-[400px]">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* CartoDB Dark Matter tiles look extremely premium and match our dark theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ChangeView center={center} />
        {complaints.map((comp) => (
          <Marker 
            key={comp.id} 
            position={[comp.lat, comp.lng]} 
            icon={markerIcon}
          >
            <Popup className="dark-popup">
              <div className="p-2 space-y-1 bg-slate-900 text-slate-100 rounded-md">
                <p className="font-bold text-sm text-orange-400">{comp.category}</p>
                <p className="text-xs">{comp.title}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
