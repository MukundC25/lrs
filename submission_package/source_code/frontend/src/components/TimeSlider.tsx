'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AvailableTime, TimeSliderProps } from '@/lib/types';
import { TIME_LABELS } from '@/lib/types';

const TIME_OPTIONS: AvailableTime[] = [5, 10, 30, 60, 120];

export function TimeSlider({ selectedTime, onTimeChange, disabled = false }: TimeSliderProps) {
  const selectedIndex = TIME_OPTIONS.indexOf(selectedTime);

  const handleSliderChange = (value: number[]) => {
    if (!disabled && value[0] !== undefined) {
      const newTime = TIME_OPTIONS[value[0]];
      onTimeChange(newTime);
    }
  };

  const getTimeDescription = (time: AvailableTime): string => {
    switch (time) {
      case 5:
        return 'Quick break';
      case 10:
        return 'Short session';
      case 30:
        return 'Medium session';
      case 60:
        return 'Full session';
      case 120:
        return 'Extended session';
      default:
        return 'Custom time';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
          <Clock className="w-5 h-5" />
          Available Time
        </h3>
        <p className="text-sm text-muted-foreground">How much time do you have?</p>
      </div>

      {/* Time options as buttons */}
      <div className="grid grid-cols-5 gap-2">
        {TIME_OPTIONS.map((time, index) => (
          <motion.button
            key={time}
            onClick={() => !disabled && onTimeChange(time)}
            disabled={disabled}
            className={cn(
              'px-3 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium',
              selectedTime === time
                ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                : 'bg-background border-border hover:border-primary/50 hover:bg-primary/5',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            {TIME_LABELS[time]}
          </motion.button>
        ))}
      </div>

      {/* Visual slider representation */}
      <div className="relative">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((selectedIndex + 1) / TIME_OPTIONS.length) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        
        {/* Slider markers */}
        <div className="absolute top-0 left-0 right-0 flex justify-between">
          {TIME_OPTIONS.map((time, index) => (
            <motion.div
              key={time}
              className={cn(
                'w-3 h-3 rounded-full border-2 bg-background transition-all duration-200',
                selectedTime === time
                  ? 'border-primary scale-125 shadow-lg'
                  : 'border-muted-foreground/30'
              )}
              initial={{ scale: 0 }}
              animate={{ scale: selectedTime === time ? 1.25 : 1 }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      </div>

      {/* Selected time display */}
      <motion.div
        className="text-center p-4 rounded-lg glass-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        key={selectedTime}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-1">
          <div className="text-2xl font-bold text-primary">
            {TIME_LABELS[selectedTime]}
          </div>
          <div className="text-sm text-muted-foreground">
            {getTimeDescription(selectedTime)}
          </div>
        </div>
      </motion.div>

      {/* Time recommendations */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>💡 <strong>Tip:</strong> We'll suggest activities that fit your available time</p>
        <div className="flex justify-center gap-4 text-xs">
          <span>⚡ 5-10min: Quick boosts</span>
          <span>🎯 30-60min: Full sessions</span>
          <span>🚀 2hrs: Deep dives</span>
        </div>
      </div>
    </div>
  );
}
