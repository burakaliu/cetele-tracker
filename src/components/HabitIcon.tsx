import { HABIT_ICONS } from '../constants/habitIcons';

interface HabitIconProps {
  iconName: string;
  size?: number;
  className?: string;
}

export const HabitIcon: React.FC<HabitIconProps> = ({
  iconName,
  size = 20,
  className = ''
}) => {
  const habitIcon = HABIT_ICONS.find(h => h.name === iconName);

  // Fallback to first icon if not found
  const Icon = habitIcon?.icon || HABIT_ICONS[0].icon;

  return <Icon size={size} className={className} />;
};
