import React, { useState, useEffect } from 'react';
import { BrainCircuit, CheckCircle2, Loader2, Truck, Building2, MapPin, ShieldAlert, ArrowRight } from 'lucide-react';
import { EmergencyAnalysisResult } from '../types';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: EmergencyAnalysisResult | null;
  onDispatch: () => void;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysisResult,
  onDispatch,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    "Analyzing emergency severity & patient requirements...",
    "Locating active available ambulances in Jaipur...",
    "Predicting travel times using RandomForest ML Model...",
    "Evaluating hospital bed capacity & ICU availability...",
    "Selecting optimal hospital matching emergency profile...",
    "Calculating route geometry (Ambulance → Patient → Hospital)...",
    "Assessing emergency corridor priority & generating police alert..."
  ];

  useEffect(() => {
    if (isOpen) {
      setStepIndex(0);
      const interval = setInterval(() => {
        setStepIndex((prev) => {
          if (prev < steps.length - 1) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 450);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen || !analysisResult) return null;

  const isComplete = stepIndex >= steps.length - 1;
  const amb = analysisResult.recommended_ambulance;
  const hosp = analysisResult.recommended_hospital;
  const route = analysisResult.route;
  const priority = analysisResult.priority_assessment;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-3xl glass-panel bg-navy-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-navy-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>AI Emergency Dispatch Analysis</span>
                {isComplete && <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full">COMPLETE</span>}
              </h2>
              <p className="text-xs text-slate-400">Incident #{analysisResult.emergency_id} • {analysisResult.patient_count} Patients ({analysisResult.critical_patient_count} Critical)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* AI Checklist Progress */}
          <div className="glass-card p-4 rounded-xl space-y-2 border border-white/5 bg-navy-950/40">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Execution Pipeline</div>
            {steps.map((text, idx) => {
              const done = idx <= stepIndex;
              const current = idx === stepIndex && !isComplete;
              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : current ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                  )}
                  <span className={done ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                    {text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Results Summary Card when analysis completes */}
          {isComplete && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ambulance Recommendation */}
                <div className="glass-card p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs uppercase">
                      <Truck className="w-4 h-4" /> AI Ambulance Recommendation
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded">
                      Score: {amb.score}/100
                    </span>
                  </div>
                  <div className="text-lg font-black text-slate-100 flex items-center justify-between">
                    <span>🚑 {amb.ambulance.vehicle_number}</span>
                    <span className="text-xs font-medium text-slate-400">({amb.ambulance.vehicle_type})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1 border-t border-white/10">
                    <div>Predicted ETA: <b className="text-emerald-400">{amb.predicted_eta} mins</b></div>
                    <div>Distance: <b>{amb.distance_km} km</b></div>
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-semibold text-slate-400">Optimization Rationale:</div>
                    {amb.reasoning.map((r, i) => (
                      <div key={i} className="text-[11px] text-emerald-300">{r}</div>
                    ))}
                  </div>
                </div>

                {/* Hospital Recommendation */}
                <div className="glass-card p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-blue-400 text-xs uppercase">
                      <Building2 className="w-4 h-4" /> AI Hospital Recommendation
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-300 rounded">
                      Score: {hosp.score}/100
                    </span>
                  </div>
                  <div className="text-base font-black text-slate-100 truncate">
                    🏥 {hosp.hospital.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1 border-t border-white/10">
                    <div>ICU Beds: <b className="text-amber-400">{hosp.hospital.icu_beds} Open</b></div>
                    <div>Travel ETA: <b>{hosp.predicted_eta} mins</b></div>
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-semibold text-slate-400">Optimization Rationale:</div>
                    {hosp.reasoning.map((r, i) => (
                      <div key={i} className="text-[11px] text-blue-300">{r}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Priority Corridor Alert Banner */}
              {priority.corridor_recommended && (
                <div className="glass-card p-4 rounded-xl border border-red-500/40 bg-red-950/30 space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wide">
                    <ShieldAlert className="w-5 h-5 animate-bounce" />
                    <span>Emergency Corridor Requested to Police Control Room</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Confirmed route transmitted to Jaipur Traffic Police Control Room for green-corridor priority signal clearance.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {priority.reasons.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30 rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-navy-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg"
          >
            Close Window
          </button>

          {isComplete && (
            <button
              onClick={() => {
                onDispatch();
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>CONFIRM & DISPATCH AMBULANCE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
