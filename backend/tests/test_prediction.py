import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_predict_endpoint_valid(client):
    payload = {
        "gender": "Male",
        "SeniorCitizen": 0,
        "Partner": "Yes",
        "Dependents": "No",
        "tenure": 12,
        "PhoneService": "Yes",
        "InternetService": "Fiber optic",
        "OnlineSecurity": "No",
        "OnlineBackup": "Yes",
        "TechSupport": "No",
        "StreamingTV": "Yes",
        "PaymentMethod": "Electronic check",
        "MonthlyCharges": 79.50,
        "TotalCharges": 954.00
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["prediction"] in ["Yes", "No"]
    assert isinstance(data["churn"], bool)
    assert 0.0 <= data["probability"] <= 1.0
    assert 0.0 <= data["confidence"] <= 100.0
    assert data["risk_level"] in ["Low", "Medium", "High"]


def test_predict_endpoint_invalid_input(client):
    # Negative tenure should fail pydantic validation
    payload = {
        "gender": "Male",
        "SeniorCitizen": 0,
        "Partner": "Yes",
        "Dependents": "No",
        "tenure": -5,
        "PhoneService": "Yes",
        "InternetService": "Fiber optic",
        "OnlineSecurity": "No",
        "OnlineBackup": "Yes",
        "TechSupport": "No",
        "StreamingTV": "Yes",
        "PaymentMethod": "Electronic check",
        "MonthlyCharges": 79.50,
        "TotalCharges": 954.00
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422  # Unprocessable Entity


def test_retrain_endpoint(client):
    response = client.post("/api/retrain")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "metadata" in data
    assert data["metadata"]["algorithm"] == "LogisticRegression"
