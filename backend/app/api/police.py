from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import PoliceAlert, Emergency
from app.schemas.schemas import PoliceAlertOut

router = APIRouter(prefix="/api/police", tags=["Police Control Room"])

@router.get("/alerts", response_model=List[PoliceAlertOut])
def get_police_alerts(db: Session = Depends(get_db)):
    return db.query(PoliceAlert).order_by(PoliceAlert.created_at.desc()).all()

@router.patch("/alerts/{alert_id}")
def update_police_alert(alert_id: int, action: str, db: Session = Depends(get_db)):
    # action: ACKNOWLEDGE, ACTIVATE_CORRIDOR, DECLINE
    alert = db.query(PoliceAlert).filter(PoliceAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Police alert not found")
        
    emg = db.query(Emergency).filter(Emergency.id == alert.emergency_id).first()
    
    if action == "ACKNOWLEDGE":
        alert.status = "ACKNOWLEDGED"
        alert.acknowledged_at = datetime.utcnow()
        if emg:
            emg.police_corridor_acknowledged = True
    elif action == "ACTIVATE_CORRIDOR":
        alert.status = "PRIORITY_ACTIVE"
        if emg:
            emg.police_corridor_active = True
            emg.status = "CORRIDOR_ACTIVE"
    elif action == "DECLINE":
        alert.status = "DECLINED"
        if emg:
            emg.police_corridor_requested = False
            
    db.commit()
    db.refresh(alert)
    return {
        "alert": alert,
        "message": f"Police alert status updated to {alert.status}",
        "simulated_traffic_clearance": alert.status == "PRIORITY_ACTIVE"
    }
