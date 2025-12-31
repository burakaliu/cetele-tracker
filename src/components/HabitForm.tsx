import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useHabitStore } from '../store/useHabitStore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import classes from './HabitForm.module.css';
import { cn } from '../lib/utils';
import { HABIT_ICONS } from '../constants/habitIcons';
import type { HabitIconName } from '../constants/habitIcons';

interface HabitFormProps {
  onClose: () => void;
}

export const HabitForm: React.FC<HabitFormProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<HabitIconName>(HABIT_ICONS[0].name);
  const addHabit = useHabitStore((state) => state.addHabit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addHabit(name, selectedIcon);
      onClose();
    }
  };

  return (
    <div className={classes.overlay}>
      <Card className={classes.modal}>
        <div className={classes.header}>
          <h3>New Habit</h3>
          <button onClick={onClose} className={classes.closeButton}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes.inputGroup}>
            <label>What do you want to track?</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Drink Water"
              className={classes.input}
              autoFocus
            />
          </div>

          <div className={classes.inputGroup}>
            <label>Choose an icon</label>
            <div className={classes.iconGrid}>
              {HABIT_ICONS.map(({ name, icon: Icon, label }) => {
                const isSelected = name === selectedIcon;
                return (
                  <button
                    key={name}
                    type="button"
                    className={cn(classes.iconBtn, isSelected && classes.selectedIcon)}
                    onClick={() => setSelectedIcon(name)}
                    title={label}
                  >
                    <Icon size={20} className={isSelected ? 'text-olive' : 'text-charcoal-soft'} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className={classes.actions}>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!name.trim()}>Create Habit</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
