import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure backend directory is in sys.path for serverless & local runtime imports
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_URL
from app.api.routes import router
from app.ml.predictor import predictor_instance
from app.ml.trainer import train_and_save_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler to ensure model is loaded or trained at application startup."""
    print("Initializing Customer Churn Backend...")
    if not predictor_instance.is_loaded:
        print("No pre-existing model found. Training initial model from Excel dataset...")
        try:
            train_and_save_model()
            predictor_instance.load_model()
            print("Initial model trained and loaded successfully.")
        except Exception as e:
            print(f"Warning: Initial training on startup encountered error: {e}")
    else:
        print("Pre-existing model loaded successfully.")

    yield
    print("Shutting down Customer Churn Backend...")


app = FastAPI(
    title="Customer Churn Prediction API",
    description=(
        "Production ML Backend API for Telco Customer Churn Prediction. "
        "Built with FastAPI and scikit-learn Logistic Regression pipeline."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Configuration for Frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler for unhandled exceptions to return clean JSON
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error", "message": str(exc)},
    )



# Include API routes
app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
