import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.database.database import Base, engine, SessionLocal
from app.models.models import User, Ambulance, Hospital, Emergency, Assignment, PoliceAlert, Trip
from app.services.auth import get_password_hash

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        print("Seeding Users...")
        users = [
            User(name="Control Room Admin", email="admin@sara.ai", password_hash=get_password_hash("admin123"), role="ADMIN"),
            User(name="Jaipur Traffic Police Control Room", email="police@sara.ai", password_hash=get_password_hash("police123"), role="POLICE"),
            User(name="SMS Hospital Emergency Desk", email="hospital@sara.ai", password_hash=get_password_hash("hospital123"), role="HOSPITAL"),
            User(name="Ambulance A-102 Driver", email="driver@sara.ai", password_hash=get_password_hash("driver123"), role="DRIVER")
        ]
        db.add_all(users)
        
        print("Seeding Jaipur Hospitals...")
        hospitals = [
            Hospital(name="Sawai Man Singh (SMS) Hospital", latitude=26.8970, longitude=75.8150, available_beds=45, icu_beds=12, trauma_capacity=True, emergency_capacity=30, status="OPERATIONAL", contact_number="+91 141 2560291"),
            Hospital(name="Fortis Escorts Hospital", latitude=26.8450, longitude=75.8030, available_beds=25, icu_beds=8, trauma_capacity=True, emergency_capacity=15, status="OPERATIONAL", contact_number="+91 141 2547000"),
            Hospital(name="Eternal Hospital (EHCC)", latitude=26.8480, longitude=75.8080, available_beds=30, icu_beds=10, trauma_capacity=True, emergency_capacity=20, status="OPERATIONAL", contact_number="+91 141 5174000"),
            Hospital(name="Apex Hospital Malviya Nagar", latitude=26.8520, longitude=75.8210, available_beds=18, icu_beds=6, trauma_capacity=True, emergency_capacity=12, status="OPERATIONAL", contact_number="+91 141 2751999"),
            Hospital(name="Manipal Hospital Vidhyadhar Nagar", latitude=26.9610, longitude=75.7760, available_beds=22, icu_beds=7, trauma_capacity=True, emergency_capacity=16, status="OPERATIONAL", contact_number="+91 141 5163000"),
            Hospital(name="Metro Mas Hospital Mansarovar", latitude=26.8710, longitude=75.7620, available_beds=15, icu_beds=5, trauma_capacity=False, emergency_capacity=10, status="OPERATIONAL", contact_number="+91 141 2780000"),
            Hospital(name="Narayana Multispeciality Hospital", latitude=26.8120, longitude=75.8450, available_beds=28, icu_beds=9, trauma_capacity=True, emergency_capacity=18, status="OPERATIONAL", contact_number="+91 141 7122222"),
            Hospital(name="Mahatma Gandhi Hospital Sitapura", latitude=26.7720, longitude=75.8560, available_beds=50, icu_beds=14, trauma_capacity=True, emergency_capacity=35, status="OPERATIONAL", contact_number="+91 141 2771777")
        ]
        db.add_all(hospitals)
        
        print("Seeding Jaipur Ambulances...")
        ambulances = [
            Ambulance(vehicle_number="RJ-14-EA-101", driver_name="Rajesh Kumar", latitude=26.9124, longitude=75.7873, status="AVAILABLE", vehicle_type="ALS", equipment_level="ADVANCED"),
            Ambulance(vehicle_number="RJ-14-EA-102", driver_name="Suresh Sharma", latitude=26.8600, longitude=75.8100, status="AVAILABLE", vehicle_type="ICU", equipment_level="ICU_LEVEL"),
            Ambulance(vehicle_number="RJ-14-EA-103", driver_name="Vikram Singh", latitude=26.9300, longitude=75.7500, status="AVAILABLE", vehicle_type="BLS", equipment_level="BASIC"),
            Ambulance(vehicle_number="RJ-14-EA-104", driver_name="Amit Verma", latitude=26.8800, longitude=75.8300, status="AVAILABLE", vehicle_type="ALS", equipment_level="ADVANCED"),
            Ambulance(vehicle_number="RJ-14-EA-105", driver_name="Dinesh Meena", latitude=26.8400, longitude=75.7700, status="AVAILABLE", vehicle_type="ICU", equipment_level="ICU_LEVEL"),
            Ambulance(vehicle_number="RJ-14-EA-106", driver_name="Manish Sharma", latitude=26.9500, longitude=75.8000, status="AVAILABLE", vehicle_type="ALS", equipment_level="ADVANCED"),
            Ambulance(vehicle_number="RJ-14-EA-107", driver_name="Ramesh Yadav", latitude=26.8200, longitude=75.8100, status="AVAILABLE", vehicle_type="BLS", equipment_level="BASIC"),
            Ambulance(vehicle_number="RJ-14-EA-108", driver_name="Pankaj Joshi", latitude=26.8700, longitude=75.8500, status="AVAILABLE", vehicle_type="ALS", equipment_level="ADVANCED"),
            Ambulance(vehicle_number="RJ-14-EA-109", driver_name="Deepak Saini", latitude=26.9000, longitude=75.7400, status="AVAILABLE", vehicle_type="ICU", equipment_level="ICU_LEVEL"),
            Ambulance(vehicle_number="RJ-14-EA-110", driver_name="Rakesh Choudhary", latitude=26.8300, longitude=75.8300, status="AVAILABLE", vehicle_type="ALS", equipment_level="ADVANCED"),
            Ambulance(vehicle_number="RJ-14-EA-111", driver_name="Ashok Gurjar", latitude=26.9400, longitude=75.7800, status="AVAILABLE", vehicle_type="BLS", equipment_level="BASIC"),
            Ambulance(vehicle_number="RJ-14-EA-112", driver_name="Sunil Kumar", latitude=26.8850, longitude=75.7900, status="AVAILABLE", vehicle_type="ALS", equipment_level="ADVANCED"),
            Ambulance(vehicle_number="RJ-14-EA-113", driver_name="Mahendra Singh", latitude=26.8000, longitude=75.8600, status="AVAILABLE", vehicle_type="ICU", equipment_level="ICU_LEVEL"),
            Ambulance(vehicle_number="RJ-14-EA-114", driver_name="Gopal Lal", latitude=26.9200, longitude=75.8300, status="AVAILABLE", vehicle_type="BLS", equipment_level="BASIC"),
            Ambulance(vehicle_number="RJ-14-EA-115", driver_name="Vinod Sharma", latitude=26.8550, longitude=75.7850, status="AVAILABLE", vehicle_type="ALS", equipment_level="ADVANCED")
        ]
        db.add_all(ambulances)
        
        print("Seeding Historical Trips for Analytics...")
        now = datetime.utcnow()
        trips = []
        for i in range(1, 35):
            days_ago = i % 7
            t_time = 8.0 + (i * 0.4)
            p_eta = t_time + (0.5 if i % 2 == 0 else -0.3)
            dist = 4.0 + (i * 0.3)
            trips.append(Trip(
                emergency_id=i,
                ambulance_id=(i % 15) + 1,
                hospital_id=(i % 8) + 1,
                start_time=now - timedelta(days=days_ago, hours=i%12),
                completion_time=now - timedelta(days=days_ago, hours=i%12) + timedelta(minutes=int(t_time)),
                travel_time_minutes=round(t_time, 2),
                predicted_eta_minutes=round(p_eta, 2),
                distance_km=round(dist, 2),
                police_corridor_used=(i % 3 == 0)
            ))
        db.add_all(trips)
        
        db.commit()
        print("Database Seeded Successfully!")
    except Exception as e:
        db.rollback()
        print("Error seeding database:", e)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
