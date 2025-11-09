import { useEffect, useState } from 'react';

interface LevelIndicatorProps {
  orientation: 'portrait' | 'landscape';
}

export function LevelIndicator({ orientation }: LevelIndicatorProps) {
  const [tilt, setTilt] = useState(0); // -15 to +15 degrees
  
  // Simulate device tilt (in real app, would use device orientation API)
  useEffect(() => {
    const interval = setInterval(() => {
      setTilt(Math.sin(Date.now() / 2000) * 8); // Oscillate between -8 and +8
    }, 50);
    return () => clearInterval(interval);
  }, []);
  
  const isLevel = Math.abs(tilt) <= 2;
  
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '3px',
        zIndex: 15,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Apple-Style: Horizontal Level Line (rotiert mit Device) */}
      <div
        style={{
          position: 'relative',
          width: '80%',
          maxWidth: '400px',
          height: '100%',
        }}
      >
        {/* Rotating horizon line */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) rotate(${tilt}deg)`,
            width: '100%',
            height: '2px',
            background: isLevel 
              ? 'rgba(255, 204, 0, 0.95)'
              : 'rgba(255, 255, 255, 0.85)',
            transition: 'background 0.2s ease',
            boxShadow: isLevel 
              ? '0 0 8px rgba(255, 204, 0, 0.6)' 
              : '0 0 4px rgba(255, 255, 255, 0.3)',
            transformOrigin: 'center',
          }}
        >
          {/* Center crosshair marks */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '2px',
              height: '20px',
              background: isLevel ? 'rgba(255, 204, 0, 0.95)' : 'rgba(255, 255, 255, 0.85)',
            }}
          />
          
          {/* Left mark */}
          <div
            style={{
              position: 'absolute',
              left: '20%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '2px',
              height: '12px',
              background: isLevel ? 'rgba(255, 204, 0, 0.7)' : 'rgba(255, 255, 255, 0.6)',
            }}
          />
          
          {/* Right mark */}
          <div
            style={{
              position: 'absolute',
              left: '80%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '2px',
              height: '12px',
              background: isLevel ? 'rgba(255, 204, 0, 0.7)' : 'rgba(255, 255, 255, 0.6)',
            }}
          />
        </div>
      </div>
      
      {/* Angle display (klein, unten rechts wie Apple) */}
      {!isLevel && Math.abs(tilt) > 0.5 && (
        <div
          style={{
            position: 'absolute',
            bottom: '-30px',
            right: '10%',
            fontSize: '11px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.7)',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '3px 8px',
            borderRadius: '8px',
            backdropFilter: 'blur(4px)',
          }}
        >
          {tilt > 0 ? '+' : ''}{tilt.toFixed(1)}°
        </div>
      )}
    </div>
  );
}
