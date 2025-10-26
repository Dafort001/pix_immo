/**
 * Level Indicator Component
 * Professional alignment tool using device motion sensors
 * Shows visual + haptic feedback when device is level
 */

import { useEffect, useState, useRef } from 'react';
import { useManualModeStore } from '@/lib/manual-mode/store';
import { LEVEL_SENSITIVITY_PRESETS } from '@/lib/manual-mode/types';

interface LevelData {
  roll: number;
  pitch: number;
  isLevel: boolean;
}

export function LevelIndicator() {
  const showLevelIndicator = useManualModeStore((state) => state.showLevelIndicator);
  const showLevelDegrees = useManualModeStore((state) => state.showLevelDegrees);
  const levelSensitivity = useManualModeStore((state) => state.levelSensitivity);
  
  const [levelData, setLevelData] = useState<LevelData>({ roll: 0, pitch: 0, isLevel: false });
  const [showLevelConfirmation, setShowLevelConfirmation] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  
  const lastHapticTimeRef = useRef<number>(0);
  const wasLevelRef = useRef<boolean>(false);
  
  // Get current sensitivity thresholds
  const sensitivity = LEVEL_SENSITIVITY_PRESETS[levelSensitivity];

  useEffect(() => {
    if (!showLevelIndicator) return;

    let mounted = true;

    // Request permission (iOS 13+)
    async function requestPermission() {
      if (typeof DeviceMotionEvent !== 'undefined' && 
          typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (mounted) {
            setPermissionStatus(permission === 'granted' ? 'granted' : 'denied');
          }
        } catch (error) {
          console.warn('[Level Indicator] Permission request failed:', error);
          if (mounted) setPermissionStatus('denied');
        }
      } else {
        // Non-iOS or older browsers - assume granted
        if (mounted) setPermissionStatus('granted');
      }
    }

    requestPermission();

    return () => {
      mounted = false;
    };
  }, [showLevelIndicator]);

  useEffect(() => {
    if (!showLevelIndicator || permissionStatus !== 'granted') return;

    function handleDeviceOrientation(event: DeviceOrientationEvent) {
      // beta: front-to-back tilt (-180 to 180), 0 = device horizontal
      // gamma: left-to-right tilt (-90 to 90), 0 = device upright
      
      const beta = event.beta ?? 0;  // pitch (front-back tilt)
      const gamma = event.gamma ?? 0; // roll (left-right tilt)
      
      // Normalize angles for landscape-first design using robust orientation detection
      // When device is in landscape (rotated 90° to the right):
      // - gamma becomes the effective pitch (forward/backward)
      // - beta becomes the effective roll (left/right)
      
      // Multi-tiered orientation detection (iOS Safari compatible)
      let isLandscape = false;
      
      // Tier 1: Modern ScreenOrientation API
      if (screen.orientation && screen.orientation.angle !== undefined) {
        const angle = screen.orientation.angle;
        isLandscape = angle === 90 || angle === 270;
      }
      // Tier 2: Deprecated window.orientation (works on iOS Safari!)
      else if ('orientation' in window && typeof (window as any).orientation === 'number') {
        const angle = (window as any).orientation;
        isLandscape = angle === 90 || angle === -90;
      }
      // Tier 3: Fallback to viewport dimensions
      else {
        isLandscape = window.innerWidth > window.innerHeight;
      }
      
      let roll: number;
      let pitch: number;
      
      if (isLandscape) {
        // Landscape mode: swap beta and gamma
        roll = Math.abs(beta);
        pitch = Math.abs(gamma);
      } else {
        // Portrait mode: use as-is
        roll = Math.abs(gamma);
        pitch = Math.abs(beta);
      }
      
      // Apply hysteresis to prevent jitter
      const hysteresis = sensitivity.hysteresis;
      const rollThreshold = sensitivity.roll;
      const pitchThreshold = sensitivity.pitch;
      
      // Check if currently within documented tolerance
      const withinThreshold = roll <= rollThreshold && pitch <= pitchThreshold;
      
      // Check if beyond exit tolerance (threshold + hysteresis)
      const beyondExit = roll > (rollThreshold + hysteresis) || pitch > (pitchThreshold + hysteresis);
      
      // State machine with proper entry/exit conditions
      let isLevel: boolean;
      
      if (wasLevelRef.current) {
        // Currently level - exit only when BOTH axes exceed threshold+hysteresis
        // OR when ANY axis exceeds threshold+hysteresis
        isLevel = !beyondExit;
      } else {
        // Not level - enter when BOTH axes are within documented threshold
        isLevel = withinThreshold;
      }
      
      // Update visual state
      setLevelData({ roll, pitch, isLevel });
      
      // Trigger haptic feedback when transitioning TO level (with debounce)
      if (isLevel && !wasLevelRef.current) {
        const now = Date.now();
        if (now - lastHapticTimeRef.current > 1000) { // 1s debounce
          triggerHapticFeedback();
          setShowLevelConfirmation(true);
          setTimeout(() => setShowLevelConfirmation(false), 400);
          lastHapticTimeRef.current = now;
        }
      }
      
      // Update ref for next iteration
      wasLevelRef.current = isLevel;
    }

    window.addEventListener('deviceorientation', handleDeviceOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [showLevelIndicator, permissionStatus, sensitivity]);

  function triggerHapticFeedback() {
    // Try vibration API (works on Android, some iOS browsers)
    if (navigator.vibrate) {
      navigator.vibrate(20); // Short 20ms pulse
    }
    
    // Try experimental Haptic Feedback API (iOS Safari)
    if ((window as any).webkit?.messageHandlers?.hapticFeedback) {
      try {
        (window as any).webkit.messageHandlers.hapticFeedback.postMessage('light');
      } catch (e) {
        console.debug('[Level Indicator] Haptic feedback not available');
      }
    }
  }

  if (!showLevelIndicator) return null;

  // Permission denied fallback
  if (permissionStatus === 'denied') {
    return (
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
        data-testid="level-indicator-disabled"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-2 border-gray-500/50 rounded-sm flex items-center justify-center">
            <div className="w-6 h-px bg-gray-500/50" />
            <div className="w-px h-6 bg-gray-500/50 absolute" />
          </div>
          <span className="text-xs text-gray-500 bg-black/50 px-2 py-1 rounded">
            Sensor nicht verfügbar
          </span>
        </div>
      </div>
    );
  }

  // Main level indicator
  const { roll, pitch, isLevel } = levelData;
  const indicatorColor = isLevel ? 'border-green-500 bg-green-500/20' : 'border-white/60 bg-white/10';
  const crossColor = isLevel ? 'bg-green-400' : 'bg-white/60';

  return (
    <div 
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
      data-testid="level-indicator"
    >
      <div className="flex flex-col items-center gap-2">
        {/* Square with crosshair */}
        <div 
          className={`w-10 h-10 border-2 rounded-sm flex items-center justify-center transition-all duration-200 ${indicatorColor}`}
          data-testid="level-square"
        >
          {/* Horizontal line */}
          <div className={`w-6 h-0.5 ${crossColor} transition-colors duration-200`} />
          {/* Vertical line */}
          <div className={`w-0.5 h-6 ${crossColor} absolute transition-colors duration-200`} />
        </div>

        {/* Level confirmation text */}
        {showLevelConfirmation && (
          <div 
            className="absolute top-12 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-fade-in-out"
            data-testid="level-confirmation"
          >
            LEVEL ✓
          </div>
        )}

        {/* Optional degree display */}
        {showLevelDegrees && (
          <div 
            className="text-xs text-white/80 bg-black/60 px-2 py-1 rounded font-mono"
            data-testid="level-degrees"
          >
            {roll >= 0 ? '+' : ''}{roll.toFixed(1)}° / {pitch >= 0 ? '+' : ''}{pitch.toFixed(1)}°
          </div>
        )}
      </div>
    </div>
  );
}
