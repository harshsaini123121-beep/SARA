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
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

from generate_dataset import generate_dataset

def train_eta_model():
    dataset_path = 'data/emergency_trips.csv'
    if not os.path.exists(dataset_path):
        print("Dataset not found. Generating dataset...")
        df = generate_dataset()
    else:
        df = pd.read_csv(dataset_path)
        
    X = df[['distance_km', 'traffic_level', 'hour_of_day', 'day_of_week', 'weather_condition', 'road_type']]
    y = df['travel_time_minutes']
    
    categorical_features = ['traffic_level', 'weather_condition', 'road_type']
    numerical_features = ['distance_km', 'hour_of_day', 'day_of_week']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForestRegressor model...")
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))
    
    print(f"Model Training Completed!")
    print(f"MAE:  {mae:.3f} mins")
    print(f"RMSE: {rmse:.3f} mins")
    print(f"R²:   {r2:.4f}")
    
    # Feature Importance extraction
    onehot_encoder = pipeline.named_steps['preprocessor'].named_transformers_['cat']
    cat_feature_names = list(onehot_encoder.get_feature_names_out(categorical_features))
    all_feature_names = numerical_features + cat_feature_names
    importances = pipeline.named_steps['model'].feature_importances_
    
    feature_importance_dict = {name: float(imp) for name, imp in zip(all_feature_names, importances)}
    
    # Group category importances for visual presentation
    aggregated_importance = {
        'Distance': float(importances[0]),
        'Hour of Day': float(importances[1]),
        'Day of Week': float(importances[2]),
        'Traffic Level': float(sum(importances[len(numerical_features):len(numerical_features)+4])),
        'Weather Condition': float(sum(importances[len(numerical_features)+4:len(numerical_features)+7])),
        'Road Type': float(sum(importances[len(numerical_features)+7:]))
    }
    
    os.makedirs('models', exist_ok=True)
    os.makedirs('../backend/app/ml/models', exist_ok=True)
    
    model_path = 'models/eta_model.joblib'
    backend_model_path = '../backend/app/ml/models/eta_model.joblib'
    
    joblib.dump(pipeline, model_path)
    joblib.dump(pipeline, backend_model_path)
    
    metrics = {
        'algorithm': 'RandomForestRegressor',
        'training_records': len(df),
        'test_records': len(X_test),
        'mae': round(mae, 3),
        'rmse': round(rmse, 3),
        'r2': round(r2, 4),
        'feature_importance_raw': feature_importance_dict,
        'feature_importance_aggregated': aggregated_importance
    }
    
    with open('models/model_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
        
    with open('../backend/app/ml/models/model_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
        
    print(f"Saved model to {model_path} and metrics to models/model_metrics.json")
    return metrics

if __name__ == '__main__':
    train_eta_model()
