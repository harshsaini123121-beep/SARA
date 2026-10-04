from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="ADMIN") # ADMIN, POLICE, HOSPITAL, DRIVER
    created_at = Column(DateTime, default=datetime.utcnow)

class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String(50), unique=True, nullable=False)
    driver_name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(30), nullable=False, default="AVAILABLE") # AVAILABLE, DISPATCHED, EN_ROUTE_PATIENT, ARRIVED_PATIENT, EN_ROUTE_HOSPITAL, ARRIVED_HOSPITAL, MAINTENANCE
    vehicle_type = Column(String(30), nullable=False, default="ALS") # ALS (Advanced Life Support), BLS (Basic), ICU
    equipment_level = Column(String(30), nullable=False, default="ADVANCED") # BASIC, ADVANCED, ICU_LEVEL
    patient_capacity = Column(Integer, default=2)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    available_beds = Column(Integer, default=20)
    icu_beds = Column(Integer, default=5)
    trauma_capacity = Column(Boolean, default=True)
    emergency_capacity = Column(Integer, default=10)
    status = Column(String(20), default="OPERATIONAL") # OPERATIONAL, BUSY, FULL
    contact_number = Column(String(20), nullable=True)

class Emergency(Base):
    __tablename__ = "emergencies"

    id = Column(Integer, primary_key=True, index=True)
    patient_count = Column(Integer, default=1)
    critical_patient_count = Column(Integer, default=0)
    emergency_type = Column(String(50), nullable=False) # Road Accident, Cardiac, Stroke, Trauma, Breathing Emergency, Burn, Other
    severity = Column(String(20), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String(255), nullable=True)
    status = Column(String(30), default="CREATED") # CREATED, ANALYZED, DISPATCHED, POLICE_NOTIFIED, CORRIDOR_ACTIVE, HOSPITAL_ACCEPTED, EN_ROUTE, COMPLETED, CANCELLED
    police_corridor_requested = Column(Boolean, default=False)
    police_corridor_acknowledged = Column(Boolean, default=False)
    police_corridor_active = Column(Boolean, default=False)
    hospital_accepted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    assignments = relationship("Assignment", back_populates="emergency", cascade="all, delete-orphan")
    police_alerts = relationship("PoliceAlert", back_populates="emergency", cascade="all, delete-orphan")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    emergency_id = Column(Integer, ForeignKey("emergencies.id"), nullable=False)
    ambulance_id = Column(Integer, ForeignKey("ambulances.id"), nullable=False)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    predicted_eta = Column(Float, nullable=False) # in minutes
    distance_km = Column(Float, nullable=False)
    score = Column(Float, nullable=False) # 0-100 AI recommendation score
    reasoning = Column(Text, nullable=True)
    assigned_patients = Column(Integer, default=1)
    status = Column(String(20), default="ACTIVE") # ACTIVE, COMPLETED, CANCELLED
    created_at = Column(DateTime, default=datetime.utcnow)

    emergency = relationship("Emergency", back_populates="assignments")
    ambulance = relationship("Ambulance")
    hospital = relationship("Hospital")

class PoliceAlert(Base):
    __tablename__ = "police_alerts"

    id = Column(Integer, primary_key=True, index=True)
    emergency_id = Column(Integer, ForeignKey("emergencies.id"), nullable=False)
    route_json = Column(Text, nullable=False) # Serialized polyline/waypoints
    destination_hospital_name = Column(String(150), nullable=False)
    ambulance_vehicle_number = Column(String(50), nullable=False)
    patient_count = Column(Integer, default=1)
    critical_count = Column(Integer, default=0)
    severity = Column(String(20), default="CRITICAL")
    eta_minutes = Column(Float, default=10.0)
    status = Column(String(30), default="PENDING") # PENDING, ACKNOWLEDGED, PRIORITY_ACTIVE, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)
    acknowledged_at = Column(DateTime, nullable=True)

    emergency = relationship("Emergency", back_populates="police_alerts")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    emergency_id = Column(Integer, nullable=False)
    ambulance_id = Column(Integer, nullable=False)
    hospital_id = Column(Integer, nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    completion_time = Column(DateTime, default=datetime.utcnow)
    travel_time_minutes = Column(Float, nullable=False)
    predicted_eta_minutes = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=False)
    police_corridor_used = Column(Boolean, default=False)
