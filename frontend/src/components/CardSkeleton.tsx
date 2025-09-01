'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardSkeletonProps {
  className?: string;
  count?: number;
}

export function CardSkeleton({ className, count = 1 }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={cn('glass-card rounded-2xl overflow-hidden', className)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {/* Image skeleton */}
          <div className="relative h-48 bg-muted animate-pulse">
            <div className="absolute top-3 left-3">
              <div className="w-16 h-6 bg-muted-foreground/20 rounded-full" />
            </div>
            <div className="absolute top-3 right-3">
              <div className="w-12 h-6 bg-muted-foreground/20 rounded-full" />
            </div>
            <div className="absolute bottom-3 left-3">
              <div className="w-12 h-6 bg-muted-foreground/20 rounded-full" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            </div>

            {/* Difficulty badge */}
            <div className="w-20 h-6 bg-muted rounded-full animate-pulse" />

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
            </div>

            {/* Tags */}
            <div className="flex space-x-2">
              <div className="w-12 h-6 bg-muted rounded animate-pulse" />
              <div className="w-16 h-6 bg-muted rounded animate-pulse" />
              <div className="w-14 h-6 bg-muted rounded animate-pulse" />
            </div>

            {/* Feedback buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex space-x-2">
                <div className="w-16 h-8 bg-muted rounded-lg animate-pulse" />
                <div className="w-16 h-8 bg-muted rounded-lg animate-pulse" />
              </div>
              <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}

export function PlaylistSkeletonRail() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
      
      <div className="flex space-x-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0 w-80 glass-card rounded-xl overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {/* Horizontal card layout for carousel */}
            <div className="flex h-32">
              {/* Image */}
              <div className="w-32 h-32 bg-muted animate-pulse flex-shrink-0" />
              
              {/* Content */}
              <div className="flex-1 p-3 space-y-2">
                <div className="h-5 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="flex space-x-1">
                  <div className="w-8 h-4 bg-muted rounded animate-pulse" />
                  <div className="w-10 h-4 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-12 h-4 bg-muted rounded animate-pulse" />
                  <div className="flex space-x-1">
                    <div className="w-6 h-6 bg-muted rounded animate-pulse" />
                    <div className="w-6 h-6 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
