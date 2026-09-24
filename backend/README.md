# Customer Churn Prediction ML Backend

A complete Python + FastAPI ML application for Telco Customer Churn Prediction, powered by scikit-learn Logistic Regression.

## Overview

This project provides a REST API for Customer Churn prediction based on the Telco Customer Churn dataset.

### Core Features & Architecture
- **Excel Dataset Loading & Cleaning**: Loads `backend/data/my_dataset.xlsx`, strips whitespace, cleans categorical values, and converts numeric columns.
- **Scikit-Learn Pipeline**: Integrated `ColumnTransformer` handling numerical imputation (`SimpleImputer` median) & scaling (`StandardScaler`), alongside categorical imputation (`SimpleImputer` most_frequent) & encoding (`OneHotEncoder` with `handle_unknown="ignore"`).
- **Week 4 Production Model**: Trained with `LogisticRegression(max_iter=2000, random_state=42)` using an 80/20 stratified train/test split.
- **No Manual Scaling/Encoding for Inference**: Single saved `joblib` Pipeline handles all preprocessing + prediction end-to-end.
- **Exclusion of `customerID`**: `customerID` is strictly omitted from model features and preprocessing pipelines.
- **True ML Predictions & Probabilities**: Inference outputs actual `predict()` and `predict_proba()` results with presentation risk levels (`Low` < 0.40, `Medium` 0.40–0.70, `High` >= 0.70).
- **CORS Configured**: Pre-configured CORS support for React frontend running at `http://localhost:5173`.

---

## Installation & Setup

1. Navigate to the backend directory:
   ```bash
   cd ML-Churn-Project/backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

## Running the Backend Server

Start the FastAPI application using Uvicorn:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **FastAPI Base URL**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

---

## API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check & model load status |
| `GET` | `/api/model-info` | Detailed model metadata & algorithm information |
| `GET` | `/api/dataset-info` | Summary statistics, row/col counts & churn distribution |
| `GET` | `/api/metrics` | Model performance metrics (Accuracy, Precision, Recall, F1, Confusion Matrix) |
| `GET` | `/api/feature-options` | Dynamic unique categorical values from dataset |
| `POST` | `/api/predict` | Predict churn probability & risk level for a customer profile |
| `POST` | `/api/retrain` | Retrain model from Excel dataset and update active model |

---

## Example Prediction Request

`POST http://localhost:8000/api/predict`

```json
{
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
```

### Example Response
```json
{
  "prediction": "Yes",
  "churn": true,
  "probability": 0.7312,
  "confidence": 73.12,
  "risk_level": "High"
}
```

---

## Running Automated Tests

Run the test suite using pytest:
```bash
pytest tests/
```
