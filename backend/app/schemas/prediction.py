from typing import Optional
from pydantic import BaseModel, Field, field_validator


class PredictionRequest(BaseModel):
    gender: str = Field(..., description="Gender of customer ('Male' or 'Female')")
    SeniorCitizen: int = Field(..., description="Senior citizen indicator (0 or 1)")
    Partner: str = Field(..., description="Whether customer has a partner ('Yes' or 'No')")
    Dependents: str = Field(..., description="Whether customer has dependents ('Yes' or 'No')")
    tenure: int = Field(..., ge=0, description="Number of months customer has stayed with company (>= 0)")
    PhoneService: str = Field(..., description="Whether customer has phone service ('Yes' or 'No')")
    InternetService: str = Field(..., description="Internet service provider ('DSL', 'Fiber optic', 'No')")
    OnlineSecurity: str = Field(..., description="Online security option ('Yes', 'No', 'No internet service')")
    OnlineBackup: str = Field(..., description="Online backup option ('Yes', 'No', 'No internet service')")
    TechSupport: str = Field(..., description="Tech support option ('Yes', 'No', 'No internet service')")
    StreamingTV: str = Field(..., description="Streaming TV option ('Yes', 'No', 'No internet service')")
    PaymentMethod: str = Field(..., description="Payment method")
    MonthlyCharges: float = Field(..., ge=0.0, description="Monthly charge amount (>= 0)")
    TotalCharges: float = Field(..., ge=0.0, description="Total charges accumulated (>= 0)")
    customerID: Optional[str] = Field(None, description="Optional Customer ID, not used as ML feature")

    @field_validator("SeniorCitizen")
    @classmethod
    def validate_senior_citizen(cls, v: int) -> int:
        if v not in (0, 1):
            raise ValueError("SeniorCitizen must be 0 or 1")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "gender": "Male",
                "SeniorCitizen": 0,
                "Partner": "Yes",
                "Dependents": "No",
                "tenure": 12,
                "PhoneService": "Yes",
                "InternetService": "Fiber optic",
                "OnlineSecurity": "No",
                "OnlineBackup": "Yes",
                "TechSupport": "No",
                "StreamingTV": "Yes",
                "PaymentMethod": "Electronic check",
                "MonthlyCharges": 79.50,
                "TotalCharges": 954.00
            }
        }
    }


class PredictionResponse(BaseModel):
    prediction: str = Field(..., description="Churn prediction: 'Yes' or 'No'")
    churn: bool = Field(..., description="Boolean flag: true for Yes, false for No")
    probability: float = Field(..., description="Model churn probability (0.0 to 1.0)")
    confidence: float = Field(..., description="Percentage confidence (0.0 to 100.0)")
    risk_level: str = Field(..., description="Risk category: 'Low', 'Medium', or 'High'")
    model_name: str = Field("Production Model", description="Name of the final selected ML model used for prediction")

