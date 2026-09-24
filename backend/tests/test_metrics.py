import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_model_info_endpoint(client):
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert data["algorithm"] == "LogisticRegression"
    assert "training_accuracy" in data
    assert "testing_accuracy" in data


def test_dataset_info_endpoint(client):
    response = client.get("/api/dataset-info")
    assert response.status_code == 200
    data = response.json()
    assert data["total_rows"] > 0
    assert data["total_columns"] >= 16
    assert "churn_distribution" in data


def test_metrics_endpoint(client):
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert "precision" in data
    assert "recall" in data
    assert "f1_score" in data
    assert "confusion_matrix" in data


def test_feature_options_endpoint(client):
    response = client.get("/api/feature-options")
    assert response.status_code == 200
    data = response.json()
    assert "gender" in data
    assert "InternetService" in data
    assert isinstance(data["gender"], list)
