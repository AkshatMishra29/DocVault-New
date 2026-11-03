import React, { useState, useEffect } from 'react';
import './InteractiveVaultVisual.css';

export default function InteractiveVaultVisual({ className = "" }) {
  const [rotation, setRotation] = useState(0);
  const [isLocked, setIsLocked] = useState(true);
  const [activeSegment, setActiveSegment] = useState(3);
  const [pulseKey, setPulseKey] = useState(0);

  // Micro ambient movement and dial response
  const handleDialClick = () => {
    setRotation(prev => prev + 60);
    setIsLocked(prev => !prev);
    setActiveSegment(prev => (prev + 1) % 6);
    setPulseKey(k => k + 1);
  };

  return (
    <div className={`elite-vault-canvas-card ${className}`}>
      {/* Top Ambient Cyber/Titanium Glow */}
      <div className="elite-vault-glow-top" />
      
      {/* Dynamic Status HUD Header */}
      <div className="elite-vault-hud-header">
        <div className="elite-vault-hud-chip">
          <span className={`elite-vault-status-dot ${isLocked ? 'locked' : 'unlocked'}`} />
          <span className="elite-vault-hud-label">
            {isLocked ? 'VAULT SECURED • HARDWARE AES' : 'AUTHORIZATION GRANTED'}
          </span>
        </div>
        <div className="elite-vault-hud-metric">
          <span className="elite-vault-metric-name">INTEGRITY</span>
          <span className="elite-vault-metric-value">99.999%</span>
        </div>
      </div>

      {/* Main Procedural Visual Chamber */}
      <div className="elite-vault-chamber" onClick={handleDialClick} role="button" tabIndex={0} title="Click to rotate dial & test mechanism">
        
        {/* Outer Titanium Calibrated Bezel */}
        <div className="elite-bezel-outer">
          <div className="elite-bezel-notches">
            {[...Array(24)].map((_, i) => (
              <span 
                key={i} 
                className={`elite-notch ${i % 4 === 0 ? 'elite-notch--major' : ''} ${i === activeSegment * 4 ? 'elite-notch--active' : ''}`}
                style={{ transform: `rotate(${i * 15}deg) translateY(-148px)` }}
              />
            ))}
          </div>

          {/* Glowing Arc Track */}
          <svg className="elite-dial-svg" viewBox="0 0 320 320" width="100%" height="100%">
            <defs>
              <linearGradient id="eliteRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FD2B06" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#EB6C3B" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FF9466" stopOpacity="0.2" />
              </linearGradient>
              <filter id="eliteGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Track */}
            <circle cx="160" cy="160" r="140" stroke="rgba(255,255,255,0.06)" strokeWidth="4" fill="none" />
            
            {/* Primary Calibrated Cyan/Amber Track */}
            <circle 
              cx="160" 
              cy="160" 
              r="140" 
              stroke="url(#eliteRingGrad)" 
              strokeWidth="4" 
              fill="none" 
              strokeDasharray="18 12" 
              className="elite-rotating-track"
              filter="url(#eliteGlowFilter)"
            />

            {/* Inner Precision Ticks */}
            <circle 
              cx="160" 
              cy="160" 
              r="120" 
              stroke="rgba(255,255,255,0.12)" 
              strokeWidth="1.5" 
              strokeDasharray="4 6" 
              fill="none" 
            />
          </svg>

          {/* Heavy Titanium Door Face */}
          <div className="elite-door-face">
            <div className="elite-door-sheen" />
            
            {/* Cross Steel Locking Bolts (Extend/Retract visually) */}
            <div className={`elite-bolt elite-bolt--top ${isLocked ? 'engaged' : ''}`} />
            <div className={`elite-bolt elite-bolt--bottom ${isLocked ? 'engaged' : ''}`} />
            <div className={`elite-bolt elite-bolt--left ${isLocked ? 'engaged' : ''}`} />
            <div className={`elite-bolt elite-bolt--right ${isLocked ? 'engaged' : ''}`} />

            {/* Center Rotating Tri-Spoke Wheel */}
            <div 
              className="elite-spoke-hub"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="elite-spoke elite-spoke-1" />
              <div className="elite-spoke elite-spoke-2" />
              <div className="elite-spoke elite-spoke-3" />
              
              {/* Spoke Handles */}
              <div className="elite-handle elite-handle-1" />
              <div className="elite-handle elite-handle-2" />
              <div className="elite-handle elite-handle-3" />

              {/* Central Core Cap */}
              <div className="elite-core-cap">
                <div className="elite-core-lens">
                  <div className={`elite-core-laser ${isLocked ? 'locked' : 'unlocked'}`} />
                  <div className="elite-core-inner">
                    <span className="elite-core-txt">DV-24</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Digital Sensor HUD Ring */}
            <div className="elite-sensor-ring">
              <span className="elite-sensor-tick elite-sensor-tick--1" />
              <span className="elite-sensor-tick elite-sensor-tick--2" />
              <span className="elite-sensor-tick elite-sensor-tick--3" />
              <span className="elite-sensor-tick elite-sensor-tick--4" />
            </div>
          </div>
        </div>

        {/* Floating Holographic Cryptographic Nodes */}
        <div className="elite-floating-chip elite-floating-chip--left">
          <div className="elite-chip-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FD2B06" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="elite-chip-text">
            <strong>Client Enclave</strong>
            <span>Hardware Isolated</span>
          </div>
        </div>

        <div className="elite-floating-chip elite-floating-chip--right">
          <div className="elite-chip-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="elite-chip-text">
            <strong>Dual-Tier PIN</strong>
            <span>Zero-Knowledge Proof</span>
          </div>
        </div>

        <div className="elite-floating-chip elite-floating-chip--bottom">
          <div className="elite-chip-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="elite-chip-text">
            <strong>OCR Verification</strong>
            <span>Deterministic Engine</span>
          </div>
        </div>

      </div>

      {/* Bottom Telemetry Bar */}
      <div className="elite-vault-footer-telemetry">
        <div className="elite-telemetry-col">
          <span className="elite-telemetry-k">LATENCY</span>
          <span className="elite-telemetry-v">14ms E2E</span>
        </div>
        <div className="elite-telemetry-divider" />
        <div className="elite-telemetry-col">
          <span className="elite-telemetry-k">CIPHER</span>
          <span className="elite-telemetry-v">CHACHA20-POLY1305</span>
        </div>
        <div className="elite-telemetry-divider" />
        <div className="elite-telemetry-col">
          <span className="elite-telemetry-k">SESSION</span>
          <span className="elite-telemetry-v text-emerald">ACTIVE & GUARDED</span>
        </div>
      </div>
    </div>
  );
}
