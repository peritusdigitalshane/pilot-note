# Docker Deployment Guide

This project is configured for Docker containerization with a multi-stage build process.

## Quick Start

### Build and Run with Docker

```bash
# Build the image
docker build -t my-llm-hub .

# Run the container
docker run -p 3000:80 my-llm-hub
```

Access the application at `http://localhost:3000`

### Using Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Configuration

### Environment Variables

The Supabase configuration is embedded in the build. If you need to use different Supabase credentials:

1. Create a `.env.production` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

2. Rebuild the image

### Custom Port

To run on a different port, modify the docker-compose.yml or use:

```bash
docker run -p 8080:80 my-llm-hub
```

## Production Deployment

### Building for Production

```bash
# Build with a specific tag
docker build -t my-llm-hub:v1.0.0 .

# Push to registry (example with Docker Hub)
docker tag my-llm-hub:v1.0.0 username/my-llm-hub:v1.0.0
docker push username/my-llm-hub:v1.0.0
```

### Kubernetes Deployment

Example deployment.yaml:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-hub
spec:
  replicas: 3
  selector:
    matchLabels:
      app: llm-hub
  template:
    metadata:
      labels:
        app: llm-hub
    spec:
      containers:
      - name: web
        image: username/my-llm-hub:v1.0.0
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: llm-hub
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: llm-hub
```

## Architecture

- **Stage 1**: Node.js 20 Alpine - Builds the Vite application
- **Stage 2**: Nginx Alpine - Serves the static files with optimized configuration

## Optimization Features

- Multi-stage build for minimal image size
- Gzip compression enabled
- Static asset caching (1 year)
- Security headers configured
- SPA routing support
