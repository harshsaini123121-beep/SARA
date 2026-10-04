@echo off
TITLE S.A.R.A. Emergency Response System Launcher

echo ========================================================
echo   S.A.R.A. - Smart AI Rescue & Ambulance Routing Assistant
echo ========================================================
echo.

set PATH=C:\Users\pawan\node\node-v20.18.0-win-x64;%PATH%

echo [1/3] Training S.A.R.A. ML Suite Models (ETA, Triage, Hotspots, Green Corridor)...
cd ml
py train_model.py
py train_triage_model.py
py train_hotspot_model.py
py train_corridor_model.py
cd ..


echo [2/3] Starting FastAPI Backend on http://localhost:8000 ...
start "SARA Backend" cmd /k "cd backend && py -m uvicorn app.main:app --reload --port 8000"

echo [3/3] Starting React Vite Frontend on http://localhost:5173 ...
start "SARA Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo S.A.R.A. system launched successfully!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000/docs
echo ========================================================
