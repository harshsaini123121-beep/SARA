import React, { useState } from 'react';
import { AlertOctagon, MapPin, Users, HeartPulse, Crosshair } from 'lucide-react';

interface CreateEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const CreateEmergencyModal: React.FC<CreateEmergencyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [patientCount, setPatientCount] = useState<number>(1);
  const [criticalCount, setCriticalCount] = useState<number>(0);
  const [emergencyType, setEmergencyType] = useState<string>('Road Accident');
  const [severity, setSeverity] = useState<string>('CRITICAL');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('MI Road, Ajmeri Gate, Jaipur');
  const [latitude, setLatitude] = useState<number>(26.9124);
  const [longitude, setLongitude] = useState<number>(75.7873);

  // Predefined Jaipur hotspots for fast testing
  const jaipurLocations = [
    { name: 'MI Road (Ajmeri Gate Junction)', lat: 26.9124, lng: 75.7873 },
    { name: 'Tonk Road (Near Durgapura)', lat: 26.8500, lng: 75.7950 },
    { name: 'Ajmer Expressway (200ft Bypass)', lat: 26.8850, lng: 75.7400 },
    { name: 'Malviya Nagar Sector 3', lat: 26.8550, lng: 75.8180 },
    { name: 'Vidhyadhar Nagar Sector 1', lat: 26.9550, lng: 75.7800 },
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      patient_count: patientCount,
      critical_patient_count: criticalCount,
      emergency_type: emergencyType,
      severity,
      latitude,
      longitude,
      description,
      address,
    });
    onClose();
  };

  const handleSelectLocation = (loc: typeof jaipurLocations[0]) => {
    setLatitude(loc.lat);
    setLongitude(loc.lng);
    setAddress(loc.name);
  };

  const handleUseBrowserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAddress('Browser Geolocation Target');
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl glass-panel bg-navy-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-navy-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Create Emergency Incident</h2>
              <p className="text-xs text-slate-400">Emergency Control Room Operations Input</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm px-2.5 py-1 rounded-lg hover:bg-white/5">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Emergency Type & Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Category</label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-medium"
              >
                <option value="Road Accident">Road Accident</option>
                <option value="Cardiac">Cardiac Emergency</option>
                <option value="Stroke">Stroke</option>
                <option value="Trauma">Trauma / Injury</option>
                <option value="Breathing Emergency">Breathing Emergency</option>
                <option value="Burn">Severe Burn</option>
                <option value="Other">Other Emergency</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Severity Level</label>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/ml/predict-triage', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          systolic_bp: 82,
                          heart_rate_bpm: 125,
                          spo2_percent: 88,
                          gcs_score: 10,
                          age: 55,
                          primary_symptom: emergencyType
                        })
                      });
                      const data = await res.json();
                      if (data.severity_level) {
                        setSeverity(data.severity_level);
                        if (data.severity_level === 'CRITICAL') setCriticalCount(1);
                      }
                    } catch (e) {
                      setSeverity('CRITICAL');
                    }
                  }}
                  className="text-[10px] text-emerald-400 font-bold hover:underline"
                >
                  ⚡ Auto-Triage Vitals
                </button>
              </div>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold text-red-400"
              >
                <option value="CRITICAL">CRITICAL (Red)</option>
                <option value="HIGH">HIGH (Orange)</option>
                <option value="MEDIUM">MEDIUM (Yellow)</option>
                <option value="LOW">LOW (Green)</option>
              </select>
            </div>
          </div>


          {/* Patient Counts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Patients</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => {
                      setPatientCount(num);
                      if (criticalCount > num) setCriticalCount(num);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      patientCount === num
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-navy-800 text-slate-400 hover:bg-navy-700'
                    }`}
                  >
                    {num}{num === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Critical Patients (ICU Needs)</label>
              <input
                type="number"
                min="0"
                max={patientCount}
                value={criticalCount}
                onChange={(e) => setCriticalCount(Math.min(patientCount, parseInt(e.target.value) || 0))}
                className="w-full glass-input rounded-xl px-3 py-1.5 text-xs font-bold text-amber-400"
              />
            </div>
          </div>

          {/* Incident Location Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Incident Location (Jaipur Demo Hotspots)</label>
              <button
                type="button"
                onClick={handleUseBrowserLocation}
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Crosshair className="w-3 h-3" /> Geolocation
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {jaipurLocations.map((loc, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectLocation(loc)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    address === loc.name
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-navy-800 text-slate-400 hover:bg-navy-700'
                  }`}
                >
                  📍 {loc.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Incident address..."
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>

          {/* Latitude / Longitude */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full glass-input rounded-xl px-3 py-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full glass-input rounded-xl px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe incident situation..."
              rows={2}
              className="w-full glass-input rounded-xl p-3 text-xs"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/5 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-900/30 transition-all"
            >
              CREATE & RUN AI ANALYSIS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
