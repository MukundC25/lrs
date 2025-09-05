"""Tests for API endpoints."""

import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


class TestHealthEndpoint:
    """Test health check endpoint."""
    
    def test_health_check(self):
        """Test health check returns correct response."""
        response = client.get("/api/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "version" in data
        assert "app_name" in data
        assert data["status"] == "ok"
    
    def test_metadata_endpoint(self):
        """Test metadata endpoint returns system information."""
        response = client.get("/api/metadata")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "data_summary" in data
        assert "configuration" in data
        assert "features" in data
        
        # Check configuration structure
        config = data["configuration"]
        assert "mood_options" in config
        assert "time_options" in config
        assert "interest_options" in config


class TestRecommendationEndpoint:
    """Test recommendation endpoint."""
    
    def test_get_recommendations_valid_request(self):
        """Test recommendation endpoint with valid request."""
        request_data = {
            "mood": "happy",
            "available_minutes": 30,
            "interests": ["lifestyle"],
            "limit": 5
        }
        
        response = client.post("/api/recommend", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "playlist" in data
        assert "total_duration" in data
        assert "mood" in data
        assert "available_minutes" in data
        assert "interests" in data
        
        assert isinstance(data["playlist"], list)
        assert isinstance(data["total_duration"], int)
        assert data["mood"] == "happy"
        assert data["available_minutes"] == 30
        assert data["interests"] == ["lifestyle"]
    
    def test_get_recommendations_with_user_session(self):
        """Test recommendation endpoint with user session."""
        request_data = {
            "mood": "energized",
            "available_minutes": 60,
            "interests": ["lifestyle", "learning"],
            "limit": 6,
            "user_session": "test_user_123"
        }
        
        response = client.post("/api/recommend", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["playlist"]) <= 6
    
    def test_get_recommendations_invalid_mood(self):
        """Test recommendation endpoint with invalid mood."""
        request_data = {
            "mood": "invalid_mood",
            "available_minutes": 30,
            "interests": ["lifestyle"]
        }
        
        response = client.post("/api/recommend", json=request_data)
        
        assert response.status_code == 400
        assert "detail" in response.json()
    
    def test_get_recommendations_invalid_time(self):
        """Test recommendation endpoint with invalid time."""
        request_data = {
            "mood": "happy",
            "available_minutes": 999,  # Invalid time
            "interests": ["lifestyle"]
        }
        
        response = client.post("/api/recommend", json=request_data)
        
        assert response.status_code == 400
    
    def test_get_recommendations_invalid_interests(self):
        """Test recommendation endpoint with invalid interests."""
        request_data = {
            "mood": "happy",
            "available_minutes": 30,
            "interests": ["invalid_interest"]
        }
        
        response = client.post("/api/recommend", json=request_data)
        
        assert response.status_code == 400
    
    def test_get_recommendations_missing_fields(self):
        """Test recommendation endpoint with missing required fields."""
        request_data = {
            "mood": "happy"
            # Missing available_minutes and interests
        }
        
        response = client.post("/api/recommend", json=request_data)
        
        assert response.status_code == 422  # Validation error


class TestFeedbackEndpoint:
    """Test feedback endpoint."""
    
    def test_submit_feedback_like(self):
        """Test submitting like feedback."""
        feedback_data = {
            "item_id": "workout_1",
            "domain": "workout",
            "action": "like",
            "user_session": "test_user_123"
        }
        
        response = client.post("/api/feedback", json=feedback_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "message" in data
        assert data["status"] == "ok"
    
    def test_submit_feedback_dislike(self):
        """Test submitting dislike feedback."""
        feedback_data = {
            "item_id": "recipe_5",
            "domain": "recipe",
            "action": "dislike",
            "user_session": "test_user_456"
        }
        
        response = client.post("/api/feedback", json=feedback_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
    
    def test_submit_feedback_invalid_action(self):
        """Test submitting feedback with invalid action."""
        feedback_data = {
            "item_id": "workout_1",
            "domain": "workout",
            "action": "invalid_action",
            "user_session": "test_user_123"
        }
        
        response = client.post("/api/feedback", json=feedback_data)
        
        assert response.status_code == 400
    
    def test_submit_feedback_missing_fields(self):
        """Test submitting feedback with missing fields."""
        feedback_data = {
            "item_id": "workout_1"
            # Missing domain and action
        }
        
        response = client.post("/api/feedback", json=feedback_data)
        
        assert response.status_code == 422  # Validation error


class TestSimilarItemsEndpoint:
    """Test similar items endpoint."""
    
    def test_get_similar_items(self):
        """Test getting similar items."""
        # First get some recommendations to have valid item IDs
        request_data = {
            "mood": "happy",
            "available_minutes": 30,
            "interests": ["lifestyle"]
        }
        
        rec_response = client.post("/api/recommend", json=request_data)
        assert rec_response.status_code == 200
        
        playlist = rec_response.json()["playlist"]
        if playlist:
            item_id = playlist[0]["item_id"]
            
            response = client.get(f"/api/similar/{item_id}?limit=3")
            
            assert response.status_code == 200
            data = response.json()
            
            assert "item_id" in data
            assert "similar_items" in data
            assert "count" in data
            assert data["item_id"] == item_id
            assert isinstance(data["similar_items"], list)
            assert len(data["similar_items"]) <= 3
    
    def test_get_similar_items_invalid_limit(self):
        """Test getting similar items with invalid limit."""
        response = client.get("/api/similar/workout_1?limit=25")  # Exceeds max limit
        
        assert response.status_code == 400


class TestQuickSuggestionsEndpoint:
    """Test quick suggestions endpoint."""
    
    def test_get_quick_suggestions(self):
        """Test getting quick suggestions."""
        response = client.get("/api/quick-suggestions?available_minutes=10")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "available_minutes" in data
        assert "suggestions" in data
        assert "count" in data
        assert data["available_minutes"] == 10
        assert isinstance(data["suggestions"], list)
    
    def test_get_quick_suggestions_with_domain(self):
        """Test getting quick suggestions for specific domain."""
        response = client.get("/api/quick-suggestions?available_minutes=30&domain=workout")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["domain"] == "workout"
        
        # All suggestions should be workouts
        for suggestion in data["suggestions"]:
            assert suggestion["domain"] == "workout"
            assert suggestion["duration_min"] <= 30
    
    def test_get_quick_suggestions_invalid_time(self):
        """Test getting quick suggestions with invalid time."""
        response = client.get("/api/quick-suggestions?available_minutes=999")
        
        assert response.status_code == 400
    
    def test_get_quick_suggestions_invalid_domain(self):
        """Test getting quick suggestions with invalid domain."""
        response = client.get("/api/quick-suggestions?available_minutes=30&domain=invalid")
        
        assert response.status_code == 400


class TestRootEndpoint:
    """Test root endpoint."""
    
    def test_root_endpoint(self):
        """Test root endpoint returns welcome message."""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "version" in data
        assert "docs" in data
        assert "health" in data


if __name__ == "__main__":
    pytest.main([__file__])
