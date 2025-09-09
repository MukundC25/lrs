'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MoodSelector } from '../components/MoodSelector';
import { TimeSlider } from '../components/TimeSlider';
import { ToggleInterest } from '../components/ToggleInterest';
import { PlaylistRail } from '../components/PlaylistRail';
import { CardItem } from '../components/CardItem';
import { CardSkeleton, PlaylistSkeletonRail } from '../components/CardSkeleton';
import { ToastContainer } from '../components/Toast';

import { useAppStore, useToast } from '../lib/store';
import { apiClient } from './api';
import type { RecommendationRequest, PlaylistItem } from '../lib/types';

export default function HomePage() {
  const {
    mood,
    availableTime,
    interests,
    currentPlaylist,
    isLoading,
    error,
    userSession,
    setMood,
    setAvailableTime,
    setInterests,
    setCurrentPlaylist,
    setLoading,
    setError,
    clearError,
  } = useAppStore();

  const toast = useToast();
  const [additionalRecommendations, setAdditionalRecommendations] = useState<PlaylistItem[]>([]);

  // Get recommendations mutation
  const recommendationMutation = useMutation({
    mutationFn: (request: RecommendationRequest) => apiClient.getRecommendations(request),
    onMutate: () => {
      setLoading(true);
      clearError();
    },
    onSuccess: (data) => {
      setCurrentPlaylist(data.playlist);
      setAdditionalRecommendations([]);
      setLoading(false);
      toast.success('Playlist generated!', `Found ${data.playlist.length} personalized recommendations`);
    },
    onError: (error: any) => {
      setLoading(false);
      setError(error.message || 'Failed to get recommendations');
      toast.error('Failed to generate playlist', error.message);
    },
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: apiClient.submitFeedback,
    onSuccess: () => {
      toast.success('Feedback recorded', 'Thanks for helping us improve!');
    },
    onError: (error: any) => {
      toast.error('Failed to record feedback', error.message);
    },
  });

  // Health check query
  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: apiClient.getHealth,
    refetchInterval: 30000, // Check every 30 seconds
    retry: 1, // Reduce retries to avoid long delays
    enabled: true, // Re-enable health check
  });

  const handleGeneratePlaylist = () => {
    const request: RecommendationRequest = {
      mood,
      available_minutes: availableTime,
      interests,
      limit: 6,
      user_session: userSession,
    };

    recommendationMutation.mutate(request);
  };

  const handleLike = (itemId: string) => {
    const item = [...currentPlaylist, ...additionalRecommendations].find(
      (item) => item.item_id === itemId
    );
    
    if (item) {
      feedbackMutation.mutate({
        item_id: itemId,
        domain: item.domain,
        action: 'like',
        user_session: userSession,
      });
    }
  };

  const handleDislike = (itemId: string) => {
    const item = [...currentPlaylist, ...additionalRecommendations].find(
      (item) => item.item_id === itemId
    );
    
    if (item) {
      feedbackMutation.mutate({
        item_id: itemId,
        domain: item.domain,
        action: 'dislike',
        user_session: userSession,
      });
    }
  };

  const handleItemClick = (item: PlaylistItem) => {
    toast.info(`${item.domain} selected`, `"${item.title}" - ${item.duration_min} minutes`);

    // You can add more functionality here, such as:
    // - Opening a detailed view modal
    // - Starting a workout/recipe/course
    // - Navigating to a dedicated page
    // - Playing video content

    console.log('Item clicked:', item);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* System status */}
        {!healthData && (
          <motion.div
            className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">Connecting to recommendation service...</span>
          </motion.div>
        )}

        {/* Control Panel */}
        <motion.section
          className="glass-card rounded-2xl p-8 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Personalize Your Experience</h2>
            <p className="text-muted-foreground">
              Tell us about your current mood, available time, and interests to get tailored recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <MoodSelector
              selectedMood={mood}
              onMoodChange={setMood}
              disabled={isLoading}
            />
            
            <TimeSlider
              selectedTime={availableTime}
              onTimeChange={setAvailableTime}
              disabled={isLoading}
            />
            
            <ToggleInterest
              selectedInterests={interests}
              onInterestsChange={setInterests}
              disabled={isLoading}
            />
          </div>

          <div className="text-center pt-4">
            <motion.button
              onClick={handleGeneratePlaylist}
              disabled={isLoading || !healthData}
              className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating Your Playlist...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate My Playlist
                </>
              )}
            </motion.button>
          </div>
        </motion.section>

        {/* Error Display */}
        {error && (
          <motion.div
            className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Playlist Rail */}
        {isLoading && <PlaylistSkeletonRail />}
        
        {!isLoading && currentPlaylist.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PlaylistRail
              items={currentPlaylist}
              onItemClick={handleItemClick}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          </motion.section>
        )}

        {/* Additional Recommendations Grid */}
        {!isLoading && currentPlaylist.length > 0 && (
          <motion.section
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">More Recommendations</h2>
              <p className="text-muted-foreground">
                Explore additional options that match your preferences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPlaylist.slice(3).map((item) => (
                <CardItem
                  key={item.item_id}
                  item={item}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  showFeedback={true}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.section
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">More Recommendations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton count={6} />
            </div>
          </motion.section>
        )}

        {/* Empty State */}
        {!isLoading && currentPlaylist.length === 0 && !error && (
          <motion.section
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Ready to Get Started?</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Set your mood, available time, and interests above, then click "Generate My Playlist" 
                to discover personalized recommendations just for you.
              </p>
            </div>
          </motion.section>
        )}
      </main>

      <Footer />
      <ToastContainer />
    </div>
  );
}
