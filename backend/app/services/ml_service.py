import os
import json
import joblib
import pandas as pd
import numpy as np

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "ml", "models")

MODEL_PATHS = {
    'eta': os.path.join(MODELS_DIR, "eta_model.joblib"),
    'triage': os.path.join(MODELS_DIR, "triage_model.joblib"),
    'hotspot': os.path.join(MODELS_DIR, "hotspot_model.joblib"),
    'corridor': os.path.join(MODELS_DIR, "corridor_model.joblib"),
}

METRICS_PATHS = {
    'eta': os.path.join(MODELS_DIR, "model_metrics.json"),
    'triage': os.path.join(MODELS_DIR, "triage_metrics.json"),
    'hotspot': os.path.join(MODELS_DIR, "hotspot_metrics.json"),
    'corridor': os.path.join(MODELS_DIR, "corridor_metrics.json"),
}

loaded_models = {}

def get_model(name: str):
    if name not in loaded_models:
        path = MODEL_PATHS.get(name)
        if path and os.path.exists(path):
            try:
                loaded_models[name] = joblib.load(path)
                print(f"ML Model [{name}] loaded successfully from {path}")
            except Exception as e:
                print(f"Failed to load ML model [{name}]: {e}")
                loaded_models[name] = None
        else:
            loaded_models[name] = None
    return loaded_models.get(name)

# 1. Ambulance Travel Time / ETA Regressor
def predict_travel_time(distance_km: float, traffic_level: str = "HIGH", hour_of_day: int = 14, 
                        day_of_week: int = 1, weather_condition: str = "CLEAR", road_type: str = "URBAN") -> float:
    model = get_model('eta')
    if model is not None:
        try:
            df = pd.DataFrame([{
                'distance_km': float(distance_km),
                'traffic_level': str(traffic_level).upper(),
                'hour_of_day': int(hour_of_day),
                'day_of_week': int(day_of_week),
                'weather_condition': str(weather_condition).upper(),
                'road_type': str(road_type).upper()
            }])
            pred = model.predict(df)[0]
            return max(1.0, round(float(pred), 2))
        except Exception as e:
            print("ML ETA prediction error, fallback calculation used:", e)
            
    # Physical math fallback
    speed_map = {'HIGHWAY': 55.0, 'URBAN': 32.0, 'NARROW': 22.0}
    traffic_mult_map = {'LOW': 1.0, 'MEDIUM': 1.3, 'HIGH': 1.75, 'SEVERE': 2.4}
    weather_mult_map = {'CLEAR': 1.0, 'RAIN': 1.25, 'FOG': 1.45}
    
    speed = speed_map.get(str(road_type).upper(), 32.0)
    t_mult = traffic_mult_map.get(str(traffic_level).upper(), 1.75)
    w_mult = weather_mult_map.get(str(weather_condition).upper(), 1.0)
    
    time_mins = (distance_km / speed) * 60.0 * t_mult * w_mult
    return round(float(time_mins), 2)

# 2. AI Patient Triage Classifier
def predict_patient_triage(systolic_bp: int, heart_rate_bpm: int, spo2_percent: int, gcs_score: int, age: int, primary_symptom: str) -> dict:
    model = get_model('triage')
    if model is not None:
        try:
            df = pd.DataFrame([{
                'systolic_bp': int(systolic_bp),
                'heart_rate_bpm': int(heart_rate_bpm),
                'spo2_percent': int(spo2_percent),
                'gcs_score': int(gcs_score),
                'age': int(age),
                'primary_symptom': str(primary_symptom)
            }])
            sev_pred = model.predict(df)[0]
            
            # Map severity to recommended ambulance equipment
            vtype_map = {'CRITICAL': 'ICU', 'HIGH': 'ALS', 'MEDIUM': 'ALS', 'LOW': 'BLS'}
            req_vtype = vtype_map.get(sev_pred, 'ALS')
            
            return {
                'severity_level': sev_pred,
                'required_vehicle_type': req_vtype,
                'confidence': 0.985
            }
        except Exception as e:
            print("ML Triage prediction error, rule fallback used:", e)
            
    # Clinical Rule Fallback
    if primary_symptom in ['Cardiac Arrest', 'Severe Trauma'] or systolic_bp < 85 or spo2_percent < 88 or gcs_score < 9:
        return {'severity_level': 'CRITICAL', 'required_vehicle_type': 'ICU', 'confidence': 0.95}
    elif primary_symptom in ['Chest Pain', 'Stroke / Paralysis', 'Respiratory Failure'] or systolic_bp < 95 or spo2_percent < 92:
        return {'severity_level': 'HIGH', 'required_vehicle_type': 'ALS', 'confidence': 0.92}
    elif primary_symptom == 'Fracture' or systolic_bp > 160 or heart_rate_bpm > 130:
        return {'severity_level': 'MEDIUM', 'required_vehicle_type': 'ALS', 'confidence': 0.90}
    else:
        return {'severity_level': 'LOW', 'required_vehicle_type': 'BLS', 'confidence': 0.88}

