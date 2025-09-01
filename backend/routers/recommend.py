"""Recommendation and feedback endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session

from core.config import settings
from core.logging import app_logger
from models.feedback import Feedback, FeedbackCreate, get_session
from services.playlist import playlist_generator


router = APIRouter(prefix="/api", tags=["recommendations"])


class RecommendationRequest(BaseModel):
    """Request model for recommendations."""
    mood: str = Field(..., description="User's current mood")
    available_minutes: int = Field(..., description="Available time in minutes")
    interests: List[str] = Field(..., description="User interests (lifestyle, learning)")
    limit: Optional[int] = Field(default=6, description="Number of recommendations")
    user_session: Optional[str] = Field(default=None, description="User session ID")

    class Config:
        schema_extra = {
            "example": {
                "mood": "energized",
                "available_minutes": 60,
                "interests": ["lifestyle", "learning"],
                "limit": 6,
                "user_session": "user_123"
            }
        }


class FeedbackRequest(BaseModel):
    """Request model for feedback."""
    item_id: str = Field(..., description="Item ID")
    domain: str = Field(..., description="Item domain (workout, recipe, course)")
    action: str = Field(..., description="User action (like, dislike)")
    user_session: Optional[str] = Field(default=None, description="User session ID")

    class Config:
        schema_extra = {
            "example": {
                "item_id": "workout_1",
                "domain": "workout",
                "action": "like",
                "user_session": "user_123"
            }
        }


@router.post("/recommend")
async def get_recommendations(request: RecommendationRequest):
    """Get personalized recommendations based on mood, time, and interests."""
    
    # Validate inputs
    if request.mood not in settings.mood_options:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mood. Must be one of: {settings.mood_options}"
        )
    
    if request.available_minutes not in settings.available_time_options:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid time. Must be one of: {settings.available_time_options}"
        )
    
    if not all(interest in settings.interest_options for interest in request.interests):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid interests. Must be from: {settings.interest_options}"
        )
    
    if request.limit and (request.limit < 1 or request.limit > settings.max_recommendation_limit):
        raise HTTPException(
            status_code=400,
            detail=f"Limit must be between 1 and {settings.max_recommendation_limit}"
        )
    
    try:
        # Generate playlist
        result = playlist_generator.generate_playlist(
            mood=request.mood,
            available_minutes=request.available_minutes,
            interests=request.interests,
            limit=request.limit or settings.default_recommendation_limit,
            user_session=request.user_session
        )
        
        app_logger.info(
            f"Generated playlist for mood={request.mood}, "
            f"time={request.available_minutes}, interests={request.interests}"
        )
        
        return result
        
    except Exception as e:
        app_logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error generating recommendations"
        )


@router.post("/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    session: Session = Depends(get_session)
):
    """Submit user feedback for an item."""
    
    # Validate action
    if request.action not in ["like", "dislike"]:
        raise HTTPException(
            status_code=400,
            detail="Action must be 'like' or 'dislike'"
        )
    
    try:
        # Create feedback record
        feedback = Feedback(
            item_id=request.item_id,
            domain=request.domain,
            action=request.action,
            user_session=request.user_session
        )
        
        session.add(feedback)
        session.commit()
        session.refresh(feedback)
        
        app_logger.info(
            f"Feedback recorded: {request.action} for {request.item_id} "
            f"by session {request.user_session}"
        )
        
        return {"status": "ok", "message": "Feedback recorded successfully"}
        
    except Exception as e:
        app_logger.error(f"Error recording feedback: {e}")
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error recording feedback"
        )


@router.get("/similar/{item_id}")
async def get_similar_items(item_id: str, limit: int = 5):
    """Get items similar to a given item."""
    
    if limit < 1 or limit > 20:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 20"
        )
    
    try:
        similar_items = playlist_generator.get_similar_items(item_id, limit)
        
        return {
            "item_id": item_id,
            "similar_items": similar_items,
            "count": len(similar_items)
        }
        
    except Exception as e:
        app_logger.error(f"Error getting similar items: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting similar items"
        )


@router.get("/quick-suggestions")
async def get_quick_suggestions(
    available_minutes: int,
    domain: Optional[str] = None
):
    """Get quick suggestions for a specific time constraint."""
    
    if available_minutes not in settings.available_time_options:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid time. Must be one of: {settings.available_time_options}"
        )
    
    if domain and domain not in ["workout", "recipe", "course"]:
        raise HTTPException(
            status_code=400,
            detail="Domain must be one of: workout, recipe, course"
        )
    
    try:
        suggestions = playlist_generator.get_quick_suggestions(
            available_minutes, domain
        )
        
        return {
            "available_minutes": available_minutes,
            "domain": domain,
            "suggestions": suggestions,
            "count": len(suggestions)
        }
        
    except Exception as e:
        app_logger.error(f"Error getting quick suggestions: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error getting quick suggestions"
        )
