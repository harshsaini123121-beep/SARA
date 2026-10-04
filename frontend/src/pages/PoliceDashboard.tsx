import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Radio, MapPin, Truck, Building2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { PoliceAlert } from '../types';
import { LiveMap } from '../components/LiveMap';

export const PoliceDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<PoliceAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<PoliceAlert | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/police/alerts');
      setAlerts(res.data);
      if (res.data.length > 0 && !selectedAlert) {
        setSelectedAlert(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching police alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (alertId: number, action: string) => {
    try {
      await api.patch(`/police/alerts/${alertId}?action=${action}`);
      fetchAlerts();
    } catch (err) {
      console.error('Error updating police alert:', err);
    }
  };

  const pendingCount = alerts.filter(a => a.status === 'PENDING').length;
  const activeCount = alerts.filter(a => a.status === 'PRIORITY_ACTIVE').length;
  const ackCount = alerts.filter(a => a.status === 'ACKNOWLEDGED').length;

  // Parse route polyline geometry if available
  let routeGeometry: [number, number][] = [];
  if (selectedAlert && selectedAlert.route_json) {
    try {
      routeGeometry = JSON.parse(selectedAlert.route_json);
    } catch (e) {
      routeGeometry = [];
    }
  }

  return (
    <div className="p-6 space-y-6 flex-1 bg-navy-950 min-h-screen">
      {/* Police Command Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tight">
              Police Emergency Control Room
            </h1>
          </div>
          <p className="text-xs text-slate-400">Jaipur Traffic Coordination Division • Emergency Green Corridor Dispatch</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-extrabold rounded-full animate-pulse flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" /> GREEN CORRIDOR MONITOR ACTIVE
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Alerts</div>
          <div className="text-2xl font-black text-amber-400">{pendingCount}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Corridors</div>
          <div className="text-2xl font-black text-emerald-400">{activeCount}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Acknowledged</div>
          <div className="text-2xl font-black text-blue-400">{ackCount}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Simulated Traffic Signals</div>
          <div className="text-2xl font-black text-slate-100">OPERATIONAL</div>
        </div>
      </div>

      {/* Main Grid: Alerts Queue & Route View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">
        {/* Left Alerts Queue */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col justify-between overflow-hidden">
          <div className="pb-3 border-b border-white/10">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Corridor Requests ({alerts.length})</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 py-3">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No active police corridor requests.
              </div>
            ) : (
              alerts.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => setSelectedAlert(alt)}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedAlert?.id === alt.id
                      ? 'bg-amber-500/20 border-amber-500/50 text-white shadow-lg'
                      : 'bg-navy-900/60 border-white/5 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-slate-100 text-sm">
                      🚨 Incident #{alt.emergency_id}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      alt.status === 'PRIORITY_ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {alt.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ambulance: <b>{alt.ambulance_vehicle_number}</b></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Destination: <b>{alt.destination_hospital_name}</b></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 mt-2.5 border-t border-white/10">
                    <span>Patients: <b className="text-slate-200">{alt.patient_count}</b> ({alt.critical_count} Critical)</span>
                    <span className="font-bold text-amber-400">ETA: {alt.eta_minutes} mins</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Route View & Control Panel */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between overflow-y-auto space-y-6">
          {selectedAlert ? (
            <>
              {/* Alert Details Banner */}
              <div className="glass-card p-5 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                      <span>🚨 CRITICAL EMERGENCY CORRIDOR REQUEST</span>
                    </h3>
                    <p className="text-xs text-slate-400">Confirmed Emergency Route Dispatch • Target Hospital Assigned</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-black bg-amber-500 text-navy-950 rounded-lg uppercase tracking-wider">
                    {selectedAlert.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300 pt-2 border-t border-white/10">
                  <div>Ambulance ID: <b className="text-emerald-400">{selectedAlert.ambulance_vehicle_number}</b></div>
                  <div>Destination Hospital: <b className="text-blue-400">{selectedAlert.destination_hospital_name}</b></div>
                  <div>Total Patients: <b>{selectedAlert.patient_count} ({selectedAlert.critical_count} ICU)</b></div>
                  <div>Predicted Travel ETA: <b className="text-amber-400">{selectedAlert.eta_minutes} mins</b></div>
                </div>
              </div>

              {/* Live Map with Route Polyline */}
              <div className="h-64 rounded-xl overflow-hidden border border-white/10">
                <LiveMap
                  ambulances={[]}
                  hospitals={[]}
                  emergencies={[]}
                  selectedRoute={routeGeometry}
                  center={routeGeometry.length > 0 ? routeGeometry[0] : [26.8970, 75.8150]}
                  zoom={13}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 glass-card rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-slate-400 italic">
                  * Emergency green corridor priority clearance simulation mode.
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'ACKNOWLEDGE')}
                    className="px-4 py-2.5 bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 text-xs font-bold rounded-xl transition-all"
                  >
                    ACKNOWLEDGE REQUEST
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'ACTIVATE_CORRIDOR')}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    ACTIVATE PRIORITY GREEN CORRIDOR
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select a corridor request to view detailed police route controls.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
