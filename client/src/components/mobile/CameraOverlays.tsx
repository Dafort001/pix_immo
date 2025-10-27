/**
 * Camera Overlays - Grid, Level, Metering Spot
 * Visual aids for professional photography
 */

import { useManualModeStore } from '@/lib/manual-mode/store';
import { useState, useEffect } from 'react';

/**
 * Grid Overlay Component
 */
export function GridOverlay() {
  const gridType = useManualModeStore((state) => state.gridType);

  if (gridType === 'none') return null;

  return (
    <div className="absolute inset-0 pointer-events-none" data-testid="camera-grid-overlay">
      {gridType === '3x3' && <Grid3x3 />}
      {gridType === 'golden-ratio' && <GridGoldenRatio />}
    </div>
  );
}

/**
 * 3x3 Grid (Rule of Thirds)
 */
function Grid3x3() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Vertical Lines */}
      <line x1="33.33" y1="0" x2="33.33" y2="100" stroke="white" strokeWidth="0.2" opacity="0.5" />
      <line x1="66.66" y1="0" x2="66.66" y2="100" stroke="white" strokeWidth="0.2" opacity="0.5" />
      
      {/* Horizontal Lines */}
      <line x1="0" y1="33.33" x2="100" y2="33.33" stroke="white" strokeWidth="0.2" opacity="0.5" />
      <line x1="0" y1="66.66" x2="100" y2="66.66" stroke="white" strokeWidth="0.2" opacity="0.5" />
      
      {/* Intersection Points (Power Points) */}
      <circle cx="33.33" cy="33.33" r="1" fill="white" opacity="0.7" />
      <circle cx="66.66" cy="33.33" r="1" fill="white" opacity="0.7" />
      <circle cx="33.33" cy="66.66" r="1" fill="white" opacity="0.7" />
      <circle cx="66.66" cy="66.66" r="1" fill="white" opacity="0.7" />
    </svg>
  );
}

/**
 * Golden Ratio Grid (Phi Grid)
 */
function GridGoldenRatio() {
  // Golden ratio: 1:1.618
  const phi = 38.2; // 100 / 1.618 ≈ 61.8%, complement is 38.2%

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Vertical Lines at Golden Ratio */}
      <line x1={phi} y1="0" x2={phi} y2="100" stroke="white" strokeWidth="0.2" opacity="0.5" />
      <line x1={100 - phi} y1="0" x2={100 - phi} y2="100" stroke="white" strokeWidth="0.2" opacity="0.5" />
      
      {/* Horizontal Lines at Golden Ratio */}
      <line x1="0" y1={phi} x2="100" y2={phi} stroke="white" strokeWidth="0.2" opacity="0.5" />
      <line x1="0" y1={100 - phi} x2="100" y2={100 - phi} stroke="white" strokeWidth="0.2" opacity="0.5" />
      
      {/* Intersection Points */}
      <circle cx={phi} cy={phi} r="1" fill="white" opacity="0.7" />
      <circle cx={100 - phi} cy={phi} r="1" fill="white" opacity="0.7" />
      <circle cx={phi} cy={100 - phi} r="1" fill="white" opacity="0.7" />
      <circle cx={100 - phi} cy={100 - phi} r="1" fill="white" opacity="0.7" />
    </svg>
  );
}

/**
 * Horizon Level Overlay
 * Shows digital spirit level with angle indication
 */
export function HorizonLevelOverlay() {
  const enabled = useManualModeStore((state) => state.horizonLevelEnabled);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Use gamma (left-right tilt) for horizon level
      const gamma = event.gamma ?? 0;
      setAngle(Math.round(gamma * 10) / 10); // Round to 1 decimal
    };

    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [enabled]);

  if (!enabled) return null;

  const isLevel = Math.abs(angle) < 1; // Within 1 degree is "level"

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" data-testid="horizon-level-overlay">
      {/* Center Line (Horizon) */}
      <div className="relative w-full h-px bg-white/30">
        {/* Level Indicator */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ transform: `translate(-50%, -50%) rotate(${-angle}deg)` }}
        >
          {/* Bubble Level Visualization */}
          <div className="w-32 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Level Marks */}
              <div className="absolute inset-0 flex items-center justify-around px-2">
                <div className="w-px h-4 bg-white/50" />
                <div className="w-px h-6 bg-white" />
                <div className="w-px h-4 bg-white/50" />
              </div>
              
              {/* Bubble */}
              <div
                className={`absolute w-6 h-6 rounded-full transition-all ${
                  isLevel ? 'bg-green-500' : 'bg-white'
                }`}
                style={{
                  transform: `translateX(${Math.max(-50, Math.min(50, angle * 5))}px)`,
                }}
              />
            </div>
          </div>
          
          {/* Angle Display */}
          <div className={`mt-2 px-3 py-1 rounded-lg font-mono text-sm ${
            isLevel ? 'bg-green-500/80 text-white' : 'bg-black/60 backdrop-blur-sm text-white border border-white/30'
          }`}>
            {angle > 0 ? '+' : ''}{angle}°
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Metering Mode Spot Indicator
 */
export function MeteringModeOverlay() {
  const meteringMode = useManualModeStore((state) => state.meteringMode);

  if (meteringMode !== 'spot') return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" data-testid="metering-spot-overlay">
      {/* Spot Metering Circle */}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Outer Circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.7"
          />
          {/* Inner Circle */}
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="white"
            strokeWidth="1"
            opacity="0.5"
          />
          {/* Center Dot */}
          <circle cx="50" cy="50" r="2" fill="white" opacity="0.9" />
          
          {/* Crosshair - 5x größer */}
          <line x1="50" y1="0" x2="50" y2="40" stroke="white" strokeWidth="1.5" opacity="0.7" />
          <line x1="50" y1="60" x2="50" y2="100" stroke="white" strokeWidth="1.5" opacity="0.7" />
          <line x1="0" y1="50" x2="40" y2="50" stroke="white" strokeWidth="1.5" opacity="0.7" />
          <line x1="60" y1="50" x2="100" y2="50" stroke="white" strokeWidth="1.5" opacity="0.7" />
        </svg>
        
        {/* Label */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-xs border border-white/30">
          Spot Metering
        </div>
      </div>
    </div>
  );
}

/**
 * Focus Peaking Overlay
 * Highlights edges in focus (simulated - real implementation would use canvas)
 */
export function FocusPeakingOverlay() {
  const enabled = useManualModeStore((state) => state.focusPeakingEnabled);
  const focusMode = useManualModeStore((state) => state.focusMode);

  if (!enabled || focusMode === 'auto') return null;

  return (
    <div className="absolute inset-0 pointer-events-none mix-blend-screen" data-testid="focus-peaking-overlay">
      {/* Note: This is a visual indicator. Real focus peaking would require 
          canvas-based edge detection on the video stream */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-green-400 text-xs border border-green-500/50 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Focus Peaking Active
      </div>
    </div>
  );
}
