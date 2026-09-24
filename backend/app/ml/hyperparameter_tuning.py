import time
from typing import Dict, Any, List
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

from app.ml.preprocessing import create_preprocessor
from app.ml.evaluation import evaluate_model
from app.ml.cross_validation import run_5fold_cv


def tune_hyperparameters(X_train, X_test, y_train, y_test) -> Dict[str, Any]:
    """
    Performs real GridSearchCV hyperparameter tuning on training data using 5-Fold Stratified CV.
    Optimizes for F1 score on Churn class.
    Models tuned:
    1. Logistic Regression
    2. Decision Tree
    3. Random Forest
    4. Gradient Boosting
    """
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    tuning_configs = [
        {
            "name": "Logistic Regression",
            "classifier": LogisticRegression(max_iter=2000, random_state=42),
            "param_grid": [
                {
                    "classifier__C": [0.01, 0.1, 1.0, 10.0, 100.0],
                    "classifier__solver": ["lbfgs"],
                    "classifier__class_weight": [None, "balanced"],
                },
                {
                    "classifier__C": [0.01, 0.1, 1.0, 10.0, 100.0],
                    "classifier__solver": ["liblinear"],
                    "classifier__class_weight": [None, "balanced"],
                },
            ],
        },
        {
            "name": "Decision Tree",
            "classifier": DecisionTreeClassifier(random_state=42),
            "param_grid": {
                "classifier__max_depth": [None, 5, 10, 15],
                "classifier__min_samples_split": [2, 5, 10],
                "classifier__min_samples_leaf": [1, 2, 4],
                "classifier__criterion": ["gini", "entropy"],
            },
        },
        {
            "name": "Random Forest",
            "classifier": RandomForestClassifier(random_state=42, n_jobs=1),
            "param_grid": {
                "classifier__n_estimators": [100, 200],
                "classifier__max_depth": [None, 10, 20],
                "classifier__min_samples_split": [2, 5],
                "classifier__min_samples_leaf": [1, 2],
            },
        },
        {
            "name": "Gradient Boosting",
            "classifier": GradientBoostingClassifier(random_state=42),
            "param_grid": {
                "classifier__n_estimators": [100, 150],
                "classifier__learning_rate": [0.01, 0.1, 0.2],
                "classifier__max_depth": [3, 5],
            },
        },
    ]

    tuned_results: Dict[str, Any] = {}
    summary_list: List[Dict[str, Any]] = []

    for config in tuning_configs:
        model_name = config["name"]
        classifier = config["classifier"]
        param_grid = config["param_grid"]

        pipeline = Pipeline(
            steps=[
                ("preprocessor", create_preprocessor()),
                ("classifier", classifier),
            ]
        )

        grid_search = GridSearchCV(
            estimator=pipeline,
            param_grid=param_grid,
            scoring="f1",
            cv=cv,
            n_jobs=1,
            refit=True,
        )

        start_time = time.time()
        grid_search.fit(X_train, y_train)
        duration = round(time.time() - start_time, 4)

        best_pipeline = grid_search.best_estimator_
        best_cv_f1 = round(float(grid_search.best_score_), 4)

        # Clean best parameters dict (remove classifier__ prefix)
        raw_best_params = grid_search.best_params_
        clean_best_params = {
            k.replace("classifier__", ""): v for k, v in raw_best_params.items()
        }

        # Evaluate tuned pipeline on untouched test set
        test_eval = evaluate_model(best_pipeline, X_train, y_train, X_test, y_test)
        cv_eval = run_5fold_cv(best_pipeline, X_train, y_train)

        # Top parameter combinations
        cv_results = grid_search.cv_results_
        top_combos = []
        indices = cv_results["mean_test_score"].argsort()[::-1][:5]
        for idx in indices:
            params = {
                k.replace("classifier__", ""): v
                for k, v in cv_results["params"][idx].items()
            }
            top_combos.append(
                {
                    "params": params,
                    "mean_f1": round(float(cv_results["mean_test_score"][idx]), 4),
                    "std_f1": round(float(cv_results["std_test_score"][idx]), 4),
                }
            )

        model_result = {
            "model": model_name,
            "best_params": clean_best_params,
            "best_cv_score": best_cv_f1,
            "tuning_duration": duration,
            "test_accuracy": test_eval["testing_accuracy"],
            "test_f1": test_eval["f1_score"],
            "test_precision": test_eval["precision"],
            "test_recall": test_eval["recall"],
            "test_roc_auc": test_eval["roc_auc"],
            "top_combinations": top_combos,
            "pipeline": best_pipeline,
        }

        tuned_results[model_name] = model_result

        summary_list.append(
            {
                "model": model_name,
                "best_params": clean_best_params,
                "best_cv_f1": best_cv_f1,
                "test_f1": test_eval["f1_score"],
                "test_accuracy": test_eval["testing_accuracy"],
                "test_roc_auc": test_eval["roc_auc"],
                "tuning_duration": duration,
            }
        )

    return {
        "summary": summary_list,
        "detailed_tuned_models": tuned_results,
    }
