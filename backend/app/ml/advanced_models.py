import time
from typing import Dict, Any, List
from sklearn.pipeline import Pipeline
from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingClassifier,
    HistGradientBoostingClassifier,
)

from app.ml.preprocessing import create_preprocessor
from app.ml.evaluation import evaluate_model
from app.ml.cross_validation import run_5fold_cv


def evaluate_advanced_models(X_train, X_test, y_train, y_test) -> Dict[str, Any]:
    """
    Evaluates advanced and ensemble model architectures.
    Models tested:
    1. Random Forest Classifier
    2. Gradient Boosting Classifier
    3. HistGradientBoosting Classifier
    4. XGBoost Classifier (Optional, handled gracefully if not installed)
    """
    advanced_classifiers = {
        "Random Forest": RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=150, learning_rate=0.1, random_state=42),
        "HistGradientBoosting": HistGradientBoostingClassifier(random_state=42),
    }

    # Attempt to load XGBoost if installed
    xgb_available = False
    try:
        from xgboost import XGBClassifier
        advanced_classifiers["XGBoost"] = XGBClassifier(
            n_estimators=150, learning_rate=0.1, random_state=42, eval_metric="logloss"
        )
        xgb_available = True
    except ImportError:
        xgb_available = False

    advanced_summary: List[Dict[str, Any]] = []
    detailed_models: Dict[str, Any] = {}

    for name, classifier in advanced_classifiers.items():
        pipeline = Pipeline(
            steps=[
                ("preprocessor", create_preprocessor()),
                ("classifier", classifier),
            ]
        )

        start_time = time.time()
        pipeline.fit(X_train, y_train)
        fit_time = round(time.time() - start_time, 4)

        eval_metrics = evaluate_model(pipeline, X_train, y_train, X_test, y_test)
        cv_metrics = run_5fold_cv(pipeline, X_train, y_train)

        model_info = {
            "model": name,
            "is_available": True,
            "training_accuracy": eval_metrics["training_accuracy"],
            "test_accuracy": eval_metrics["testing_accuracy"],
            "cv_f1_mean": cv_metrics["f1"]["mean"],
            "cv_f1_std": cv_metrics["f1"]["std"],
            "precision": eval_metrics["precision"],
            "recall": eval_metrics["recall"],
            "f1": eval_metrics["f1_score"],
            "roc_auc": eval_metrics["roc_auc"],
            "training_time": fit_time,
            "description": _get_model_description(name),
        }

        advanced_summary.append(model_info)
        detailed_models[name] = {
            "summary": model_info,
            "metrics": eval_metrics,
            "cross_validation": cv_metrics,
        }

    # Add optional XGBoost note if unavailable
    if not xgb_available:
        advanced_summary.append(
            {
                "model": "XGBoost",
                "is_available": False,
                "note": "XGBoost package is optional and not installed in current environment. Application continues smoothly using HistGradientBoosting and scikit-learn ensembles.",
                "description": "Extreme Gradient Boosting implementation.",
            }
        )

    return {
        "models": advanced_summary,
        "details": detailed_models,
        "xgb_installed": xgb_available,
    }


def _get_model_description(name: str) -> str:
    descriptions = {
        "Random Forest": "Ensemble of decision trees trained with bagging and feature randomness to reduce variance.",
        "Gradient Boosting": "Sequential ensemble building trees sequentially to minimize residual loss.",
        "HistGradientBoosting": "High-performance histogram-based gradient boosting, optimized for speed and large datasets.",
        "XGBoost": "Scalable, regularized gradient boosted decision tree library.",
    }
    return descriptions.get(name, "Advanced ensemble classifier.")
