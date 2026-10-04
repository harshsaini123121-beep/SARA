import React, { useState, useEffect } from 'react';
import { Building2, HeartPulse, BedDouble, CheckCircle2, ShieldAlert, Truck, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { Hospital, Emergency } from '../types';

export const HospitalDashboard: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [hospRes, emgRes] = await Promise.all([
        api.get('/hospitals'),
        api.get('/emergencies'),
      ]);
      setHospitals(hospRes.data);
      if (hospRes.data.length > 0 && !selectedHospital) {
        setSelectedHospital(hospRes.data[0]); // Default to SMS Hospital
      }
      setEmergencies(emgRes.data);
    } catch (err) {
      console.error('Error fetching hospital dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateCapacity = async (beds: number, icu: number) => {
    if (selectedHospital) {
      try {
        const res = await api.patch(`/hospitals/${selectedHospital.id}`, {
          available_beds: beds,
          icu_beds: icu,
        });
        setSelectedHospital(res.data);
        fetchData();
      } catch (err) {
        console.error('Error updating hospital capacity:', err);
      }
    }
  };

  const incomingEmergencies = emergencies.filter(
    (e) => e.status !== 'COMPLETED' && e.status !== 'CANCELLED'
  );

  return (
    <div className="p-6 space-y-6 flex-1 bg-navy-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-400" />
            <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tight">
              Hospital Emergency Intake Center
            </h1>
          </div>
          <p className="text-xs text-slate-400">Real-Time Bed Capacity & Incoming Patient Triage Monitor</p>
        </div>

        {selectedHospital && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">Active Hospital:</span>
            <select
              value={selectedHospital.id}
              onChange={(e) => {
                const found = hospitals.find((h) => h.id === parseInt(e.target.value));
                if (found) setSelectedHospital(found);
              }}
              className="glass-input rounded-xl px-3 py-1.5 text-xs font-bold text-blue-400"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Selected Hospital Stats & Capacity Controls */}
      {selectedHospital && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-100">🏥 {selectedHospital.name}</h2>
              <p className="text-xs text-slate-400">Jaipur Emergency Desk • Contact: {selectedHospital.contact_number}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                {selectedHospital.status}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${selectedHospital.trauma_capacity ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400'}`}>
                Trauma Certified: {selectedHospital.trauma_capacity ? 'YES' : 'NO'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* General Beds Control */}
            <div className="glass-card p-4 rounded-xl border border-white/10 space-y-2">
              <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Available Emergency Beds</span>
                <BedDouble className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400">{selectedHospital.available_beds}</div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleUpdateCapacity(Math.max(0, selectedHospital.available_beds - 1), selectedHospital.icu_beds)}
                  className="px-3 py-1 bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold rounded-lg"
                >
                  -1 Bed
                </button>
                <button
                  onClick={() => handleUpdateCapacity(selectedHospital.available_beds + 1, selectedHospital.icu_beds)}
                  className="px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 text-xs font-bold rounded-lg"
                >
                  +1 Bed
                </button>
              </div>
            </div>

            {/* ICU Beds Control */}
            <div className="glass-card p-4 rounded-xl border border-white/10 space-y-2">
              <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Available ICU Beds</span>
                <HeartPulse className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400">{selectedHospital.icu_beds}</div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleUpdateCapacity(selectedHospital.available_beds, Math.max(0, selectedHospital.icu_beds - 1))}
                  className="px-3 py-1 bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold rounded-lg"
                >
                  -1 ICU
                </button>
                <button
                  onClick={() => handleUpdateCapacity(selectedHospital.available_beds, selectedHospital.icu_beds + 1)}
                  className="px-3 py-1 bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 text-xs font-bold rounded-lg"
                >
                  +1 ICU
                </button>
              </div>
            </div>

            {/* Capacity Total */}
            <div className="glass-card p-4 rounded-xl border border-white/10 space-y-2">
              <div className="text-xs font-semibold text-slate-400">Total Emergency Capacity</div>
              <div className="text-3xl font-black text-slate-100">{selectedHospital.emergency_capacity}</div>
              <div className="text-[11px] text-slate-400 pt-2">
                Intake Capacity Margin: <b className="text-emerald-400">{Math.round((selectedHospital.available_beds / selectedHospital.emergency_capacity) * 100)}% Available</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Ambulance Notifications */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Truck className="w-5 h-5 text-red-400" />
          <span>Incoming Critical Emergency Dispatches ({incomingEmergencies.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incomingEmergencies.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-slate-500 text-xs">
              No incoming critical patient dispatches at this time.
            </div>
          ) : (
            incomingEmergencies.map((emg) => (
              <div key={emg.id} className="glass-card p-4 rounded-xl border border-red-500/30 bg-red-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-100 text-sm">
                    🚨 Incident #{emg.id} • {emg.emergency_type}
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-black bg-red-500 text-white rounded">
                    {emg.severity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>Patients: <b>{emg.patient_count}</b></div>
                  <div>ICU Required: <b className="text-amber-400">{emg.critical_patient_count} Beds</b></div>
                  <div>Address: <span className="text-slate-400">{emg.address}</span></div>
                  <div>Status: <span className="text-blue-400 font-bold">{emg.status}</span></div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Hospital Accepted: <b className={emg.hospital_accepted ? 'text-emerald-400' : 'text-amber-400'}>{emg.hospital_accepted ? 'YES' : 'PENDING'}</b>
                  </span>

                  {!emg.hospital_accepted && (
                    <button
                      onClick={async () => {
                        await api.post(`/simulation/step/${emg.id}?step=HOSPITAL_ACCEPT`);
                        fetchData();
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow"
                    >
                      ACCEPT INCOMING PATIENTS
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
