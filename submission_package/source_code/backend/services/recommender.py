"""Core recommendation engine with content-based and collaborative filtering."""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from core.config import settings
from core.logging import app_logger
from services.data_loader import data_loader
from services.mood_mapper import mood_mapper

# Try to import surprise for collaborative filtering
try:
    from surprise import Dataset, Reader, SVD
    from surprise.model_selection import train_test_split
    SURPRISE_AVAILABLE = True
    app_logger.info("scikit-surprise available - collaborative filtering enabled")
except ImportError:
    SURPRISE_AVAILABLE = False
    app_logger.warning("scikit-surprise not available - falling back to content-based only")


class RecommendationEngine:
    """Main recommendation engine combining content-based and collaborative filtering."""
    
    def __init__(self):
        """Initialize the recommendation engine."""
        self.tfidf_vectorizers = {}
        self.content_matrices = {}
        self.collaborative_models = {}
        self.item_features = {}
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize recommendation models."""
        try:
            self._build_content_models()
            if SURPRISE_AVAILABLE:
                self._build_collaborative_models()
        except Exception as e:
            app_logger.error(f"Error initializing models: {e}")
    
    def _build_content_models(self):
        """Build content-based recommendation models."""
        for domain in ['workouts', 'recipes', 'courses']:
            df = data_loader.get_data(domain)
            if df.empty:
                continue
            
            # Create feature text combining tags and other attributes
            feature_texts = []
            item_features = []
            
            for _, item in df.iterrows():
                # Combine tags, mood tags, and other text features
                features = []
                
                if 'tags_list' in item and isinstance(item['tags_list'], list):
                    features.extend(item['tags_list'])
                
                if 'mood_tags' in item and isinstance(item['mood_tags'], list):
                    features.extend(item['mood_tags'])
                
                # Add difficulty if available
                if 'difficulty' in item and pd.notna(item['difficulty']):
                    features.append(str(item['difficulty']).lower())
                
                # Add type/category if available
                if 'type' in item and pd.notna(item['type']):
                    features.append(str(item['type']).lower())
                
                feature_text = ' '.join(features)
                feature_texts.append(feature_text)
                
                # Store item features for scoring
                item_features.append({
                    'item_id': item['item_id'],
                    'tags': item.get('tags_list', []),
                    'mood_tags': item.get('mood_tags', []),
                    'duration': item.get('duration_min', 30),
                    'difficulty': item.get('difficulty', 'intermediate'),
                    'domain': item['domain']
                })
            
            if feature_texts:
                # Build TF-IDF matrix
                vectorizer = TfidfVectorizer(
                    max_features=1000,
                    stop_words='english',
                    ngram_range=(1, 2)
                )
                tfidf_matrix = vectorizer.fit_transform(feature_texts)
                
                self.tfidf_vectorizers[domain] = vectorizer
                self.content_matrices[domain] = tfidf_matrix
                self.item_features[domain] = item_features
                
                app_logger.info(f"Built content model for {domain}: {tfidf_matrix.shape}")
    
    def _build_collaborative_models(self):
        """Build collaborative filtering models using surprise."""
        if not SURPRISE_AVAILABLE:
            return
        
        # Create synthetic interaction data for demo
        # In a real app, this would come from user feedback
        for domain in ['workouts', 'recipes', 'courses']:
            df = data_loader.get_data(domain)
            if df.empty:
                continue
            
            try:
                # Generate synthetic ratings for demo
                interactions = []
                for user_id in range(1, 21):  # 20 demo users
                    # Each user rates 5-10 random items
                    sample_size = min(np.random.randint(5, 11), len(df))
                    sampled_items = df.sample(sample_size)
                    
                    for _, item in sampled_items.iterrows():
                        # Generate rating based on mood compatibility
                        base_rating = np.random.uniform(2.5, 4.5)
                        interactions.append({
                            'user_id': user_id,
                            'item_id': item['item_id'],
                            'rating': base_rating
                        })
                
                if interactions:
                    # Create surprise dataset
                    df_interactions = pd.DataFrame(interactions)
                    reader = Reader(rating_scale=(1, 5))
                    dataset = Dataset.load_from_df(
                        df_interactions[['user_id', 'item_id', 'rating']], 
                        reader
                    )
                    
                    # Train SVD model
                    trainset, _ = train_test_split(dataset, test_size=0.2)
                    model = SVD(n_factors=50, random_state=42)
                    model.fit(trainset)
                    
                    self.collaborative_models[domain] = model
                    app_logger.info(f"Built collaborative model for {domain}")
                    
            except Exception as e:
                app_logger.error(f"Error building collaborative model for {domain}: {e}")
    
    def get_content_recommendations(self, mood: str, interests: List[str], 
                                  available_minutes: int, limit: int = 6) -> List[Dict]:
        """Get content-based recommendations."""
        recommendations = []
        
        # Get mood preferences
        domain_weights = mood_mapper.get_domain_weights(mood)
        time_constraints = mood_mapper.get_time_constraints(mood, available_minutes)
        
        # Filter domains based on interests
        active_domains = []
        if 'lifestyle' in interests:
            active_domains.extend(['workouts', 'recipes'])
        if 'learning' in interests:
            active_domains.append('courses')
        
        if not active_domains:
            active_domains = ['workouts', 'recipes', 'courses']
        
        for domain in active_domains:
            if domain not in self.item_features:
                continue
            
            domain_items = []
            for item_features in self.item_features[domain]:
                # Calculate scores
                mood_score = mood_mapper.calculate_mood_score(
                    item_features['tags'], mood, item_features['domain']
                )
                
                difficulty_score = mood_mapper.get_difficulty_preference_score(
                    item_features['difficulty'], mood
                )
                
                # Time fit score
                duration = item_features['duration']
                time_score = self._calculate_time_score(
                    duration, time_constraints['min_duration'], 
                    time_constraints['max_duration'], time_constraints['optimal_duration']
                )
                
                # Combined content score
                content_score = (mood_score * 0.4 + difficulty_score * 0.3 + time_score * 0.3)
                
                domain_items.append({
                    'item_id': item_features['item_id'],
                    'domain': item_features['domain'],
                    'content_score': content_score,
                    'mood_score': mood_score,
                    'time_score': time_score,
                    'duration': duration
                })
            
            # Sort by score and take top items
            domain_items.sort(key=lambda x: x['content_score'], reverse=True)
            domain_limit = max(1, int(limit * domain_weights.get(domain.rstrip('s'), 0.33)))
            recommendations.extend(domain_items[:domain_limit])
        
        return recommendations
    
    def get_collaborative_recommendations(self, user_session: str, domain: str, 
                                        limit: int = 10) -> List[Dict]:
        """Get collaborative filtering recommendations."""
        if not SURPRISE_AVAILABLE or domain not in self.collaborative_models:
            return []
        
        try:
            model = self.collaborative_models[domain]
            recommendations = []
            
            # Get all items for this domain
            if domain not in self.item_features:
                return []
            
            # Predict ratings for all items
            for item_features in self.item_features[domain]:
                item_id = item_features['item_id']
                prediction = model.predict(user_session, item_id)
                
                recommendations.append({
                    'item_id': item_id,
                    'domain': item_features['domain'],
                    'collaborative_score': prediction.est,
                    'duration': item_features['duration']
                })
            
            # Sort by predicted rating
            recommendations.sort(key=lambda x: x['collaborative_score'], reverse=True)
            return recommendations[:limit]
            
        except Exception as e:
            app_logger.error(f"Error getting collaborative recommendations: {e}")
            return []
    
    def _calculate_time_score(self, duration: int, min_dur: int, max_dur: int, optimal_dur: int) -> float:
        """Calculate how well an item's duration fits the time constraints."""
        if duration < min_dur or duration > max_dur:
            return 0.1  # Outside acceptable range
        
        # Score based on distance from optimal
        distance_from_optimal = abs(duration - optimal_dur)
        max_distance = max(optimal_dur - min_dur, max_dur - optimal_dur)
        
        if max_distance == 0:
            return 1.0
        
        return max(0.3, 1.0 - (distance_from_optimal / max_distance))
    
    def combine_recommendations(self, content_recs: List[Dict], 
                              collaborative_recs: List[Dict]) -> List[Dict]:
        """Combine content-based and collaborative recommendations."""
        if not collaborative_recs:
            return content_recs
        
        # Create lookup for collaborative scores
        collab_scores = {rec['item_id']: rec['collaborative_score'] for rec in collaborative_recs}
        
        # Combine scores
        combined_recs = []
        for content_rec in content_recs:
            item_id = content_rec['item_id']
            content_score = content_rec['content_score']
            collab_score = collab_scores.get(item_id, 0.5)  # neutral if not found
            
            # Weighted combination
            final_score = (
                settings.content_weight * content_score + 
                settings.collaborative_weight * collab_score
            )
            
            combined_rec = content_rec.copy()
            combined_rec['collaborative_score'] = collab_score
            combined_rec['final_score'] = final_score
            combined_recs.append(combined_rec)
        
        # Sort by final score
        combined_recs.sort(key=lambda x: x['final_score'], reverse=True)
        return combined_recs
    
    def get_recommendations(self, mood: str, available_minutes: int, 
                          interests: List[str], limit: int = 6, 
                          user_session: Optional[str] = None) -> List[Dict]:
        """Get combined recommendations."""
        # Get content-based recommendations
        content_recs = self.get_content_recommendations(
            mood, interests, available_minutes, limit * 2  # Get more for better selection
        )
        
        # Get collaborative recommendations if available
        collaborative_recs = []
        if user_session and SURPRISE_AVAILABLE:
            for domain in ['workout', 'recipe', 'course']:
                domain_collab = self.get_collaborative_recommendations(
                    user_session, domain + 's', limit
                )
                collaborative_recs.extend(domain_collab)
        
        # Combine recommendations
        final_recs = self.combine_recommendations(content_recs, collaborative_recs)
        
        return final_recs[:limit]


# Global instance
recommendation_engine = RecommendationEngine()
