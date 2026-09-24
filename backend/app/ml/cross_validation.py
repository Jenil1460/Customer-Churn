from typing import Dict, Any
import numpy as np
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)
from sklearn.base import clone


def run_5fold_cv(pipeline, X_train, y_train) -> Dict[str, Any]:
    """
    Executes 5-Fold Stratified Cross Validation on training data ONLY.
    Calculates Accuracy, Precision, Recall, F1, and ROC-AUC per fold, mean, and standard deviation.
    """
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    fold_accs = []
    fold_precs = []
    fold_recs = []
    fold_f1s = []
    fold_rocs = []

    for train_idx, val_idx in skf.split(X_train, y_train):
        # Split fold
        if hasattr(X_train, "iloc"):
            X_tr, X_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
        else:
            X_tr, X_val = X_train[train_idx], X_train[val_idx]

        if hasattr(y_train, "iloc"):
            y_tr, y_val = y_train.iloc[train_idx], y_train.iloc[val_idx]
        else:
            y_tr, y_val = y_train[train_idx], y_train[val_idx]

        # Clone clean pipeline instance to prevent data leakage across folds
        model_fold = clone(pipeline)
        model_fold.fit(X_tr, y_tr)

        preds = model_fold.predict(X_val)

        if hasattr(model_fold, "predict_proba"):
            probs = model_fold.predict_proba(X_val)[:, 1]
        elif hasattr(model_fold, "decision_function"):
            scores = model_fold.decision_function(X_val)
            probs = (scores - scores.min()) / (scores.max() - scores.min() + 1e-9)
        else:
            probs = preds.astype(float)

        acc = float(accuracy_score(y_val, preds))
        prec = float(precision_score(y_val, preds, pos_label=1, zero_division=0))
        rec = float(recall_score(y_val, preds, pos_label=1, zero_division=0))
        f1 = float(f1_score(y_val, preds, pos_label=1, zero_division=0))
        try:
            roc = float(roc_auc_score(y_val, probs))
        except Exception:
            roc = 0.5

        fold_accs.append(round(acc, 4))
        fold_precs.append(round(prec, 4))
        fold_recs.append(round(rec, 4))
        fold_f1s.append(round(f1, 4))
        fold_rocs.append(round(roc, 4))

    return {
        "accuracy": {
            "folds": fold_accs,
            "mean": round(float(np.mean(fold_accs)), 4),
            "std": round(float(np.std(fold_accs)), 4),
        },
        "precision": {
            "folds": fold_precs,
            "mean": round(float(np.mean(fold_precs)), 4),
            "std": round(float(np.std(fold_precs)), 4),
        },
        "recall": {
            "folds": fold_recs,
            "mean": round(float(np.mean(fold_recs)), 4),
            "std": round(float(np.std(fold_recs)), 4),
        },
        "f1": {
            "folds": fold_f1s,
            "mean": round(float(np.mean(fold_f1s)), 4),
            "std": round(float(np.std(fold_f1s)), 4),
        },
        "roc_auc": {
            "folds": fold_rocs,
            "mean": round(float(np.mean(fold_rocs)), 4),
            "std": round(float(np.std(fold_rocs)), 4),
        },
    }
