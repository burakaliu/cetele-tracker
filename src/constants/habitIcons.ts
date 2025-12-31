import {
  Droplet,      // Hydration
  Dumbbell,     // Exercise
  Book,         // Reading
  BookOpen,     // Studying
  Moon,         // Sleep
  Coffee,       // Morning routine
  Apple,        // Nutrition
  Brain,        // Meditation
  Bike,         // Cycling
  Music,        // Music practice
  Code,         // Coding
  Pen,          // Writing
  Sparkles,     // Self-care
  Heart,        // Wellness
  Smile,        // Gratitude
  Leaf,         // Nature
  Zap,          // Energy
  Target,       // Goals
  Star,         // Achievement
  CheckCircle,  // Daily task
} from 'lucide-react';

export const HABIT_ICONS = [
  { name: 'Droplet', icon: Droplet, label: 'Hydration' },
  { name: 'Dumbbell', icon: Dumbbell, label: 'Exercise' },
  { name: 'Book', icon: Book, label: 'Reading' },
  { name: 'BookOpen', icon: BookOpen, label: 'Studying' },
  { name: 'Moon', icon: Moon, label: 'Sleep' },
  { name: 'Coffee', icon: Coffee, label: 'Morning' },
  { name: 'Apple', icon: Apple, label: 'Nutrition' },
  { name: 'Brain', icon: Brain, label: 'Meditation' },
  { name: 'Bike', icon: Bike, label: 'Cycling' },
  { name: 'Music', icon: Music, label: 'Music' },
  { name: 'Code', icon: Code, label: 'Coding' },
  { name: 'Pen', icon: Pen, label: 'Writing' },
  { name: 'Sparkles', icon: Sparkles, label: 'Self-care' },
  { name: 'Heart', icon: Heart, label: 'Wellness' },
  { name: 'Smile', icon: Smile, label: 'Gratitude' },
  { name: 'Leaf', icon: Leaf, label: 'Nature' },
  { name: 'Zap', icon: Zap, label: 'Energy' },
  { name: 'Target', icon: Target, label: 'Goals' },
  { name: 'Star', icon: Star, label: 'Achievement' },
  { name: 'CheckCircle', icon: CheckCircle, label: 'Task' },
] as const;

export type HabitIconName = typeof HABIT_ICONS[number]['name'];
