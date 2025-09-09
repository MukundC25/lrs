'use client';

import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import type { Mood, MoodSelectorProps } from '../lib/types';
import { MOOD_EMOJIS } from '../lib/types';

const MOOD_OPTIONS: { value: Mood; label: string; description: string }[] = [
  { value: 'energized', label: 'Energized', description: 'Ready for action!' },
  { value: 'calm', label: 'Calm', description: 'Peaceful and relaxed' },
  { value: 'stressed', label: 'Stressed', description: 'Need to unwind' },
  { value: 'happy', label: 'Happy', description: 'Feeling great!' },
  { value: 'tired', label: 'Tired', description: 'Low energy' },
];

export function MoodSelector({ selectedMood, onMoodChange, disabled = false }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">How are you feeling?</h3>
        <p className="text-sm text-muted-foreground">Choose your current mood</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {MOOD_OPTIONS.map((mood) => (
          <motion.button
            key={mood.value}
            onClick={() => !disabled && onMoodChange(mood.value)}
            disabled={disabled}
            className={cn(
              'mood-button relative group',
              selectedMood === mood.value ? 'mood-button-active' : 'mood-button-inactive',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: MOOD_OPTIONS.indexOf(mood) * 0.1 }}
          >
            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl" role="img" aria-label={mood.label}>
                {MOOD_EMOJIS[mood.value]}
              </span>
              <div className="text-center">
                <div className="font-medium text-sm">{mood.label}</div>
                <div className="text-xs opacity-75">{mood.description}</div>
              </div>
            </div>
            
            {/* Selection indicator */}
            {selectedMood === mood.value && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-primary/50 bg-primary/10"
                layoutId="mood-selection"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            
            {/* Hover effect */}
            <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </motion.button>
        ))}
      </div>
      
      {/* Selected mood display */}
      <motion.div
        className="text-center p-3 rounded-lg bg-muted/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={selectedMood}
      >
        <span className="text-sm text-muted-foreground">
          Current mood: <span className="font-medium text-foreground">{selectedMood}</span>
          <span className="ml-2" role="img" aria-label={selectedMood}>
            {MOOD_EMOJIS[selectedMood]}
          </span>
        </span>
      </motion.div>
    </div>
  );
}
