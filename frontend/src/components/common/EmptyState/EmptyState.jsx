import React from 'react';
import Button from '../Button/Button';
import './EmptyState.css';

export default function EmptyState({
  illustration,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`dv-empty-state ${className}`}>
      {illustration && (
        <div className="dv-empty-state__media">
          <img src={illustration} alt="" aria-hidden="true" />
        </div>
      )}
      <h3 className="dv-empty-state__title">{title}</h3>
      {description && <p className="dv-empty-state__desc">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
