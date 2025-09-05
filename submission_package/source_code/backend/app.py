"""Main FastAPI application."""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from core.config import settings
from core.logging import app_logger
from routers import health, recommend


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    app_logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    app_logger.info(f"Backend running on port {settings.backend_port}")
    
    # Create logs directory
    os.makedirs("logs", exist_ok=True)
    
    # Create data directory if it doesn't exist
    os.makedirs(settings.data_dir, exist_ok=True)
    
    yield
    
    # Shutdown
    app_logger.info("Shutting down application")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(recommend.router)

# Mount static files for images
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=settings.backend_port,
        reload=True,
        log_level=settings.log_level.lower()
    )
