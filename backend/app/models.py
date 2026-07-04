from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class WebhookSubscription(BaseModel):
    url: str
    events: List[str] = Field(default_factory=lambda: ["analysis.completed", "analysis.failed"])

class AnalysisRequest(BaseModel):
    video_url: Optional[str] = None
    callback_url: Optional[str] = None

class BatchAnalysisRequest(BaseModel):
    videos: List[str]
    callback_url: Optional[str] = None

class FrameEvidence(BaseModel):
    frame_number: int
    timestamp: float
    confidence: float
    prediction: str
    risk_level: str
    box: Optional[List[int]] = None  # [x, y, w, h] face bounding box
    anomaly_type: Optional[str] = None

class AnalysisResult(BaseModel):
    id: str
    filename: str
    status: str  # "queued", "processing", "completed", "failed"
    prediction: str  # "AI-Generated", "Authentic"
    trust_score: float  # 0.0 to 100.0
    confidence: float  # 0.0 to 1.0
    risk_level: str  # "Low", "Medium", "High"
    explanation: str
    evidence: List[FrameEvidence]
    suspicious_timestamps: List[float]
    processing_time: float
    recommendations: List[str]
    created_at: str
    completed_at: Optional[str] = None
    error: Optional[str] = None

class QueueStatus(BaseModel):
    queued_count: int
    processing_count: int
    completed_count: int
    failed_count: int

class DashboardStats(BaseModel):
    total_scanned: int
    average_trust_score: float
    high_risk_count: int
    queue_size: int
    recent_analyses: List[AnalysisResult]
    trust_distribution: Dict[str, int]  # e.g., {"0-20": 5, "21-40": 12, ...}
    daily_trends: List[Dict[str, Any]]  # e.g., [{"date": "2026-07-01", "scanned": 15, "ai_detected": 4}]
    audit_logs: List[Dict[str, Any]]
