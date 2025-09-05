"""Health check and metadata endpoints."""

from fastapi import APIRouter
from core.config import settings
from services.data_loader import data_loader

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "version": settings.app_version,
        "app_name": settings.app_name
    }


@router.get("/metadata")
async def get_metadata():
    """Get system metadata including data counts and available options."""
    metadata = data_loader.get_metadata()
    
    return {
        "data_summary": metadata,
        "configuration": {
            "mood_options": settings.mood_options,
            "time_options": settings.available_time_options,
            "interest_options": settings.interest_options,
            "max_recommendations": settings.max_recommendation_limit
        },
        "features": {
            "collaborative_filtering": True,  # Will be updated based on surprise availability
            "content_filtering": True,
            "mood_mapping": True,
            "time_optimization": True
        }
    }
