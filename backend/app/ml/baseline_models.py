from typing import Dict, Any
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingClassifier,
    HistGradientBoostingClassifier,
)
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier


def get_baseline_classifiers() -> Dict[str, Any]:
    """
    Returns a dictionary of baseline classifiers configured with standard parameters.
    Models:
    1. Logistic Regression
    2. Decision Tree
    3. Random Forest
    4. Gradient Boosting
    5. Support Vector Machine (SVM)
    6. K-Nearest Neighbors (KNN)
    7. HistGradientBoosting
    """
    return {
        "Logistic Regression": LogisticRegression(max_iter=2000, random_state=42),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=1),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42),
        "Support Vector Machine": SVC(probability=True, random_state=42),
        "K-Nearest Neighbors": KNeighborsClassifier(),
        "HistGradientBoosting": HistGradientBoostingClassifier(random_state=42),
    }
