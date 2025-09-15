FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r requirements.txt

# Copy rest of the app
COPY . .

# Run training script during build to generate the model
# This will fail with clear error if data/issues_mock.csv is missing
RUN python train.py

# Expose the Flask port
EXPOSE 5000

CMD ["python", "app/api.py"]