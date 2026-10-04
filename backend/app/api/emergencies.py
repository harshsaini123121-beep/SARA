import json
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import Emergency, Ambulance, Hospital, Assignment, PoliceAlert
from app.schemas.schemas import EmergencyCreate, EmergencyOut
from app.algorithms.ambulance_optimizer import optimize_ambulance_selection
from app.algorithms.hospital_optimizer import optimize_hospital_selection
from app.services.routing_service import calculate_route

router = APIRouter(prefix="/api/emergencies", tags=["Emergencies"])

@router.get("", response_model=List[EmergencyOut])
def get_emergencies(db: Session = Depends(get_db)):
    return db.query(Emergency).order_by(Emergency.created_at.desc()).all()

@router.post("", response_model=EmergencyOut)
def create_emergency(req: EmergencyCreate, db: Session = Depends(get_db)):
    emg = Emergency(
        patient_count=req.patient_count,
        critical_patient_count=req.critical_patient_count,
        emergency_type=req.emergency_type,
        severity=req.severity.upper(),
        latitude=req.latitude,
        longitude=req.longitude,
        description=req.description,
        address=req.address or "Jaipur Incident Location",
        status="CREATED"
    )
    db.add(emg)
    db.commit()
    db.refresh(emg)
    return emg

@router.get("/{emergency_id}", response_model=EmergencyOut)
def get_emergency(emergency_id: int, db: Session = Depends(get_db)):
    emg = db.query(Emergency).filter(Emergency.id == emergency_id).first()
    if not emg:
        raise HTTPException(status_code=404, detail="Emergency not found")
    return emg

@router.post("/{emergency_id}/analyze")
def analyze_emergency(emergency_id: int, db: Session = Depends(get_db)):
    emg = db.query(Emergency).filter(Emergency.id == emergency_id).first()
    if not emg:
        raise HTTPException(status_code=404, detail="Emergency not found")
        
    # 1. Available ambulances
    available_ambulances = db.query(Ambulance).filter(Ambulance.status == "AVAILABLE").all()
    if not available_ambulances:
        available_ambulances = db.query(Ambulance).all()
        
    amb_res = optimize_ambulance_selection(
        ambulances=available_ambulances,
        incident_lat=emg.latitude,
        incident_lng=emg.longitude,
        patient_count=emg.patient_count,
        critical_count=emg.critical_patient_count,
        severity=emg.severity,
        traffic_level="HIGH"
    )
    
    # 2. Hospital selection (MUST HAPPEN BEFORE POLICE NOTIFICATION!)
    hospitals = db.query(Hospital).filter(Hospital.status != "CLOSED").all()
    hosp_res = optimize_hospital_selection(
        hospitals=hospitals,
        incident_lat=emg.latitude,
        incident_lng=emg.longitude,
        patient_count=emg.patient_count,
        critical_count=emg.critical_patient_count,
        severity=emg.severity,
        emergency_type=emg.emergency_type,
        traffic_level="HIGH"
    )
    
    recommended_amb = amb_res["recommended"][0]
    recommended_hosp = hosp_res["recommended"][0]
    
    # 3. Route Calculation: Ambulance -> Incident -> Hospital
    amb_to_inc = calculate_route(
        recommended_amb["ambulance"].latitude,
        recommended_amb["ambulance"].longitude,
        emg.latitude,
        emg.longitude
    )
    
    inc_to_hosp = calculate_route(
        emg.latitude,
        emg.longitude,
        recommended_hosp["hospital"].latitude,
        recommended_hosp["hospital"].longitude
    )
    
    combined_geometry = amb_to_inc["geometry"] + inc_to_hosp["geometry"]
    total_dist = round(amb_to_inc["distance_km"] + inc_to_hosp["distance_km"], 2)
    total_eta = round(recommended_amb["predicted_eta"] + recommended_hosp["predicted_eta"], 1)
    
    # 4. Emergency Priority Assessment
    is_corridor_recommended = (
        emg.severity == "CRITICAL" or 
        emg.critical_patient_count > 1 or 
        emg.patient_count >= 3 or 
        total_eta > 18.0
    )
    
    priority_assessment = {
        "level": "CRITICAL" if is_corridor_recommended else emg.severity,
        "corridor_recommended": is_corridor_recommended,
        "total_estimated_arrival_minutes": total_eta,
        "reasons": []
    }
    
    if is_corridor_recommended:
        if emg.severity == "CRITICAL":
            priority_assessment["reasons"].append("✓ Emergency severity classified as CRITICAL")
        if emg.critical_patient_count > 1:
            priority_assessment["reasons"].append(f"✓ Multiple critical patients ({emg.critical_patient_count} critical)")
        if emg.patient_count >= 3:
            priority_assessment["reasons"].append(f"✓ Mass casualty event ({emg.patient_count} patients total)")
        if total_eta > 18.0:
            priority_assessment["reasons"].append(f"✓ High overall travel ETA ({total_eta} mins)")
            
    # Update Emergency status
    emg.status = "ANALYZED"
    emg.police_corridor_requested = is_corridor_recommended
    
    # Clean existing temp assignments
    db.query(Assignment).filter(Assignment.emergency_id == emg.id).delete()
    db.query(PoliceAlert).filter(PoliceAlert.emergency_id == emg.id).delete()
    
    # Create Assignment Record
    assgn = Assignment(
        emergency_id=emg.id,
        ambulance_id=recommended_amb["ambulance"].id,
        hospital_id=recommended_hosp["hospital"].id,
        predicted_eta=total_eta,
        distance_km=total_dist,
        score=recommended_amb["score"],
        reasoning="; ".join(recommended_amb["reasoning"] + recommended_hosp["reasoning"])
    )
    db.add(assgn)
    
    # Create Police Alert ONLY AFTER HOSPITAL & ROUTE CONFIRMED!
    police_alert = None
    if is_corridor_recommended:
        police_alert = PoliceAlert(
            emergency_id=emg.id,
            route_json=json.dumps(combined_geometry),
            destination_hospital_name=recommended_hosp["hospital"].name,
            ambulance_vehicle_number=recommended_amb["ambulance"].vehicle_number,
            patient_count=emg.patient_count,
            critical_count=emg.critical_patient_count,
            severity=emg.severity,
            eta_minutes=total_eta,
            status="PENDING"
        )
        db.add(police_alert)
        emg.status = "POLICE_NOTIFIED"
        
    db.commit()
    db.refresh(emg)
    
    return {
        "emergency_id": emg.id,
        "severity": emg.severity,
        "patient_count": emg.patient_count,
        "critical_patient_count": emg.critical_patient_count,
        "recommended_ambulance": recommended_amb,
        "recommended_hospital": recommended_hosp,
        "route": {
            "total_distance_km": total_dist,
            "total_eta_minutes": total_eta,
            "geometry": combined_geometry,
            "mode": amb_to_inc["mode"]
        },
        "priority_assessment": priority_assessment,
        "police_alert_created": is_corridor_recommended
    }

@router.post("/{emergency_id}/dispatch")
def dispatch_emergency(emergency_id: int, db: Session = Depends(get_db)):
    emg = db.query(Emergency).filter(Emergency.id == emergency_id).first()
    if not emg:
        raise HTTPException(status_code=404, detail="Emergency not found")
        
    assgn = db.query(Assignment).filter(Assignment.emergency_id == emg.id).first()
    if assgn:
        amb = db.query(Ambulance).filter(Ambulance.id == assgn.ambulance_id).first()
        if amb:
            amb.status = "DISPATCHED"
            
    emg.status = "DISPATCHED"
    db.commit()
    return {"message": "Ambulance dispatched successfully", "status": emg.status}
