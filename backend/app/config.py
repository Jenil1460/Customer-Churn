import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

DEFAULT_EXCEL_FILENAME = "my_dataset.xlsx"
MODEL_FILENAME = "churn_model.joblib"
METADATA_FILENAME = "model_metadata.json"
FINAL_METADATA_FILENAME = "final_model_metadata.json"
MODEL_COMPARISON_FILENAME = "model_comparison.json"
CROSS_VALIDATION_FILENAME = "cross_validation_results.json"
OVERFITTING_FILENAME = "overfitting_analysis.json"
TUNING_RESULTS_FILENAME = "tuning_results.json"
ADVANCED_MODELS_FILENAME = "advanced_models.json"
ROC_CURVES_FILENAME = "roc_curves.json"
PR_CURVES_FILENAME = "pr_curves.json"

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Core Feature Definitions
NUMERICAL_FEATURES = ["SeniorCitizen", "tenure", "MonthlyCharges", "TotalCharges"]

CATEGORICAL_FEATURES = [
    "gender",
    "Partner",
    "Dependents",
    "PhoneService",
    "InternetService",
    "OnlineSecurity",
    "OnlineBackup",
    "TechSupport",
    "StreamingTV",
    "PaymentMethod",
]

TARGET_COLUMN = "Churn"
ID_COLUMN = "customerID"

