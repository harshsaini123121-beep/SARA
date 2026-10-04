import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Ambulance, Hospital, Emergency } from '../types';

interface LiveMapProps {
  ambulances: Ambulance[];
  hospitals: Hospital[];
  emergencies: Emergency[];
  selectedRoute?: [number, number][];
  center?: [number, number];
  zoom?: number;
  onSelectEmergency?: (emg: Emergency) => void;
}

// Custom Leaflet Icons using SVG divIcons
const createAmbulanceIcon = (status: string) => {
  const isBusy = status !== 'AVAILABLE';
  const color = isBusy ? '#EF4444' : '#10B981';
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 8px; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect width="16" height="10" x="2" y="6" rx="2"/>
          <circle cx="7" cy="18" r="2"/>
          <circle cx="17" cy="18" r="2"/>
          <path d="M12 9v4"/>
          <path d="M10 11h4"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

const createHospitalIcon = (status: string) => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="background-color: #3B82F6; width: 34px; height: 34px; border-radius: 8px; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
          <path d="M10 6h4"/>
          <path d="M12 4v4"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

const createEmergencyIcon = (severity: string, patientCount: number) => {
  const isCritical = severity === 'CRITICAL';
  const color = isCritical ? '#EF4444' : '#F97316';
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="background-color: ${color}; width: 38px; height: 38px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: #ffffff; box-shadow: 0 0 15px ${color};" class="${isCritical ? 'pulse-marker-red' : ''}">
        🚨 ${patientCount}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

// Map Recenter Component
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const LiveMap: React.FC<LiveMapProps> = ({
  ambulances,
  hospitals,
  emergencies,
  selectedRoute = [],
  center = [26.8970, 75.8150], // Jaipur SMS Hospital Default Center
  zoom = 12,
  onSelectEmergency,
}) => {
  return (
    <div className="w-full h-full min-h-[450px] relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <MapRecenter center={center} zoom={zoom} />

        {/* Dark Matter CartoDB Basemap tiles for emergency ops UI */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Route Geometry Line */}
        {selectedRoute && selectedRoute.length > 0 && (
          <Polyline
            positions={selectedRoute}
            pathOptions={{
              color: '#06B6D4',
              weight: 5,
              opacity: 0.85,
              dashArray: '10, 10',
            }}
          />
        )}

        {/* Ambulances */}
        {ambulances.map((amb) => (
          <Marker
            key={`amb-${amb.id}`}
            position={[amb.latitude, amb.longitude]}
            icon={createAmbulanceIcon(amb.status)}
          >
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>🚑 {amb.vehicle_number}</span>
                </div>
                <div className="text-slate-300">Driver: {amb.driver_name}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-semibold text-slate-400">Type:</span>
                  <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded font-bold">{amb.vehicle_type}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold ${amb.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {amb.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hospitals */}
        {hospitals.map((hosp) => (
          <Marker
            key={`hosp-${hosp.id}`}
            position={[hosp.latitude, hosp.longitude]}
            icon={createHospitalIcon(hosp.status)}
          >
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <div className="font-bold text-sm text-slate-100">🏥 {hosp.name}</div>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10">
                  <div>Available Beds: <b className="text-emerald-400">{hosp.available_beds}</b></div>
                  <div>ICU Beds: <b className="text-amber-400">{hosp.icu_beds}</b></div>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Trauma Center: <b className={hosp.trauma_capacity ? 'text-emerald-400' : 'text-slate-500'}>{hosp.trauma_capacity ? 'YES' : 'NO'}</b>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Emergencies */}
        {emergencies.map((emg) => (
          <Marker
            key={`emg-${emg.id}`}
            position={[emg.latitude, emg.longitude]}
            icon={createEmergencyIcon(emg.severity, emg.patient_count)}
            eventHandlers={{
              click: () => onSelectEmergency && onSelectEmergency(emg),
            }}
          >
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <div className="font-bold text-sm text-red-400 flex items-center gap-1">
                  <span>🚨 {emg.emergency_type}</span>
                </div>
                <div className="text-slate-200">Severity: <b className="text-red-400">{emg.severity}</b></div>
                <div className="text-slate-300">Patients: <b>{emg.patient_count}</b> ({emg.critical_patient_count} critical)</div>
                <div className="text-[11px] text-slate-400 mt-1">{emg.address}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-20 glass-panel p-2.5 rounded-lg text-[11px] flex items-center gap-4 text-slate-300 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
          <span>Ambulance (Available)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-500 inline-block"></span>
          <span>Ambulance (Dispatched)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
          <span>Hospital</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block animate-ping"></span>
          <span>Incident Location</span>
        </div>
      </div>
    </div>
  );
};
