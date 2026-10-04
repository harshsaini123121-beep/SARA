import os
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import Base, engine, SessionLocal
from app.database.seed import seed_database
from app.models.models import User
from app.api import (
    auth,
    dashboard,
    ambulances,
    hospitals,
    emergencies,
    optimizers,
    police,
    ml_api,
    analytics,
    simulation
)

app = FastAPI(
    title="S.A.R.A. API",
    description="Smart AI Rescue & Ambulance Routing Assistant Backend API",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(ambulances.router)
app.include_router(hospitals.router)
app.include_router(emergencies.router)
app.include_router(optimizers.router)
app.include_router(police.router)
app.include_router(ml_api.router)
app.include_router(analytics.router)
app.include_router(simulation.router)

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast({"event": "PING", "data": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            print("Auto-seeding database on first startup...")
            seed_database()
    except Exception as e:
        print("Startup seed check:", e)
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "app": "S.A.R.A.",
        "name": "Smart AI Rescue & Ambulance Routing Assistant",
        "status": "RUNNING",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