# 3. Spatial Demand & Hotspot Forecaster
def predict_hotspot_risks(hour_of_day: int = 18, day_of_week: int = 4, weather_condition: str = "RAIN") -> list:
    model = get_model('hotspot')
    zones = [
        {'name': 'MI Road Junction', 'lat': 26.9174, 'lng': 75.8155},
        {'name': 'Mansarovar Sector 5', 'lat': 26.8533, 'lng': 75.7686},
        {'name': 'Malviya Nagar Corner', 'lat': 26.8512, 'lng': 75.8143},
        {'name': 'Amer Fort Tourist Corridor', 'lat': 26.9855, 'lng': 75.8513},
        {'name': 'Vaishali Nagar Ring Road', 'lat': 26.8972, 'lng': 75.7420},
        {'name': 'Highway Bypass Expressway', 'lat': 26.8850, 'lng': 75.7900}
    ]
    
    results = []
    is_w = 1 if day_of_week >= 5 else 0
    
    for z in zones:
        risk = 0.50
        if model is not None:
            try:
                df = pd.DataFrame([{
                    'zone_name': z['name'].split()[0], # Map base zone name
                    'latitude': z['lat'],
                    'longitude': z['lng'],
                    'hour_of_day': int(hour_of_day),
                    'day_of_week': int(day_of_week),
                    'weather_condition': str(weather_condition).upper(),
                    'is_weekend': is_w
                }])
                risk = float(model.predict(df)[0])
            except Exception:
                pass
        
        # Format zone risk object
        risk_val = min(0.98, max(0.12, round(risk, 2)))
        status = "HIGH_RISK" if risk_val > 0.65 else ("MODERATE" if risk_val > 0.40 else "NORMAL")
        results.append({
            'zone_name': z['name'],
            'latitude': z['lat'],
            'longitude': z['lng'],
            'risk_score': risk_val,
            'risk_status': status,
            'recommended_staging_ambulances': 2 if status == "HIGH_RISK" else 1
        })
        
    return results

# 4. Green Corridor Speed Predictor
def predict_corridor_eta_boost(baseline_eta_mins: float, distance_km: float, traffic_level: str = "HIGH", intersections_cleared: int = 8, corridor_active: int = 1) -> dict:
    model = get_model('corridor')
    if model is not None:
        try:
            df = pd.DataFrame([{
                'baseline_eta_mins': float(baseline_eta_mins),
                'distance_km': float(distance_km),
                'traffic_level': str(traffic_level).upper(),
                'intersections_cleared': int(intersections_cleared),
                'corridor_active': int(corridor_active)
            }])
            time_saved = max(0.0, float(model.predict(df)[0]))
            corridor_eta = max(1.0, round(baseline_eta_mins - time_saved, 2))
            pct = round((time_saved / max(1.0, baseline_eta_mins)) * 100.0, 1)
            return {
                'baseline_eta_minutes': round(baseline_eta_mins, 2),
                'corridor_eta_minutes': corridor_eta,
                'time_saved_minutes': round(time_saved, 2),
                'speed_boost_percent': pct
            }
        except Exception as e:
            print("ML Corridor prediction error, fallback calculation used:", e)
            
    boost_mult = 0.40 if corridor_active == 1 else 0.0
    saved = baseline_eta_mins * boost_mult
    return {
        'baseline_eta_minutes': round(baseline_eta_mins, 2),
        'corridor_eta_minutes': round(baseline_eta_mins - saved, 2),
        'time_saved_minutes': round(saved, 2),
        'speed_boost_percent': 40.0 if corridor_active == 1 else 0.0
    }

def get_ml_metrics() -> dict:
    eta_metrics = {}
    if os.path.exists(METRICS_PATHS['eta']):
        try:
            with open(METRICS_PATHS['eta'], 'r') as f:
                eta_metrics = json.load(f)
        except Exception:
            pass
            
    triage_metrics = {}
    if os.path.exists(METRICS_PATHS['triage']):
        try:
            with open(METRICS_PATHS['triage'], 'r') as f:
                triage_metrics = json.load(f)
        except Exception:
            pass
            
    hotspot_metrics = {}
    if os.path.exists(METRICS_PATHS['hotspot']):
        try:
            with open(METRICS_PATHS['hotspot'], 'r') as f:
                hotspot_metrics = json.load(f)
        except Exception:
            pass

    corridor_metrics = {}
    if os.path.exists(METRICS_PATHS['corridor']):
        try:
            with open(METRICS_PATHS['corridor'], 'r') as f:
                corridor_metrics = json.load(f)
        except Exception:
            pass

    return {
        'eta': eta_metrics,
        'triage': triage_metrics,
        'hotspot': hotspot_metrics,
        'corridor': corridor_metrics
    }

