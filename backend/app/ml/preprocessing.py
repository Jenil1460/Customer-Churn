from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline

from app.config import NUMERICAL_FEATURES, CATEGORICAL_FEATURES


def create_preprocessor() -> ColumnTransformer:
    """
    Creates a scikit-learn ColumnTransformer preprocessing pipeline.
    - Numerical features: SimpleImputer(median) + StandardScaler()
    - Categorical features: SimpleImputer(most_frequent) + OneHotEncoder(handle_unknown="ignore")
    """
    num_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    cat_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERICAL_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )

    return preprocessor
