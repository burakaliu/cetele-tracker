import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import classes from './Checkbox.module.css';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  checked, 
  onCheckedChange, 
  className,
  ...props 
}) => {
  return (
    <label className={cn(classes.container, className)}>
      <div className={classes.inputWrapper}>
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onCheckedChange(e.target.checked)}
          className={classes.input}
          {...props}
        />
        <div className={cn(classes.indicator, checked && classes.checked)}>
          <Check size={14} strokeWidth={3} />
        </div>
      </div>
      {label && <span className={classes.label}>{label}</span>}
    </label>
  );
};
