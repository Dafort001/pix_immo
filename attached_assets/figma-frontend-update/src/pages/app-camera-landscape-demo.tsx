import { useState, useEffect } from 'react';
import { IPhoneFrame } from '../components/IPhoneFrame';
import { Bluetooth, BluetoothOff, Settings } from 'lucide-react';

type FormatRatio = '2:3' | '3:2' | '3:4' | '4:3' | '16:9' | '9:16';

// Available formats for landscape orientation only
const LANDSCAPE_FORMATS: FormatRatio[] = ['3:2', '4:3', '16:9'];

export default function AppCameraLandscapeDemo() {
  // Force landscape orientation
  const orientation = 'landscape';
  
  const SAFE_AREA_TOP = 59;
  const SAFE_AREA_BOTTOM = 34;
  const NAV_BAR_SIZE = 72;

  // Camera states
  const [currentFormat, setCurrentFormat] = useState<FormatRatio>('3:2');
  const [gridMode, setGridMode] = useState<'off' | '3x3'>('3x3');
  const [zoomLevel, setZoomLevel] = useState(2.5);
  const [bluetoothConnected, setBluetoothConnected] = useState(true);
  const [histogramVisible, setHistogramVisible] = useState(true);
  const [showZoomSlider, setShowZoomSlider] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [photoCount, setPhotoCount] = useState(42);
  const [currentRoom] = useState('Wohnzimmer');

  // Histogram dragging
  const [histogramPosition, setHistogramPosition] = useState({ top: 120, right: 16 });

  // Mock camera feed background
  const cameraBackground = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  const toggleGrid = () => {
    setGridMode(gridMode === 'off' ? '3x3' : 'off');
  };

  const handleShutter = () => {
    setPhotoCount(prev => prev + 1);
  };

  // Format dimensions for landscape
  const getFormatDimensions = (format: FormatRatio) => {
    const screenWidth = 932;
    const screenHeight = 430;
    const maxWidth = screenWidth - 200; // Space for controls
    const maxHeight = screenHeight - 120;

    let width = maxWidth;
    let height = maxHeight;

    switch (format) {
      case '16:9':
        width = maxWidth;
        height = (maxWidth * 9) / 16;
        break;
      case '9:16':
        height = maxHeight;
        width = (maxHeight * 9) / 16;
        break;
      case '3:2':
        width = maxWidth;
        height = (maxWidth * 2) / 3;
        break;
      case '2:3':
        height = maxHeight;
        width = (maxHeight * 2) / 3;
        break;
      case '4:3':
        width = maxWidth;
        height = (maxWidth * 3) / 4;
        break;
      case '3:4':
        height = maxHeight;
        width = (maxHeight * 3) / 4;
        break;
    }

    if (height > maxHeight) {
      const scale = maxHeight / height;
      height = maxHeight;
      width *= scale;
    }
    if (width > maxWidth) {
      const scale = maxWidth / width;
      width = maxWidth;
      height *= scale;
    }

    return { width: Math.round(width), height: Math.round(height) };
  };

  const formatDims = getFormatDimensions(currentFormat);

  return (
    <IPhoneFrame orientation="landscape" hideStatusBar={false}>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          background: cameraBackground,
          overflow: 'hidden',
        }}
      >
        {/* Format Frame - Centered */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${formatDims.width}px`,
            height: `${formatDims.height}px`,
            border: '2px solid rgba(255, 255, 255, 0.8)',
            zIndex: 10,
          }}
        >
          {/* Grid Overlay */}
          {gridMode === '3x3' && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              {/* Vertical lines */}
              <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
              <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
              {/* Horizontal lines */}
              <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
              <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
            </svg>
          )}
        </div>

        {/* Room Name - Top Center */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 1)',
            zIndex: 30,
          }}
        >
          {currentRoom}
        </div>

        {/* Photo Counter - Top Right */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 88,
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 1)',
            zIndex: 30,
          }}
        >
          {photoCount}
        </div>

        {/* Grid Toggle Button - Bottom Left */}
        <button
          onClick={toggleGrid}
          style={{
            position: 'absolute',
            bottom: 16,
            left: 64,
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: gridMode !== 'off' ? 'rgba(176, 224, 230, 0.75)' : 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            zIndex: 40,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="6" height="6" stroke="rgba(255, 255, 255, 1)" strokeWidth="2"/>
            <rect x="14" y="4" width="6" height="6" stroke="rgba(255, 255, 255, 1)" strokeWidth="2"/>
            <rect x="4" y="14" width="6" height="6" stroke="rgba(255, 255, 255, 1)" strokeWidth="2"/>
            <rect x="14" y="14" width="6" height="6" stroke="rgba(255, 255, 255, 1)" strokeWidth="2"/>
          </svg>
        </button>

        {/* LANDSCAPE: Control Buttons - Vertical Column on Right */}
        <div
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center',
            zIndex: 20,
          }}
        >
          {/* Bluetooth */}
          <button
            onClick={() => setBluetoothConnected(!bluetoothConnected)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: bluetoothConnected ? 'rgba(176, 224, 230, 0.75)' : 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            }}
          >
            {bluetoothConnected ? (
              <Bluetooth size={20} color="rgba(255, 255, 255, 1)" />
            ) : (
              <BluetoothOff size={20} color="rgba(255, 255, 255, 1)" />
            )}
          </button>
          
          {/* Zoom */}
          <button
            onClick={() => setShowZoomSlider(!showZoomSlider)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: showZoomSlider ? 'rgba(176, 224, 230, 0.75)' : 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="6" stroke="rgba(255, 255, 255, 1)" strokeWidth="2"/>
              <path d="M16 16L20 20" stroke="rgba(255, 255, 255, 1)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M11 8V14M8 11H14" stroke="rgba(255, 255, 255, 1)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          
          {/* Format Status Button */}
          <button
            onClick={() => {
              const currentIndex = LANDSCAPE_FORMATS.indexOf(currentFormat);
              const nextIndex = (currentIndex + 1) % LANDSCAPE_FORMATS.length;
              setCurrentFormat(LANDSCAPE_FORMATS[nextIndex]);
            }}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
              fontSize: '11px',
              fontWeight: '700',
              color: 'rgba(255, 255, 255, 1)',
            }}
          >
            {currentFormat}
          </button>
          
          {/* Shutter - 32px from format frame */}
          <button
            id="shutter-btn"
            onClick={handleShutter}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'transparent',
              border: '4px solid rgba(255, 255, 255, 0.9)',
              cursor: 'pointer',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
              transition: 'transform 0.1s ease',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(60, 60, 60, 0.8)',
                backdropFilter: 'blur(10px)',
              }}
            />
          </button>
          
          {/* Histogram */}
          <button
            onClick={() => setHistogramVisible(!histogramVisible)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: histogramVisible ? 'rgba(176, 224, 230, 0.75)' : 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="12" width="3" height="8" fill="rgba(255, 255, 255, 1)"/>
              <rect x="8" y="8" width="3" height="12" fill="rgba(255, 255, 255, 1)"/>
              <rect x="12" y="4" width="3" height="16" fill="rgba(255, 255, 255, 1)"/>
              <rect x="16" y="10" width="3" height="10" fill="rgba(255, 255, 255, 1)"/>
            </svg>
          </button>
          
          {/* Settings (Zahnrad) */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: showSettings ? 'rgba(176, 224, 230, 0.75)' : 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Settings size={20} color="rgba(255, 255, 255, 1)" />
          </button>
        </div>

        {/* Zoom Slider - Left of control buttons */}
        {showZoomSlider && (
          <div
            style={{
              position: 'absolute',
              right: 80,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '280px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              zIndex: 20,
            }}
          >
            {/* Zoom Value Display */}
            <div
              style={{
                padding: '4px 8px',
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 1)',
              }}
            >
              {zoomLevel.toFixed(1)}x
            </div>
            
            {/* Vertical Slider */}
            <div
              style={{
                position: 'relative',
                width: '48px',
                height: '240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Track */}
              <div
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '2px',
                }}
              />
              
              {/* Filled Track */}
              <div
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: `${((zoomLevel - 0.5) / (10 - 0.5)) * 100}%`,
                  background: 'rgba(176, 224, 230, 0.9)',
                  borderRadius: '2px',
                  bottom: 0,
                }}
              />
              
              {/* Thumb */}
              <div
                style={{
                  position: 'absolute',
                  bottom: `${((zoomLevel - 0.5) / (10 - 0.5)) * 100}%`,
                  transform: 'translateY(50%)',
                  width: '24px',
                  height: '24px',
                  background: 'rgba(255, 255, 255, 1)',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  cursor: 'grab',
                }}
              />
            </div>
          </div>
        )}

        {/* Histogram Overlay */}
        {histogramVisible && (
          <div
            style={{
              position: 'absolute',
              top: `${histogramPosition.top}px`,
              right: `${histogramPosition.right}px`,
              width: '120px',
              height: '80px',
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '8px',
              zIndex: 30,
              cursor: 'move',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 100 64">
              {/* Mock histogram bars */}
              {Array.from({ length: 32 }, (_, i) => {
                const height = Math.random() * 60 + 4;
                return (
                  <rect
                    key={i}
                    x={i * 3}
                    y={64 - height}
                    width="2.5"
                    height={height}
                    fill="rgba(176, 224, 230, 0.8)"
                  />
                );
              })}
            </svg>
          </div>
        )}

        {/* Navigation Bar - Right Side for Landscape */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '72px',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: `${SAFE_AREA_BOTTOM}px 0`,
            zIndex: 50,
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {[
            { icon: '🏠', label: 'Start', active: false },
            { icon: '📷', label: 'Kamera', active: true },
            { icon: '🖼️', label: 'Galerie', active: false },
            { icon: '⬆️', label: 'Upload', active: false },
            { icon: '⚙️', label: 'Manuell', active: false },
          ].map((btn, idx) => (
            <button
              key={idx}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                background: btn.active ? 'rgba(176, 224, 230, 0.75)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: btn.active ? 1 : 0.4,
                transition: 'all 0.2s ease',
                fontSize: '22px',
                transform: 'rotate(90deg)',
              }}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Info Overlay - Bottom Left Corner */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 80,
            padding: '12px 16px',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(176, 224, 230, 0.3)',
            zIndex: 30,
            maxWidth: '300px',
          }}
        >
          <div style={{ fontSize: '12px', color: 'rgba(176, 224, 230, 1)', fontWeight: '600', marginBottom: '4px' }}>
            LANDSCAPE MODE
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Controls: Rechts vertikal • Nav: Rechts gedreht
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Format: {currentFormat} • Grid: {gridMode === '3x3' ? 'An' : 'Aus'}
          </div>
        </div>
      </div>
    </IPhoneFrame>
  );
}
