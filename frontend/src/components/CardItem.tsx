'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ThumbsDown, Clock, Star, Info } from 'lucide-react';
import Image from 'next/image';
import { cn } from '../lib/utils';
import type { CardItemProps } from '../lib/types';
import { DOMAIN_EMOJIS } from '../lib/types';

export function CardItem({ 
  item, 
  onLike, 
  onDislike, 
  showFeedback = true, 
  className 
}: CardItemProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      setIsDisliked(false);
      onLike(item.item_id);
    }
  };

  const handleDislike = () => {
    if (!isDisliked) {
      setIsDisliked(true);
      setIsLiked(false);
      onDislike(item.item_id);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <motion.div
      className={cn(
        'glass-card rounded-2xl overflow-hidden card-hover group relative',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={item.image || `/images/${item.domain}s/default.jpg`}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Domain badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
            <span className="mr-1">{DOMAIN_EMOJIS[item.domain]}</span>
            {item.domain}
          </span>
        </div>

        {/* Score badge */}
        <div className="absolute top-3 right-3">
          <motion.button
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground backdrop-blur-sm cursor-pointer"
            onHoverStart={() => setShowTooltip(true)}
            onHoverEnd={() => setShowTooltip(false)}
            whileHover={{ scale: 1.05 }}
          >
            <Star className="w-3 h-3 mr-1" />
            {(item.score * 100).toFixed(0)}%
          </motion.button>
          
          {/* Score tooltip */}
          {showTooltip && (
            <motion.div
              className="absolute top-full right-0 mt-2 p-3 bg-black/90 text-white text-xs rounded-lg backdrop-blur-sm z-10 min-w-48"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="space-y-1">
                <div className="font-medium">Match Score Breakdown</div>
                <div>Overall: {(item.score_breakdown.overall * 100).toFixed(0)}%</div>
                <div>Content: {(item.score_breakdown.content * 100).toFixed(0)}%</div>
                <div>Mood: {(item.score_breakdown.mood * 100).toFixed(0)}%</div>
                <div>Time: {(item.score_breakdown.time * 100).toFixed(0)}%</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
            <Clock className="w-3 h-3 mr-1" />
            {formatDuration(item.duration_min)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and difficulty */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          
          {item.difficulty && (
            <span className={cn(
              'inline-block px-2 py-1 rounded-full text-xs font-medium',
              getDifficultyColor(item.difficulty)
            )}>
              {item.difficulty}
            </span>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Mood match */}
        {item.mood_match && item.mood_match.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Mood match:</span> {item.mood_match.join(', ')}
          </div>
        )}

        {/* Feedback buttons */}
        {showFeedback && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex space-x-2">
              <motion.button
                onClick={handleLike}
                className={cn(
                  'flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isLiked
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-muted hover:bg-green-50 text-muted-foreground hover:text-green-600'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
                <span>Like</span>
              </motion.button>

              <motion.button
                onClick={handleDislike}
                className={cn(
                  'flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isDisliked
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-muted hover:bg-red-50 text-muted-foreground hover:text-red-600'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ThumbsDown className={cn('w-4 h-4', isDisliked && 'fill-current')} />
                <span>Pass</span>
              </motion.button>
            </div>

            <motion.button
              className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
