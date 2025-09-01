"""Data loading and preprocessing service."""

import os
import pandas as pd
from typing import Dict, List, Optional
from core.config import settings
from core.logging import app_logger


class DataLoader:
    """Loads and preprocesses CSV data for recommendations."""
    
    def __init__(self):
        """Initialize data loader."""
        self.data_cache = {}
        self.processed_data = {}
        self._load_all_data()
    
    def _load_all_data(self):
        """Load all CSV data files."""
        try:
            # Load workouts
            workouts_path = os.path.join(settings.data_dir, settings.workouts_file)
            if os.path.exists(workouts_path):
                self.data_cache['workouts'] = pd.read_csv(workouts_path)
                app_logger.info(f"Loaded {len(self.data_cache['workouts'])} workouts")
            else:
                app_logger.warning(f"Workouts file not found: {workouts_path}")
                self.data_cache['workouts'] = pd.DataFrame()
            
            # Load recipes
            recipes_path = os.path.join(settings.data_dir, settings.recipes_file)
            if os.path.exists(recipes_path):
                self.data_cache['recipes'] = pd.read_csv(recipes_path)
                app_logger.info(f"Loaded {len(self.data_cache['recipes'])} recipes")
            else:
                app_logger.warning(f"Recipes file not found: {recipes_path}")
                self.data_cache['recipes'] = pd.DataFrame()
            
            # Load courses
            courses_path = os.path.join(settings.data_dir, settings.courses_file)
            if os.path.exists(courses_path):
                self.data_cache['courses'] = pd.read_csv(courses_path)
                app_logger.info(f"Loaded {len(self.data_cache['courses'])} courses")
            else:
                app_logger.warning(f"Courses file not found: {courses_path}")
                self.data_cache['courses'] = pd.DataFrame()
            
            # Process data
            self._preprocess_data()
            
        except Exception as e:
            app_logger.error(f"Error loading data: {e}")
            # Initialize empty dataframes as fallback
            for domain in ['workouts', 'recipes', 'courses']:
                if domain not in self.data_cache:
                    self.data_cache[domain] = pd.DataFrame()
    
    def _preprocess_data(self):
        """Preprocess loaded data for recommendations."""
        for domain, df in self.data_cache.items():
            if df.empty:
                self.processed_data[domain] = df
                continue
            
            processed_df = df.copy()
            
            # Ensure required columns exist
            required_columns = ['id', 'title', 'duration_min', 'mood_tag', 'tags']
            for col in required_columns:
                if col not in processed_df.columns:
                    if col == 'duration_min':
                        processed_df[col] = 30  # default duration
                    elif col == 'mood_tag':
                        processed_df[col] = 'happy'  # default mood
                    elif col == 'tags':
                        processed_df[col] = ''  # empty tags
                    else:
                        processed_df[col] = f"Unknown {col}"
            
            # Process tags - convert string to list
            if 'tags' in processed_df.columns:
                processed_df['tags_list'] = processed_df['tags'].apply(
                    lambda x: [tag.strip().lower() for tag in str(x).split(',') if tag.strip()]
                )
            
            # Process mood tags
            if 'mood_tag' in processed_df.columns:
                processed_df['mood_tags'] = processed_df['mood_tag'].apply(
                    lambda x: [tag.strip().lower() for tag in str(x).split(',') if tag.strip()]
                )
            
            # Ensure numeric columns
            if 'duration_min' in processed_df.columns:
                processed_df['duration_min'] = pd.to_numeric(processed_df['duration_min'], errors='coerce').fillna(30)
            
            # Add domain identifier
            processed_df['domain'] = domain.rstrip('s')  # workouts -> workout
            
            # Create unique item IDs
            processed_df['item_id'] = processed_df.apply(
                lambda row: f"{row['domain']}_{row['id']}", axis=1
            )
            
            self.processed_data[domain] = processed_df
            app_logger.info(f"Preprocessed {len(processed_df)} {domain}")
    
    def get_data(self, domain: str) -> pd.DataFrame:
        """Get processed data for a domain."""
        return self.processed_data.get(domain, pd.DataFrame())
    
    def get_all_data(self) -> Dict[str, pd.DataFrame]:
        """Get all processed data."""
        return self.processed_data
    
    def get_item_by_id(self, item_id: str) -> Optional[Dict]:
        """Get a specific item by ID."""
        for domain, df in self.processed_data.items():
            if df.empty:
                continue
            
            item = df[df['item_id'] == item_id]
            if not item.empty:
                return item.iloc[0].to_dict()
        
        return None
    
    def get_items_by_domain(self, domain: str, limit: Optional[int] = None) -> List[Dict]:
        """Get items from a specific domain."""
        df = self.get_data(domain)
        if df.empty:
            return []
        
        if limit:
            df = df.head(limit)
        
        return df.to_dict('records')
    
    def get_items_by_mood(self, mood: str, domain: Optional[str] = None) -> List[Dict]:
        """Get items that match a specific mood."""
        items = []
        
        domains_to_search = [domain] if domain else self.processed_data.keys()
        
        for d in domains_to_search:
            df = self.get_data(d)
            if df.empty:
                continue
            
            # Filter by mood
            mood_matches = df[df['mood_tags'].apply(
                lambda tags: mood.lower() in tags if isinstance(tags, list) else False
            )]
            
            items.extend(mood_matches.to_dict('records'))
        
        return items
    
    def get_items_by_duration(self, min_duration: int, max_duration: int, 
                            domain: Optional[str] = None) -> List[Dict]:
        """Get items within a duration range."""
        items = []
        
        domains_to_search = [domain] if domain else self.processed_data.keys()
        
        for d in domains_to_search:
            df = self.get_data(d)
            if df.empty:
                continue
            
            # Filter by duration
            duration_matches = df[
                (df['duration_min'] >= min_duration) & 
                (df['duration_min'] <= max_duration)
            ]
            
            items.extend(duration_matches.to_dict('records'))
        
        return items
    
    def get_metadata(self) -> Dict:
        """Get metadata about the loaded data."""
        metadata = {
            "total_items": 0,
            "domains": {},
            "moods": set(),
            "duration_range": {"min": float('inf'), "max": 0}
        }
        
        for domain, df in self.processed_data.items():
            if df.empty:
                metadata["domains"][domain] = 0
                continue
            
            count = len(df)
            metadata["domains"][domain] = count
            metadata["total_items"] += count
            
            # Collect moods
            if 'mood_tags' in df.columns:
                for mood_list in df['mood_tags']:
                    if isinstance(mood_list, list):
                        metadata["moods"].update(mood_list)
            
            # Update duration range
            if 'duration_min' in df.columns:
                min_dur = df['duration_min'].min()
                max_dur = df['duration_min'].max()
                metadata["duration_range"]["min"] = min(metadata["duration_range"]["min"], min_dur)
                metadata["duration_range"]["max"] = max(metadata["duration_range"]["max"], max_dur)
        
        metadata["moods"] = list(metadata["moods"])
        
        if metadata["duration_range"]["min"] == float('inf'):
            metadata["duration_range"] = {"min": 0, "max": 0}
        
        return metadata
    
    def reload_data(self):
        """Reload all data from files."""
        self.data_cache.clear()
        self.processed_data.clear()
        self._load_all_data()


# Global instance
data_loader = DataLoader()
