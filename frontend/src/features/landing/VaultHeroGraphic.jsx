import React, { useState } from 'react';
import './VaultHeroGraphic.css';

export default function VaultHeroGraphic({ className = "" }) {
  const [activeTier, setActiveTier] = useState(2);
  const [dialRotation, setDialRotation] = useState(30);

  const handleDialClick = () => {
    setDialRotation(r => r + 45);
    setActiveTier(t => (t === 1 ? 2 : 1));
  };

  return (
    <div className={`dv-vault-graphic-card ${className}`}>
      {/* Dynamic Ambient Forest Glow */}
      <div className="dv-vault-ambient-glow" />

      {/* Top Banking Security HUD Bar */}
      <div className="dv-vault-hud">
        <div className="dv-vault-hud-badge">
          <span className="dv-vault-hud-dot" />
          <span className="dv-vault-hud-code">PRIVATE BANKING CUSTODY</span>
        </div>
        <div className="dv-vault-hud-tier">
          <span>TIER {activeTier} ACTIVE</span>
        </div>
      </div>

      {/* Main Procedural Safe Asset */}
      <div 
        className="dv-vault-stage"
        onClick={handleDialClick}
        role="button"
        tabIndex={0}
        title="Interactive Vault: Click to toggle security tumblers"
      >
        <svg 
          viewBox="0 0 380 380" 
          width="100%" 
          height="100%" 
          className="dv-vault-stage-svg"
          aria-hidden="true"
        >
          <defs>
            {/* Outer Chamber Radial */}
            <radialGradient id="safeBodyGrad" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#24493B" />
              <stop offset="50%" stopColor="#1D3B30" />
              <stop offset="85%" stopColor="#101A17" />
              <stop offset="100%" stopColor="#080E0C" />
            </radialGradient>

            {/* Copper Bevel Rim */}
            <linearGradient id="safeRimCopper" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2A67D" />
              <stop offset="40%" stopColor="#C47B48" />
              <stop offset="70%" stopColor="#8A5129" />
              <stop offset="100%" stopColor="#1D3B30" />
            </linearGradient>

            {/* Forest Inner Chamber */}
            <radialGradient id="innerChamberGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#162D24" />
              <stop offset="60%" stopColor="#0F1F19" />
              <stop offset="100%" stopColor="#070E0B" />
            </radialGradient>

            {/* Glowing Calibrated Track */}
            <linearGradient id="calibratedArc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#287A57" />
              <stop offset="50%" stopColor="#34966D" />
              <stop offset="100%" stopColor="#C47B48" />
            </linearGradient>

            {/* Core Lens Radiance */}
            <radialGradient id="coreLensRadiance" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#E2A67D" />
              <stop offset="70%" stopColor="#C47B48" />
              <stop offset="100%" stopColor="#101A17" />
            </radialGradient>

            <filter id="vaultShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#080E0C" floodOpacity="0.6" />
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#287A57" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Heavy Chamfered Vault Frame */}
          <rect 
            x="25" 
            y="25" 
            width="330" 
            height="330" 
            rx="36" 
            fill="url(#safeBodyGrad)" 
            stroke="url(#safeRimCopper)" 
            strokeWidth="3"
            filter="url(#vaultShadow)"
          />

          {/* Corner Reinforcement Rivets */}
          <circle cx="52" cy="52" r="5" fill="#C47B48" stroke="#101A17" strokeWidth="1.5" />
          <circle cx="328" cy="52" r="5" fill="#C47B48" stroke="#101A17" strokeWidth="1.5" />
          <circle cx="52" cy="328" r="5" fill="#C47B48" stroke="#101A17" strokeWidth="1.5" />
          <circle cx="328" cy="328" r="5" fill="#C47B48" stroke="#101A17" strokeWidth="1.5" />

          {/* Inner Vault Door Drum */}
          <circle 
            cx="190" 
            cy="190" 
            r="125" 
            fill="url(#innerChamberGrad)" 
            stroke="#287A57" 
            strokeWidth="2" 
          />

          {/* Calibrated Degree Notches & Track */}
          <circle 
            cx="190" 
            cy="190" 
            r="115" 
            fill="none" 
            stroke="url(#calibratedArc)" 
            strokeWidth="3.5" 
            strokeDasharray="12 8" 
            className="dv-vault-track-spin"
          />

          <circle 
            cx="190" 
            cy="190" 
            r="98" 
            fill="none" 
            stroke="rgba(220, 226, 217, 0.25)" 
            strokeWidth="1.5" 
            strokeDasharray="3 5" 
          />

          {/* Spoke Wheel Assembly (Rotates with state) */}
          <g 
            style={{ 
              transform: `rotate(${dialRotation}deg)`, 
              transformOrigin: '190px 190px',
              transition: 'transform 0.6s cubic-bezier(0.19, 1, 0.22, 1)' 
            }}
          >
            {/* 3 Heavy Bronze/Copper Spoke Handles */}
            <rect x="183" y="100" width="14" height="180" rx="7" fill="url(#safeRimCopper)" stroke="#101A17" strokeWidth="1.5" />
            <rect x="183" y="100" width="14" height="180" rx="7" transform="rotate(60 190 190)" fill="url(#safeRimCopper)" stroke="#101A17" strokeWidth="1.5" />
            <rect x="183" y="100" width="14" height="180" rx="7" transform="rotate(120 190 190)" fill="url(#safeRimCopper)" stroke="#101A17" strokeWidth="1.5" />

            {/* Handle Grips */}
            <circle cx="190" cy="100" r="9" fill="#E2A67D" stroke="#101A17" strokeWidth="2" />
            <circle cx="190" cy="280" r="9" fill="#E2A67D" stroke="#101A17" strokeWidth="2" />
            <circle cx="112" cy="145" r="9" fill="#E2A67D" stroke="#101A17" strokeWidth="2" />
            <circle cx="268" cy="235" r="9" fill="#E2A67D" stroke="#101A17" strokeWidth="2" />
            <circle cx="112" cy="235" r="9" fill="#E2A67D" stroke="#101A17" strokeWidth="2" />
            <circle cx="268" cy="145" r="9" fill="#E2A67D" stroke="#101A17" strokeWidth="2" />

            {/* Center Master Dial Cap */}
            <circle cx="190" cy="190" r="42" fill="#1D3B30" stroke="url(#safeRimCopper)" strokeWidth="3" />
            <circle cx="190" cy="190" r="26" fill="url(#coreLensRadiance)" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="190" cy="190" r="10" fill="#101A17" />
            <circle cx="190" cy="190" r="4" fill="#C47B48" />
          </g>

          {/* Cardinal Laser Indicator Lines */}
          <line x1="190" y1="56" x2="190" y2="70" stroke="#C47B48" strokeWidth="3" strokeLinecap="round" />
          <line x1="190" y1="310" x2="190" y2="324" stroke="#C47B48" strokeWidth="3" strokeLinecap="round" />
          <line x1="56" y1="190" x2="70" y2="190" stroke="#C47B48" strokeWidth="3" strokeLinecap="round" />
          <line x1="310" y1="190" x2="324" y2="190" stroke="#C47B48" strokeWidth="3" strokeLinecap="round" />
        </svg>

        {/* Floating Holographic Cryptographic Badges */}
        <div className="dv-floating-spec dv-floating-spec--top-left">
          <div className="dv-spec-pill">
            <span className="dv-spec-dot" />
            <strong>Zero-Knowledge Dual-PIN</strong>
          </div>
          <small>Client-side authenticated</small>
        </div>

        <div className="dv-floating-spec dv-floating-spec--bottom-right">
          <div className="dv-spec-pill dv-spec-pill--copper">
            <span className="dv-spec-dot dv-spec-dot--copper" />
            <strong>OCR Verified Ingestion</strong>
          </div>
          <small>Deterministic privacy gate</small>
        </div>
      </div>

      {/* Bottom Architectural Reassurance */}
      <div className="dv-vault-footer">
        <div className="dv-vault-meta-item">
          <span className="dv-meta-k">ENCRYPTION</span>
          <span className="dv-meta-v">ChaCha20-Poly1305</span>
        </div>
        <div className="dv-vault-divider" />
        <div className="dv-vault-meta-item">
          <span className="dv-meta-k">TELEMETRY</span>
          <span className="dv-meta-v text-copper">Zero Third-Party</span>
        </div>
        <div className="dv-vault-divider" />
        <div className="dv-vault-meta-item">
          <span className="dv-meta-k">STATUS</span>
          <span className="dv-meta-v text-forest">Hermetic Custody</span>
        </div>
      </div>
    </div>
  );
}
