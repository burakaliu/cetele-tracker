import React from 'react';
import { cn } from '../../lib/utils';
import classes from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}) => {
  return (
    <button 
      className={cn(classes.button, classes[variant], classes[size], className)} 
      {...props}
    >
      {children}
    </button>
  );
};
