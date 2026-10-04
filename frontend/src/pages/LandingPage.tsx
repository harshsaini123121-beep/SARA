import React from 'react';
import { ShieldAlert, Truck, Building2, Radio, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between selection:bg-red-500 selection:text-white">
      {/* Top Navbar */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-white/10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-900/30">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              S.A.R.A.
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Emergency AI Logistics</p>
          </div>
        </div>

        <button
          onClick={onEnter}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-900/30 transition-all hover:scale-105 active:scale-95"
        >
          <span>ENTER CONTROL ROOM</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-12 flex-1 flex flex-col justify-center items-center text-center space-y-12">
        <div className="space-y-4 max-w-3xl">
          <span className="px-3 py-1 text-xs font-bold tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 rounded-full uppercase">
            Intelligent Emergency Logistics
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Intelligent Emergency Response.<br />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              Faster Decisions. Smarter Routes.
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            S.A.R.A. combines machine learning travel-time prediction, multi-vehicle dispatch optimization, hospital capacity-matching, and real-time police green-corridor simulation to accelerate life-saving care.
          </p>
          <div className="pt-4 flex justify-center">
            <button
              onClick={onEnter}
              className="px-8 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-red-900/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <span>ACCESS CONTROL ROOM DEMO</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-red-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <Truck className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">AI Ambulance Dispatch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-criteria optimization matching ambulance equipment levels, traffic congestion, and RandomForest ML travel-time predictions.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-blue-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Smart Hospital Selection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically evaluates bed availability, open ICU capacity, trauma certification, and patient distribution for mass-casualty events.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Radio className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Police Green Corridor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transmits confirmed routes to the Police Control Room for simulated traffic-priority coordination on critical emergency dispatches.
            </p>
          </div>
        </div>

        {/* How It Works Pipeline */}
        <div className="w-full max-w-4xl glass-card p-8 rounded-3xl border border-white/10 space-y-6">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 text-center">
            System Workflow Architecture
          </h3>
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
            {['Emergency Intake', 'AI ML Analysis', 'Ambulance Selection', 'Hospital Match', 'Route Polyline', 'Police Corridor', 'Patient Arrival'].map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-2 px-3 py-2 bg-navy-800 border border-white/10 rounded-xl text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
                {idx < 6 && <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>

      {/* Safety Disclaimer Footer */}
      <footer className="border-t border-white/10 p-6 text-center text-xs text-slate-500 bg-navy-950">
        <div className="max-w-4xl mx-auto space-y-1">
          <p className="font-semibold text-slate-400">
            ⚠️ Academic Project Disclaimer: S.A.R.A. is an AI research and decision-support prototype using synthetic/demo data centered around Jaipur, Rajasthan, India.
          </p>
          <p>
            It is not a certified real-world emergency dispatch system and does not directly connect to government traffic signals or emergency services.
          </p>
        </div>
      </footer>
    </div>
  );
};
