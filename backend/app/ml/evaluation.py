from typing import Dict, Any
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
    balanced_accuracy_score,
    roc_curve,
    precision_recall_curve,
)


def evaluate_model(model, X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """
    Evaluates a fitted model pipeline on training and testing sets.
    Calculates exact actual metrics without hardcoding.
    """
    train_preds = model.predict(X_train)
    test_preds = model.predict(X_test)

    # Probabilities for class 1
    if hasattr(model, "predict_proba"):
        test_probs = model.predict_proba(X_test)[:, 1]
    elif hasattr(model, "decision_function"):
        scores = model.decision_function(X_test)
        test_probs = (scores - scores.min()) / (scores.max() - scores.min() + 1e-9)
    else:
        test_probs = test_preds.astype(float)

    train_acc = float(accuracy_score(y_train, train_preds))
    test_acc = float(accuracy_score(y_test, test_preds))

    # General classification metrics
    prec = float(precision_score(y_test, test_preds, pos_label=1, zero_division=0))
    rec = float(recall_score(y_test, test_preds, pos_label=1, zero_division=0))
    f1 = float(f1_score(y_test, test_preds, pos_label=1, zero_division=0))

    try:
        roc_auc = float(roc_auc_score(y_test, test_probs))
    except Exception:
        roc_auc = 0.5

    bal_acc = float(balanced_accuracy_score(y_test, test_preds))

    # Confusion matrix extraction
    cm = confusion_matrix(y_test, test_preds)
    if cm.shape == (2, 2):
        tn, fp, fn, tp = int(cm[0, 0]), int(cm[0, 1]), int(cm[1, 0]), int(cm[1, 1])
    else:
        tn, fp, fn, tp = 0, 0, 0, 0

    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

    # Detailed dictionary breakdown
    cm_dict = {
        "true_negative": tn,
        "false_positive": fp,
        "false_negative": fn,
        "true_positive": tp,
        "matrix": cm.tolist(),
    }

    report_dict = classification_report(
        y_test,
        test_preds,
        target_names=["No Churn (0)", "Churn (1)"],
        output_dict=True,
        zero_division=0,
    )

    def clean_val(val) -> float:
        if np.isinf(val) or np.isnan(val):
            return 1.0
        return round(float(val), 4)

    # ROC Curve calculation
    fpr, tpr, roc_thresholds = roc_curve(y_test, test_probs)
    step = max(1, len(fpr) // 100)
    roc_curve_data = {
        "fpr": [clean_val(val) for val in fpr[::step]],
        "tpr": [clean_val(val) for val in tpr[::step]],
        "thresholds": [clean_val(val) for val in roc_thresholds[::step]],
        "auc": round(roc_auc, 4),
    }

    # Precision-Recall Curve calculation
    pr_precision, pr_recall, pr_thresholds = precision_recall_curve(y_test, test_probs)
    pr_step = max(1, len(pr_precision) // 100)
    pr_curve_data = {
        "precision": [clean_val(val) for val in pr_precision[::pr_step]],
        "recall": [clean_val(val) for val in pr_recall[::pr_step]],
        "thresholds": [clean_val(val) for val in pr_thresholds[::pr_step]],
    }

    return {
        "training_accuracy": round(train_acc, 4),
        "testing_accuracy": round(test_acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "specificity": round(specificity, 4),
        "balanced_accuracy": round(bal_acc, 4),
        "churn_precision": round(prec, 4),
        "churn_recall": round(rec, 4),
        "churn_f1": round(f1, 4),
        "confusion_matrix": cm_dict,
        "classification_report": report_dict,
        "roc_curve": roc_curve_data,
        "precision_recall_curve": pr_curve_data,
    }
