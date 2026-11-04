import React from 'react';
import './DocVaultLogo.css';

export function DocVaultLogoIcon({ size = 28, className = "" }) {
  // Pure text mark representation (stylish monogram token)
  return (
    <span 
      className={`dv-logo-glyph-text ${className}`} 
      style={{ fontSize: `${Math.round(size * 0.75)}px` }}
      aria-hidden="true"
    >
      DV
    </span>
  );
}

export default function DocVaultLogo({ 
  height = 32, 
  variant = 'default',
  className = ''
}) {
  if (variant === 'icon-only') {
    return (
      <div className={`dv-brand-logo dv-brand-logo--icon-only ${className}`}>
        <DocVaultLogoIcon size={height} />
      </div>
    );
  }

  const titleSize = Math.max(18, Math.round(height * 0.7));

  return (
    <div className={`dv-brand-logo dv-brand-logo--${variant} ${className}`}>
      <span className="dv-brand-logo__wordmark" style={{ fontSize: `${titleSize}px` }}>
        <span className="dv-brand-logo__primary">Doc</span>
        <span className="dv-brand-logo__accent">Vault</span>
        <span className="dv-brand-logo__dot">.</span>
      </span>
    </div>
  );
}
