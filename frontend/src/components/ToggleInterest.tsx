'use client';

import { motion } from 'framer-motion';
import { Heart, BookOpen, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Interest, InterestToggleProps } from '../lib/types';
import { INTEREST_LABELS } from '../lib/types';

const INTEREST_OPTIONS: { value: Interest; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'lifestyle',
    label: 'Lifestyle',
    icon: <Heart className="w-5 h-5" />,
    description: 'Workouts, recipes, wellness'
  },
  {
    value: 'learning',
    label: 'Learning',
    icon: <BookOpen className="w-5 h-5" />,
    description: 'Courses, skills, knowledge'
  },
];

export function ToggleInterest({ selectedInterests, onInterestsChange, disabled = false }: InterestToggleProps) {
  const toggleInterest = (interest: Interest) => {
    if (disabled) return;

    if (selectedInterests.includes(interest)) {
      // Don't allow removing the last interest
      if (selectedInterests.length > 1) {
        onInterestsChange(selectedInterests.filter(i => i !== interest));
      }
    } else {
      onInterestsChange([...selectedInterests, interest]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">What interests you?</h3>
        <p className="text-sm text-muted-foreground">Select your areas of interest</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEREST_OPTIONS.map((interest, index) => {
          const isSelected = selectedInterests.includes(interest.value);
          const isLastSelected = selectedInterests.length === 1 && isSelected;

          return (
            <motion.button
              key={interest.value}
              onClick={() => toggleInterest(interest.value)}
              disabled={disabled || isLastSelected}
              className={cn(
                'interest-chip relative p-4 rounded-xl border-2 transition-all duration-200 group',
                isSelected ? 'interest-chip-active' : 'interest-chip-inactive',
                disabled && 'opacity-50 cursor-not-allowed',
                isLastSelected && 'cursor-not-allowed opacity-75'
              )}
              whileHover={!disabled && !isLastSelected ? { scale: 1.02 } : {}}
              whileTap={!disabled && !isLastSelected ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'flex-shrink-0 p-2 rounded-lg transition-colors duration-200',
                  isSelected ? 'bg-primary-foreground/20' : 'bg-muted'
                )}>
                  {interest.icon}
                </div>
                
                <div className="flex-1 text-left">
                  <div className="font-medium">{interest.label}</div>
                  <div className="text-sm opacity-75">{interest.description}</div>
                </div>
                
                <div className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                  isSelected 
                    ? 'bg-primary-foreground border-primary-foreground' 
                    : 'border-muted-foreground/30'
                )}>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="w-3 h-3 text-primary" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Selection glow effect */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-primary/10 border-2 border-primary/30"
                  layoutId={`interest-glow-${interest.value}`}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </motion.button>
          );
        })}
      </div>

      {/* Selected interests summary */}
      <motion.div
        className="text-center p-3 rounded-lg bg-muted/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-sm text-muted-foreground">
          Selected: {' '}
          <span className="font-medium text-foreground">
            {selectedInterests.map(interest => INTEREST_LABELS[interest]).join(', ')}
          </span>
        </div>
        {selectedInterests.length === 1 && (
          <div className="text-xs text-muted-foreground mt-1">
            💡 Select at least one interest area
          </div>
        )}
      </motion.div>

      {/* Interest descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="flex items-start space-x-2">
          <Heart className="w-4 h-4 mt-0.5 text-pink-500" />
          <div>
            <div className="font-medium">Lifestyle</div>
            <div>Workouts, healthy recipes, wellness tips</div>
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <BookOpen className="w-4 h-4 mt-0.5 text-blue-500" />
          <div>
            <div className="font-medium">Learning</div>
            <div>Skills, courses, personal development</div>
          </div>
        </div>
      </div>
    </div>
  );
}
