import React from 'react';
import { ShieldAlert, User, LogOut, Activity, Radio, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  activeTrafficLevel?: string;
  onOpenTrafficSim?: () => void;
  onStartSimulation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  activeTrafficLevel = 'HIGH',
  onOpenTrafficSim,
  onStartSimulation,
}) => {
  return (
    <header className="h-16 bg-navy-900/90 border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-900/30">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              S.A.R.A.
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
              LIVE SYSTEM
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Smart AI Rescue & Ambulance Routing Assistant</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Simulation trigger button */}
        {onStartSimulation && user?.role === 'ADMIN' && (
          <button
            onClick={onStartSimulation}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-900/40 transition-all duration-200 hover:scale-105 active:scale-95 animate-pulse"
          >
            <Radio className="w-4 h-4 animate-spin" />
            START EMERGENCY SIMULATION
          </button>
        )}

        {/* Traffic Simulator Controls Button */}
        {onOpenTrafficSim && (
          <button
            onClick={onOpenTrafficSim}
            className="flex items-center gap-2 px-3 py-1.5 bg-navy-800 hover:bg-navy-700 border border-white/10 text-slate-200 text-xs font-medium rounded-lg transition-all"
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Traffic: </span>
            <span className="font-bold text-amber-400">{activeTrafficLevel}</span>
          </button>
        )}

        {/* User Role Badge & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-200">{user?.name || 'Operator'}</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">{user?.role || 'ADMIN'}</span>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
