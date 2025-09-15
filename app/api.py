from flask import Flask, request, jsonify
import joblib
import os

app = Flask(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../model/ticket_assigner.pkl')
model = joblib.load(MODEL_PATH)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    title = data.get('title', '')
    description = data.get('description', '')
    labels = data.get('labels', [])
    # If labels is a list, join as space-separated string
    if isinstance(labels, list):
        labels_text = ' '.join(labels)
    else:
        labels_text = str(labels)
    text = f'{title} {description} {labels_text}'
    assignee = model.predict([text])[0]
    return jsonify({'assignee': assignee})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
