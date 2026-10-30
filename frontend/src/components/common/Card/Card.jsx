import React from 'react';
import './Card.css';

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  ...props
}) {
  return (
    <div
      className={`dv-card dv-card--p-${padding} ${hover ? 'dv-card--hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
