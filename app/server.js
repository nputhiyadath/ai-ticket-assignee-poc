/**
 * Express.js API server for AI ticket assignee prediction
 * Converts Flask implementation to Node.js/Express
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Model path
const MODEL_PATH = path.join(__dirname, '../model/ticket_assigner.json');

// Load the trained model
let model = null;

function loadModel() {
    try {
        if (!fs.existsSync(MODEL_PATH)) {
            throw new Error(`Model file not found at ${MODEL_PATH}. Please run 'npm run train' first.`);
        }
        
        const modelData = JSON.parse(fs.readFileSync(MODEL_PATH, 'utf8'));
        model = modelData;
        console.log(`Model loaded successfully from ${MODEL_PATH}`);
        console.log(`Model trained at: ${model.metadata?.trainedAt || 'unknown'}`);
        console.log(`Available assignees: ${model.assignees?.join(', ') || 'unknown'}`);
    } catch (error) {
        console.error('Failed to load model:', error.message);
        process.exit(1);
    }
}

/**
 * Predict assignee for new text using the loaded model
 * Replicates the simple scoring logic from training
 */
function predict(text) {
    if (!model) {
        throw new Error('Model not loaded');
    }
    
    const tokens = text.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    const scores = {};
    
    // Calculate score for each assignee
    model.assignees.forEach(assignee => {
        const stats = model.assigneeStats[assignee];
        let score = Math.log(stats.count / Object.keys(model.assigneeStats).length); // Prior probability
        
        tokens.forEach(token => {
            const termFreq = stats.termFreqs[token] || 0;
            const termProb = (termFreq + 1) / (stats.totalTerms + model.vocabulary.length); // Laplace smoothing
            score += Math.log(termProb);
        });
        
        scores[assignee] = score;
    });
    
    // Return assignee with highest score
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        model_loaded: model !== null,
        model_metadata: model?.metadata || null
    });
});

/**
 * Prediction endpoint - matches Flask API interface
 */
app.post('/predict', (req, res) => {
    try {
        const { title, description, labels } = req.body;
        
        // Validate input
        if (typeof title !== 'string' && typeof description !== 'string') {
            return res.status(400).json({
                error: 'Either title or description must be provided as a string'
            });
        }
        
        // Process input similar to Python version
        const titleText = title || '';
        const descriptionText = description || '';
        let labelsText = '';
        
        if (Array.isArray(labels)) {
            labelsText = labels.join(' ');
        } else if (typeof labels === 'string') {
            labelsText = labels;
        }
        
        // Combine all text fields
        const text = `${titleText} ${descriptionText} ${labelsText}`.trim();
        
        if (!text) {
            return res.status(400).json({
                error: 'No text content provided for prediction'
            });
        }
        
        // Make prediction
        const assignee = predict(text);
        
        res.json({ assignee });
        
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({
            error: 'Internal server error during prediction',
            message: error.message
        });
    }
});

/**
 * Get model information endpoint
 */
app.get('/model/info', (req, res) => {
    if (!model) {
        return res.status(503).json({
            error: 'Model not loaded'
        });
    }
    
    res.json({
        assignees: model.assignees,
        vocabulary_size: model.vocabulary?.length || 0,
        training_samples: Object.values(model.assigneeStats || {}).reduce((sum, stats) => sum + stats.count, 0),
        metadata: model.metadata
    });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error'
    });
});

/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        available_endpoints: [
            'GET /health',
            'POST /predict',
            'GET /model/info'
        ]
    });
});

// Load model and start server
loadModel();

app.listen(PORT, () => {
    console.log(`🚀 AI Ticket Assignee API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔮 Prediction endpoint: http://localhost:${PORT}/predict`);
    console.log(`ℹ️  Model info: http://localhost:${PORT}/model/info`);
});

module.exports = app;