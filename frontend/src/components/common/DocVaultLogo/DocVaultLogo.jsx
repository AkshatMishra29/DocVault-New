import React from 'react';
import LogoImg from '../../../assets/Logo.png';
import './DocVaultLogo.css';

export default function DocVaultLogo({ 
  height = 36, 
  variant = 'default', // 'default' (dark text), 'light' (white text), 'icon-only'
  className = '' 
}) {
  return (
    <div className={`dv-brand-logo dv-brand-logo--${variant} ${className}`}>
      <img 
        src={LogoImg} 
        alt="DocVault" 
        style={{ height: `${height}px`, width: 'auto' }}
        className="dv-brand-logo__img" 
      />
      {variant !== 'icon-only' && (
        <span className="dv-brand-logo__text" style={{ fontSize: `${Math.round(height * 0.62)}px` }}>
          Doc<span className="dv-brand-logo__accent">Vault</span>
        </span>
      )}
    </div>
  );
}
