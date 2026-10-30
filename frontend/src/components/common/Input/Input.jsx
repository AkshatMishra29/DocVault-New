import React from 'react';
import './Input.css';

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`dv-input-wrapper ${className}`}>
      {label && <label htmlFor={inputId} className="dv-input-label">{label}</label>}
      <div className={`dv-input-field ${error ? 'dv-input-field--error' : ''}`}>
        {Icon && <Icon size={16} className="dv-input-icon" />}
        <input id={inputId} className="dv-input-control" {...props} />
      </div>
      {error && <span className="dv-input-error-msg">{error}</span>}
    </div>
  );
}

