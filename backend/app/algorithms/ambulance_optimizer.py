import math
from typing import List, Dict, Any
from app.services.routing_service import haversine_distance
from app.services.ml_service import predict_travel_time

def optimize_ambulance_selection(
    ambulances: List[Any], 
    incident_lat: float, 
    incident_lng: float,
    patient_count: int = 1,
    critical_count: int = 0,
    severity: str = "CRITICAL",
    traffic_level: str = "HIGH"
) -> Dict[str, Any]:
    
    scored_ambulances = []
    
    for amb in ambulances:
        # Distance calculation
        dist = haversine_distance(amb.latitude, amb.longitude, incident_lat, incident_lng)
        
        # ML ETA prediction
        eta = predict_travel_time(
            distance_km=dist,
            traffic_level=traffic_level,
            hour_of_day=14,
            weather_condition="CLEAR",
            road_type="URBAN"
        )
        
        # Scoring components
        # 1. ETA Score (0-100): Lower is better. Max target 30 mins
        eta_score = max(0.0, min(100.0, (1.0 - (eta / 30.0)) * 100.0))
        
        # 2. Traffic Score (0-100)
        traffic_map = {'LOW': 100.0, 'MEDIUM': 75.0, 'HIGH': 50.0, 'SEVERE': 25.0}
        traffic_score = traffic_map.get(traffic_level.upper(), 50.0)
        
        # 3. Distance Score (0-100): Max target 25 km
        dist_score = max(0.0, min(100.0, (1.0 - (dist / 25.0)) * 100.0))
        
        # 4. Equipment Suitability Score (0-100)
        equip_score = 70.0
        if severity == "CRITICAL" or critical_count > 0:
            if amb.vehicle_type == "ICU" or amb.equipment_level == "ICU_LEVEL":
                equip_score = 100.0
            elif amb.vehicle_type == "ALS":
                equip_score = 90.0
            else:
                equip_score = 50.0
        else:
            equip_score = 85.0
            
        # Total Weighted AI Score
        # ETA: 40%, Traffic: 25%, Distance: 20%, Equipment: 15%
        total_score = round(
            (eta_score * 0.40) + 
            (traffic_score * 0.25) + 
            (dist_score * 0.20) + 
            (equip_score * 0.15), 
            1
        )
        
        reasons = []
        if eta < 10.0:
            reasons.append(f"✓ Exceptionally low predicted ETA ({eta} mins)")
        elif eta < 15.0:
            reasons.append(f"✓ Favorable predicted ETA ({eta} mins)")
            
        if dist < 5.0:
            reasons.append(f"✓ Nearby location ({dist} km)")
            
        if amb.equipment_level in ["ADVANCED", "ICU_LEVEL"]:
            reasons.append(f"✓ High-level life support equipment ({amb.equipment_level})")
            
        if amb.status == "AVAILABLE":
            reasons.append("✓ Vehicle ready and available for immediate dispatch")
            
        if traffic_level in ["LOW", "MEDIUM"]:
            reasons.append(f"✓ Low traffic congestion along route")
            
        scored_ambulances.append({
            "ambulance": amb,
            "distance_km": dist,
            "traffic_level": traffic_level,
            "predicted_eta": eta,
            "score": total_score,
            "reasoning": reasons
        })
        
    # Sort by AI score descending
    scored_ambulances.sort(key=lambda x: x["score"], reverse=True)
    
    # Determine multi-ambulance requirements
    ambulances_needed = math.ceil(patient_count / 2.0) if patient_count > 2 else 1
    selected = scored_ambulances[:ambulances_needed]
    
    # Distribute patient counts among selected ambulances
    remaining_patients = patient_count
    for item in selected:
        assigned = min(2, remaining_patients)
        item["assigned_patients"] = assigned
        remaining_patients -= assigned
        
    return {
        "recommended": selected,
        "alternatives": scored_ambulances[ambulances_needed:],
        "total_ambulances_needed": ambulances_needed
    }
