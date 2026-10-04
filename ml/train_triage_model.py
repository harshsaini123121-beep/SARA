import os
import json
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

from generate_extended_datasets import generate_triage_dataset

def train_triage_model():
    dataset_path = 'data/patient_triage.csv'
    if not os.path.exists(dataset_path):
        df = generate_triage_dataset()
    else:
        df = pd.read_csv(dataset_path)
        
    X = df[['systolic_bp', 'heart_rate_bpm', 'spo2_percent', 'gcs_score', 'age', 'primary_symptom']]
    y = df['severity_level']
    
    categorical_features = ['primary_symptom']
    numerical_features = ['systolic_bp', 'heart_rate_bpm', 'spo2_percent', 'gcs_score', 'age']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestClassifier(n_estimators=100, max_depth=6, min_samples_split=10, random_state=42, n_jobs=-1))
    ])

    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training Patient Triage RandomForestClassifier model...")
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    
    print(f"Triage Model Accuracy: {acc * 100:.2f}%")
    
    os.makedirs('models', exist_ok=True)
    os.makedirs('../backend/app/ml/models', exist_ok=True)
    
    model_path = 'models/triage_model.joblib'
    backend_model_path = '../backend/app/ml/models/triage_model.joblib'
    
    joblib.dump(pipeline, model_path)
    joblib.dump(pipeline, backend_model_path)
    
    metrics = {
        'algorithm': 'RandomForestClassifier (Triage Engine)',
        'accuracy': round(acc, 4),
        'records': len(df),
        'classes': ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
    }
    
    with open('models/triage_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    with open('../backend/app/ml/models/triage_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
        
    print(f"Saved triage model to {model_path}")
    return metrics

if __name__ == '__main__':
    train_triage_model()
