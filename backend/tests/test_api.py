import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.endpoints import analyses_db

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert "app" in response.json()

def test_stats_endpoint():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_scanned" in data
    assert "average_trust_score" in data
    assert "high_risk_count" in data
    assert "recent_analyses" in data
    assert len(data["recent_analyses"]) > 0

def test_get_result_not_found():
    response = client.get("/api/result/nonexistent-id")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_get_mock_result():
    # Retrieve one of the pre-populated mock results
    mock_id = "mock-analysis-1"
    response = client.get(f"/api/result/{mock_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == mock_id
    assert data["status"] == "completed"
    assert data["prediction"] == "AI-Generated"
    assert "explanation" in data
    assert "evidence" in data

def test_get_report_download():
    mock_id = "mock-analysis-1"
    response = client.get(f"/api/report/{mock_id}")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"

def test_webhook_receiver():
    payload = {
        "event": "analysis.completed",
        "data": {
            "id": "test-id",
            "prediction": "Authentic",
            "trust_score": 95.0
        }
    }
    response = client.post("/api/webhook", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "received"
