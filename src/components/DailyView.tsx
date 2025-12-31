import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { useHabitStore } from '../store/useHabitStore';
import { Checkbox } from './ui/Checkbox';
import { Card } from './ui/Card';
import classes from './DailyView.module.css';
import { cn } from '../lib/utils';

export const DailyView: React.FC = () => {
  const habits = useHabitStore((state) => state.habits);
  const toggleHabit = useHabitStore((state) => state.toggleHabit);
  const getCompletionForDate = useHabitStore((state) => state.getCompletionForDate);
  const logs = useHabitStore((state) => state.logs);
  const selectedDate = useHabitStore((state) => state.selectedDate);

  // Safely handle date parsing
  const dateObj = new Date(selectedDate);
  const completion = getCompletionForDate(selectedDate);
  const formattedDate = format(dateObj, 'MMMM d, yyyy');
  const isToday = isSameDay(dateObj, new Date());

  if (habits.length === 0) {
    return (
      <div className={classes.emptyState}>
        <h2 className={classes.emptyTitle}>Start Your Journey</h2>
        <p className={classes.emptyText}>Add your first habit to begin tracking your Cetele.</p>
        <div className={classes.arrow}>↓</div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <Card className={classes.scoreCard}>
        <div className={classes.scoreHeader}>
          <span>Daily Score {isToday && '(Today)'}</span>
          <span className={classes.date}>{formattedDate}</span>
        </div>
        <div className={classes.progressBarContainer}>
          <motion.div 
            className={classes.progressBarFill}
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>
        <div className={classes.scoreValue}>
          <span className={classes.percentage}>{completion}%</span>
          <span className={classes.status}>
            {completion === 100 ? 'Perfect!' : completion > 0 ? 'Keep going' : 'Get started'}
          </span>
        </div>
      </Card>

      <div className={classes.habitList}>
        <AnimatePresence>
          {habits.map((habit) => {
            const isCompleted = logs[selectedDate]?.includes(habit.id);
            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={cn(classes.habitCard, isCompleted && classes.completedCard)}>
                  <div className={classes.habitInfo}>
                    <span className={classes.emoji}>{habit.emoji}</span>
                    <span className={cn(classes.habitName, isCompleted && classes.completedText)}>
                      {habit.name}
                    </span>
                  </div>
                  <Checkbox 
                    checked={!!isCompleted} 
                    onCheckedChange={() => toggleHabit(habit.id, selectedDate)}
                  />
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
