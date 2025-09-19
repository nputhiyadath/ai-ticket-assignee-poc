/**
 * Train AI model for ticket assignee prediction using Node.js
 * Converts Python scikit-learn implementation to Node.js with a simple approach
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const natural = require('natural');

// Configuration
const DATA_PATH = path.join(__dirname, '../data/issues_mock.csv');
const MODEL_PATH = path.join(__dirname, '../model/ticket_assigner.json');

/**
 * Load and parse CSV data
 */
function loadData() {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(DATA_PATH)
            .pipe(csv())
            .on('data', (data) => {
                try {
                    // Parse labels JSON string - handle potential escaping issues
                    let labelsStr = data.labels;
                    if (labelsStr && labelsStr.startsWith('"') && labelsStr.endsWith('"')) {
                        labelsStr = labelsStr.slice(1, -1); // Remove outer quotes
                    }
                    // Handle escaped quotes
                    labelsStr = labelsStr.replace(/\\"/g, '"');
                    
                    const labels = JSON.parse(labelsStr);
                    results.push({
                        id: data.id,
                        title: data.title || '',
                        description: data.description || '',
                        labels: labels || [],
                        assignee: data.assignee
                    });
                } catch (e) {
                    console.warn(`Error parsing row ${data.id}:`, e.message, 'Original labels string:', data.labels);
                    // Fallback: treat labels as plain text or extract from string
                    const labelsText = data.labels ? data.labels.replace(/[\[\]"\\]/g, '').split(',').map(s => s.trim()) : [];
                    results.push({
                        id: data.id,
                        title: data.title || '',
                        description: data.description || '',
                        labels: labelsText,
                        assignee: data.assignee
                    });
                }
            })
            .on('end', () => {
                console.log(`Loaded ${results.length} training samples`);
                resolve(results);
            })
            .on('error', reject);
    });
}

/**
 * Create text features from title, description, and labels
 * Simple keyword-based approach
 */
function createTextFeatures(data) {
    // Combine text fields
    const texts = data.map(item => {
        const labelsText = Array.isArray(item.labels) ? item.labels.join(' ') : '';
        return `${item.title} ${item.description} ${labelsText}`.toLowerCase();
    });

    console.log('Sample processed text:', texts[0]);

    // Use natural.js for tokenization and TF-IDF
    const TfIdf = natural.TfIdf;
    const tokenizer = new natural.WordTokenizer();
    const tfidf = new TfIdf();
    
    // Add documents to TF-IDF
    texts.forEach(text => {
        tfidf.addDocument(text);
    });

    // Get vocabulary and create feature matrix
    const vocabulary = new Set();
    texts.forEach(text => {
        const tokens = tokenizer.tokenize(text);
        tokens.forEach(token => vocabulary.add(token));
    });

    const vocabArray = Array.from(vocabulary);
    console.log(`Vocabulary size: ${vocabArray.length}`);

    // Create feature matrix using simple TF-IDF scores
    const featureMatrix = [];
    for (let i = 0; i < texts.length; i++) {
        const features = [];
        vocabArray.forEach(term => {
            const tfidfScore = tfidf.tfidf(term, i);
            features.push(tfidfScore);
        });
        featureMatrix.push(features);
    }

    return {
        featureMatrix: featureMatrix,
        vocabulary: vocabArray,
        texts: texts,
        tfidf: tfidf
    };
}

/**
 * Simple Naive Bayes-like classifier
 * Calculate term frequencies for each assignee
 */
function trainSimpleClassifier(data, features) {
    const assignees = [...new Set(data.map(item => item.assignee))];
    const assigneeStats = {};
    
    // Initialize stats for each assignee
    assignees.forEach(assignee => {
        assigneeStats[assignee] = {
            count: 0,
            termFreqs: {},
            totalTerms: 0
        };
    });

    // Calculate term frequencies per assignee
    data.forEach((item, index) => {
        const assignee = item.assignee;
        const text = features.texts[index];
        const tokens = text.split(/\s+/).filter(t => t.length > 0);
        
        assigneeStats[assignee].count++;
        tokens.forEach(token => {
            if (!assigneeStats[assignee].termFreqs[token]) {
                assigneeStats[assignee].termFreqs[token] = 0;
            }
            assigneeStats[assignee].termFreqs[token]++;
            assigneeStats[assignee].totalTerms++;
        });
    });

    console.log('Assignee stats:', Object.keys(assigneeStats).map(a => ({
        assignee: a,
        count: assigneeStats[a].count,
        uniqueTerms: Object.keys(assigneeStats[a].termFreqs).length
    })));

    return {
        assignees,
        assigneeStats,
        vocabulary: features.vocabulary
    };
}

/**
 * Predict assignee for new text using simple scoring
 */
function predict(model, text) {
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
 * Test the model accuracy
 */
function testModel(model, data, features) {
    let correct = 0;
    const predictions = [];
    
    data.forEach((item, index) => {
        const text = features.texts[index];
        const predicted = predict(model, text);
        const actual = item.assignee;
        
        predictions.push({ predicted, actual, correct: predicted === actual });
        if (predicted === actual) correct++;
    });
    
    const accuracy = correct / data.length;
    console.log(`Training accuracy: ${(accuracy * 100).toFixed(2)}%`);
    console.log('Sample predictions:', predictions.slice(0, 3));
    
    return accuracy;
}

/**
 * Save the trained model to JSON file
 */
function saveModel(model) {
    const modelData = {
        ...model,
        metadata: {
            trainedAt: new Date().toISOString(),
            version: '1.0.0',
            framework: 'nodejs-simple'
        }
    };

    // Ensure model directory exists
    const modelDir = path.dirname(MODEL_PATH);
    if (!fs.existsSync(modelDir)) {
        fs.mkdirSync(modelDir, { recursive: true });
    }

    fs.writeFileSync(MODEL_PATH, JSON.stringify(modelData, null, 2));
    console.log(`Model saved to: ${MODEL_PATH}`);
}

/**
 * Main training function
 */
async function main() {
    try {
        console.log('Starting model training...');
        
        // Load data
        const data = await loadData();
        if (data.length === 0) {
            throw new Error('No training data found');
        }

        // Create features
        const features = createTextFeatures(data);
        
        // Train simple classifier
        const model = trainSimpleClassifier(data, features);
        
        // Test model
        testModel(model, data, features);
        
        // Save model
        saveModel(model);
        
        console.log('Model training completed successfully!');
        
    } catch (error) {
        console.error('Training failed:', error);
        process.exit(1);
    }
}

// Run training if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = { main, loadData, createTextFeatures, trainSimpleClassifier, predict };