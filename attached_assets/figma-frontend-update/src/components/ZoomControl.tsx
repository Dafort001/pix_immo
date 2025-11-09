import { useState, useEffect, useRef } from 'react';

interface ZoomControlProps {
  orientation: 'portrait' | 'landscape';
  safeAreaBottom: number;
  navBarSize?: number;
  controlBarHeight?: number;
  onZoomChange?: (zoom: number) => void;
}

export function ZoomControl({ 
  orientation, 
  safeAreaBottom, 
  navBarSize = 72,
  controlBarHeight = 170,
  onZoomChange 
}: ZoomControlProps) {
  const [zoom, setZoom] = useState(1);
  const [showSlider, setShowSlider] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  
  const snapPoints = [0.5, 1, 3, 5];
  const minZoom = 0.5;
  const maxZoom = 5;
  
  // Load saved zoom
  useEffect(() => {
    const saved = localStorage.getItem('camera-zoom');
    if (saved) {
      setZoom(parseFloat(saved));
    }
  }, []);
  
  // Save zoom when changed
  useEffect(() => {
    localStorage.setItem('camera-zoom', zoom.toString());
    onZoomChange?.(zoom);
  }, [zoom]);
  
  // Auto-hide slider
  const resetHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      setShowSlider(false);
    }, 2000);
  };
  
  useEffect(() => {
    if (showSlider) {
      resetHideTimer();
    }
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [showSlider]);
  
  const handleSliderChange = (value: number) => {
    // Find nearest snap point
    let newZoom = value;
    const threshold = 0.2;
    
    for (const snap of snapPoints) {
      if (Math.abs(value - snap) < threshold) {
        newZoom = snap;
        // Haptic feedback simulation
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
        break;
      }
    }
    
    setZoom(newZoom);
    resetHideTimer();
  };
  
  const toggleSlider = () => {
    setShowSlider(!showSlider);
  };
  
  // Slider position and dimensions
  const sliderHeight = 200;
  const buttonSize = 48;
  
  return (
    <>
      {/* Zoom Button */}
      <div
        style={{
          position: 'absolute',
          bottom: orientation === 'portrait' ? safeAreaBottom + navBarSize + controlBarHeight + 16 : 'auto',
          top: orientation === 'landscape' ? '20%' : 'auto',
          left: orientation === 'portrait' ? 16 : 'auto',
          right: orientation === 'landscape' ? navBarSize + 88 : 'auto',
          transform: 'none',
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 20,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.15s ease',
        }}
        onClick={toggleSlider}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          {zoom}×
        </span>
      </div>
      
      {/* Zoom Slider */}
      {showSlider && (
        <div
          style={{
            position: 'absolute',
            bottom: orientation === 'portrait' ? safeAreaBottom + navBarSize + controlBarHeight + 16 + buttonSize + 8 : 'auto',
            top: orientation === 'landscape' ? '20%' : 'auto',
            left: orientation === 'portrait' ? 16 : 'auto',
            right: orientation === 'landscape' ? navBarSize + 88 : 'auto',
            transform: orientation === 'portrait' ? 'none' : `translateY(-${sliderHeight + 8}px)`,
            width: '48px',
            height: `${sliderHeight}px`,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '12px 0',
            zIndex: 20,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            opacity: showSlider ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          {/* Slider track */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 0',
            }}
          >
            {/* Snap point markers */}
            {snapPoints.map((snap) => {
              const position = ((snap - minZoom) / (maxZoom - minZoom)) * 100;
              const isActive = Math.abs(zoom - snap) < 0.1;
              
              return (
                <div
                  key={snap}
                  style={{
                    position: 'absolute',
                    bottom: `${position}%`,
                    left: '50%',
                    transform: 'translate(-50%, 50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setZoom(snap);
                    resetHideTimer();
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '2px',
                      background: isActive ? '#3B82F6' : 'rgba(255, 255, 255, 0.6)',
                      transition: 'background 0.2s ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '10px',
                      color: isActive ? '#3B82F6' : 'rgba(255, 255, 255, 0.6)',
                      fontWeight: '600',
                      minWidth: '24px',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {snap}×
                  </span>
                </div>
              );
            })}
            
            {/* Slider thumb */}
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={0.1}
              value={zoom}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              style={{
                position: 'absolute',
                left: '50%',
                top: '8px',
                bottom: '8px',
                width: '176px',
                transform: 'translateX(-50%) rotate(-90deg)',
                transformOrigin: 'center',
                appearance: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      )}
      
      <style>
        {`
          input[type="range"]::-webkit-slider-track {
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3B82F6;
            cursor: pointer;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          }
          
          input[type="range"]::-moz-range-track {
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3B82F6;
            cursor: pointer;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          }
        `}
      </style>
    </>
  );
}
