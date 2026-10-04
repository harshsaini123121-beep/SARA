from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class AmbulanceOut(BaseModel):
    id: int
    vehicle_number: str
    driver_name: str
    latitude: float
    longitude: float
    status: str
    vehicle_type: str
    equipment_level: str
    patient_capacity: int
    updated_at: datetime

    class Config:
        from_attributes = True

class AmbulanceUpdate(BaseModel):
    status: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class HospitalOut(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    available_beds: int
    icu_beds: int
    trauma_capacity: bool
    emergency_capacity: int
    status: str
    contact_number: Optional[str] = None

    class Config:
        from_attributes = True

class HospitalUpdate(BaseModel):
    available_beds: Optional[int] = None
    icu_beds: Optional[int] = None
    emergency_capacity: Optional[int] = None
    status: Optional[str] = None

class EmergencyCreate(BaseModel):
    patient_count: int = 1
    critical_patient_count: int = 0
    emergency_type: str
    severity: str # LOW, MEDIUM, HIGH, CRITICAL
    latitude: float
    longitude: float
    description: Optional[str] = None
    address: Optional[str] = None

class EmergencyOut(BaseModel):
    id: int
    patient_count: int
    critical_patient_count: int
    emergency_type: str
    severity: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    address: Optional[str] = None
    status: str
    police_corridor_requested: bool
    police_corridor_acknowledged: bool
    police_corridor_active: bool
    hospital_accepted: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ETAPredictRequest(BaseModel):
    distance_km: float
    traffic_level: str = "HIGH" # LOW, MEDIUM, HIGH, SEVERE
    hour_of_day: int = 14
    day_of_week: int = 1
    weather_condition: str = "CLEAR" # CLEAR, RAIN, FOG
    road_type: str = "URBAN" # URBAN, HIGHWAY, NARROW

class ETAPredictResponse(BaseModel):
    predicted_eta_minutes: float
    distance_km: float
    traffic_level: str

class RecommendedAmbulance(BaseModel):
    ambulance: AmbulanceOut
    distance_km: float
    traffic_level: str
    predicted_eta: float
    score: float
    reasoning: List[str]
    assigned_patients: int = 1

class AmbulanceOptimizeResponse(BaseModel):
    recommended: List[RecommendedAmbulance]
    total_ambulances_needed: int

class RecommendedHospital(BaseModel):
    hospital: HospitalOut
    distance_km: float
    predicted_eta: float
    score: float
    reasoning: List[str]
    assigned_patients: int = 1

class HospitalOptimizeResponse(BaseModel):
    recommended: List[RecommendedHospital]

class RouteInfo(BaseModel):
    ambulance_id: int
    hospital_id: int
    distance_km: float
    predicted_eta: float
    geometry: List[List[float]] # [[lat, lng], ...]
    traffic_level: str

class EmergencyAnalysisResult(BaseModel):
    emergency_id: int
    severity: str
    patient_count: int
    critical_patient_count: int
    ambulances: List[RecommendedAmbulance]
    hospitals: List[RecommendedHospital]
    routes: List[RouteInfo]
    priority_assessment: Dict[str, Any]

class PoliceAlertOut(BaseModel):
    id: int
    emergency_id: int
    route_json: str
    destination_hospital_name: str
    ambulance_vehicle_number: str
    patient_count: int
    critical_count: int
    severity: str
    eta_minutes: float
    status: str
    created_at: datetime
    acknowledged_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DispatchRequest(BaseModel):
    emergency_id: int
    ambulance_ids: List[int]
    hospital_ids: List[int]

class TriagePredictRequest(BaseModel):
    systolic_bp: int = 120
    heart_rate_bpm: int = 80
    spo2_percent: int = 98
    gcs_score: int = 15
    age: int = 35
    primary_symptom: str = "Chest Pain"

class TriagePredictResponse(BaseModel):
    severity_level: str
    required_vehicle_type: str
    confidence: float

class CorridorPredictRequest(BaseModel):
    baseline_eta_mins: float = 15.0
    distance_km: float = 8.5
    traffic_level: str = "HIGH"
    intersections_cleared: int = 8
    corridor_active: int = 1

class CorridorPredictResponse(BaseModel):
    baseline_eta_minutes: float
    corridor_eta_minutes: float
    time_saved_minutes: float
    speed_boost_percent: float

