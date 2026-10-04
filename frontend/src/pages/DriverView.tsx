import React, { useState, useEffect } from 'react';
import { Navigation, Truck, MapPin, CheckCircle2, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { Emergency, Ambulance } from '../types';

export const DriverView: React.FC = () => {
  const [activeEmergency, setActiveEmergency] = useState<Emergency | null>(null);
  const [assignedAmbulance, setAssignedAmbulance] = useState<Ambulance | null>(null);
  const [driverStep, setDriverStep] = useState<string>('DISPATCHED');
  const [loading, setLoading] = useState(true);

  const fetchDriverData = async () => {
    try {
      const [emgRes, ambRes] = await Promise.all([
        api.get('/emergencies'),
        api.get('/ambulances'),
      ]);

      const active = emgRes.data.find((e: Emergency) => e.status !== 'COMPLETED' && e.status !== 'CANCELLED');
      if (active) {
        setActiveEmergency(active);
      }
      if (ambRes.data.length > 0) {
        setAssignedAmbulance(ambRes.data[1]); // A-102
      }
    } catch (err) {
      console.error('Error fetching driver view:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
    const interval = setInterval(fetchDriverData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStep = async (nextStep: string, backendStepName: string) => {
    setDriverStep(nextStep);
    if (activeEmergency) {
      try {
        await api.post(`/simulation/step/${activeEmergency.id}?step=${backendStepName}`);
        fetchDriverData();
      } catch (err) {
        console.error('Error advancing driver step:', err);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 flex-1 bg-navy-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Truck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tight">
              Ambulance Driver Operations
            </h1>
            <p className="text-xs text-slate-400">On-Board Navigation & Trip Status Controller</p>
          </div>
        </div>

        {assignedAmbulance && (
          <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-sm rounded-xl">
            🚑 {assignedAmbulance.vehicle_number} ({assignedAmbulance.vehicle_type})
          </span>
        )}
      </div>

      {/* Main Active Dispatch Card */}
      {activeEmergency ? (
        <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="px-2.5 py-1 text-xs font-black bg-red-500 text-white rounded uppercase">
                {activeEmergency.severity} EMERGENCY
              </span>
              <h2 className="text-xl font-extrabold text-slate-100 mt-2">
                🚨 Incident #{activeEmergency.id} • {activeEmergency.emergency_type}
              </h2>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Current Trip Status</div>
              <div className="text-sm font-black text-emerald-400">{activeEmergency.status}</div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-300 glass-card p-4 rounded-2xl border border-white/5">
            <div>Incident Location: <b className="text-slate-100">{activeEmergency.address}</b></div>
            <div>Patient Count: <b className="text-slate-100">{activeEmergency.patient_count} ({activeEmergency.critical_patient_count} Critical)</b></div>
            <div>Police Corridor: <b className={activeEmergency.police_corridor_active ? 'text-emerald-400' : 'text-slate-500'}>{activeEmergency.police_corridor_active ? 'ACTIVE (SIMULATED)' : 'NONE'}</b></div>
            <div>Hospital Status: <b className={activeEmergency.hospital_accepted ? 'text-emerald-400' : 'text-amber-400'}>{activeEmergency.hospital_accepted ? 'ACCEPTED' : 'WAITING'}</b></div>
          </div>

          {/* 4 Driver Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Trip Progress Stepper
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleAdvanceStep('EN_ROUTE_PATIENT', 'ACTIVATE_CORRIDOR')}
                className="p-4 bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border border-blue-500/40 font-bold text-xs rounded-xl flex items-center justify-between transition-all"
              >
                <span>1. START TRIP (EN ROUTE)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleAdvanceStep('ARRIVED_PATIENT', 'PICKUP_PATIENT')}
                className="p-4 bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/40 font-bold text-xs rounded-xl flex items-center justify-between transition-all"
              >
                <span>2. ARRIVED AT PATIENT</span>
                <MapPin className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleAdvanceStep('EN_ROUTE_HOSPITAL', 'NOTIFY_HOSPITAL')}
                className="p-4 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 font-bold text-xs rounded-xl flex items-center justify-between transition-all"
              >
                <span>3. START HOSPITAL ROUTE</span>
                <Navigation className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleAdvanceStep('COMPLETED', 'ARRIVE_HOSPITAL')}
                className="p-4 bg-emerald-600/40 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/50 font-bold text-xs rounded-xl flex items-center justify-between transition-all"
              >
                <span>4. ARRIVED AT HOSPITAL (COMPLETE)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-3">
          <Truck className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No Active Emergency Assigned</h3>
          <p className="text-xs text-slate-400">
            Ambulance RJ-14-EA-102 is currently AVAILABLE on standby at MI Road, Jaipur.
          </p>
        </div>
      )}
    </div>
  );
};
