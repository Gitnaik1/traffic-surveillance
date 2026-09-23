# Dockerfile for UrbanTrax AI Traffic Intelligence & ANPR Service
FROM python:3.11-slim

# Install system dependencies for OpenCV and GL
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install dependencies
COPY backend/requirements.txt ./backend_requirements.txt
COPY backend/requirements-ml.txt ./backend_requirements_ml.txt

RUN pip install --no-cache-dir -r backend_requirements.txt
RUN pip install --no-cache-dir -r backend_requirements_ml.txt

# Copy source code
COPY . /app

EXPOSE 8000

# Run FastAPI backend using uvicorn
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
