"""Tests for playlist generation functionality."""

import pytest
from services.playlist import PlaylistGenerator
from services.data_loader import DataLoader
from services.mood_mapper import MoodMapper


class TestPlaylistGenerator:
    """Test playlist generation functionality."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.playlist_generator = PlaylistGenerator()
        self.data_loader = DataLoader()
        self.mood_mapper = MoodMapper()
    
    def test_generate_playlist_basic(self):
        """Test basic playlist generation."""
        result = self.playlist_generator.generate_playlist(
            mood="happy",
            available_minutes=30,
            interests=["lifestyle"],
            limit=5
        )
        
        assert "playlist" in result
        assert "total_duration" in result
        assert isinstance(result["playlist"], list)
        assert isinstance(result["total_duration"], int)
        assert result["mood"] == "happy"
        assert result["available_minutes"] == 30
        assert result["interests"] == ["lifestyle"]
    
    def test_playlist_respects_time_budget(self):
        """Test that playlist respects available time."""
        result = self.playlist_generator.generate_playlist(
            mood="energized",
            available_minutes=10,
            interests=["lifestyle", "learning"],
            limit=6
        )
        
        # Total duration should not exceed available time by more than 20%
        assert result["total_duration"] <= result["available_minutes"] * 1.2
    
    def test_playlist_diversification(self):
        """Test that playlist includes diverse content types."""
        result = self.playlist_generator.generate_playlist(
            mood="calm",
            available_minutes=60,
            interests=["lifestyle", "learning"],
            limit=6
        )
        
        if len(result["playlist"]) > 2:
            domains = [item["domain"] for item in result["playlist"]]
            unique_domains = set(domains)
            
            # Should have at least 2 different domains for diverse content
            assert len(unique_domains) >= 2
    
    def test_playlist_with_single_interest(self):
        """Test playlist generation with single interest."""
        result = self.playlist_generator.generate_playlist(
            mood="stressed",
            available_minutes=15,
            interests=["learning"],
            limit=3
        )
        
        assert len(result["playlist"]) <= 3
        # Should contain learning-related content
        if result["playlist"]:
            domains = [item["domain"] for item in result["playlist"]]
            assert "course" in domains
    
    def test_empty_playlist_handling(self):
        """Test handling when no suitable items are found."""
        # This might happen with very restrictive constraints
        result = self.playlist_generator.generate_playlist(
            mood="tired",
            available_minutes=1,  # Very short time
            interests=["learning"],
            limit=10
        )
        
        # Should still return valid structure even if empty
        assert "playlist" in result
        assert "total_duration" in result
        assert isinstance(result["playlist"], list)
    
    def test_mood_influence_on_recommendations(self):
        """Test that mood influences recommendation selection."""
        energized_result = self.playlist_generator.generate_playlist(
            mood="energized",
            available_minutes=30,
            interests=["lifestyle"],
            limit=5
        )
        
        calm_result = self.playlist_generator.generate_playlist(
            mood="calm",
            available_minutes=30,
            interests=["lifestyle"],
            limit=5
        )
        
        # Results should be different for different moods
        if energized_result["playlist"] and calm_result["playlist"]:
            energized_items = {item["item_id"] for item in energized_result["playlist"]}
            calm_items = {item["item_id"] for item in calm_result["playlist"]}
            
            # At least some items should be different
            assert energized_items != calm_items
    
    def test_get_similar_items(self):
        """Test similar items functionality."""
        # First get a playlist to have some items
        result = self.playlist_generator.generate_playlist(
            mood="happy",
            available_minutes=30,
            interests=["lifestyle"],
            limit=3
        )
        
        if result["playlist"]:
            item_id = result["playlist"][0]["item_id"]
            similar_items = self.playlist_generator.get_similar_items(item_id, limit=3)
            
            assert isinstance(similar_items, list)
            assert len(similar_items) <= 3
            
            # Similar items should not include the original item
            similar_ids = {item["item_id"] for item in similar_items}
            assert item_id not in similar_ids
    
    def test_get_quick_suggestions(self):
        """Test quick suggestions functionality."""
        suggestions = self.playlist_generator.get_quick_suggestions(
            available_minutes=10,
            domain="workout"
        )
        
        assert isinstance(suggestions, list)
        
        if suggestions:
            # All suggestions should fit within time limit
            for item in suggestions:
                assert item["duration_min"] <= 10
                assert item["domain"] == "workout"
    
    def test_playlist_item_format(self):
        """Test that playlist items have correct format."""
        result = self.playlist_generator.generate_playlist(
            mood="happy",
            available_minutes=30,
            interests=["lifestyle"],
            limit=3
        )
        
        if result["playlist"]:
            item = result["playlist"][0]
            
            # Check required fields
            required_fields = [
                "domain", "id", "item_id", "title", "duration_min",
                "tags", "mood_match", "image", "score", "score_breakdown"
            ]
            
            for field in required_fields:
                assert field in item
            
            # Check score breakdown structure
            score_breakdown = item["score_breakdown"]
            assert "overall" in score_breakdown
            assert "content" in score_breakdown
            assert "mood" in score_breakdown
            assert "time" in score_breakdown
            
            # Scores should be between 0 and 1
            assert 0 <= item["score"] <= 1
            assert 0 <= score_breakdown["overall"] <= 1


class TestMoodMapper:
    """Test mood mapping functionality."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.mood_mapper = MoodMapper()
    
    def test_get_mood_preferences(self):
        """Test mood preference retrieval."""
        prefs = self.mood_mapper.get_mood_preferences("energized")
        
        assert "workout_tags" in prefs
        assert "recipe_tags" in prefs
        assert "course_tags" in prefs
        assert "workout_weight" in prefs
        assert "recipe_weight" in prefs
        assert "course_weight" in prefs
    
    def test_get_preferred_tags(self):
        """Test preferred tags for mood and domain."""
        tags = self.mood_mapper.get_preferred_tags("calm", "workout")
        
        assert isinstance(tags, list)
        assert "yoga" in tags or "stretching" in tags  # Expected for calm mood
    
    def test_calculate_mood_score(self):
        """Test mood score calculation."""
        item_tags = ["yoga", "relaxing", "gentle"]
        score = self.mood_mapper.calculate_mood_score(item_tags, "calm", "workout")
        
        assert 0 <= score <= 1
        assert score > 0.5  # Should be high for matching tags
    
    def test_get_time_constraints(self):
        """Test time constraint calculation."""
        constraints = self.mood_mapper.get_time_constraints("energized", 60)
        
        assert "min_duration" in constraints
        assert "max_duration" in constraints
        assert "optimal_duration" in constraints
        assert constraints["min_duration"] <= constraints["max_duration"]


if __name__ == "__main__":
    pytest.main([__file__])
