from typing import Dict, Any
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)


def evaluate_model(model, X_train, y_train, X_test, y_test) -> Dict[str, Any]:
    """
    Evaluates the fitted model pipeline on training and testing data.
    Returns calculated actual metrics without hardcoding.
    """
    train_preds = model.predict(X_train)
    test_preds = model.predict(X_test)

    train_acc = float(accuracy_score(y_train, train_preds))
    test_acc = float(accuracy_score(y_test, test_preds))

    # Calculate metrics with zero_division safety
    prec = float(precision_score(y_test, test_preds, pos_label=1, zero_division=0))
    rec = float(recall_score(y_test, test_preds, pos_label=1, zero_division=0))
    f1 = float(f1_score(y_test, test_preds, pos_label=1, zero_division=0))

    cm = confusion_matrix(y_test, test_preds).tolist()

    report_dict = classification_report(
        y_test, test_preds, target_names=["No Churn (0)", "Churn (1)"], output_dict=True, zero_division=0
    )

    return {
        "training_accuracy": round(train_acc, 4),
        "testing_accuracy": round(test_acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "classification_report": report_dict,
    }
