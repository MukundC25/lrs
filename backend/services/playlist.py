"""Playlist generation service for creating curated daily recommendations."""

import random
from typing import Dict, List, Optional, Tuple
from core.config import settings
from core.logging import app_logger
from services.data_loader import data_loader
from services.recommender import recommendation_engine


class PlaylistGenerator:
    """Generates curated playlists from recommendations."""
    
    def __init__(self):
        """Initialize playlist generator."""
        self.domain_order_preferences = {
            "energized": ["workout", "recipe", "course"],
            "calm": ["course", "recipe", "workout"],
            "stressed": ["workout", "course", "recipe"],
            "happy": ["workout", "recipe", "course"],
            "tired": ["recipe", "course", "workout"]
        }
    
    def generate_playlist(self, mood: str, available_minutes: int, 
                         interests: List[str], limit: int = 6,
                         user_session: Optional[str] = None) -> Dict:
        """Generate a curated playlist based on preferences."""
        
        # Get recommendations from the engine
        recommendations = recommendation_engine.get_recommendations(
            mood=mood,
            available_minutes=available_minutes,
            interests=interests,
            limit=limit * 2,  # Get more for better curation
            user_session=user_session
        )
        
        if not recommendations:
            app_logger.warning("No recommendations found, returning empty playlist")
            return {
                "playlist": [],
                "total_duration": 0,
                "message": "No recommendations available"
            }
        
        # Enrich recommendations with full item data
        enriched_recommendations = self._enrich_recommendations(recommendations)
        
        # Create curated playlist
        playlist = self._curate_playlist(
            enriched_recommendations, mood, available_minutes, limit
        )
        
        # Calculate total duration
        total_duration = sum(item.get('duration_min', 0) for item in playlist)
        
        return {
            "playlist": playlist,
            "total_duration": total_duration,
            "mood": mood,
            "available_minutes": available_minutes,
            "interests": interests
        }
    
    def _enrich_recommendations(self, recommendations: List[Dict]) -> List[Dict]:
        """Enrich recommendations with full item data."""
        enriched = []
        
        for rec in recommendations:
            item_id = rec['item_id']
            item_data = data_loader.get_item_by_id(item_id)
            
            if item_data:
                # Combine recommendation scores with item data
                enriched_item = {
                    **item_data,
                    'score': rec.get('final_score', rec.get('content_score', 0.5)),
                    'content_score': rec.get('content_score', 0.5),
                    'collaborative_score': rec.get('collaborative_score', 0.5),
                    'mood_score': rec.get('mood_score', 0.5),
                    'time_score': rec.get('time_score', 0.5)
                }
                enriched.append(enriched_item)
        
        return enriched
    
    def _curate_playlist(self, recommendations: List[Dict], mood: str, 
                        available_minutes: int, limit: int) -> List[Dict]:
        """Curate a balanced playlist from recommendations."""
        
        # Group recommendations by domain
        domain_groups = {}
        for item in recommendations:
            domain = item['domain']
            if domain not in domain_groups:
                domain_groups[domain] = []
            domain_groups[domain].append(item)
        
        # Sort each domain group by score
        for domain in domain_groups:
            domain_groups[domain].sort(key=lambda x: x['score'], reverse=True)
        
        # Get preferred domain order for this mood
        domain_order = self.domain_order_preferences.get(
            mood, ["workout", "recipe", "course"]
        )
        
        # Build playlist with time constraints
        playlist = []
        remaining_time = available_minutes
        remaining_slots = limit
        
        # First pass: try to get one item from each domain in preferred order
        for domain in domain_order:
            if domain in domain_groups and remaining_slots > 0:
                suitable_items = [
                    item for item in domain_groups[domain]
                    if item['duration_min'] <= remaining_time
                ]
                
                if suitable_items:
                    selected_item = suitable_items[0]
                    playlist.append(self._format_playlist_item(selected_item))
                    remaining_time -= selected_item['duration_min']
                    remaining_slots -= 1
                    
                    # Remove selected item from group
                    domain_groups[domain].remove(selected_item)
        
        # Second pass: fill remaining slots with best available items
        all_remaining = []
        for domain_items in domain_groups.values():
            all_remaining.extend(domain_items)
        
        # Sort by score and filter by time
        all_remaining.sort(key=lambda x: x['score'], reverse=True)
        
        for item in all_remaining:
            if remaining_slots <= 0:
                break
            
            if item['duration_min'] <= remaining_time:
                playlist.append(self._format_playlist_item(item))
                remaining_time -= item['duration_min']
                remaining_slots -= 1
        
        # Ensure diversity - no more than 2 consecutive items from same domain
        playlist = self._ensure_diversity(playlist)
        
        return playlist
    
    def _format_playlist_item(self, item: Dict) -> Dict:
        """Format an item for playlist output."""
        return {
            "domain": item['domain'],
            "id": str(item['id']),
            "item_id": item['item_id'],
            "title": item['title'],
            "duration_min": int(item['duration_min']),
            "tags": item.get('tags_list', []),
            "mood_match": item.get('mood_tags', []),
            "image": item.get('image', f"/images/{item['domain']}s/default.jpg"),
            "score": round(float(item['score']), 3),
            "difficulty": item.get('difficulty', 'intermediate'),
            "description": item.get('description', ''),
            # Score breakdown for tooltips
            "score_breakdown": {
                "overall": round(float(item['score']), 3),
                "content": round(float(item.get('content_score', 0.5)), 3),
                "collaborative": round(float(item.get('collaborative_score', 0.5)), 3),
                "mood": round(float(item.get('mood_score', 0.5)), 3),
                "time": round(float(item.get('time_score', 0.5)), 3)
            }
        }
    
    def _ensure_diversity(self, playlist: List[Dict]) -> List[Dict]:
        """Ensure domain diversity in playlist order."""
        if len(playlist) <= 2:
            return playlist
        
        # Check for consecutive items from same domain
        for i in range(len(playlist) - 2):
            if (playlist[i]['domain'] == playlist[i + 1]['domain'] == 
                playlist[i + 2]['domain']):
                
                # Find a different domain item to swap
                for j in range(i + 3, len(playlist)):
                    if playlist[j]['domain'] != playlist[i]['domain']:
                        # Swap items
                        playlist[i + 2], playlist[j] = playlist[j], playlist[i + 2]
                        break
        
        return playlist
    
    def get_similar_items(self, item_id: str, limit: int = 5) -> List[Dict]:
        """Get items similar to a given item."""
        item = data_loader.get_item_by_id(item_id)
        if not item:
            return []
        
        domain = item['domain'] + 's'  # workout -> workouts
        all_items = data_loader.get_items_by_domain(domain)
        
        if not all_items:
            return []
        
        # Simple similarity based on shared tags
        item_tags = set(item.get('tags_list', []))
        similar_items = []
        
        for candidate in all_items:
            if candidate['item_id'] == item_id:
                continue
            
            candidate_tags = set(candidate.get('tags_list', []))
            
            # Calculate Jaccard similarity
            intersection = len(item_tags & candidate_tags)
            union = len(item_tags | candidate_tags)
            
            if union > 0:
                similarity = intersection / union
                if similarity > 0.1:  # Minimum similarity threshold
                    similar_items.append({
                        **candidate,
                        'similarity': similarity
                    })
        
        # Sort by similarity and return top items
        similar_items.sort(key=lambda x: x['similarity'], reverse=True)
        return [self._format_playlist_item(item) for item in similar_items[:limit]]
    
    def get_quick_suggestions(self, available_minutes: int, 
                            domain: Optional[str] = None) -> List[Dict]:
        """Get quick suggestions for a specific time constraint."""
        suggestions = []
        
        domains_to_search = [domain + 's'] if domain else ['workouts', 'recipes', 'courses']
        
        for d in domains_to_search:
            items = data_loader.get_items_by_duration(
                min_duration=1,
                max_duration=available_minutes,
                domain=d
            )
            
            # Sort by duration (prefer items that use most of available time)
            items.sort(key=lambda x: x['duration_min'], reverse=True)
            suggestions.extend(items[:3])  # Top 3 from each domain
        
        # Format and return
        return [self._format_playlist_item(item) for item in suggestions[:10]]


# Global instance
playlist_generator = PlaylistGenerator()
