import math
from typing import List, Dict, Any
from app.services.routing_service import haversine_distance
from app.services.ml_service import predict_travel_time

def optimize_hospital_selection(
    hospitals: List[Any],
    incident_lat: float,
    incident_lng: float,
    patient_count: int = 1,
    critical_count: int = 0,
    severity: str = "CRITICAL",
    emergency_type: str = "Road Accident",
    traffic_level: str = "HIGH"
) -> Dict[str, Any]:
    
    scored_hospitals = []
    
    for hosp in hospitals:
        # Distance calculation
        dist = haversine_distance(incident_lat, incident_lng, hosp.latitude, hosp.longitude)
        
        # ML ETA prediction
        eta = predict_travel_time(
            distance_km=dist,
            traffic_level=traffic_level,
            hour_of_day=14,
            weather_condition="CLEAR",
            road_type="URBAN"
        )
        
        # 1. ICU Score (0-100)
        if critical_count > 0:
            if hosp.icu_beds >= critical_count:
                icu_score = 100.0
            elif hosp.icu_beds > 0:
                icu_score = 60.0
            else:
                icu_score = 10.0 # Heavy penalty if no ICU for critical patient
        else:
            icu_score = 80.0 if hosp.icu_beds > 0 else 50.0
            
        # 2. ETA Score (0-100): Target max 30 mins
        eta_score = max(0.0, min(100.0, (1.0 - (eta / 30.0)) * 100.0))
        
        # 3. Trauma Capability (0-100)
        requires_trauma = emergency_type in ["Road Accident", "Trauma", "Stroke", "Burn"]
        if requires_trauma:
            trauma_score = 100.0 if hosp.trauma_capacity else 20.0
        else:
            trauma_score = 85.0
            
        # 4. Emergency Bed Capacity (0-100)
        if hosp.available_beds >= patient_count:
            capacity_score = 100.0
        elif hosp.available_beds > 0:
            capacity_score = 50.0
        else:
            capacity_score = 0.0
            
        # Total Weighted Hospital AI Score
        # ICU: 35%, ETA: 30%, Trauma: 20%, Bed Capacity: 15%
        total_score = round(
            (icu_score * 0.35) + 
            (eta_score * 0.30) + 
            (trauma_score * 0.20) + 
            (capacity_score * 0.15),
            1
        )
        
        reasons = []
        if hosp.icu_beds > 0:
            reasons.append(f"✓ ICU beds available ({hosp.icu_beds} open)")
        else:
            reasons.append("⚠️ No ICU beds currently available")
            
        if hosp.trauma_capacity:
            reasons.append("✓ Trauma center level certified")
            
        if hosp.available_beds >= patient_count:
            reasons.append(f"✓ Sufficient emergency capacity ({hosp.available_beds} beds open)")
            
        if eta < 15.0:
            reasons.append(f"✓ Reasonable travel ETA ({eta} mins)")
            
        scored_hospitals.append({
            "hospital": hosp,
            "distance_km": dist,
            "predicted_eta": eta,
            "score": total_score,
            "reasoning": reasons
        })
        
    # Sort hospitals by score descending
    scored_hospitals.sort(key=lambda x: x["score"], reverse=True)
    
    # Handle hospital capacity distribution for mass casualties
    selected_hospitals = []
    patients_to_assign = patient_count
    
    for item in scored_hospitals:
        if patients_to_assign <= 0:
            break
        # Capacity check
        h_beds = item["hospital"].available_beds
        if h_beds <= 0 and len(selected_hospitals) > 0:
            continue
            
        assigned = min(patients_to_assign, max(1, h_beds))
        item["assigned_patients"] = assigned
        selected_hospitals.append(item)
        patients_to_assign -= assigned
        
    if not selected_hospitals and scored_hospitals:
        selected_hospitals = [scored_hospitals[0]]
        selected_hospitals[0]["assigned_patients"] = patient_count
        
    return {
        "recommended": selected_hospitals,
        "alternatives": [h for h in scored_hospitals if h not in selected_hospitals]
    }
