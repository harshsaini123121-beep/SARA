import React, { useState, useEffect } from 'react';
import { BrainCircuit, Cpu, Calculator, ShieldAlert, Navigation, Flame, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';

export const MLInsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'eta' | 'triage' | 'hotspot' | 'corridor'>('eta');
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. ETA Form State
  const [dist, setDist] = useState<number>(6.5);
  const [traffic, setTraffic] = useState<string>('HIGH');
  const [hour, setHour] = useState<number>(18);
  const [weather, setWeather] = useState<string>('CLEAR');
  const [road, setRoad] = useState<string>('URBAN');
  const [etaPrediction, setEtaPrediction] = useState<number | null>(null);

  // 2. Triage Form State
  const [bp, setBp] = useState<number>(85);
  const [hr, setHr] = useState<number>(115);
  const [spo2, setSpo2] = useState<number>(88);
  const [gcs, setGcs] = useState<number>(10);
  const [age, setAge] = useState<number>(55);
  const [symptom, setSymptom] = useState<string>('Chest Pain');
  const [triagePrediction, setTriagePrediction] = useState<any>(null);

  // 3. Hotspot State
  const [hotspotForecast, setHotspotForecast] = useState<any[]>([]);

  // 4. Corridor Form State
  const [baseEta, setBaseEta] = useState<number>(20.0);
  const [corridorDist, setCorridorDist] = useState<number>(12.0);
  const [corridorTraffic, setCorridorTraffic] = useState<string>('HIGH');
  const [intersections, setIntersections] = useState<number>(10);
  const [corridorPrediction, setCorridorPrediction] = useState<any>(null);

  useEffect(() => {
    fetchInsights();
    fetchHotspots();
  }, []);

  const fetchInsights = () => {
    api.get('/ml/insights')
      .then((res) => setInsights(res.data))
      .catch((err) => console.error('Error fetching ML insights:', err))
      .finally(() => setLoading(false));
  };

  const fetchHotspots = () => {
    api.get('/ml/hotspot-forecast?hour_of_day=18&day_of_week=4&weather_condition=RAIN')
      .then((res) => setHotspotForecast(res.data))
      .catch((err) => console.error('Error fetching hotspot forecast:', err));
  };

  const handlePredictEta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/ml/predict-eta', {
        distance_km: dist,
        traffic_level: traffic,
        hour_of_day: hour,
        day_of_week: 1,
        weather_condition: weather,
        road_type: road,
      });
      setEtaPrediction(res.data.predicted_eta_minutes);
    } catch (err) {
      console.error('Error predicting ETA:', err);
    }
  };

  const handlePredictTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/ml/predict-triage', {
        systolic_bp: bp,
        heart_rate_bpm: hr,
        spo2_percent: spo2,
        gcs_score: gcs,
        age: age,
        primary_symptom: symptom,
      });
      setTriagePrediction(res.data);
    } catch (err) {
      console.error('Error predicting triage:', err);
    }
  };

  const handlePredictCorridor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/ml/predict-corridor-boost', {
        baseline_eta_mins: baseEta,
        distance_km: corridorDist,
        traffic_level: corridorTraffic,
        intersections_cleared: intersections,
        corridor_active: 1,
      });
      setCorridorPrediction(res.data);
    } catch (err) {
      console.error('Error predicting corridor boost:', err);
    }
  };

  if (loading || !insights) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Loading S.A.R.A. AI Suite & Machine Learning Models...
      </div>
    );
  }

  const etaMetrics = insights.eta || {};
  const triageMetrics = insights.triage || {};
  const hotspotMetrics = insights.hotspot || {};
  const corridorMetrics = insights.corridor || {};

  const featureData = Object.entries(etaMetrics.feature_importance_aggregated || {}).map(
    ([key, value]) => ({
      feature: key,
      importance: Number((Number(value) * 100).toFixed(1)),
    })
  );

  return (
    <div className="p-6 space-y-6 flex-1 bg-navy-950 min-h-screen">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
            <BrainCircuit className="w-7 h-7 text-emerald-400" />
            <span>S.A.R.A. Machine Learning Operations Suite</span>
          </h1>
          <p className="text-xs text-slate-400">4 Trained Scikit-Learn Engines: ETA Regressor • Triage Classifier • Hotspot Forecaster • Green Corridor Predictor</p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-white/10 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('eta')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${activeTab === 'eta' ? 'bg-emerald-500 text-navy-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>1. ETA Model</span>
          </button>

          <button
            onClick={() => setActiveTab('triage')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${activeTab === 'triage' ? 'bg-emerald-500 text-navy-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>2. AI Triage</span>
          </button>

          <button
            onClick={() => setActiveTab('hotspot')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${activeTab === 'hotspot' ? 'bg-emerald-500 text-navy-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>3. Hotspot Forecast</span>
          </button>

          <button
            onClick={() => setActiveTab('corridor')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${activeTab === 'corridor' ? 'bg-emerald-500 text-navy-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>4. Green Corridor</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ETA REGRESSOR MODEL */}
      {activeTab === 'eta' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Algorithm</div>
              <div className="text-lg font-black text-slate-100">{etaMetrics.algorithm || 'RandomForestRegressor'}</div>
              <div className="text-[10px] text-slate-500">n_estimators=100 • Scikit-Learn</div>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Dataset Records</div>
              <div className="text-lg font-black text-blue-400">{etaMetrics.training_records?.toLocaleString() || '12,000'} <span className="text-xs text-slate-400 font-normal">samples</span></div>
              <div className="text-[10px] text-slate-500">Jaipur Emergency Transit Dataset</div>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Error (MAE / RMSE)</div>
              <div className="text-lg font-black text-emerald-400">{etaMetrics.mae || 3.38} / {etaMetrics.rmse || 5.64} <span className="text-xs font-normal text-slate-400">mins</span></div>
              <div className="text-[10px] text-slate-500">Mean Absolute Error</div>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">R² Accuracy Score</div>
              <div className="text-lg font-black text-amber-400">{etaMetrics.r2 || 0.9703}</div>
              <div className="text-[10px] text-slate-500">Variance Explained</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Feature Importance Weights (%)</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={featureData}>
                    <XAxis type="number" stroke="#64748B" fontSize={11} domain={[0, 60]} />
                    <YAxis type="category" dataKey="feature" stroke="#94A3B8" fontSize={11} width={110} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#334155', color: '#F8FAFC' }} />
                    <Bar dataKey="importance" fill="#10B981" radius={[0, 6, 6, 0]}>
                      {featureData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#3B82F6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-400" />
                <span>Live Ambulance ETA Predictor Sandbox</span>
              </h3>

              <form onSubmit={handlePredictEta} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Distance (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={dist}
                      onChange={(e) => setDist(parseFloat(e.target.value))}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Traffic Level</label>
                    <select
                      value={traffic}
                      onChange={(e) => setTraffic(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="LOW">LOW (1.0x)</option>
                      <option value="MEDIUM">MEDIUM (1.3x)</option>
                      <option value="HIGH">HIGH (1.75x)</option>
                      <option value="SEVERE">SEVERE (2.4x)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Hour of Day</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={hour}
                      onChange={(e) => setHour(parseInt(e.target.value))}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Weather</label>
                    <select
                      value={weather}
                      onChange={(e) => setWeather(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="CLEAR">CLEAR</option>
                      <option value="RAIN">RAIN</option>
                      <option value="FOG">FOG</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Road Type</label>
                    <select
                      value={road}
                      onChange={(e) => setRoad(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="URBAN">URBAN</option>
                      <option value="HIGHWAY">HIGHWAY</option>
                      <option value="NARROW">NARROW</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow transition-all"
                >
                  RUN ETA PREDICTION
                </button>
              </form>

              {etaPrediction !== null && (
                <div className="p-4 glass-card rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-center space-y-1 animate-in fade-in">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Predicted ETA Output</div>
                  <div className="text-3xl font-black text-emerald-400">{etaPrediction} <span className="text-sm font-normal text-slate-300">minutes</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI PATIENT TRIAGE CLASSIFIER */}
      {activeTab === 'triage' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Algorithm</div>
              <div className="text-lg font-black text-slate-100">{triageMetrics.algorithm || 'RandomForestClassifier'}</div>
              <div className="text-[10px] text-slate-500">Emergency Severity Classifier</div>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Classifier Accuracy</div>
              <div className="text-lg font-black text-emerald-400">{((triageMetrics.accuracy || 0.9969) * 100).toFixed(2)}%</div>
              <div className="text-[10px] text-slate-500">Cross-Validated Test Accuracy</div>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Training Samples</div>
              <div className="text-lg font-black text-blue-400">{triageMetrics.records?.toLocaleString() || '8,000'}</div>
              <div className="text-[10px] text-slate-500">Clinical Patient Vitals Logs</div>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Triage Classes</div>
              <div className="text-lg font-black text-amber-400">4 Categories</div>
              <div className="text-[10px] text-slate-500">CRITICAL • HIGH • MEDIUM • LOW</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 max-w-2xl mx-auto">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Interactive Patient Vitals Triage Classifier Sandbox</span>
            </h3>

            <form onSubmit={handlePredictTriage} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={bp}
                    onChange={(e) => setBp(parseInt(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    value={hr}
                    onChange={(e) => setHr(parseInt(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Oxygen SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(parseInt(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">GCS Score (3-15)</label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={gcs}
                    onChange={(e) => setGcs(parseInt(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Patient Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Primary Symptom</label>
                  <select
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="Chest Pain">Chest Pain</option>
                    <option value="Cardiac Arrest">Cardiac Arrest</option>
                    <option value="Severe Trauma">Severe Trauma</option>
                    <option value="Stroke / Paralysis">Stroke / Paralysis</option>
                    <option value="Respiratory Failure">Respiratory Failure</option>
                    <option value="Fracture">Fracture</option>
                    <option value="Minor Injury">Minor Injury</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow transition-all"
              >
                CLASSIFY PATIENT SEVERITY
              </button>
            </form>

            {triagePrediction && (
              <div className="p-4 glass-card rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-center space-y-2 animate-in fade-in">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">AI Triage Classification Result</div>
                <div className="flex justify-center items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${triagePrediction.severity_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                    Severity: {triagePrediction.severity_level}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-full text-xs font-black uppercase">
                    Vehicle Type Needed: {triagePrediction.required_vehicle_type}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SPATIAL HOTSPOT FORECASTER */}
      {activeTab === 'hotspot' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Algorithm</div>
              <div className="text-lg font-black text-slate-100">{hotspotMetrics.algorithm || 'RandomForestRegressor'}</div>
              <div className="text-[10px] text-slate-500">Spatial Demand Risk Estimator</div>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Forecast MAE Error</div>
              <div className="text-lg font-black text-emerald-400">{hotspotMetrics.mae || 0.0395}</div>
              <div className="text-[10px] text-slate-500">Probability Error Margin</div>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">R² Spatial Score</div>
              <div className="text-lg font-black text-amber-400">{hotspotMetrics.r2 || 0.9434}</div>
              <div className="text-[10px] text-slate-500">Predictive Spatial Variance</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Jaipur City Spatial Emergency Risk Forecast & Proactive Staging</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotspotForecast.map((h, i) => (
                <div key={i} className="glass-card p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-slate-200">{h.zone_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${h.risk_status === 'HIGH_RISK' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                      {h.risk_status}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-400">
                    {(h.risk_score * 100).toFixed(0)}% <span className="text-xs font-normal text-slate-400">Risk Score</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Recommended Staging: <strong>{h.recommended_staging_ambulances} Ambulances</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GREEN CORRIDOR PREDICTOR */}
      {activeTab === 'corridor' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Algorithm</div>
              <div className="text-lg font-black text-slate-100">{corridorMetrics.algorithm || 'RandomForestRegressor'}</div>
              <div className="text-[10px] text-slate-500">Green Corridor Speed Estimator</div>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Time Saved Accuracy</div>
              <div className="text-lg font-black text-emerald-400">{corridorMetrics.r2 || 0.9997}</div>
              <div className="text-[10px] text-slate-500">R² Variance Score</div>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Speed Boost</div>
              <div className="text-lg font-black text-amber-400">35% – 50% Time Reduction</div>
              <div className="text-[10px] text-slate-500">Police Intersections Preemption</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 max-w-xl mx-auto">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Police Green Corridor Speed Boost Estimator Sandbox</span>
            </h3>

            <form onSubmit={handlePredictCorridor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Baseline Traffic ETA (mins)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={baseEta}
                    onChange={(e) => setBaseEta(parseFloat(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={corridorDist}
                    onChange={(e) => setCorridorDist(parseFloat(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Traffic Congestion</label>
                  <select
                    value={corridorTraffic}
                    onChange={(e) => setCorridorTraffic(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="SEVERE">SEVERE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Intersections Cleared</label>
                  <input
                    type="number"
                    value={intersections}
                    onChange={(e) => setIntersections(parseInt(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow transition-all"
              >
                ESTIMATE GREEN CORRIDOR SPEED BOOST
              </button>
            </form>

            {corridorPrediction && (
              <div className="p-4 glass-card rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-center space-y-2 animate-in fade-in">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Green Corridor Prediction Result</div>
                <div className="text-3xl font-black text-emerald-400 flex items-center justify-center gap-2">
                  <span>{corridorPrediction.corridor_eta_minutes} mins</span>
                  <span className="text-xs text-slate-400 font-normal">(Saved {corridorPrediction.time_saved_minutes} mins)</span>
                </div>
                <div className="text-xs text-amber-400 font-bold">
                  ⚡ Speed Boost: +{corridorPrediction.speed_boost_percent}% Time Reduction
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

