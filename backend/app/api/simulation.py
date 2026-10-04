import json
import time
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import Emergency, Ambulance, Hospital, Assignment, PoliceAlert, Trip
from app.algorithms.ambulance_optimizer import optimize_ambulance_selection
from app.algorithms.hospital_optimizer import optimize_hospital_selection
from app.services.routing_service import calculate_route

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

@router.post("/start")
def start_simulation(db: Session = Depends(get_db)):
    """Creates a sample multi-patient critical road accident in Jaipur to demonstrate the automated end-to-end workflow."""
    # 1. Create Emergency
    emg = Emergency(
        patient_count=4,
        critical_patient_count=2,
        emergency_type="Road Accident",
        severity="CRITICAL",
        latitude=26.9124, # Jaipur MI Road junction
        longitude=75.7873,
        description="Mass casualty vehicle collision on MI Road near Ajmeri Gate. 4 victims, 2 severe injuries requiring ICU.",
        address="MI Road, Ajmeri Gate, Jaipur, Rajasthan",
        status="CREATED"
    )
    db.add(emg)
    db.commit()
    db.refresh(emg)
    
    # 2. Select Ambulance
    ambulances = db.query(Ambulance).filter(Ambulance.status == "AVAILABLE").all()
    if not ambulances:
        ambulances = db.query(Ambulance).all()
        
    amb_res = optimize_ambulance_selection(
        ambulances=ambulances,
        incident_lat=emg.latitude,
        incident_lng=emg.longitude,
        patient_count=4,
        critical_count=2,
        severity="CRITICAL",
        traffic_level="HIGH"
    )
    
    # 3. Select Hospital (BEFORE POLICE NOTIFICATION!)
    hospitals = db.query(Hospital).all()
    hosp_res = optimize_hospital_selection(
        hospitals=hospitals,
        incident_lat=emg.latitude,
        incident_lng=emg.longitude,
        patient_count=4,
        critical_count=2,
        severity="CRITICAL",
        emergency_type="Road Accident",
        traffic_level="HIGH"
    )
    
    rec_amb = amb_res["recommended"][0]
    rec_hosp = hosp_res["recommended"][0]
    
    amb_obj = db.query(Ambulance).filter(Ambulance.id == rec_amb["ambulance"].id).first()
    hosp_obj = db.query(Hospital).filter(Hospital.id == rec_hosp["hospital"].id).first()
    
    # 4. Route Calculation
    amb_to_patient = calculate_route(amb_obj.latitude, amb_obj.longitude, emg.latitude, emg.longitude)
    patient_to_hosp = calculate_route(emg.latitude, emg.longitude, hosp_obj.latitude, hosp_obj.longitude)
    
    total_dist = round(amb_to_patient["distance_km"] + patient_to_hosp["distance_km"], 2)
    total_eta = round(rec_amb["predicted_eta"] + rec_hosp["predicted_eta"], 1)
    combined_geo = amb_to_patient["geometry"] + patient_to_hosp["geometry"]
    
    # 5. Create Assignment
    assgn = Assignment(
        emergency_id=emg.id,
        ambulance_id=amb_obj.id,
        hospital_id=hosp_obj.id,
        predicted_eta=total_eta,
        distance_km=total_dist,
        score=rec_amb["score"],
        reasoning="; ".join(rec_amb["reasoning"] + rec_hosp["reasoning"])
    )
    db.add(assgn)
    
    # 6. Create Police Alert
    alert = PoliceAlert(
        emergency_id=emg.id,
        route_json=json.dumps(combined_geo),
        destination_hospital_name=hosp_obj.name,
        ambulance_vehicle_number=amb_obj.vehicle_number,
        patient_count=emg.patient_count,
        critical_count=emg.critical_patient_count,
        severity=emg.severity,
        eta_minutes=total_eta,
        status="PENDING"
    )
    db.add(alert)
    
    emg.status = "POLICE_NOTIFIED"
    emg.police_corridor_requested = True
    db.commit()
    db.refresh(emg)
    
    return {
        "message": "Simulation initialized successfully",
        "emergency_id": emg.id,
        "ambulance": rec_amb,
        "hospital": rec_hosp,
        "route": {
            "total_distance_km": total_dist,
            "total_eta_minutes": total_eta,
            "geometry": combined_geo
        },
        "police_alert_id": alert.id
    }

@router.post("/step/{emergency_id}")
def advance_simulation_step(emergency_id: int, step: str, db: Session = Depends(get_db)):
    """Advances emergency state step-by-step for live demo tracking."""
    emg = db.query(Emergency).filter(Emergency.id == emergency_id).first()
    if not emg:
        raise HTTPException(status_code=404, detail="Emergency not found")
        
    assgn = db.query(Assignment).filter(Assignment.emergency_id == emg.id).first()
    alert = db.query(PoliceAlert).filter(PoliceAlert.emergency_id == emg.id).first()
    
    amb = None
    if assgn:
        amb = db.query(Ambulance).filter(Ambulance.id == assgn.ambulance_id).first()
        
    if step == "POLICE_ACKNOWLEDGE":
        if alert:
            alert.status = "ACKNOWLEDGED"
            alert.acknowledged_at = datetime.utcnow()
        emg.police_corridor_acknowledged = True
        emg.status = "POLICE_NOTIFIED"
        
    elif step == "ACTIVATE_CORRIDOR":
        if alert:
            alert.status = "PRIORITY_ACTIVE"
        emg.police_corridor_active = True
        emg.status = "CORRIDOR_ACTIVE"
        if amb:
            amb.status = "DISPATCHED"
            
    elif step == "PICKUP_PATIENT":
        emg.status = "IN_TRANSIT"
        if amb:
            amb.status = "ARRIVED_PATIENT"
            amb.latitude = emg.latitude
            amb.longitude = emg.longitude
            
    elif step == "NOTIFY_HOSPITAL":
        emg.status = "HOSPITAL_NOTIFIED"
        if amb:
            amb.status = "EN_ROUTE_HOSPITAL"
            
    elif step == "HOSPITAL_ACCEPT":
        emg.hospital_accepted = True
        
    elif step == "ARRIVE_HOSPITAL":
        emg.status = "COMPLETED"
        if amb:
            amb.status = "AVAILABLE"
            
        if assgn:
            # Create completed Trip record
            trip = Trip(
                emergency_id=emg.id,
                ambulance_id=assgn.ambulance_id,
                hospital_id=assgn.hospital_id,
                travel_time_minutes=round(assgn.predicted_eta * 0.9, 1),
                predicted_eta_minutes=assgn.predicted_eta,
                distance_km=assgn.distance_km,
                police_corridor_used=emg.police_corridor_active
            )
            db.add(trip)
            
    db.commit()
    db.refresh(emg)
    return {"emergency_id": emg.id, "current_status": emg.status, "step_executed": step}
