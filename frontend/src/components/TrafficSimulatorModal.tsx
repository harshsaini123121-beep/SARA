import React from 'react';
import { Activity, Gauge, Flame, AlertCircle } from 'lucide-react';

interface TrafficSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTraffic: string;
  onSelectTraffic: (level: string) => void;
}

export const TrafficSimulatorModal: React.FC<TrafficSimulatorModalProps> = ({
  isOpen,
  onClose,
  currentTraffic,
  onSelectTraffic,
}) => {
  if (!isOpen) return null;

  const levels = [
    { id: 'LOW', label: 'NORMAL', desc: 'Free-flowing transit (~35 km/h avg)', speed: '1.0x ETA', color: 'emerald' },
    { id: 'MEDIUM', label: 'MODERATE', desc: 'Standard city movement (~28 km/h avg)', speed: '1.3x ETA', color: 'amber' },
    { id: 'HIGH', label: 'HIGH', desc: 'Peak rush hour congestion (~20 km/h avg)', speed: '1.7x ETA', color: 'orange' },
    { id: 'SEVERE', label: 'SEVERE', desc: 'Gridlock / Accident block (~12 km/h avg)', speed: '2.4x ETA', color: 'red' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-lg glass-panel bg-navy-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-navy-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Traffic Congestion Simulator</h2>
              <p className="text-xs text-slate-400">Dynamic Traffic Multiplier Controls</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/5">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Adjusting traffic levels updates the Random Forest ML travel-time prediction, re-ranks candidate ambulances, and triggers alternative route recommendations in real-time.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {levels.map((item) => {
              const isSelected = currentTraffic === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTraffic(item.id);
                    onClose();
                  }}
                  className={`w-full p-4 rounded-xl text-left border transition-all duration-150 flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/50 text-white shadow-lg shadow-amber-900/20'
                      : 'bg-navy-950/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
                      <span>{item.label}</span>
                      {isSelected && <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-navy-950 font-black rounded-full">ACTIVE</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400">{item.speed}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-navy-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-semibold rounded-lg"
          >
            Apply Traffic Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
