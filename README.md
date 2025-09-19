# AI Ticket Assignee POC

This is a proof of concept (POC) for an AI-based ticket assignee predictor. It trains a simple model to predict the assignee based on a ticket's title, description, and labels.

## 🚀 Node.js Migration in Progress

This repository is being converted from Python to Node.js. The Node.js implementation is currently in development alongside the existing Python version.

## Components

### Python Implementation (Current)
- **notebooks/train_model.ipynb**: Jupyter notebook for training the model using mock data.
- **model/ticket_assigner.pkl**: The trained model saved with joblib.
- **app/api.py**: Flask API server to predict assignee for a new ticket.
- **requirements.txt**: Dependencies.

### Node.js Implementation (In Development)
- **src/index.js**: Main entry point for the Node.js application (placeholder).
- **package.json**: Node.js project configuration and dependencies.

## Usage

### Node.js Version (In Development)

#### Prerequisites
- Node.js (v14 or higher)
- npm

#### Setup and Run
```bash
# Clone the repository
git clone https://github.com/nputhiyadath/ai-ticket-assignee-poc.git
cd ai-ticket-assignee-poc

# Install Node.js dependencies (when available)
npm install

# Run the placeholder application
node src/index.js
```

**Note**: The Node.js implementation is currently a placeholder. More functionality will be added during the migration process.

### Python Version (Current Implementation)

#### 1. Train the Model

1. Place your mock data as `data/issues_mock.csv` (columns: `title`, `description`, `labels` as JSON list, `assignee`).
2. Run the notebook:  
   Open `notebooks/train_model.ipynb` and execute all cells.  
   This will output the model as `model/ticket_assigner.pkl`.

#### 2. Run the API

```bash
pip install -r requirements.txt
python app/api.py
```

#### 3. Predict Example

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
- **Node.js Migration**: This repository is currently being migrated from Python to Node.js. The Node.js version will eventually provide the same functionality as the Python implementation.

## Directory Structure

```
ai-ticket-assignee-poc/
├── src/                    # Node.js source code (new)
│   └── index.js           # Main Node.js entry point (placeholder)
├── app/                   # Python Flask API (existing)
│   └── api.py
├── notebooks/             # Jupyter notebooks (existing)
│   └── train_model.ipynb
├── data/                  # Mock data (existing)
│   └── issues_mock.csv
├── model/                 # Trained models (existing)
├── package.json           # Node.js project config (new)
├── requirements.txt       # Python dependencies (existing)
├── Dockerfile            # Docker config (existing)
├── docker-compose.yml    # Docker compose (existing)
└── README.md             # This file
```