import json
import os
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
import joblib
from sklearn.pipeline import Pipeline

from app.config import (
    MODELS_DIR,
    MODEL_FILENAME,
    FINAL_METADATA_FILENAME,
    MODEL_COMPARISON_FILENAME,
    CROSS_VALIDATION_FILENAME,
    OVERFITTING_FILENAME,
    TUNING_RESULTS_FILENAME,
    ADVANCED_MODELS_FILENAME,
    ROC_CURVES_FILENAME,
    PR_CURVES_FILENAME,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
)
from app.ml.evaluation import evaluate_model
from app.ml.cross_validation import run_5fold_cv


def select_and_save_final_model(
    baseline_results: Dict[str, Any],
    tuning_results: Dict[str, Any],
    advanced_results: Dict[str, Any],
    X_train,
    X_test,
    y_train,
    y_test,
    df_raw,
) -> Tuple[Pipeline, Dict[str, Any]]:
    """
    Selects the best performing model pipeline based on CV F1 score on training data.
    Then performs ONE final evaluation on the untouched test set.
    Saves churn_model.joblib and all corresponding JSON artifacts.
    """
    candidates = []

    # 1. Baseline candidates
    for row in baseline_results["comparison_table"]:
        model_name = row["model"]
        detailed = baseline_results["detailed_results"][model_name]
        cv_f1 = detailed["cross_validation"]["f1"]["mean"]
        cv_roc = detailed["cross_validation"]["roc_auc"]["mean"]
        candidates.append(
            {
                "source": "baseline",
                "name": model_name,
                "cv_f1": cv_f1,
                "cv_roc": cv_roc,
                "pipeline_provider": lambda m=model_name: _build_baseline_pipeline(m, baseline_results),
            }
        )

    # 2. Tuned candidates
    for model_name, detailed in tuning_results["detailed_tuned_models"].items():
        candidates.append(
            {
                "source": "tuned",
                "name": f"{model_name} (Tuned)",
                "cv_f1": detailed["best_cv_score"],
                "cv_roc": detailed["test_roc_auc"],
                "pipeline": detailed["pipeline"],
            }
        )

    # Sort candidates by CV F1 score (descending), then CV ROC-AUC
    candidates.sort(key=lambda c: (c["cv_f1"], c["cv_roc"]), reverse=True)
    winner = candidates[0]

    selected_model_name = winner["name"]
    if "pipeline" in winner:
        final_pipeline = winner["pipeline"]
    else:
        final_pipeline = winner["pipeline_provider"]()

    # Perform ONE final evaluation on untouched test set
    final_test_metrics = evaluate_model(final_pipeline, X_train, y_train, X_test, y_test)
    final_cv_metrics = run_5fold_cv(final_pipeline, X_train, y_train)

    timestamp = datetime.now(timezone.utc).isoformat()

    final_metadata = {
        "final_model_name": selected_model_name,
        "selection_source": winner["source"],
        "selection_criterion": "Highest 5-Fold Cross-Validation F1 Score on Training Data",
        "dataset_info": {
            "total_rows": int(len(df_raw)),
            "total_columns": int(len(df_raw.columns)),
            "features_used": list(X_train.columns),
            "numerical_features": NUMERICAL_FEATURES,
            "categorical_features": CATEGORICAL_FEATURES,
        },
        "validation_cv_metrics": {
            "cv_f1_mean": final_cv_metrics["f1"]["mean"],
            "cv_f1_std": final_cv_metrics["f1"]["std"],
            "cv_accuracy_mean": final_cv_metrics["accuracy"]["mean"],
            "cv_roc_auc_mean": final_cv_metrics["roc_auc"]["mean"],
        },
        "final_test_metrics": {
            "accuracy": final_test_metrics["testing_accuracy"],
            "precision": final_test_metrics["precision"],
            "recall": final_test_metrics["recall"],
            "f1_score": final_test_metrics["f1_score"],
            "roc_auc": final_test_metrics["roc_auc"],
            "specificity": final_test_metrics["specificity"],
            "balanced_accuracy": final_test_metrics["balanced_accuracy"],
            "confusion_matrix": final_test_metrics["confusion_matrix"],
            "classification_report": final_test_metrics["classification_report"],
        },
        "training_timestamp": timestamp,
    }

    # Ensure models output directory exists
    os.makedirs(MODELS_DIR, exist_ok=True)

    # Save joblib model pipeline
    model_path = MODELS_DIR / MODEL_FILENAME
    joblib.dump(final_pipeline, model_path)

    # Save final metadata JSON
    with open(MODELS_DIR / FINAL_METADATA_FILENAME, "w", encoding="utf-8") as f:
        json.dump(final_metadata, f, indent=2)

    # Save legacy metadata.json for backward compatibility
    with open(MODELS_DIR / "model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(
            {
                "model_name": selected_model_name,
                "algorithm": selected_model_name,
                "dataset_rows": int(len(df_raw)),
                "dataset_columns": int(len(df_raw.columns)),
                "feature_names": list(X_train.columns),
                "numerical_features": NUMERICAL_FEATURES,
                "categorical_features": CATEGORICAL_FEATURES,
                "training_accuracy": final_test_metrics["training_accuracy"],
                "testing_accuracy": final_test_metrics["testing_accuracy"],
                "precision": final_test_metrics["precision"],
                "recall": final_test_metrics["recall"],
                "f1_score": final_test_metrics["f1_score"],
                "roc_auc": final_test_metrics["roc_auc"],
                "confusion_matrix": final_test_metrics["confusion_matrix"]["matrix"],
                "classification_report": final_test_metrics["classification_report"],
                "training_timestamp": timestamp,
            },
            f,
            indent=2,
        )

    # Save individual artifact JSON files
    with open(MODELS_DIR / MODEL_COMPARISON_FILENAME, "w", encoding="utf-8") as f:
        json.dump(baseline_results["comparison_table"], f, indent=2)

    with open(MODELS_DIR / CROSS_VALIDATION_FILENAME, "w", encoding="utf-8") as f:
        cv_summary = {
            model_name: res["cross_validation"]
            for model_name, res in baseline_results["detailed_results"].items()
        }
        json.dump(cv_summary, f, indent=2)

    with open(MODELS_DIR / OVERFITTING_FILENAME, "w", encoding="utf-8") as f:
        overfit_summary = {
            model_name: res["overfitting"]
            for model_name, res in baseline_results["detailed_results"].items()
        }
        json.dump(overfit_summary, f, indent=2)

    with open(MODELS_DIR / TUNING_RESULTS_FILENAME, "w", encoding="utf-8") as f:
        json.dump(tuning_results["summary"], f, indent=2)

    with open(MODELS_DIR / ADVANCED_MODELS_FILENAME, "w", encoding="utf-8") as f:
        json.dump(advanced_results["models"], f, indent=2)

    # Collect ROC & PR curves for all baseline models
    roc_curves_dict = {}
    pr_curves_dict = {}
    for model_name, res in baseline_results["detailed_results"].items():
        roc_curves_dict[model_name] = res["metrics"]["roc_curve"]
        pr_curves_dict[model_name] = res["metrics"]["precision_recall_curve"]

    with open(MODELS_DIR / ROC_CURVES_FILENAME, "w", encoding="utf-8") as f:
        json.dump(roc_curves_dict, f, indent=2)

    with open(MODELS_DIR / PR_CURVES_FILENAME, "w", encoding="utf-8") as f:
        json.dump(pr_curves_dict, f, indent=2)

    return final_pipeline, final_metadata


def _build_baseline_pipeline(model_name: str, baseline_results: Dict[str, Any]):
    from app.ml.preprocessing import create_preprocessor
    from app.ml.baseline_models import get_baseline_classifiers

    classifiers = get_baseline_classifiers()
    classifier = classifiers[model_name]
    pipeline = Pipeline(
        steps=[
            ("preprocessor", create_preprocessor()),
            ("classifier", classifier),
        ]
    )
    return pipeline
