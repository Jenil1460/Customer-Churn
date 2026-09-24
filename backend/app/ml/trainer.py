from typing import Dict, Any, Tuple
from sklearn.pipeline import Pipeline

from app.ml.data_loader import load_raw_dataset, prepare_dataset
from app.ml.train_test import get_train_test_split
from app.ml.model_comparison import compare_all_baseline_models
from app.ml.hyperparameter_tuning import tune_hyperparameters
from app.ml.advanced_models import evaluate_advanced_models
from app.ml.model_selection import select_and_save_final_model


def train_and_save_model() -> Tuple[Pipeline, Dict[str, Any]]:
    """
    Executes complete ML Workflow:
    Excel -> Validation -> Stratified Train/Test Split -> Preprocessing ->
    Baseline Models -> 5-Fold Cross-Validation -> Overfitting Analysis ->
    Model Comparison -> Hyperparameter Tuning -> Advanced Models ->
    Final Model Selection -> Untouched Test Set Evaluation -> Save Models & Results JSON.
    """
    print("Step 1: Loading raw dataset from Excel...")
    raw_df = load_raw_dataset()
    df, X, y = prepare_dataset(raw_df)

    print(f"Step 2: Performing Stratified Train/Test Split (80/20) on {len(X)} samples...")
    X_train, X_test, y_train, y_test = get_train_test_split(X, y)

    print("Step 3 & 4: Evaluating baseline models, 5-Fold CV, & Overfitting Analysis...")
    baseline_results = compare_all_baseline_models(X_train, X_test, y_train, y_test)

    print("Step 5: Performing GridSearchCV Hyperparameter Tuning on training data...")
    tuning_results = tune_hyperparameters(X_train, X_test, y_train, y_test)

    print("Step 6: Evaluating Advanced Ensemble Models...")
    advanced_results = evaluate_advanced_models(X_train, X_test, y_train, y_test)

    print("Step 7 & 8: Selecting winning model based on CV F1 score & evaluating once on untouched test set...")
    final_pipeline, final_metadata = select_and_save_final_model(
        baseline_results,
        tuning_results,
        advanced_results,
        X_train,
        X_test,
        y_train,
        y_test,
        df,
    )

    print(f"Training completed successfully! Winner: '{final_metadata['final_model_name']}'")
    return final_pipeline, final_metadata
