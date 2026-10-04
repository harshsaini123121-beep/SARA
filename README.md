# S.A.R.A. — Smart AI Rescue & Ambulance Routing Assistant

> **"Intelligent Emergency Response. Faster Decisions. Smarter Routes."**

S.A.R.A. is an advanced AI-powered emergency response coordination platform designed for emergency operations centers. It combines machine learning travel-time prediction, multi-vehicle dispatch optimization, hospital capacity-matching, route calculation, and police green-corridor priority simulation.

---

## 🏛️ System Logic & Sequence of Operations

The order of emergency operations is strictly enforced across backend services and frontend interfaces:

```text
Emergency Intake
   ↓
Patient count & severity assessment (1-5+ patients)
   ↓
Locate available ambulances (ALS, BLS, ICU level)
   ↓
AI Ambulance Recommendation (RandomForest ETA + Scoring)
   ↓
Check hospital bed & ICU capacity
   ↓
AI Hospital Recommendation (ICU & Trauma matching)
   ↓
Calculate exact route (Ambulance → Patient → Hospital)
   ↓
Assess emergency priority (CRITICAL / Mass Casualty)
   ↓
Transmit confirmed route to Police Control Room
   ↓
Police acknowledge request & activate green corridor
   ↓
Ambulance trip tracking & Hospital intake alert
   ↓
Patient arrival & Emergency completion
```

---

## 👥 User Roles & Demo Credentials

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **ADMIN / CONTROL ROOM** | `admin@sara.ai` | `admin123` | Create emergency, view live Leaflet map, run AI analysis, dispatch ambulances, trigger simulation |
| **POLICE CONTROL ROOM** | `police@sara.ai` | `police123` | View incoming critical alerts, inspect confirmed routes, acknowledge requests, activate green corridor |
| **HOSPITAL DESK** | `hospital@sara.ai` | `hospital123` | View incoming ambulances, accept patient intake, update emergency beds & ICU capacity |
| **AMBULANCE DRIVER** | `driver@sara.ai` | `driver123` | On-board driver stepper (Start trip → Arrived at patient → Start hospital route → Completed) |

---

## 🤖 Machine Learning Engine

- **Task**: Ambulance Travel Time / ETA Prediction
- **Algorithm**: `RandomForestRegressor` (`n_estimators=100`, `max_depth=15`)
- **Dataset**: 12,000 synthetic transit records generated with physical traffic multipliers around Jaipur, India.
- **Features**: `distance_km`, `traffic_level` (LOW, MEDIUM, HIGH, SEVERE), `hour_of_day`, `day_of_week`, `weather_condition` (CLEAR, RAIN, FOG), `road_type` (URBAN, HIGHWAY, NARROW).
- **Target**: `travel_time_minutes`
- **Performance Metrics**:
  - **MAE**: 3.38 minutes
  - **RMSE**: 5.64 minutes
  - **R² Score**: 0.9703

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Leaflet, React-Leaflet, Recharts, Lucide React, Axios.
- **Backend**: Python 3.13, FastAPI, SQLAlchemy, Pydantic v2, PyJWT, Passlib, WebSockets, Uvicorn.
- **Machine Learning**: Scikit-Learn, Pandas, NumPy, Joblib.
- **Database**: SQLite (`sara.db`) with SQLAlchemy ORM (PostgreSQL-ready).
- **Geographic Focus**: Jaipur, Rajasthan, India (SMS Hospital, Fortis, Eternal, Apex, etc.).

---

## 🚀 Installation & Running

### Windows Quick Launcher
Double-click `start.bat` or run:
```cmd
start.bat
```

### Manual Execution

#### 1. Train ML Model
```bash
cd ml
py train_model.py
```

#### 2. Start Backend API
```bash
cd backend
py -m uvicorn app.main:app --reload --port 8000
```
Backend API docs available at: `http://localhost:8000/docs`

#### 3. Start Frontend UI
```bash
cd frontend
npm run dev
```
Frontend available at: `http://localhost:5173`

---

## ⚠️ Academic Disclaimer

> **S.A.R.A.** is an academic decision-support prototype using synthetic/demo data centered around Jaipur, Rajasthan. It is not a certified real-world emergency dispatch system and does not directly connect to government traffic signals or emergency services.
