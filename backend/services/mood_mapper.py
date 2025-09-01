"""Mood mapping service for recommendation preferences."""

from typing import Dict, List, Tuple
from core.config import settings


class MoodMapper:
    """Maps moods to preferred content characteristics."""
    
    def __init__(self):
        """Initialize mood mappings."""
        self.mood_preferences = {
            "energized": {
                "workout_tags": ["hiit", "cardio", "strength", "intense", "dynamic"],
                "recipe_tags": ["protein", "energy", "smoothie", "quick", "fresh"],
                "course_tags": ["productivity", "skills", "challenge", "active"],
                "workout_weight": 0.4,
                "recipe_weight": 0.3,
                "course_weight": 0.3,
                "difficulty_preference": ["intermediate", "advanced"],
                "duration_preference": "medium_to_long"
            },
            "calm": {
                "workout_tags": ["yoga", "stretching", "meditation", "gentle", "relaxing"],
                "recipe_tags": ["comfort", "warm", "herbal", "soothing", "mindful"],
                "course_tags": ["mindfulness", "art", "philosophy", "gentle", "reflection"],
                "workout_weight": 0.3,
                "recipe_weight": 0.4,
                "course_weight": 0.3,
                "difficulty_preference": ["beginner", "intermediate"],
                "duration_preference": "medium"
            },
            "stressed": {
                "workout_tags": ["yoga", "breathing", "meditation", "stress-relief", "gentle"],
                "recipe_tags": ["comfort", "simple", "quick", "healthy", "calming"],
                "course_tags": ["stress-management", "mindfulness", "simple", "practical"],
                "workout_weight": 0.4,
                "recipe_weight": 0.3,
                "course_weight": 0.3,
                "difficulty_preference": ["beginner"],
                "duration_preference": "short_to_medium"
            },
            "happy": {
                "workout_tags": ["fun", "dance", "social", "energetic", "playful"],
                "recipe_tags": ["colorful", "creative", "social", "celebration", "variety"],
                "course_tags": ["creative", "social", "fun", "exploration", "variety"],
                "workout_weight": 0.35,
                "recipe_weight": 0.35,
                "course_weight": 0.3,
                "difficulty_preference": ["beginner", "intermediate", "advanced"],
                "duration_preference": "flexible"
            },
            "tired": {
                "workout_tags": ["gentle", "restorative", "stretching", "low-impact", "recovery"],
                "recipe_tags": ["energizing", "nutritious", "simple", "vitamin", "boost"],
                "course_tags": ["light", "inspiring", "motivational", "easy", "short"],
                "workout_weight": 0.2,
                "recipe_weight": 0.4,
                "course_weight": 0.4,
                "difficulty_preference": ["beginner"],
                "duration_preference": "short"
            }
        }
        
        self.time_preferences = {
            "short": {"min": 0, "max": 15, "optimal": 10},
            "short_to_medium": {"min": 5, "max": 30, "optimal": 20},
            "medium": {"min": 15, "max": 45, "optimal": 30},
            "medium_to_long": {"min": 30, "max": 90, "optimal": 60},
            "flexible": {"min": 5, "max": 120, "optimal": 45}
        }
    
    def get_mood_preferences(self, mood: str) -> Dict:
        """Get preferences for a given mood."""
        return self.mood_preferences.get(mood, self.mood_preferences["happy"])
    
    def get_preferred_tags(self, mood: str, domain: str) -> List[str]:
        """Get preferred tags for a mood and domain."""
        preferences = self.get_mood_preferences(mood)
        return preferences.get(f"{domain}_tags", [])
    
    def get_domain_weights(self, mood: str) -> Dict[str, float]:
        """Get domain weights for a mood."""
        preferences = self.get_mood_preferences(mood)
        return {
            "workout": preferences.get("workout_weight", 0.33),
            "recipe": preferences.get("recipe_weight", 0.33),
            "course": preferences.get("course_weight", 0.34)
        }
    
    def get_time_constraints(self, mood: str, available_minutes: int) -> Dict:
        """Get time constraints based on mood and available time."""
        preferences = self.get_mood_preferences(mood)
        duration_pref = preferences.get("duration_preference", "flexible")
        time_range = self.time_preferences[duration_pref]
        
        # Adjust based on actual available time
        max_time = min(available_minutes, time_range["max"])
        min_time = min(time_range["min"], max_time)
        
        return {
            "min_duration": min_time,
            "max_duration": max_time,
            "optimal_duration": min(time_range["optimal"], max_time)
        }
    
    def calculate_mood_score(self, item_tags: List[str], mood: str, domain: str) -> float:
        """Calculate how well an item matches a mood."""
        preferred_tags = self.get_preferred_tags(mood, domain)
        if not preferred_tags or not item_tags:
            return 0.5  # neutral score
        
        # Calculate overlap
        tag_overlap = len(set(item_tags) & set(preferred_tags))
        max_possible = min(len(item_tags), len(preferred_tags))
        
        if max_possible == 0:
            return 0.5
        
        return tag_overlap / max_possible
    
    def get_difficulty_preference_score(self, item_difficulty: str, mood: str) -> float:
        """Get preference score for item difficulty based on mood."""
        preferences = self.get_mood_preferences(mood)
        preferred_difficulties = preferences.get("difficulty_preference", ["intermediate"])
        
        if item_difficulty.lower() in preferred_difficulties:
            return 1.0
        elif len(preferred_difficulties) > 1:
            return 0.7  # partial match
        else:
            return 0.3  # not preferred


# Global instance
mood_mapper = MoodMapper()
