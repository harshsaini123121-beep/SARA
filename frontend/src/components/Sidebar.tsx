import React from 'react';
import { 
  LayoutDashboard, 
  AlertOctagon, 
  Truck, 
  Building2, 
  Map, 
  ShieldCheck, 
  BarChart3, 
  BrainCircuit, 
  Navigation,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  policeAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  policeAlertCount = 0,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'POLICE', 'HOSPITAL'] },
    { id: 'emergencies', label: 'Emergencies', icon: AlertOctagon, roles: ['ADMIN'] },
    { id: 'ambulances', label: 'Ambulances', icon: Truck, roles: ['ADMIN'] },
    { id: 'hospitals', label: 'Hospitals', icon: Building2, roles: ['ADMIN', 'HOSPITAL'] },
    { id: 'live-map', label: 'Live Operations Map', icon: Map, roles: ['ADMIN', 'POLICE'] },
    { id: 'police-coordination', label: 'Police Corridor', icon: ShieldCheck, roles: ['ADMIN', 'POLICE'], badge: policeAlertCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN'] },
    { id: 'ml-insights', label: 'ML Insights', icon: BrainCircuit, roles: ['ADMIN'] },
    { id: 'driver-view', label: 'Ambulance Driver', icon: Navigation, roles: ['ADMIN', 'DRIVER'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-navy-900/90 border-r border-white/10 flex flex-col h-[calc(100vh-4rem)] sticky top-16 z-30">
      <div className="p-4 space-y-1 overflow-y-auto flex-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Control Center
        </div>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-900/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full animate-bounce">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10 text-[11px] text-slate-500 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span>Target Region:</span>
          <span className="font-semibold text-slate-300">Jaipur, RJ</span>
        </div>
        <div className="flex items-center justify-between">
          <span>ML Model:</span>
          <span className="font-semibold text-emerald-400">RandomForest v1.0</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 italic">
          Academic Decision-Support System
        </div>
      </div>
    </aside>
  );
};
