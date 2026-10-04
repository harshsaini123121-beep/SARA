from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import Ambulance, Hospital
from app.algorithms.ambulance_optimizer import optimize_ambulance_selection
from app.algorithms.hospital_optimizer import optimize_hospital_selection
from app.services.routing_service import calculate_route
from app.schemas.schemas import ETAPredictRequest, ETAPredictResponse
from app.services.ml_service import predict_travel_time

router = APIRouter(prefix="/api", tags=["Optimization & ML"])

@router.post("/ml/predict-eta", response_model=ETAPredictResponse)
def predict_eta_endpoint(req: ETAPredictRequest):
    pred = predict_travel_time(
        distance_km=req.distance_km,
        traffic_level=req.traffic_level,
        hour_of_day=req.hour_of_day,
        day_of_week=req.day_of_week,
        weather_condition=req.weather_condition,
        road_type=req.road_type
    )
    return {
        "predicted_eta_minutes": pred,
        "distance_km": req.distance_km,
        "traffic_level": req.traffic_level
    }

@router.post("/optimize/ambulance")
def optimize_ambulance_endpoint(
    latitude: float,
    longitude: float,
    patient_count: int = 1,
    critical_count: int = 0,
    severity: str = "CRITICAL",
    traffic_level: str = "HIGH",
    db: Session = Depends(get_db)
):
    ambulances = db.query(Ambulance).filter(Ambulance.status == "AVAILABLE").all()
    if not ambulances:
        # Fallback to all ambulances if all are busy for demo flexibility
        ambulances = db.query(Ambulance).all()
        
    res = optimize_ambulance_selection(
        ambulances=ambulances,
        incident_lat=latitude,
        incident_lng=longitude,
        patient_count=patient_count,
        critical_count=critical_count,
        severity=severity,
        traffic_level=traffic_level
    )
    return res

@router.post("/optimize/hospital")
def optimize_hospital_endpoint(
    latitude: float,
    longitude: float,
    patient_count: int = 1,
    critical_count: int = 0,
    severity: str = "CRITICAL",
    emergency_type: str = "Road Accident",
    traffic_level: str = "HIGH",
    db: Session = Depends(get_db)
):
    hospitals = db.query(Hospital).filter(Hospital.status != "CLOSED").all()
    res = optimize_hospital_selection(
        hospitals=hospitals,
        incident_lat=latitude,
        incident_lng=longitude,
        patient_count=patient_count,
        critical_count=critical_count,
        severity=severity,
        emergency_type=emergency_type,
        traffic_level=traffic_level
    )
    return res

@router.post("/routes/calculate")
def calculate_route_endpoint(
    start_lat: float,
    start_lon: float,
    end_lat: float,
    end_lon: float
):
    return calculate_route(start_lat, start_lon, end_lat, end_lon)
