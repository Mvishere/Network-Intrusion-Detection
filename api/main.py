from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import json
import os

app = FastAPI(title="NSL-KDD API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts")

model = None
scaler = None
label_encoder = None
metadata = None

def load_artifacts():
    global model, scaler, label_encoder, metadata
    try:
        with open(os.path.join(ARTIFACTS_DIR, "metadata.json"), "r") as f:
            metadata = json.load(f)
        model = joblib.load(os.path.join(ARTIFACTS_DIR, "best_model.joblib"))
        scaler = joblib.load(os.path.join(ARTIFACTS_DIR, "scaler.joblib"))
        label_encoder = joblib.load(os.path.join(ARTIFACTS_DIR, "label_encoder.joblib"))
        print("Artifacts loaded successfully!")
    except Exception as e:
        print(f"Warning: Artifacts not loaded correctly. ({e})")

load_artifacts()

class PredictRequest(BaseModel):
    features: dict

@app.get("/api/insights")
def get_insights():
    try:
        # Always reload metadata to ensure freshness
        with open(os.path.join(ARTIFACTS_DIR, "metadata.json"), "r") as f:
            meta = json.load(f)
        
        comp_df = pd.read_csv(os.path.join(ARTIFACTS_DIR, "model_comparison.csv"))
        feat_df = pd.read_csv(os.path.join(ARTIFACTS_DIR, "feature_importances.csv"))
        
        return {
            "metadata": meta,
            "comparison": comp_df.to_dict(orient="records"),
            "feature_importances": feat_df.head(10).to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict")
def predict(req: PredictRequest):
    if model is None:
        load_artifacts()
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded. Run pipeline first.")
        
    try:
        df = pd.DataFrame([req.features])
        
        categorical_features = metadata.get("categorical_features", [])
        numerical_features = metadata.get("numerical_features", [])
        all_cols = metadata.get("all_encoded_columns", [])
        
        df_encoded = pd.get_dummies(df, columns=[c for c in categorical_features if c in df.columns], drop_first=False)
        
        for col in all_cols:
            if col not in df_encoded.columns:
                df_encoded[col] = 0
                
        df_encoded = df_encoded[all_cols]
        
        df_encoded[numerical_features] = scaler.transform(df_encoded[numerical_features])
        
        selected_features = metadata.get("selected_features_for_best_model", [])
        X = df_encoded[selected_features]
        
        prediction = model.predict(X)[0]
        prediction_label = label_encoder.inverse_transform([prediction])[0]
        
        return {"prediction": prediction_label}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
