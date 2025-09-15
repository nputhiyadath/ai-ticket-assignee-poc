# AI Ticket Assignee POC

This is a proof of concept (POC) for an AI-based ticket assignee predictor. It trains a simple model to predict the assignee based on a ticket's title, description, and labels.

## Components

- **notebooks/train_model.ipynb**: Jupyter notebook for training the model using mock data.
- **model/ticket_assigner.pkl**: The trained model saved with joblib.
- **app/api.py**: Flask API server to predict assignee for a new ticket.
- **requirements.txt**: Dependencies.

## Usage

### 1. Train the Model

1. Place your mock data as `data/issues_mock.csv` (columns: `title`, `description`, `labels` as JSON list, `assignee`).
2. Run the notebook:  
   Open `notebooks/train_model.ipynb` and execute all cells.  
   This will output the model as `model/ticket_assigner.pkl`.

### 2. Run the API

```bash
pip install -r requirements.txt
python app/api.py
```

### 3. Predict Example

Send a POST request:

```bash
curl -X POST http://localhost:5000/predict \
    -H "Content-Type: application/json" \
    -d '{"title": "Fix login bug", "description": "Error on login page", "labels": ["bug", "urgent"]}'
```

Returns:

```json
{"assignee": "john.doe"}
```

## Notes

- This is a POC. The model is only as good as the mock data provided.
- For real use, replace mock data with real labeled issues and retrain.