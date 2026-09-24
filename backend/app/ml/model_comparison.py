import time
from typing import Dict, Any, List
from sklearn.pipeline import Pipeline

from app.ml.preprocessing import create_preprocessor
from app.ml.baseline_models import get_baseline_classifiers
from app.ml.evaluation import evaluate_model
from app.ml.cross_validation import run_5fold_cv
from app.ml.overfitting import diagnose_overfitting


def compare_all_baseline_models(X_train, X_test, y_train, y_test) -> Dict[str, Any]:
    """
    Evaluates all baseline models, computes 5-fold cross-validation, overfitting diagnosis,
    and returns a structured comparison table and per-model results.
    """
    classifiers = get_baseline_classifiers()
    comparison_table: List[Dict[str, Any]] = []
    detailed_results: Dict[str, Dict[str, Any]] = {}

    for name, classifier in classifiers.items():
        preprocessor = create_preprocessor()
        pipeline = Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("classifier", classifier),
            ]
        )

        # Measure training time
        start_train = time.time()
        pipeline.fit(X_train, y_train)
        training_time = round(time.time() - start_train, 4)

        # Measure prediction time
        start_pred = time.time()
        _ = pipeline.predict(X_test)
        prediction_time = round(time.time() - start_pred, 4)

        # Full test evaluation
        eval_metrics = evaluate_model(pipeline, X_train, y_train, X_test, y_test)

        # 5-fold CV on training data
        cv_metrics = run_5fold_cv(pipeline, X_train, y_train)

        # Overfitting diagnosis
        overfit_diag = diagnose_overfitting(
            training_score=eval_metrics["training_accuracy"],
            test_score=eval_metrics["testing_accuracy"],
            cv_mean=cv_metrics["accuracy"]["mean"],
            cv_std=cv_metrics["accuracy"]["std"],
        )

        row = {
            "model": name,
            "train_accuracy": eval_metrics["training_accuracy"],
            "test_accuracy": eval_metrics["testing_accuracy"],
            "cv_accuracy_mean": cv_metrics["accuracy"]["mean"],
            "cv_accuracy_std": cv_metrics["accuracy"]["std"],
            "precision": eval_metrics["precision"],
            "recall": eval_metrics["recall"],
            "f1": eval_metrics["f1_score"],
            "roc_auc": eval_metrics["roc_auc"],
            "train_test_gap": overfit_diag["train_test_gap"],
            "diagnosis": overfit_diag["diagnosis"],
            "training_time": training_time,
            "prediction_time": prediction_time,
        }
        comparison_table.append(row)

        detailed_results[name] = {
            "model_name": name,
            "metrics": eval_metrics,
            "cross_validation": cv_metrics,
            "overfitting": overfit_diag,
            "training_time": training_time,
            "prediction_time": prediction_time,
        }

    return {
        "comparison_table": comparison_table,
        "detailed_results": detailed_results,
    }
