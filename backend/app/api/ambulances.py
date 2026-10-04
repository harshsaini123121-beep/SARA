from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import Ambulance
from app.schemas.schemas import AmbulanceOut, AmbulanceUpdate

router = APIRouter(prefix="/api/ambulances", tags=["Ambulances"])

@router.get("", response_model=List[AmbulanceOut])
def get_ambulances(db: Session = Depends(get_db)):
    return db.query(Ambulance).all()

@router.get("/{ambulance_id}", response_model=AmbulanceOut)
def get_ambulance(ambulance_id: int, db: Session = Depends(get_db)):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return amb

@router.patch("/{ambulance_id}", response_model=AmbulanceOut)
def update_ambulance(ambulance_id: int, req: AmbulanceUpdate, db: Session = Depends(get_db)):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")
        
    if req.status is not None:
        amb.status = req.status
    if req.latitude is not None:
        amb.latitude = req.latitude
    if req.longitude is not None:
        amb.longitude = req.longitude
        
    db.commit()
    db.refresh(amb)
    return amb
