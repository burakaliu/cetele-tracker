import React from 'react';
import { cn } from '../../lib/utils';
import classes from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn(classes.card, className)} {...props}>
      {children}
    </div>
  );
};
