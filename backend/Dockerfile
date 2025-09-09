FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p data

# Expose port (Render will set PORT env var)
EXPOSE $PORT

# Create logs directory
RUN mkdir -p logs

# Run the application (Render sets PORT env var)
CMD uvicorn app:app --host 0.0.0.0 --port $PORT
