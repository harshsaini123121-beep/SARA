import os
import numpy as np
import pandas as pd

def generate_triage_dataset(num_samples=8000, seed=42):
    np.random.seed(seed)
    
    systolic_bp = np.random.randint(70, 190, size=num_samples)
    heart_rate = np.random.randint(45, 160, size=num_samples)
    spo2 = np.random.randint(75, 100, size=num_samples)
    gcs = np.random.randint(3, 16, size=num_samples) # Glasgow Coma Scale 3-15
    age = np.random.randint(1, 90, size=num_samples)
    
    symptoms = np.random.choice(
        ['Chest Pain', 'Cardiac Arrest', 'Severe Trauma', 'Stroke / Paralysis', 'Respiratory Failure', 'Fracture', 'Minor Injury'],
        size=num_samples,
        p=[0.2, 0.1, 0.15, 0.15, 0.15, 0.15, 0.1]
    )
    
    severities = []
    vehicle_types = []
    
    for i in range(num_samples):
        bp = systolic_bp[i]
        hr = heart_rate[i]
        o2 = spo2[i]
        gc = gcs[i]
        sym = symptoms[i]
        
        # Clinical Rule Logic for synthetic ground truth
        if sym in ['Cardiac Arrest', 'Severe Trauma'] or bp < 85 or o2 < 88 or gc < 9:
            sev = 'CRITICAL'
            vtype = 'ICU'
        elif sym in ['Chest Pain', 'Stroke / Paralysis', 'Respiratory Failure'] or bp < 95 or o2 < 92 or gc < 12:
            sev = 'HIGH'
            vtype = 'ALS'
        elif sym == 'Fracture' or bp > 160 or hr > 130 or o2 < 95:
            sev = 'MEDIUM'
            vtype = 'ALS'
        # Add 8% realistic clinical boundary noise (e.g. atypical presentations)
        if np.random.rand() < 0.08:
            sev = np.random.choice(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])
            
        severities.append(sev)
        vehicle_types.append(vtype)

        
    df = pd.DataFrame({
        'systolic_bp': systolic_bp,
        'heart_rate_bpm': heart_rate,
        'spo2_percent': spo2,
        'gcs_score': gcs,
        'age': age,
        'primary_symptom': symptoms,
        'severity_level': severities,
        'required_vehicle_type': vehicle_types
    })
    
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/patient_triage.csv', index=False)
    print(f"Generated patient triage dataset with {len(df)} records at data/patient_triage.csv")
    return df

def generate_hotspot_dataset(num_samples=10000, seed=42):
    np.random.seed(seed)
    
    zones = ['MI Road', 'Mansarovar', 'Malviya Nagar', 'Amer Fort Junction', 'Vaishali Nagar', 'Highway Bypass']
    lats = [26.9174, 26.8533, 26.8512, 26.9855, 26.8972, 26.8850]
    lngs = [75.8155, 75.7686, 75.8143, 75.8513, 75.7420, 75.7900]
    
    selected_zone_idx = np.random.choice(len(zones), size=num_samples)
    zone_names = [zones[i] for i in selected_zone_idx]
    zone_lats = [lats[i] + np.random.normal(0, 0.005) for i in selected_zone_idx]
    zone_lngs = [lngs[i] + np.random.normal(0, 0.005) for i in selected_zone_idx]
    
    hours = np.random.randint(0, 24, size=num_samples)
    days = np.random.randint(0, 7, size=num_samples)
    weather = np.random.choice(['CLEAR', 'RAIN', 'FOG'], size=num_samples, p=[0.7, 0.2, 0.1])
    is_weekend = (days >= 5).astype(int)
    
    risk_scores = []
    for i in range(num_samples):
        zn = zone_names[i]
        hr = hours[i]
        w = weather[i]
        
        # Base risk by zone
        base_risk = 0.65 if zn in ['Highway Bypass', 'MI Road'] else 0.40
        
        # Hour multiplier (rush hours 8-10, 18-21 & late night 22-2)
        hr_mult = 1.35 if (8 <= hr <= 10 or 18 <= hr <= 21 or hr >= 22 or hr <= 2) else 0.8
        
        # Weather multiplier
        w_mult = 1.4 if w == 'RAIN' else (1.6 if w == 'FOG' else 1.0)
        
        raw_risk = min(0.98, max(0.05, base_risk * hr_mult * w_mult + np.random.normal(0, 0.05)))
        risk_scores.append(round(raw_risk, 3))
        
    df = pd.DataFrame({
        'zone_name': zone_names,
        'latitude': np.round(zone_lats, 4),
        'longitude': np.round(zone_lngs, 4),
        'hour_of_day': hours,
        'day_of_week': days,
        'weather_condition': weather,
        'is_weekend': is_weekend,
        'risk_score': risk_scores
    })
    
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/city_hotspots.csv', index=False)
    print(f"Generated hotspot dataset with {len(df)} records at data/city_hotspots.csv")
    return df

def generate_corridor_dataset(num_samples=6000, seed=42):
    np.random.seed(seed)
    
    baseline_eta = np.random.uniform(5.0, 45.0, size=num_samples)
    distance_km = np.random.uniform(2.0, 30.0, size=num_samples)
    traffic_level = np.random.choice(['LOW', 'MEDIUM', 'HIGH', 'SEVERE'], size=num_samples)
    intersections = np.random.randint(2, 18, size=num_samples)
    corridor_active = np.random.choice([0, 1], size=num_samples, p=[0.3, 0.7])
    
    time_saved = []
    actual_corridor_eta = []
    
    for i in range(num_samples):
        b_eta = baseline_eta[i]
        c_act = corridor_active[i]
        t_lev = traffic_level[i]
        n_ints = intersections[i]
        
        if c_act == 1:
            # Green Corridor clears traffic signals -> 35% to 50% time reduction
            boost_factor = 0.45 if t_lev in ['HIGH', 'SEVERE'] else 0.35
            saved = b_eta * boost_factor + (n_ints * 0.4)
            c_eta = max(1.5, b_eta - saved)
        else:
            saved = 0.0
            c_eta = b_eta
            
        time_saved.append(round(saved, 2))
        actual_corridor_eta.append(round(c_eta, 2))
        
    df = pd.DataFrame({
        'baseline_eta_mins': np.round(baseline_eta, 2),
        'distance_km': np.round(distance_km, 2),
        'traffic_level': traffic_level,
        'intersections_cleared': intersections,
        'corridor_active': corridor_active,
        'time_saved_mins': time_saved,
        'corridor_eta_mins': actual_corridor_eta
    })
    
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/green_corridor_trips.csv', index=False)
    print(f"Generated green corridor dataset with {len(df)} records at data/green_corridor_trips.csv")
    return df

if __name__ == '__main__':
    generate_triage_dataset()
    generate_hotspot_dataset()
    generate_corridor_dataset()
