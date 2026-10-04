import os
import json
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score

from generate_extended_datasets import generate_corridor_dataset

def train_corridor_model():
    dataset_path = 'data/green_corridor_trips.csv'
    if not os.path.exists(dataset_path):
        df = generate_corridor_dataset()
    else:
        df = pd.read_csv(dataset_path)
        
    X = df[['baseline_eta_mins', 'distance_km', 'traffic_level', 'intersections_cleared', 'corridor_active']]
    y = df['time_saved_mins']
    
    categorical_features = ['traffic_level']
    numerical_features = ['baseline_eta_mins', 'distance_km', 'intersections_cleared', 'corridor_active']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Green Corridor Speed Boost Predictor model...")
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))
    
    print(f"Corridor Model MAE: {mae:.4f}, R²: {r2:.4f}")
    
    os.makedirs('models', exist_ok=True)
    os.makedirs('../backend/app/ml/models', exist_ok=True)
    
    model_path = 'models/corridor_model.joblib'
    backend_model_path = '../backend/app/ml/models/corridor_model.joblib'
    
    joblib.dump(pipeline, model_path)
    joblib.dump(pipeline, backend_model_path)
    
    metrics = {
        'algorithm': 'RandomForestRegressor (Green Corridor Engine)',
        'mae': round(mae, 4),
        'r2': round(r2, 4),
        'records': len(df)
    }
    
    with open('models/corridor_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    with open('../backend/app/ml/models/corridor_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
        
    print(f"Saved corridor model to {model_path}")
    return metrics

if __name__ == '__main__':
    train_corridor_model()
