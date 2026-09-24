import json
from pathlib import Path
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
import pandas as pd

from app.config import (
    MODELS_DIR,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    TARGET_COLUMN,
    FINAL_METADATA_FILENAME,
    MODEL_COMPARISON_FILENAME,
    CROSS_VALIDATION_FILENAME,
    OVERFITTING_FILENAME,
    TUNING_RESULTS_FILENAME,
    ADVANCED_MODELS_FILENAME,
    ROC_CURVES_FILENAME,
    PR_CURVES_FILENAME,
)
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.ml.predictor import predictor_instance
from app.ml.data_loader import load_raw_dataset
from app.ml.trainer import train_and_save_model

router = APIRouter()


def _read_json_artifact(filename: str) -> Any:
    file_path = MODELS_DIR / filename
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Artifact file '{filename}' not found. Please trigger model retraining.",
        )
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading artifact '{filename}': {str(e)}",
        )


@router.get("/", summary="Root API Welcome", tags=["General"])
def root():
    """Welcome endpoint confirming the API is operational."""
    return {
        "message": "Customer Churn Prediction API is running successfully",
        "status": "online",
        "docs_url": "/docs",
        "health_check": "/health",
        "version": "1.0.0",
    }


@router.get("/health", summary="Health Check", tags=["Health"])
def health_check():
    """Returns operational status and model loading state."""
    return {
        "status": "ok",
        "model_loaded": predictor_instance.is_loaded,
    }


@router.get("/api/model-info", summary="Get Model Details", tags=["Model & Dataset"])
def get_model_info():
    """Returns model metadata, algorithm details, dataset sizes, and feature lists."""
    if not predictor_instance.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model is not loaded. Train the model first.",
        )
    return predictor_instance.metadata


@router.get("/api/dataset-info", summary="Get Dataset Summary", tags=["Model & Dataset"])
def get_dataset_info():
    """Returns summary statistics for the Telco dataset from backend Excel file."""
    try:
        df = load_raw_dataset()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load dataset: {str(e)}",
        )

    missing_values = df.isnull().sum().to_dict()
    churn_counts = {}
    if TARGET_COLUMN in df.columns:
        churn_counts = df[TARGET_COLUMN].value_counts().to_dict()

    numeric_df = df[NUMERICAL_FEATURES].copy()
    for col in NUMERICAL_FEATURES:
        numeric_df[col] = pd.to_numeric(numeric_df[col], errors="coerce")

    describe_dict = numeric_df.describe().round(2).to_dict()

    return {
        "total_rows": int(len(df)),
        "total_columns": int(len(df.columns)),
        "column_names": list(df.columns),
        "missing_values": missing_values,
        "churn_distribution": churn_counts,
        "numerical_summaries": describe_dict,
    }


@router.get("/api/metrics", summary="Get Model Evaluation Metrics", tags=["Requirement 1: Model Evaluation"])
def get_metrics():
    """Returns classification evaluation metrics for the active model."""
    meta = predictor_instance.metadata
    if not meta:
        final_meta = _read_json_artifact(FINAL_METADATA_FILENAME)
        return final_meta.get("final_test_metrics", {})
    
    return {
        "accuracy": meta.get("testing_accuracy") or meta.get("final_test_metrics", {}).get("accuracy"),
        "precision": meta.get("precision") or meta.get("final_test_metrics", {}).get("precision"),
        "recall": meta.get("recall") or meta.get("final_test_metrics", {}).get("recall"),
        "f1_score": meta.get("f1_score") or meta.get("final_test_metrics", {}).get("f1_score"),
        "roc_auc": meta.get("roc_auc") or meta.get("final_test_metrics", {}).get("roc_auc"),
        "confusion_matrix": meta.get("confusion_matrix") or meta.get("final_test_metrics", {}).get("confusion_matrix"),
        "classification_report": meta.get("classification_report") or meta.get("final_test_metrics", {}).get("classification_report"),
    }


@router.get("/api/model-evaluation", summary="Requirement 1: Detailed Model Evaluation", tags=["Requirement 1: Model Evaluation"])
def get_model_evaluation():
    """Returns comprehensive test metrics, confusion matrix, and classification report for the final selected model."""
    return _read_json_artifact(FINAL_METADATA_FILENAME)


@router.get("/api/overfitting", summary="Requirement 2: Overfitting/Underfitting Diagnosis", tags=["Requirement 2: Overfitting / Underfitting"])
def get_overfitting_analysis():
    """Returns training vs test gaps and diagnostic classifications for all models."""
    return _read_json_artifact(OVERFITTING_FILENAME)


