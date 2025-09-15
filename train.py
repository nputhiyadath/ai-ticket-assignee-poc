#!/usr/bin/env python3
"""
Standalone training script for the AI ticket assignee model.
This script replicates the logic from notebooks/train_model.ipynb
and is run during Docker build to generate the model file.
"""

import pandas as pd
import json
import os
import sys
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import joblib


def main():
    """Train the ticket assignee model and save it to disk."""
    
    # Define paths
    data_path = 'data/issues_mock.csv'
    model_dir = 'model'
    model_path = os.path.join(model_dir, 'ticket_assigner.pkl')
    
    # Check if data file exists
    if not os.path.exists(data_path):
        print(f"ERROR: Data file not found at {data_path}")
        print("The training script expects data/issues_mock.csv to exist.")
        sys.exit(1)
    
    print(f"Loading data from {data_path}...")
    
    try:
        # Load mock data (using escapechar to handle quotes in JSON strings)
        df = pd.read_csv(data_path, escapechar='\\')
        print(f"Loaded {len(df)} training samples")
        
        # Convert labels from JSON string to list, then join as space-separated string for TF-IDF
        df['labels'] = df['labels'].apply(lambda x: ' '.join(json.loads(x)))
        df['text'] = df['title'] + ' ' + df['description'] + ' ' + df['labels']
        
        # Prepare features and labels
        X = df['text']
        y = df['assignee']
        
        print(f"Training model with {len(X)} samples...")
        print(f"Target assignees: {sorted(y.unique())}")
        
        # Split data for validation
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Build a simple pipeline (same as notebook)
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer()),
            ('clf', RandomForestClassifier(random_state=42))
        ])
        
        # Train the model
        pipeline.fit(X_train, y_train)
        
        # Evaluate the model
        accuracy = pipeline.score(X_test, y_test)
        print(f"Validation accuracy: {accuracy:.2f}")
        
        # Create model directory if it doesn't exist
        os.makedirs(model_dir, exist_ok=True)
        
        # Save the model
        joblib.dump(pipeline, model_path)
        print(f"Model saved to {model_path}")
        
    except Exception as e:
        print(f"ERROR: Failed to train model: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()