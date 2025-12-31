import React from 'react';
import { eachDayOfInterval, subDays, format, isSameDay } from 'date-fns';
import { useHabitStore } from '../store/useHabitStore';
import classes from './HabitHeatmap.module.css';
import { cn } from '../lib/utils';
import { Card } from './ui/Card';

export const HabitHeatmap: React.FC = () => {
  const getCompletionForDate = useHabitStore((state) => state.getCompletionForDate);
  const selectedDate = useHabitStore((state) => state.selectedDate);
  const setSelectedDate = useHabitStore((state) => state.setSelectedDate);

  // Generate last ~16 weeks (approx 4 months) or just do a standard contribution graph
  // Let's do a fixed grid of ~100 days for sidebar density
  const today = new Date();
  const days = eachDayOfInterval({
    start: subDays(today, 83), // 12 weeks * 7 days - 1 = 83? let's do 7*16 = 112 days
    end: today
  });

  // Group by week for column layout
  // We need to ensure we align to weeks properly.
  // Actually, easiest way to do github style is Flex Row of Columns
  // But let's keep it simple: Grid of days.

  return (
    <Card className={classes.container}>
      <h3 className={classes.title}>Consistency</h3>
      <div className={classes.grid}>
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const score = getCompletionForDate(dateStr);
          const isSelected = dateStr === selectedDate;
          const isToday = isSameDay(day, today);

          return (
            <div
              key={dateStr}
              className={cn(classes.cell, isSelected && classes.selected, isToday && classes.today)}
              style={{
                backgroundColor: score > 0 
                  ? `rgba(85, 107, 47, ${0.2 + (score / 100) * 0.8})`
                  : undefined
              }}
              title={`${format(day, 'MMM d')}: ${score}%`}
              onClick={() => setSelectedDate(dateStr)}
            />
          );
        })}
      </div>
      <div className={classes.legend}>
        <span>Less</span>
        <div className={classes.legendCell} style={{ backgroundColor: 'var(--color-bg-elevated)' }} />
        <div className={classes.legendCell} style={{ backgroundColor: 'rgba(85, 107, 47, 0.4)' }} />
        <div className={classes.legendCell} style={{ backgroundColor: 'rgba(85, 107, 47, 1)' }} />
        <span>More</span>
      </div>
    </Card>
  );
};
