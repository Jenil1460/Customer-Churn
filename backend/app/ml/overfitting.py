from typing import Dict, Any


def diagnose_overfitting(
    training_score: float,
    test_score: float,
    cv_mean: float,
    cv_std: float,
    threshold: float = 0.05,
) -> Dict[str, Any]:
    """
    Computes metric-driven diagnostic analysis for model overfitting or underfitting.
    """
    train_test_gap = round(float(training_score - test_score), 4)
    cv_test_gap = round(float(cv_mean - test_score), 4)

    # Diagnostic logic based on metrics
    if train_test_gap > threshold or (training_score - cv_mean) > threshold:
        diagnosis = "Potential Overfitting"
        explanation = (
            f"Training score ({training_score:.4f}) is higher than test score ({test_score:.4f}) "
            f"by {train_test_gap:.4f} (> {threshold}), indicating the model may be fitting noise."
        )
    elif training_score < 0.70 and test_score < 0.70:
        diagnosis = "Potential Underfitting"
        explanation = (
            f"Both training ({training_score:.4f}) and test ({test_score:.4f}) scores are low, "
            "indicating the model complexity may be insufficient for the dataset."
        )
    else:
        diagnosis = "Reasonably Consistent"
        explanation = (
            f"Training ({training_score:.4f}), cross-validation ({cv_mean:.4f}), and test ({test_score:.4f}) "
            "scores are reasonably close without extreme gap."
        )

    return {
        "training_score": round(float(training_score), 4),
        "test_score": round(float(test_score), 4),
        "cv_mean": round(float(cv_mean), 4),
        "cv_std": round(float(cv_std), 4),
        "train_test_gap": train_test_gap,
        "cv_test_gap": cv_test_gap,
        "diagnosis": diagnosis,
        "explanation": explanation,
    }
