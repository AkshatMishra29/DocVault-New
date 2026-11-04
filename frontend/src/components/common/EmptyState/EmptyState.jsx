import React from 'react';
import Button from '../Button/Button';
import { FolderLock } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({
  icon: Icon = FolderLock,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`dv-empty-state ${className}`}>
      <div className="dv-empty-state__icon-wrap">
        <Icon size={32} className="dv-empty-state__icon" strokeWidth={1.75} />
      </div>
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
