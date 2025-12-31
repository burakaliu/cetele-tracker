import React from 'react';
import { addDays, subDays, format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useHabitStore } from '../store/useHabitStore';
import { Button } from './ui/Button';
import classes from './DateNavigation.module.css';

export const DateNavigation: React.FC = () => {
  const selectedDate = useHabitStore((state) => state.selectedDate);
  const setSelectedDate = useHabitStore((state) => state.setSelectedDate);

  const current = new Date(selectedDate);
  const today = new Date();
  const isToday = isSameDay(current, today);

  const handlePrev = () => setSelectedDate(format(subDays(current, 1), 'yyyy-MM-dd'));
  const handleNext = () => setSelectedDate(format(addDays(current, 1), 'yyyy-MM-dd'));
  const handleToday = () => setSelectedDate(format(today, 'yyyy-MM-dd'));

  return (
    <div className={classes.container}>
      <Button variant="ghost" size="sm" onClick={handlePrev}>
        <ChevronLeft size={20} />
      </Button>
      
      {!isToday && (
        <Button variant="secondary" size="sm" onClick={handleToday} className={classes.todayBtn}>
          <CalendarIcon size={16} style={{ marginRight: 8 }} />
          Today
        </Button>
      )}

      <Button variant="ghost" size="sm" onClick={handleNext} disabled={isToday}> 
        <ChevronRight size={20} />
      </Button>
    </div>
  );
};
