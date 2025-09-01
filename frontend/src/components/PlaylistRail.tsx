'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Play, Heart, ThumbsDown, Clock, Star } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { PlaylistRailProps } from '@/lib/types';
import { DOMAIN_EMOJIS } from '@/lib/types';

export function PlaylistRail({ items, onItemClick, onLike, onDislike }: PlaylistRailProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    align: 'start',
    skipSnaps: false,
    dragFree: true
  });
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [dislikedItems, setDislikedItems] = useState<Set<string>>(new Set());

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  const handleLike = (itemId: string) => {
    setLikedItems(prev => new Set(prev).add(itemId));
    setDislikedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    onLike(itemId);
  };

  const handleDislike = (itemId: string) => {
    setDislikedItems(prev => new Set(prev).add(itemId));
    setLikedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    onDislike(itemId);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No playlist items available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Daily Playlist</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} personalized recommendations • {items.reduce((sum, item) => sum + item.duration_min, 0)} minutes total
          </p>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex space-x-2">
          <motion.button
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            className={cn(
              'p-2 rounded-full border transition-all duration-200',
              prevBtnDisabled
                ? 'bg-muted border-muted text-muted-foreground cursor-not-allowed'
                : 'bg-background border-border hover:bg-primary hover:text-primary-foreground hover:border-primary'
            )}
            whileHover={!prevBtnDisabled ? { scale: 1.05 } : {}}
            whileTap={!prevBtnDisabled ? { scale: 0.95 } : {}}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            className={cn(
              'p-2 rounded-full border transition-all duration-200',
              nextBtnDisabled
                ? 'bg-muted border-muted text-muted-foreground cursor-not-allowed'
                : 'bg-background border-border hover:bg-primary hover:text-primary-foreground hover:border-primary'
            )}
            whileHover={!nextBtnDisabled ? { scale: 1.05 } : {}}
            whileTap={!nextBtnDisabled ? { scale: 0.95 } : {}}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex space-x-4">
          {items.map((item, index) => {
            const isLiked = likedItems.has(item.item_id);
            const isDisliked = dislikedItems.has(item.item_id);

            return (
              <motion.div
                key={item.item_id}
                className="flex-shrink-0 w-80 glass-card rounded-xl overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => onItemClick?.(item)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex h-32">
                  {/* Image */}
                  <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.image || `/images/${item.domain}s/default.jpg`}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="128px"
                    />
                    
                    {/* Domain badge */}
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                        {DOMAIN_EMOJIS[item.domain]}
                      </span>
                    </div>

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(item.duration_min)}
                        </span>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          {(item.score * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-block px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {item.difficulty && (
                          <span className="capitalize">{item.difficulty}</span>
                        )}
                      </div>
                      
                      <div className="flex space-x-1">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(item.item_id);
                          }}
                          className={cn(
                            'p-1.5 rounded-full transition-all duration-200',
                            isLiked
                              ? 'bg-green-100 text-green-600'
                              : 'bg-muted hover:bg-green-50 text-muted-foreground hover:text-green-600'
                          )}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart className={cn('w-3 h-3', isLiked && 'fill-current')} />
                        </motion.button>

                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDislike(item.item_id);
                          }}
                          className={cn(
                            'p-1.5 rounded-full transition-all duration-200',
                            isDisliked
                              ? 'bg-red-100 text-red-600'
                              : 'bg-muted hover:bg-red-50 text-muted-foreground hover:text-red-600'
                          )}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ThumbsDown className={cn('w-3 h-3', isDisliked && 'fill-current')} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
