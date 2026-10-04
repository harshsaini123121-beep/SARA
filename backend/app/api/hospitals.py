from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import Hospital
from app.schemas.schemas import HospitalOut, HospitalUpdate

router = APIRouter(prefix="/api/hospitals", tags=["Hospitals"])

@router.get("", response_model=List[HospitalOut])
def get_hospitals(db: Session = Depends(get_db)):
    return db.query(Hospital).all()

@router.get("/{hospital_id}", response_model=HospitalOut)
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hosp

@router.patch("/{hospital_id}", response_model=HospitalOut)
def update_hospital(hospital_id: int, req: HospitalUpdate, db: Session = Depends(get_db)):
    hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")
        
    if req.available_beds is not None:
        hosp.available_beds = req.available_beds
    if req.icu_beds is not None:
        hosp.icu_beds = req.icu_beds
    if req.emergency_capacity is not None:
        hosp.emergency_capacity = req.emergency_capacity
    if req.status is not None:
        hosp.status = req.status
        
    db.commit()
    db.refresh(hosp)
    return hosp
