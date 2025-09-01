"""Configuration settings for the application."""

import os
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Server configuration
    backend_port: int = 7017
    allowed_origins: List[str] = ["http://localhost:3006"]
    
    # Database configuration
    database_url: str = "sqlite:///./feedback.db"
    
    # Logging configuration
    log_level: str = "INFO"
    
    # Application metadata
    app_name: str = "Smart Lifestyle & Learning Recommender"
    app_version: str = "1.0.0"
    app_description: str = "AI-powered recommendations for workouts, recipes, and learning"
    
    # Data paths
    data_dir: str = "data"
    workouts_file: str = "workouts.csv"
    recipes_file: str = "recipes.csv"
    courses_file: str = "courses.csv"
    
    # Recommendation settings
    default_recommendation_limit: int = 6
    max_recommendation_limit: int = 20
    content_weight: float = 0.7
    collaborative_weight: float = 0.3
    
    # Mood and time settings
    available_time_options: List[int] = [5, 10, 30, 60, 120]
    mood_options: List[str] = ["energized", "calm", "stressed", "happy", "tired"]
    interest_options: List[str] = ["lifestyle", "learning"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
