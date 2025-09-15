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

## Docker Compose

### Prerequisites

- Docker
- Docker Compose

### Setup and Running

1. **Environment Configuration**

   Copy the `.env` file and edit if needed:
   ```bash
   cp .env .env.local
   # Edit .env.local if you want to change any default values
   ```

2. **Build and Run Services**

   Build and start both Flask API and Jupyter Notebook services:
   ```bash
   docker-compose up --build
   ```

   Or run in detached mode:
   ```bash
   docker-compose up --build -d
   ```

3. **Access Services**

   - **Flask API**: http://localhost:5000
   - **Jupyter Notebook**: http://localhost:8888

4. **Stop Services**

   ```bash
   docker-compose down
   ```

   To also remove volumes:
   ```bash
   docker-compose down -v
   ```

### Environment Variables

The following environment variables can be configured in the `.env` file:

- `API_PORT`: Port for the Flask API service (default: 5000)
- `JUPYTER_PORT`: Port for the Jupyter Notebook service (default: 8888)  
- `MODEL_PATH`: Path to the trained model file (default: model/ticket_assigner.pkl)
- `DATA_PATH`: Path to the mock data CSV file (default: data/issues_mock.csv)