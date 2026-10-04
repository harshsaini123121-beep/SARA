import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Truck, 
  Building2, 
  Clock, 
  ShieldAlert, 
  Plus, 
  Play, 
  CheckCircle2, 
  Radio, 
  Layers,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { LiveMap } from '../components/LiveMap';
import { CreateEmergencyModal } from '../components/CreateEmergencyModal';
import { AIAnalysisModal } from '../components/AIAnalysisModal';
import { Emergency, Ambulance, Hospital, DashboardSummary, EmergencyAnalysisResult } from '../types';

interface AdminDashboardProps {
  onStartSimulation: () => void;
  onOpenTrafficSim: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onStartSimulation,
  onOpenTrafficSim,
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  const [analysisResult, setAnalysisResult] = useState<EmergencyAnalysisResult | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, emgRes, ambRes, hospRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/emergencies'),
        api.get('/ambulances'),
        api.get('/hospitals'),
      ]);

      setSummary(sumRes.data);
      setEmergencies(emgRes.data);
      setAmbulances(ambRes.data);
      setHospitals(hospRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateEmergency = async (data: any) => {
    try {
      const res = await api.post('/emergencies', data);
      const newEmg = res.data;
      setSelectedEmergency(newEmg);
      fetchDashboardData();

      // Trigger AI Analysis
      const analysisRes = await api.post(`/emergencies/${newEmg.id}/analyze`);
      setAnalysisResult(analysisRes.data);
      setIsAnalysisModalOpen(true);
    } catch (err) {
      console.error('Error creating emergency:', err);
    }
  };

  const handleDispatch = async () => {
    if (analysisResult) {
      try {
        await api.post(`/emergencies/${analysisResult.emergency_id}/dispatch`);
        fetchDashboardData();
      } catch (err) {
        console.error('Dispatch error:', err);
      }
    }
  };

  const activeEmgList = emergencies.filter(e => e.status !== 'COMPLETED');
  const activeRouteCoords = analysisResult?.route?.geometry || [];

  return (
    <div className="p-6 space-y-6 flex-1 bg-navy-950 min-h-screen">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-3">
            <span>Emergency Control Room</span>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
              LIVE MONITOR
            </span>
          </h1>
          <p className="text-xs text-slate-400">Jaipur Command Center • Real-Time AI Optimization</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            CREATE INCIDENT
          </button>

          <button
            onClick={onStartSimulation}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4" />
            AUTO SIMULATION
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Active Incidents</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{summary?.active_emergencies ?? 0}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Available Ambulances</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{summary?.available_ambulances ?? 0}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>En Route</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{summary?.ambulances_en_route ?? 0}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Hospitals Ready</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{summary?.available_hospitals ?? 0}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Critical Incidents</span>
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-rose-500">{summary?.critical_emergencies ?? 0}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Avg Response ETA</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{summary?.average_response_time_minutes ?? 9.4} <span className="text-xs text-slate-400 font-normal">min</span></div>
        </div>
      </div>

      {/* Main Content Area: Left Map & Right Emergency Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">
        {/* Live Operations Leaflet Map */}
        <div className="lg:col-span-2 h-full flex flex-col glass-panel rounded-2xl overflow-hidden border border-white/10 p-1">
          <LiveMap
            ambulances={ambulances}
            hospitals={hospitals}
            emergencies={emergencies}
            selectedRoute={activeRouteCoords}
            onSelectEmergency={(emg) => setSelectedEmergency(emg)}
          />
        </div>

        {/* Active Emergencies Queue Card */}
        <div className="h-full glass-panel rounded-2xl p-4 border border-white/10 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <span>Active Incidents Queue ({activeEmgList.length})</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 py-3">
            {activeEmgList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No active emergencies in Jaipur area.
              </div>
            ) : (
              activeEmgList.map((emg) => (
                <div
                  key={emg.id}
                  onClick={() => setSelectedEmergency(emg)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedEmergency?.id === emg.id
                      ? 'bg-blue-600/20 border-blue-500/40 text-white shadow-lg'
                      : 'bg-navy-900/60 border-white/5 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-100 flex items-center gap-1.5">
                      🚨 #{emg.id} • {emg.emergency_type}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      emg.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {emg.severity}
                    </span>
                  </div>

                  <div className="text-slate-400 text-[11px] mb-2">{emg.address}</div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                    <span>Patients: <b className="text-slate-200">{emg.patient_count}</b></span>
                    <span className="px-1.5 py-0.5 bg-navy-800 text-blue-400 font-bold rounded">{emg.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateEmergencyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEmergency}
      />

      <AIAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        analysisResult={analysisResult}
        onDispatch={handleDispatch}
      />
    </div>
  );
};