@router.get("/api/cross-validation", summary="Requirement 3: 5-Fold Cross Validation", tags=["Requirement 3: 5-Fold Cross Validation"])
def get_cross_validation_results():
    """Returns per-fold scores, mean, and standard deviation for 5-Fold Cross-Validation on training data."""
    return _read_json_artifact(CROSS_VALIDATION_FILENAME)


@router.get("/api/model-comparison", summary="Requirement 4: Model Comparison Table", tags=["Requirement 4: Compare All Models"])
def get_model_comparison():
    """Returns comparison matrix across all tested baseline models."""
    return _read_json_artifact(MODEL_COMPARISON_FILENAME)


@router.get("/api/hyperparameter-tuning", summary="Requirement 5: Hyperparameter Tuning Results", tags=["Requirement 5: Hyperparameter Tuning"])
def get_hyperparameter_tuning():
    """Returns optimal hyperparameter parameters, CV scores, and tuning durations from GridSearchCV."""
    return _read_json_artifact(TUNING_RESULTS_FILENAME)


@router.get("/api/advanced-models", summary="Requirement 6: Advanced & Ensemble Models", tags=["Requirement 6: Try Advanced Models"])
def get_advanced_models():
    """Returns evaluation metrics for advanced ensemble models (Random Forest, Gradient Boosting, HistGradientBoosting, XGBoost)."""
    return _read_json_artifact(ADVANCED_MODELS_FILENAME)


@router.get("/api/roc-curve", summary="ROC Curve Data", tags=["Requirement 1: Model Evaluation"])
def get_roc_curve_data():
    """Returns ROC curve False Positive Rate (FPR) and True Positive Rate (TPR) data points."""
    return _read_json_artifact(ROC_CURVES_FILENAME)


@router.get("/api/precision-recall", summary="Precision-Recall Curve Data", tags=["Requirement 1: Model Evaluation"])
def get_precision_recall_data():
    """Returns Precision-Recall curve data points."""
    return _read_json_artifact(PR_CURVES_FILENAME)


@router.get("/api/final-model", summary="Final Production Model Metadata", tags=["Model Selection"])
def get_final_model():
    """Returns details and evaluation metrics for the selected production model."""
    return _read_json_artifact(FINAL_METADATA_FILENAME)


@router.get("/api/feature-options", summary="Get Categorical Feature Options", tags=["Model & Dataset"])
def get_feature_options():
    """Returns sorted unique values for categorical features dynamically retrieved from the dataset."""
    try:
        df = load_raw_dataset()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load dataset: {str(e)}",
        )

    feature_options: Dict[str, list] = {}
    for cat_feature in CATEGORICAL_FEATURES:
        if cat_feature in df.columns:
            unique_vals = (
                df[cat_feature].astype(str).str.strip().unique().tolist()
            )
            unique_vals = sorted([v for v in unique_vals if v and v.lower() != "nan"])
            feature_options[cat_feature] = unique_vals

    return feature_options


@router.post(
    "/api/predict",
    response_model=PredictionResponse,
    summary="Predict Customer Churn",
    tags=["Prediction"],
)
def predict_churn(request: PredictionRequest):
    """
    Accepts customer profile parameters and predicts churn probability using the final selected model pipeline.
    Returns prediction ('Yes'/'No'), probability, confidence percentage, risk level, and model name.
    """
    if not predictor_instance.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded. Please train or reload model.",
        )

    try:
        input_data = request.model_dump()
        result = predictor_instance.predict(input_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prediction failed: {str(e)}",
        )


@router.post("/api/retrain", summary="Retrain All Models & Execute ML Workflow", tags=["Model & Dataset"])
def retrain_model():
    """
    Triggers complete ML workflow retraining:
    Loads Excel -> Validates -> Split -> Preprocesses -> Baselines -> 5-Fold CV ->
    Overfitting Analysis -> Comparison -> Hyperparameter Tuning -> Advanced Models ->
    Model Selection -> Untouched Test Set Evaluation -> Persists Models & JSON Artifacts.
    """
    try:
        pipeline, metadata = train_and_save_model()
        reloaded = predictor_instance.load_model()
        if not reloaded:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Model retrained but failed to reload in predictor service.",
            )
        return {
            "message": "Complete ML workflow executed and saved successfully.",
            "metadata": metadata,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Retraining workflow failed: {str(e)}",
        )
