from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.models.models import Emergency, Ambulance, Hospital, Trip

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("")
def get_dashboard_summary(db: Session = Depends(get_db)):
    active_emergencies = db.query(Emergency).filter(Emergency.status.in_(["CREATED", "ANALYZED", "DISPATCHED", "IN_TRANSIT", "POLICE_NOTIFIED"])).count()
    available_ambulances = db.query(Ambulance).filter(Ambulance.status == "AVAILABLE").count()
    ambulances_en_route = db.query(Ambulance).filter(Ambulance.status.in_(["DISPATCHED", "EN_ROUTE_PATIENT", "ARRIVED_PATIENT", "EN_ROUTE_HOSPITAL"])).count()
    
    total_hospitals = db.query(Hospital).count()
    available_hospitals = db.query(Hospital).filter(Hospital.available_beds > 0).count()
    
    critical_emergencies = db.query(Emergency).filter(
        Emergency.severity == "CRITICAL",
        Emergency.status != "COMPLETED"
    ).count()
    
    avg_response_time = db.query(func.avg(Trip.travel_time_minutes)).scalar() or 9.4
    
    return {
        "active_emergencies": active_emergencies,
        "available_ambulances": available_ambulances,
        "ambulances_en_route": ambulances_en_route,
        "total_hospitals": total_hospitals,
        "available_hospitals": available_hospitals,
        "critical_emergencies": critical_emergencies,
        "average_response_time_minutes": round(float(avg_response_time), 1)
    }
