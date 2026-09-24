import json
from pathlib import Path
from typing import Dict, Any, Optional
import joblib
import pandas as pd
from app.config import (
    MODELS_DIR,
    MODEL_FILENAME,
    FINAL_METADATA_FILENAME,
    METADATA_FILENAME,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
)


class ModelPredictor:
    """Service to handle churn predictions using the saved final scikit-learn Pipeline."""

    def __init__(self):
        self.model = None
        self.metadata = None
        self.load_model()

    def load_model(self) -> bool:
        """Loads fitted model pipeline and metadata from disk."""
        model_path = MODELS_DIR / MODEL_FILENAME
        final_meta_path = MODELS_DIR / FINAL_METADATA_FILENAME
        legacy_meta_path = MODELS_DIR / METADATA_FILENAME

        if model_path.exists():
            try:
                self.model = joblib.load(model_path)
                if final_meta_path.exists():
                    with open(final_meta_path, "r", encoding="utf-8") as f:
                        self.metadata = json.load(f)
                elif legacy_meta_path.exists():
                    with open(legacy_meta_path, "r", encoding="utf-8") as f:
                        self.metadata = json.load(f)
                else:
                    self.metadata = {"final_model_name": "Fitted Pipeline"}
                return True
            except Exception as e:
                print(f"Error loading model or metadata: {e}")
                self.model = None
                self.metadata = None
                return False
        return False

    @property
    def is_loaded(self) -> bool:
        return self.model is not None and self.metadata is not None

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes prediction using the loaded final pipeline.
        Input data must contain all required numerical and categorical features.
        """
        if not self.is_loaded:
            raise RuntimeError("Model is not loaded. Train or reload model first.")

        # Ensure correct feature ordering and structure
        df_input = pd.DataFrame([input_data])

        # Convert numerical fields to numeric types
        for num_col in NUMERICAL_FEATURES:
            if num_col in df_input.columns:
                df_input[num_col] = pd.to_numeric(df_input[num_col], errors="coerce")

        # Convert categorical fields to str
        for cat_col in CATEGORICAL_FEATURES:
            if cat_col in df_input.columns:
                df_input[cat_col] = df_input[cat_col].astype(str).str.strip()

        # Run prediction through saved sklearn Pipeline
        pred_class = int(self.model.predict(df_input)[0])
        
        if hasattr(self.model, "predict_proba"):
            probabilities = self.model.predict_proba(df_input)[0]
            churn_prob = float(probabilities[1])
        elif hasattr(self.model, "decision_function"):
            score = float(self.model.decision_function(df_input)[0])
            churn_prob = float(1.0 / (1.0 + pd.np.exp(-score)))
        else:
            churn_prob = float(pred_class)

        confidence = round(churn_prob * 100.0, 2)
        prediction_label = "Yes" if pred_class == 1 else "No"
        churn_bool = pred_class == 1

        # Determine presentation Risk Level based on probability
        if churn_prob < 0.40:
            risk_level = "Low"
        elif churn_prob < 0.70:
            risk_level = "Medium"
        else:
            risk_level = "High"

        model_name = (
            self.metadata.get("final_model_name")
            or self.metadata.get("model_name")
            or "Production Classifier"
        )

        return {
            "prediction": prediction_label,
            "churn": churn_bool,
            "probability": round(churn_prob, 4),
            "confidence": confidence,
            "risk_level": risk_level,
            "model_name": model_name,
        }


# Global predictor instance
predictor_instance = ModelPredictor()
