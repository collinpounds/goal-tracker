# Build frontend first
FROM node:18-alpine AS frontend-build

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Backend with frontend static files
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including curl for healthcheck and CA certificates for SSL
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY backend/pyproject.toml .
RUN pip install --no-cache-dir .

# Copy application
COPY backend/app ./app

# Copy frontend build from frontend-build stage
COPY --from=frontend-build /frontend/dist ./static

# Expose port (backend serves both API and frontend)
EXPOSE 8000

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
