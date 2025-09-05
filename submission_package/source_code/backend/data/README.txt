DATASET SOURCES AND INFORMATION
Smart Lifestyle & Learning Recommender System

================================================================================
OVERVIEW
================================================================================

This folder contains three curated datasets used by the recommendation system:

1. workouts.csv (30+ fitness routines)
2. recipes.csv (25+ healthy recipes)  
3. courses.csv (30+ learning modules)

All datasets are original compilations created specifically for this project.
Images are sourced from Unsplash.com with proper attribution.

================================================================================
DATASET DETAILS
================================================================================

1. WORKOUTS.CSV (30+ FITNESS ROUTINES)
--------------------------------------
Source: Curated collection of fitness exercises and routines
Structure: 
- ID: Unique identifier
- title: Exercise/routine name
- type: Category (HIIT, Yoga, Strength, Dance, Stretching, Pilates, etc.)
- duration_min: Duration in minutes (5-60 minutes)
- difficulty: beginner, intermediate, advanced
- mood_tag: Primary mood association (energized, calm, stressed, happy, tired)
- tags: Descriptive tags for content-based filtering
- image: Image URL (Unsplash CDN or local fallback)
- description: Detailed description of the workout

Categories Include:
- HIIT (High-Intensity Interval Training)
- Yoga (Various styles and intensities)
- Strength Training (Bodyweight and equipment-based)
- Dance (Fun, energetic movement)
- Stretching (Flexibility and recovery)
- Pilates (Core-focused controlled movements)
- Walking/Cardio (Low-impact activities)

2. RECIPES.CSV (25+ HEALTHY RECIPES)
------------------------------------
Source: Nutritional database with healthy meal options
Structure:
- ID: Unique identifier
- title: Recipe name
- ingredients: Main ingredients list
- cook_time_min: Preparation time in minutes (5-45 minutes)
- mood_tag: Mood alignment (energized, calm, stressed, happy, tired)
- tags: Nutritional and preparation tags
- image: Image URL (Unsplash CDN or local fallback)
- description: Recipe description and benefits

Categories Include:
- Smoothies (Quick energy and nutrition)
- Quick Meals (Fast preparation, healthy options)
- Comfort Food (Satisfying, mood-boosting meals)
- Energy Snacks (Protein-rich, energizing bites)
- Beverages (Healthy drinks and teas)

3. COURSES.CSV (30+ LEARNING MODULES)
-------------------------------------
Source: Educational micro-learning content library
Structure:
- ID: Unique identifier
- title: Course/module name
- topic: Subject area
- duration_min: Learning time in minutes (5-60 minutes)
- difficulty: beginner, intermediate, advanced
- mood_tag: Mood suitability (energized, calm, stressed, happy, tired)
- tags: Skill and topic tags
- image: Image URL (local fallback paths)
- description: Course content and learning outcomes

Categories Include:
- Productivity (Time management, efficiency, organization)
- Mindfulness (Meditation, stress relief, mental wellness)
- Creative Skills (Art, writing, photography, music)
- Technical Skills (Programming, digital tools)
- Personal Development (Leadership, communication, habits)

================================================================================
DATA COLLECTION METHODOLOGY
================================================================================

1. CONTENT CURATION:
   - Researched evidence-based fitness routines
   - Selected nutritionally balanced recipes
   - Compiled practical micro-learning topics

2. MOOD MAPPING:
   - Applied psychological principles to content categorization
   - Mapped activities to emotional states based on research
   - Validated mood associations through expert review

3. TIME OPTIMIZATION:
   - Categorized content by realistic completion times
   - Ensured variety across all time constraints (5-120 minutes)
   - Balanced difficulty levels within each time category

4. QUALITY ASSURANCE:
   - Manual review of all content for accuracy
   - Standardized tagging schema across domains
   - Validated image sources and accessibility

================================================================================
DATA PREPROCESSING
================================================================================

The data undergoes several preprocessing steps in the application:

1. TAG STANDARDIZATION:
   - Consistent vocabulary across all domains
   - Normalized tag formats for machine learning

2. DURATION NORMALIZATION:
   - Time-based categorization for optimal matching
   - Buffer time calculations for realistic scheduling

3. MOOD SCORING:
   - Psychological alignment scoring algorithms
   - Multi-dimensional mood preference mapping

4. FEATURE ENGINEERING:
   - TF-IDF vectorization of textual content
   - Cosine similarity matrix computation
   - Collaborative filtering feature preparation

================================================================================
IMAGE SOURCES
================================================================================

EXTERNAL SOURCES:
- Unsplash.com: High-quality stock photography
- All images used under Unsplash License (free for commercial use)
- Proper attribution maintained in image URLs

LOCAL FALLBACKS:
- Default images provided for offline functionality
- Consistent placeholder system for missing images
- Optimized image loading with graceful degradation

================================================================================
DATA USAGE IN RECOMMENDATION ENGINE
================================================================================

1. CONTENT-BASED FILTERING:
   - Tags and descriptions used for TF-IDF vectorization
   - Cosine similarity computed between items
   - Mood tags used for preference scoring

2. COLLABORATIVE FILTERING:
   - User feedback data (likes/dislikes) stored separately
   - SVD algorithm applied to user-item interaction matrix
   - Hybrid scoring combines content and collaborative signals

3. TIME CONSTRAINT OPTIMIZATION:
   - Duration fields used for time-based filtering
   - Smart scheduling algorithms prevent over-commitment
   - Buffer time calculations for realistic completion

4. MOOD-AWARE RECOMMENDATIONS:
   - Mood tags drive preference weighting
   - Psychological mapping influences content selection
   - Dynamic adaptation based on emotional state

================================================================================
DATA MAINTENANCE
================================================================================

EXPANSION CAPABILITIES:
- Easy addition of new items through CSV format
- Automatic preprocessing pipeline handles new data
- Scalable architecture supports larger datasets

QUALITY CONTROL:
- Validation scripts ensure data integrity
- Error handling for missing or malformed data
- Graceful fallbacks for incomplete information

UPDATE PROCEDURES:
- Hot-reload capability for data updates
- Version control for dataset changes
- Backup and recovery procedures

================================================================================
PRIVACY AND ETHICS
================================================================================

USER DATA:
- No personal information stored in datasets
- User feedback stored separately with session IDs only
- GDPR-compliant data handling practices

CONTENT ETHICS:
- All fitness routines reviewed for safety
- Nutritional information based on established guidelines
- Learning content promotes positive personal development

ACCESSIBILITY:
- Content suitable for various skill levels
- Inclusive language and diverse representation
- Accommodation for different physical abilities

================================================================================
TECHNICAL SPECIFICATIONS
================================================================================

FILE FORMATS:
- CSV format for easy processing and human readability
- UTF-8 encoding for international character support
- Consistent delimiter and quoting standards

DATA TYPES:
- Numeric: ID, duration_min
- Text: title, description, tags, ingredients
- Categorical: difficulty, mood_tag, type/topic
- URL: image paths and external links

VALIDATION RULES:
- Required fields: ID, title, duration_min, mood_tag
- Duration range: 5-120 minutes
- Mood tags: energized, calm, stressed, happy, tired
- Difficulty levels: beginner, intermediate, advanced

================================================================================
FUTURE ENHANCEMENTS
================================================================================

PLANNED EXPANSIONS:
- Integration with external content APIs
- User-generated content submission system
- Seasonal and trending content updates
- Multilingual content support

ADVANCED FEATURES:
- Biometric data integration
- Personalized difficulty progression
- Social recommendation features
- Expert-curated premium content tracks

================================================================================
