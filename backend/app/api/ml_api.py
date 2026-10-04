from fastapi import APIRouter
from app.services.ml_service import (
    get_ml_metrics,
    predict_travel_time,
    predict_patient_triage,
    predict_hotspot_risks,
    predict_corridor_eta_boost
)
from app.schemas.schemas import (
    ETAPredictRequest, ETAPredictResponse,
    TriagePredictRequest, TriagePredictResponse,
    CorridorPredictRequest, CorridorPredictResponse
)

router = APIRouter(prefix="/api/ml", tags=["ML Insights"])

@router.get("/insights")
def get_ml_insights():
    return get_ml_metrics()

@router.post("/predict-eta", response_model=ETAPredictResponse)
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

@router.post("/predict-triage", response_model=TriagePredictResponse)
def predict_triage_endpoint(req: TriagePredictRequest):
    res = predict_patient_triage(
        systolic_bp=req.systolic_bp,
        heart_rate_bpm=req.heart_rate_bpm,
        spo2_percent=req.spo2_percent,
        gcs_score=req.gcs_score,
        age=req.age,
        primary_symptom=req.primary_symptom
    )
    return res

@router.get("/hotspot-forecast")
def get_hotspot_forecast_endpoint(hour_of_day: int = 18, day_of_week: int = 4, weather_condition: str = "RAIN"):
    return predict_hotspot_risks(hour_of_day=hour_of_day, day_of_week=day_of_week, weather_condition=weather_condition)

@router.post("/predict-corridor-boost", response_model=CorridorPredictResponse)
def predict_corridor_boost_endpoint(req: CorridorPredictRequest):
    return predict_corridor_eta_boost(
        baseline_eta_mins=req.baseline_eta_mins,
        distance_km=req.distance_km,
        traffic_level=req.traffic_level,
        intersections_cleared=req.intersections_cleared,
        corridor_active=req.corridor_active
    )

