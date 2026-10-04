import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, ShieldCheck, Activity } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell 
} from 'recharts';
import api from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics')
      .then((res) => setAnalytics(res.data))
      .catch((err) => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !analytics) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Loading operational database analytics...
      </div>
    );
  }

  const { kpis, charts } = analytics;
  const SEVERITY_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981'];

  return (
    <div className="p-6 space-y-6 flex-1 bg-navy-950 min-h-screen">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-blue-400" />
          <span>System Analytics & Operational Metrics</span>
        </h1>
        <p className="text-xs text-slate-400">Jaipur Emergency Response Performance Summary</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Emergencies</div>
          <div className="text-2xl font-black text-slate-100">{kpis.total_emergencies}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completed Trips</div>
          <div className="text-2xl font-black text-emerald-400">{kpis.completed_emergencies}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Response Time</div>
          <div className="text-2xl font-black text-blue-400">{kpis.avg_response_time} <span className="text-xs font-normal">min</span></div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Police Corridors</div>
          <div className="text-2xl font-black text-amber-400">{kpis.police_corridor_requests}</div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Emergency Trend */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Weekly Emergency Incident Volume & Average ETA</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.daily_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Line type="monotone" dataKey="emergencies" stroke="#3B82F6" strokeWidth={3} name="Incidents" />
                <Line type="monotone" dataKey="avg_eta" stroke="#10B981" strokeWidth={2} name="Avg ETA (min)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400" />
            <span>Emergency Severity Breakdown</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.severity_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', color: '#F8FAFC' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {charts.severity_breakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ML Prediction vs Actual Trip Performance */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>ML Predicted ETA vs Actual Travel Time (Recent Completed Trips)</span>
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.trip_performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="id" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', color: '#F8FAFC' }} />
              <Bar dataKey="predicted_eta" fill="#3B82F6" name="Predicted ETA (min)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual_time" fill="#10B981" name="Actual Time (min)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
