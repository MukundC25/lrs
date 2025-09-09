#!/bin/bash

# Build script for Render deployment

echo "🚀 Starting Render build process..."

# Check if we're building frontend or backend
if [ "$RENDER_SERVICE_NAME" = "lrs-frontend" ]; then
    echo "📦 Building Frontend (Next.js)..."
    cd frontend
    npm install
    npm run build
    echo "✅ Frontend build complete!"
    
elif [ "$RENDER_SERVICE_NAME" = "lrs-backend" ]; then
    echo "🐍 Building Backend (FastAPI)..."
    cd backend
    pip install -r requirements.txt
    echo "✅ Backend build complete!"
    
else
    echo "❌ Unknown service name: $RENDER_SERVICE_NAME"
    exit 1
fi

echo "🎉 Build process finished successfully!"
