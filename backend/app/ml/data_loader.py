import os
from pathlib import Path
import pandas as pd
from app.config import (
    DATA_DIR,
    DEFAULT_EXCEL_FILENAME,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    TARGET_COLUMN,
    ID_COLUMN,
)


def get_excel_path() -> Path:
    """Finds the dataset Excel file in backend/data/."""
    default_path = DATA_DIR / DEFAULT_EXCEL_FILENAME
    if default_path.exists():
        return default_path

    # Search for any .xlsx file in data directory
    if DATA_DIR.exists():
        xlsx_files = list(DATA_DIR.glob("*.xlsx"))
        if xlsx_files:
            return xlsx_files[0]

    raise FileNotFoundError(
        f"No Excel dataset found in '{DATA_DIR}'. Please place 'my_dataset.xlsx' in '{DATA_DIR}'."
    )


def load_raw_dataset(file_path: Path = None) -> pd.DataFrame:
    """Loads raw Excel data and cleans whitespaces."""
    if file_path is None:
        file_path = get_excel_path()

    try:
        excel_file = pd.ExcelFile(file_path)
        # Select first sheet or sheet matching keywords
        sheet_name = excel_file.sheet_names[0]
        df = pd.read_excel(file_path, sheet_name=sheet_name)
    except Exception as e:
        raise ValueError(f"Failed to read Excel workbook at '{file_path}': {str(e)}")

    # Clean column names (strip whitespace)
    df.columns = df.columns.str.strip()

    # Clean string values (strip whitespace)
    for col in df.select_dtypes(include=["object", "string"]).columns:
        df[col] = df[col].astype(str).str.strip()

    # Clean TotalCharges numeric conversion
    if "TotalCharges" in df.columns:
        df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")

    # Clean SeniorCitizen numeric conversion
    if "SeniorCitizen" in df.columns:
        df["SeniorCitizen"] = pd.to_numeric(df["SeniorCitizen"], errors="coerce").fillna(0).astype(int)

    return df


def prepare_dataset(df: pd.DataFrame):
    """
    Validates required features and converts target column.
    Returns: cleaned_df, X, y
    """
    required_columns = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
    missing_features = [col for col in required_columns if col not in df.columns]
    if missing_features:
        raise ValueError(f"Missing required feature columns in dataset: {missing_features}")

    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Target column '{TARGET_COLUMN}' not found in dataset.")

    # Drop ID_COLUMN if present (ensure it's never used as a feature)
    X = df[required_columns].copy()

    # Encode target: Yes -> 1, No -> 0
    y_raw = df[TARGET_COLUMN].astype(str).str.strip()
    y = y_raw.map({"Yes": 1, "No": 0, "1": 1, "0": 0})
    
    if y.isnull().any():
        # Fallback for unexpected target formatting
        y = y.fillna(0).astype(int)
    else:
        y = y.astype(int)

    return df, X, y
