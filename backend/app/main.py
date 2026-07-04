import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.endpoints import router as api_router

app = FastAPI(
    title="TruthLens AI Backend",
    description="Enterprise API and AI Inference Service for detecting synthetic media.",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "*"  # Allow all for development flexibility
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static directories if they don't exist
os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/reports", exist_ok=True)

# Mount static folder for serving reports directly (optional, since we have FileResponse)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include Router
app.include_router(api_router)

@app.get("/")
def read_root():
    return {
        "app": "TruthLens AI API Service",
        "status": "healthy",
        "version": "1.0.0",
        "documentation": "/docs",
        "endpoints": {
            "analyze": "POST /api/analyze",
            "batch": "POST /api/batch",
            "result": "GET /api/result/{id}",
            "report": "GET /api/report/{id}",
            "stats": "GET /api/stats",
            "webhook": "POST /api/webhook"
        }
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
