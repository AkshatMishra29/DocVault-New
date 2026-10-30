import React from 'react';
import './Badge.css';

export default function Badge({
  children,
  variant = 'default', // 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size = 'md',
  className = ''
}) {
  return (
    <span className={`dv-badge dv-badge--${variant} dv-badge--${size} ${className}`}>
      {children}
    </span>
  );
}

