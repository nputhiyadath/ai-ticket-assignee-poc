# AI Ticket Assignee POC

This is a proof of concept (POC) for an AI-based ticket assignee predictor. It trains a simple model to predict the assignee based on a ticket's title, description, and labels.

**This is a Node.js implementation** that provides the same functionality as the original Python version, with improved performance and modern JavaScript/TypeScript ecosystem compatibility.

## Components

- **scripts/train-model.js**: Node.js script for training the model using mock data with a simple Naive Bayes-like classifier.
- **model/ticket_assigner.json**: The trained model saved as JSON with assignee statistics and vocabulary.
- **app/server.js**: Express.js API server to predict assignee for a new ticket.
- **test/test-api.js**: Comprehensive test suite for the API endpoints.
- **package.json**: Node.js dependencies and scripts.

## Requirements

- Node.js 16.0.0 or higher
- npm (comes with Node.js)

## Usage

### 1. Install Dependencies

```bash
npm install
```

### 2. Train the Model

The training uses mock data from `data/issues_mock.csv`:

```bash
npm run train
```

This will:
- Load and process the CSV data
- Extract text features using tokenization and term frequency analysis
- Train a simple Naive Bayes-like classifier
- Save the model as `model/ticket_assigner.json`

### 3. Run the API

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

The server will start on port 5000 and provide the following endpoints:
- `GET /health` - Health check
- `POST /predict` - Predict assignee
- `GET /model/info` - Model information

### 4. Test the API

Run the comprehensive test suite:

```bash
npm test
```

Or test manually with curl:

```bash
curl -X POST http://localhost:5000/predict \
    -H "Content-Type: application/json" \
    -d '{"title": "Fix login bug", "description": "Error on login page", "labels": ["bug", "urgent"]}'
```

Returns:

```json
{
  "assignee": "alice"
}
```

### 5. Docker Deployment

Build and run with Docker:

```bash
docker-compose up --build
```

Or with standalone Docker:

```bash
docker build -t ai-ticket-assignee .
docker run -p 5000:5000 ai-ticket-assignee
```

## API Reference

### POST /predict

Predict the assignee for a new ticket.

**Request Body:**
```json
{
  "title": "string",
  "description": "string", 
  "labels": ["array", "of", "strings"]
}
```

**Response:**
```json
{
  "assignee": "predicted_assignee_name"
}
```

### GET /health

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_metadata": {
    "trainedAt": "2025-09-19T19:01:28.923Z",
    "version": "1.0.0",
    "framework": "nodejs-simple"
  }
}
```

### GET /model/info

Get information about the loaded model.

**Response:**
```json
{
  "assignees": ["alice", "bob", "carol"],
  "vocabulary_size": 48,
  "training_samples": 8,
  "metadata": {
    "trainedAt": "2025-09-19T19:01:28.923Z",
    "version": "1.0.0",
    "framework": "nodejs-simple"
  }
}
```

## Architecture Changes from Python Version

### Key Improvements:
1. **Modern JavaScript**: Uses ES6+ features and async/await patterns
2. **Express.js**: Replaces Flask with a more robust Node.js web framework
3. **Simple ML Approach**: Implements a Naive Bayes-like classifier instead of scikit-learn's Random Forest
4. **Better Error Handling**: Comprehensive error handling and validation
5. **Health Checks**: Built-in health monitoring endpoints
6. **Test Suite**: Comprehensive automated testing
7. **Docker Optimization**: Multi-stage builds and health checks

### Technical Implementation:
- **Text Processing**: Uses `natural.js` for tokenization and basic NLP
- **Feature Extraction**: TF-IDF-like scoring with term frequency analysis
- **Classification**: Simple probabilistic approach with Laplace smoothing
- **Model Storage**: JSON format for easy inspection and debugging
- **API Framework**: Express.js with middleware for CORS, JSON parsing, and error handling

## Development

### Project Structure
```
├── app/
│   └── server.js          # Express.js API server
├── scripts/
│   └── train-model.js     # Model training script
├── test/
│   └── test-api.js        # API test suite
├── data/
│   └── issues_mock.csv    # Training data
├── model/
│   └── ticket_assigner.json # Trained model (generated)
├── package.json           # Dependencies and scripts
├── Dockerfile            # Container configuration
└── docker-compose.yml    # Multi-service setup
```

### Available Scripts
- `npm start` - Start the API server
- `npm run dev` - Start with auto-restart (requires nodemon)
- `npm run train` - Train the model
- `npm test` - Run test suite

## Notes

- This is a POC. The model is only as good as the mock data provided.
- For real use, replace mock data with real labeled issues and retrain.
- The Node.js implementation provides equivalent functionality to the Python version while being more maintainable and performant.
- The simple classification approach works well for small datasets and provides good interpretability.