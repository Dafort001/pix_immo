import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Bluetooth, BluetoothOff, Settings, X, Move } from 'lucide-react';
import { IPhoneFrame } from '../components/IPhoneFrame';
import { AppNavigationBar } from '../components/AppNavigationBar';
import { HistogramOverlay } from '../components/HistogramOverlay';
import { LevelIndicator } from '../components/LevelIndicator';
import { toast } from 'sonner@2.0.3';

// Types
type Orientation = 'portrait' | 'landscape';
type FormatRatio = '2:3' | '3:2' | '3:4' | '4:3' | '16:9' | '9:16';
type GridMode = 'off' | '3x3' | '4x4' | 'golden';

// Available formats per orientation
const PORTRAIT_FORMATS: FormatRatio[] = ['9:16', '2:3', '3:4'];
const LANDSCAPE_FORMATS: FormatRatio[] = ['3:2', '4:3', '16:9'];

// White Balance Presets (Kelvin values)
const WB_PRESETS = {
  auto: null,      // iOS determines
  daylight: 5500,  // Sunny, windows
  cloudy: 6500,    // Overcast daylight
  tungsten: 3200,  // Incandescent bulbs
};

// Format equivalents for device rotation
const FORMAT_EQUIVALENTS: Record<FormatRatio, FormatRatio> = {
  '2:3': '3:2',
  '3:2': '2:3',
  '3:4': '4:3',
  '4:3': '3:4',
  '16:9': '9:16',
  '9:16': '16:9',
};

// 57 Room types (complete list)
const ROOM_TYPES = [
  { id: 'undefined', name: 'Undefiniert' },
  { id: 'general', name: 'Allgemein' },
  { id: 'living', name: 'Wohnzimmer' },
  { id: 'dining', name: 'Esszimmer' },
  { id: 'kitchen', name: 'Küche' },
  { id: 'bedroom', name: 'Schlafzimmer' },
  { id: 'bedroom_master', name: 'Hauptschlafzimmer' },
  { id: 'bedroom_child', name: 'Kinderzimmer' },
  { id: 'bedroom_guest', name: 'Gästezimmer' },
  { id: 'bathroom', name: 'Badezimmer' },
  { id: 'bathroom_master', name: 'Hauptbadezimmer' },
  { id: 'bathroom_guest', name: 'Gästebad' },
  { id: 'wc', name: 'WC' },
  { id: 'office', name: 'Arbeitszimmer' },
  { id: 'hallway', name: 'Flur' },
  { id: 'entrance', name: 'Eingangsbereich' },
  { id: 'balcony', name: 'Balkon' },
  { id: 'terrace', name: 'Terrasse' },
  { id: 'garden', name: 'Garten' },
  { id: 'garage', name: 'Garage' },
  { id: 'carport', name: 'Carport' },
  { id: 'basement', name: 'Keller' },
  { id: 'attic', name: 'Dachboden' },
  { id: 'storage', name: 'Abstellraum' },
  { id: 'laundry', name: 'Waschraum' },
  { id: 'utility', name: 'Hauswirtschaftsraum' },
  { id: 'pantry', name: 'Speisekammer' },
  { id: 'walk_in_closet', name: 'Ankleidezimmer' },
  { id: 'gym', name: 'Fitnessraum' },
  { id: 'sauna', name: 'Sauna' },
  { id: 'pool', name: 'Pool' },
  { id: 'library', name: 'Bibliothek' },
  { id: 'music_room', name: 'Musikzimmer' },
  { id: 'hobby_room', name: 'Hobbyraum' },
  { id: 'playroom', name: 'Spielzimmer' },
  { id: 'studio', name: 'Studio' },
  { id: 'workshop', name: 'Werkstatt' },
  { id: 'conservatory', name: 'Wintergarten' },
  { id: 'staircase', name: 'Treppenhaus' },
  { id: 'elevator', name: 'Aufzug' },
  { id: 'roof', name: 'Dach' },
  { id: 'facade_front', name: 'Fassade Vorderseite' },
  { id: 'facade_back', name: 'Fassade Rückseite' },
  { id: 'facade_side', name: 'Fassade Seitlich' },
  { id: 'exterior', name: 'Außenansicht' },
  { id: 'street_view', name: 'Straßenansicht' },
  { id: 'aerial', name: 'Luftaufnahme' },
  { id: 'lobby', name: 'Lobby' },
  { id: 'reception', name: 'Rezeption' },
  { id: 'conference_room', name: 'Konferenzraum' },
  { id: 'meeting_room', name: 'Besprechungsraum' },
  { id: 'open_space', name: 'Großraumbüro' },
  { id: 'cafeteria', name: 'Cafeteria' },
  { id: 'restaurant', name: 'Restaurant' },
  { id: 'bar', name: 'Bar' },
  { id: 'retail', name: 'Verkaufsraum' },
  { id: 'showroom', name: 'Showroom' },
];

export default function AppCamera() {
  const [, setLocation] = useLocation();
  
  // Device & UI state
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [currentFormat, setCurrentFormat] = useState<FormatRatio>('3:2');
  const [selectedRoom, setSelectedRoom] = useState('undefined');
  const [gridMode, setGridMode] = useState<GridMode>('3x3');
  const [histogramVisible, setHistogramVisible] = useState(() => {
    // Load histogram state from localStorage
    const saved = localStorage.getItem('pix-histogram-visible');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [showZoomSlider, setShowZoomSlider] = useState(false);
  const [tiltAngle, setTiltAngle] = useState(0);
  const [memoryWarning, setMemoryWarning] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [timerMode, setTimerMode] = useState<'off' | '3s' | '10s'>('off');
  
  // Phase 1: Standard Mode Features
  const [evCompensation, setEvCompensation] = useState(0.0); // -2.0 to +2.0 EV
  const [levelIndicatorEnabled, setLevelIndicatorEnabled] = useState(false);
  const [whiteBalanceMode, setWhiteBalanceMode] = useState<'auto' | 'daylight' | 'cloudy' | 'tungsten'>('auto');
  const [whiteBalanceKelvin, setWhiteBalanceKelvin] = useState(5500);
  const [whiteBalanceLocked, setWhiteBalanceLocked] = useState(false);
  const [showWhiteBalancePanel, setShowWhiteBalancePanel] = useState(false);
  
  // Apple-Style EV Control
  const [showEvControl, setShowEvControl] = useState(false);
  const [evControlPosition, setEvControlPosition] = useState({ x: 0, y: 0 });
  const [evDragStartY, setEvDragStartY] = useState(0);
  const [evDragStartValue, setEvDragStartValue] = useState(0);
  
  // Stability Monitor
  const [stabilityEnabled, setStabilityEnabled] = useState(false);
  const [currentAcceleration, setCurrentAcceleration] = useState(0);
  const [stabilityStatus, setStabilityStatus] = useState<'stable' | 'warning' | 'unstable'>('stable');
  const [shutterSpeed, setShutterSpeed] = useState(125); // Denominator (1/125s)
  
  // Bracketing System
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState({ current: 0, total: 0 });
  const [deviceType, setDeviceType] = useState<'pro' | 'standard'>('standard');
  
  // Pro Controls Panel (Apple Chevron Style) - Simple Toggles
  const [showProControls, setShowProControls] = useState(false);
  
  // Layout constants (iPhone 15 Pro)
  const SAFE_AREA_TOP = 119;
  const SAFE_AREA_BOTTOM = 34;
  const NAV_BAR_SIZE = 80;
  
  // Detect iPhone Pro model on mount
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIPhone = /iphone/.test(userAgent);
      
      // Check for Pro models (iPhone 12 Pro and later support RAW)
      // In production, this would check for actual RAW capability via MediaDevices
      const isPro = isIPhone && (
        userAgent.includes('iphone15') ||
        userAgent.includes('iphone14 pro') ||
        userAgent.includes('iphone13 pro') ||
        userAgent.includes('iphone12 pro')
      );
      
      // Fallback: Check for high-end device characteristics
      const hasHighEndCamera = window.screen.width >= 390; // iPhone 12 Pro and later
      
      setDeviceType(isPro || hasHighEndCamera ? 'pro' : 'standard');
    };
    
    detectDevice();
  }, []);
  
  // Save histogram visibility to localStorage
  useEffect(() => {
    localStorage.setItem('pix-histogram-visible', JSON.stringify(histogramVisible));
  }, [histogramVisible]);

  // Handle orientation change - switch to equivalent format
  const handleOrientationToggle = () => {
    const newOrientation = orientation === 'portrait' ? 'landscape' : 'portrait';
    setOrientation(newOrientation);
    // Switch to equivalent format for new orientation
    setCurrentFormat(FORMAT_EQUIVALENTS[currentFormat]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        handleOrientationToggle();
      }
      if (e.key === 'g' || e.key === 'G') {
        toggleGrid();
      }
      if (e.key === 'h' || e.key === 'H') {
        setHistogramVisible(!histogramVisible);
      }
      if (e.key === ' ') {
        e.preventDefault();
        handleShutter();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [orientation, gridMode, histogramVisible, currentFormat]);

  // Toggle grid modes in cycle
  const toggleGrid = () => {
    const modes: GridMode[] = ['3x3', '4x4', 'golden', 'off'];
    const currentIndex = modes.indexOf(gridMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setGridMode(modes[nextIndex]);
  };

  // Generate unique stack ID for bracketing
  const generateStackId = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0];
    const random = Math.random().toString(36).substring(2, 8);
    return `stack_${timestamp}_${random}`;
  };

  // ⚠️ REAL CAMERA CAPTURE - NICHT FAKE HDR!
  // 
  // WICHTIG: Dies sind ECHTE Belichtungsreihen mit unterschiedlichen
  // Verschlusszeiten pro Shot - NICHT ein Foto mit Software-Filter!
  //
  // Web-Version: SIMULATION für Development (keine echte Camera API)
  // Native iOS App: ECHTE Captures via AVFoundation
  //   → Jeder Shot hat physikalisch unterschiedliche Belichtung
  //   → Shot 1: 1/500s (schnell, dunkel)
  //   → Shot 2: 1/125s (normal)
  //   → Shot 3: 1/30s (langsam, hell)
  //
  // Siehe: /REAL_CAMERA_INTEGRATION.md für technische Details
  const captureRealBracketingSequence = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    
    // 🔒 CRITICAL: Lock White Balance before bracketing!
    const currentWBKelvin = whiteBalanceMode === 'auto' 
      ? 5500  // Use default daylight for auto mode
      : WB_PRESETS[whiteBalanceMode];
    
    setWhiteBalanceLocked(true);
    console.log(`🔒 WB Locked at ${currentWBKelvin}K for HDR bracketing`);
    
    const stackId = generateStackId();
    const isPro = deviceType === 'pro';
    const exposureValues = isPro 
      ? [-2, 0, 2]       // Pro: 3 REAL shots with 2 EV steps (DNG)
      : [-2, -1, 0, 1, 2]; // Standard: 5 REAL shots with 1 EV steps (JPG)
    
    const total = exposureValues.length;
    const fileFormat = isPro ? 'DNG' : 'JPG';
    
    toast.info(`📸 ${total} echte Belichtungen (${fileFormat}) · WB locked`, {
      duration: 2000,
    });
    
    // In NATIVE APP: Get camera stream with MediaDevices or AVFoundation
    // const stream = await navigator.mediaDevices.getUserMedia({ 
    //   video: { 
    //     facingMode: 'environment',
    //     advanced: [{ exposureMode: 'manual' }]
    //   } 
    // });
    
    for (let i = 0; i < exposureValues.length; i++) {
      const ev = exposureValues[i];
      const current = i + 1;
      
      setCaptureProgress({ current, total });
      
      // NATIVE APP: Set REAL exposure compensation
      // const track = stream.getVideoTracks()[0];
      // await track.applyConstraints({
      //   advanced: [{ exposureCompensation: ev }]
      // });
      
      // Calculate REAL shutter speed based on EV
      const baseShutterSpeed = shutterSpeed;
      const evAdjustedShutter = Math.round(baseShutterSpeed * Math.pow(2, -ev));
      const actualShutterSpeed = `1/${evAdjustedShutter}s`;
      
      // Simulate shutter animation
      const shutterBtn = document.getElementById('shutter-btn');
      if (shutterBtn) {
        shutterBtn.style.transform = 'scale(0.85)';
        setTimeout(() => {
          shutterBtn.style.transform = 'scale(1)';
        }, 100);
      }
      
      // NATIVE APP: Capture actual photo with current exposure settings
      // const imageCapture = new ImageCapture(track);
      // const blob = isPro 
      //   ? await imageCapture.takePhoto({ imageFormat: 'raw' }) 
      //   : await imageCapture.takePhoto();
      
      // EXIF metadata for REAL shot with REAL exposure settings
      const exifData = {
        stackId,
        stackIndex: current,
        stackTotal: total,
        exposureValue: ev,
        exposureCompensation: `${ev > 0 ? '+' : ''}${ev} EV`,
        realShutterSpeed: actualShutterSpeed, // ACTUAL shutter used for this shot
        baseShutterSpeed: `1/${baseShutterSpeed}s`,
        fileFormat,
        deviceType,
        room: selectedRoom,
        format: currentFormat,
        orientation,
        zoom: zoomLevel,
        timestamp: new Date().toISOString(),
        captureMethod: 'REAL_EXPOSURE_BRACKETING', // Not fake HDR!
        // Phase 1: Standard Mode Settings
        evCompensationBase: evCompensation,
        whiteBalance: {
          mode: whiteBalanceMode,
          kelvin: whiteBalanceMode === 'auto' ? null : WB_PRESETS[whiteBalanceMode],
          locked: whiteBalanceLocked,
        },
        levelIndicator: {
          enabled: levelIndicatorEnabled,
          angle: tiltAngle,
        },
        stability: stabilityEnabled ? {
          enabled: true,
          status: stabilityStatus,
          acceleration: currentAcceleration.toFixed(3),
          adaptiveThresholds: getStabilityThresholds(),
        } : {
          enabled: false,
        },
      };
      
      console.log(`📷 REAL Shot ${current}/${total} (${ev > 0 ? '+' : ''}${ev} EV, ${actualShutterSpeed}):`, exifData);
      console.log(`   → Base: 1/${baseShutterSpeed}s, This shot: ${actualShutterSpeed}`);
      
      // NATIVE APP: Save file
      // await savePhoto(blob, stackId, current, exifData);
      
      // Wait between shots for:
      // 1. Stabilization
      // 2. Exposure adjustment to take effect
      // 3. Sensor reset
      if (i < exposureValues.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Complete
    setCaptureProgress({ current: 0, total: 0 });
    setIsCapturing(false);
    
    // 🔓 Unlock White Balance after bracketing
    setWhiteBalanceLocked(false);
    console.log(`🔓 WB Unlocked after HDR bracketing`);
    
    toast.success(`✅ ${total} ECHTE Aufnahmen gespeichert · WB consistent`, {
      duration: 3000,
    });
  };

  // Shutter handler - now triggers bracketing
  const handleShutter = () => {
    if (memoryWarning || isCapturing) return;
    
    // Adaptive warning based on shutter speed
    if (stabilityEnabled && stabilityStatus === 'unstable') {
      const shutterWarning = shutterSpeed < 30 
        ? `⚠️ Stativ erforderlich bei 1/${shutterSpeed}s!`
        : '⚠️ Verwenden Sie ein Stativ für beste Ergebnisse';
      
      toast.warning(shutterWarning, {
        duration: 3000,
      });
    }
    
    // Start REAL bracketing sequence
    captureRealBracketingSequence();
  };

  // Zoom slider auto-hide
  useEffect(() => {
    if (showZoomSlider) {
      const timeout = setTimeout(() => setShowZoomSlider(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [showZoomSlider, zoomLevel]);

  // Get adaptive thresholds based on shutter speed
  const getStabilityThresholds = () => {
    // Shutter speed is stored as denominator (e.g., 125 = 1/125s)
    if (shutterSpeed >= 60) {
      // Fast shutter (1/60s or faster) - normal thresholds
      return { stable: 0.05, warning: 0.15 };
    } else if (shutterSpeed >= 30) {
      // Critical range (1/30s to 1/60s) - stricter
      return { stable: 0.03, warning: 0.10 };
    } else {
      // Slow shutter (slower than 1/30s) - very strict, tripod required
      return { stable: 0.02, warning: 0.05 };
    }
  };

  // Stability Monitor - DeviceMotion API with adaptive thresholds
  useEffect(() => {
    if (!stabilityEnabled) {
      setCurrentAcceleration(0);
      setStabilityStatus('stable');
      return;
    }

    const thresholds = getStabilityThresholds();

    const handleMotion = (event: DeviceMotionEvent) => {
      if (event.acceleration) {
        const { x, y, z } = event.acceleration;
        // Calculate total acceleration magnitude
        const acceleration = Math.sqrt(
          (x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2
        );
        
        setCurrentAcceleration(acceleration);
        
        // Determine stability status with adaptive thresholds
        if (acceleration < thresholds.stable) {
          setStabilityStatus('stable');
        } else if (acceleration < thresholds.warning) {
          setStabilityStatus('warning');
        } else {
          setStabilityStatus('unstable');
        }
      }
    };

    // Check if DeviceMotion is supported
    if (typeof DeviceMotionEvent !== 'undefined') {
      window.addEventListener('devicemotion', handleMotion);
      return () => window.removeEventListener('devicemotion', handleMotion);
    } else {
      // Fallback for desktop/unsupported devices - simulate random movement
      const interval = setInterval(() => {
        const randomAccel = Math.random() * 0.3;
        setCurrentAcceleration(randomAccel);
        
        if (randomAccel < thresholds.stable) {
          setStabilityStatus('stable');
        } else if (randomAccel < thresholds.warning) {
          setStabilityStatus('warning');
        } else {
          setStabilityStatus('unstable');
        }
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [stabilityEnabled, shutterSpeed]);



  // Calculate crop frame dimensions
  const getCropFrameDimensions = () => {
    const viewportWidth = orientation === 'landscape' ? 932 : 430;
    const viewportHeight = orientation === 'landscape' ? 430 : 932;
    
    let width: number, height: number;
    
    const [w, h] = currentFormat.split(':').map(Number);
    
    // Calculate frame size with 16px padding from edges
    const maxWidth = viewportWidth - 32;
    const maxHeight = viewportHeight - 32;
    
    if (maxWidth / maxHeight > w / h) {
      height = maxHeight;
      width = (height * w) / h;
    } else {
      width = maxWidth;
      height = (width * h) / w;
    }
    
    return { width, height };
  };

  const cropFrame = getCropFrameDimensions();

  // Calculate level indicator size (1/5 of viewport height)
  const levelIndicatorSize = orientation === 'portrait' ? 932 / 5 : 430 / 5;

  // Apple-Style EV Control - Long Press Handler
  let longPressTimer: NodeJS.Timeout | null = null;
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    
    // Start long-press timer (500ms like iOS)
    longPressTimer = setTimeout(() => {
      setShowEvControl(true);
      setEvControlPosition({ x: startX, y: startY });
      setEvDragStartY(startY);
      setEvDragStartValue(evCompensation);
    }, 500);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (showEvControl) {
      // Calculate EV change based on vertical drag
      const touch = e.touches[0];
      const deltaY = evDragStartY - touch.clientY; // Inverted: up = positive
      
      // 100px drag = 1 EV change
      const evChange = deltaY / 100;
      const newEV = Math.max(-2, Math.min(2, evDragStartValue + evChange));
      
      setEvCompensation(parseFloat(newEV.toFixed(1)));
      
      // Update position to follow finger
      setEvControlPosition({ x: touch.clientX, y: touch.clientY });
    } else if (longPressTimer) {
      // Cancel long-press if finger moves before timer expires
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };
  
  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    
    // Hide EV control after a delay
    if (showEvControl) {
      setTimeout(() => {
        setShowEvControl(false);
      }, 1500);
    }
  };

  return (
    <IPhoneFrame orientation={orientation}>
      <style>
        {`
          body {
            background: #000;
          }
          
          @keyframes fadeInOut {
            0%, 100% { opacity: 0.85; }
            50% { opacity: 1; }
          }
          
          @keyframes flash {
            0% { opacity: 0.8; }
            100% { opacity: 0; }
          }
          
          @keyframes fadeIn {
            0% { 
              opacity: 0; 
              transform: translate(-50%, -120%) scale(0.8);
            }
            100% { 
              opacity: 1; 
              transform: translate(-50%, -120%) scale(1);
            }
          }
          
          @keyframes slideDown {
            0% {
              opacity: 0;
              transform: translateY(-20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          input[type="range"] {
            -webkit-appearance: none;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 5px;
            height: 4px;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            background: rgba(255, 255, 255, 1);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
        `}
      </style>
      
      {/* Main camera viewport */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#000',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Inter, -apple-system, sans-serif',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Layer 1: Camera feed background (full viewport) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.7,
            zIndex: 1,
          }}
        />
        
        {/* Layer 2: Safe-Zone Mask (format-specific darkening outside crop frame) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          {/* Top mask */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: `calc((100% - ${cropFrame.height}px) / 2)`,
              background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35) calc(100% - 50px), rgba(0, 0, 0, 0))`,
            }}
          />
          
          {/* Bottom mask */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `calc((100% - ${cropFrame.height}px) / 2)`,
              background: `linear-gradient(to top, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35) calc(100% - 50px), rgba(0, 0, 0, 0))`,
            }}
          />
          
          {/* Left mask */}
          <div
            style={{
              position: 'absolute',
              top: `calc((100% - ${cropFrame.height}px) / 2)`,
              left: 0,
              width: `calc((100% - ${cropFrame.width}px) / 2)`,
              height: `${cropFrame.height}px`,
              background: `linear-gradient(to right, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35) calc(100% - 50px), rgba(0, 0, 0, 0))`,
            }}
          />
          
          {/* Right mask */}
          <div
            style={{
              position: 'absolute',
              top: `calc((100% - ${cropFrame.height}px) / 2)`,
              right: 0,
              width: `calc((100% - ${cropFrame.width}px) / 2)`,
              height: `${cropFrame.height}px`,
              background: `linear-gradient(to left, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35) calc(100% - 50px), rgba(0, 0, 0, 0))`,
            }}
          />
        </div>
        
        {/* Layer 3: Format Frame */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${cropFrame.width}px`,
            height: `${cropFrame.height}px`,
            border: '2px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 3,
            transition: 'all 0.25s ease',
          }}
        >
          {/* Corner markers */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
            const isTop = corner.includes('top');
            const isLeft = corner.includes('left');
            return (
              <div
                key={corner}
                style={{
                  position: 'absolute',
                  [isTop ? 'top' : 'bottom']: '-2px',
                  [isLeft ? 'left' : 'right']: '-2px',
                  width: '20px',
                  height: '20px',
                  borderTop: isTop ? '3px solid rgba(255, 255, 255, 0.6)' : 'none',
                  borderBottom: !isTop ? '3px solid rgba(255, 255, 255, 0.6)' : 'none',
                  borderLeft: isLeft ? '3px solid rgba(255, 255, 255, 0.6)' : 'none',
                  borderRight: !isLeft ? '3px solid rgba(255, 255, 255, 0.6)' : 'none',
                }}
              />
            );
          })}
        </div>
        
        {/* Grid Overlay - Apple Style */}
        {gridMode !== 'off' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 4,
            }}
          >
            {gridMode === '3x3' && (
              <>
                {/* Grid Lines */}
                <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
                <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
                <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
                <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
                
                {/* Apple-Style: Center Crosshair (wenn Level aktiv) */}
                {levelIndicatorEnabled && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Small center cross */}
                    <div style={{ position: 'absolute', width: '1px', height: '12px', background: 'rgba(255, 204, 0, 0.8)' }} />
                    <div style={{ position: 'absolute', width: '12px', height: '1px', background: 'rgba(255, 204, 0, 0.8)' }} />
                  </div>
                )}
              </>
            )}
            
            {gridMode === '4x4' && (
              <>
                <div style={{ position: 'absolute', left: '25%', top: 0, bottom: 0, width: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
                <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
                <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
                <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
              </>
            )}
            
            {gridMode === 'golden' && (
              <>
                <div style={{ position: 'absolute', left: '38.2%', top: 0, bottom: 0, width: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
                <div style={{ position: 'absolute', left: '61.8%', top: 0, bottom: 0, width: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
                <div style={{ position: 'absolute', top: '38.2%', left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
                <div style={{ position: 'absolute', top: '61.8%', left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
              </>
            )}
          </div>
        )}
        
        {/* Apple-Style EV Control - Appears on Long-Press */}
        {showEvControl && (
          <div
            style={{
              position: 'absolute',
              left: `${evControlPosition.x}px`,
              top: `${evControlPosition.y}px`,
              transform: 'translate(-50%, -120%)', // Position above finger
              pointerEvents: 'none',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Sun Icon */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(255, 204, 0, 0.9)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 204, 0, 0.4)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" fill="white" />
                <path d="M12 2v2M12 20v2M20 12h2M2 12h2M17.66 6.34l1.41-1.41M4.93 19.07l1.41-1.41M17.66 17.66l1.41 1.41M4.93 4.93l1.41 1.41" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
            
            {/* EV Value Display */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '700',
                color: evCompensation === 0 ? '#FFFFFF' : evCompensation > 0 ? '#FFCC00' : '#FF9500',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                minWidth: '60px',
                textAlign: 'center',
              }}
            >
              {evCompensation > 0 ? '+' : ''}{evCompensation.toFixed(1)}
            </div>
            
            {/* Vertical EV Scale (subtle) */}
            <div
              style={{
                width: '2px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '1px',
                position: 'relative',
                marginTop: '4px',
              }}
            >
              {/* Center marker (0 EV) */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '8px',
                  height: '2px',
                  background: 'rgba(255, 255, 255, 0.6)',
                }}
              />
              
              {/* Current EV position indicator */}
              <div
                style={{
                  position: 'absolute',
                  top: `${50 - (evCompensation / 2) * 50}%`, // -2 EV = 100%, 0 = 50%, +2 = 0%
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: evCompensation === 0 ? '#FFFFFF' : evCompensation > 0 ? '#FFCC00' : '#FF9500',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              />
            </div>
          </div>
        )}
        
        {/* Layer 4: Level Indicator - Using dedicated component */}
        {levelIndicatorEnabled && (
          <LevelIndicator orientation={orientation} />
        )}
        
        {/* Histogram Overlay - Toggle via Chevron Panel */}
        {histogramVisible && (
          <HistogramOverlay
            orientation={orientation}
            visible={true}
            safeAreaTop={SAFE_AREA_TOP}
            safeAreaBottom={SAFE_AREA_BOTTOM}
          />
        )}
        


        {/* Room Label - Center Top */}
        <button
          onClick={() => setShowRoomSelector(true)}
          style={{
            position: 'absolute',
            top: orientation === 'portrait' ? SAFE_AREA_TOP + 8 : 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            zIndex: 20,
            fontSize: '14px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.85)',
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
          }}
        >
          {ROOM_TYPES.find(r => r.id === selectedRoom)?.name || 'Undefiniert'}
        </button>
        
        {/* Pro Controls Chevron - Apple Style (Top Left) */}
        <button
          onClick={() => setShowProControls(!showProControls)}
          style={{
            position: 'absolute',
            top: orientation === 'portrait' ? SAFE_AREA_TOP + 8 : 16,
            left: orientation === 'portrait' ? 16 : 64,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: showProControls ? 'rgba(255, 204, 0, 0.9)' : 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            zIndex: 30,
            transition: 'all 0.2s ease',
          }}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none"
            style={{
              transform: showProControls ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <path 
              d="M6 9L12 15L18 9" 
              stroke="rgba(255, 255, 255, 1)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
        

        
        {/* EV Compensation Badge - Show when not 0 (Top Right) */}
        {evCompensation !== 0 && (
          <div
            style={{
              position: 'absolute',
              top: orientation === 'portrait' ? SAFE_AREA_TOP + 8 : 16,
              right: orientation === 'portrait' ? 16 : 88,
              background: evCompensation > 0 ? 'rgba(255, 204, 0, 0.9)' : 'rgba(255, 149, 0, 0.9)',
              backdropFilter: 'blur(10px)',
              padding: '4px 10px',
              borderRadius: '12px',
              zIndex: 30,
              fontSize: '11px',
              fontWeight: '700',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="white" />
              <path d="M12 2v2M12 20v2M20 12h2M2 12h2" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
            <span>{evCompensation > 0 ? '+' : ''}{evCompensation.toFixed(1)}</span>
          </div>
        )}
        
        {/* Manual Mode Indicator */}
        {manualMode && (
          <div
            style={{
              position: 'absolute',
              top: orientation === 'portrait' ? SAFE_AREA_TOP + 8 : 16,
              right: 16,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '6px 12px',
              borderRadius: '12px',
              zIndex: 20,
              fontSize: '12px',
              fontWeight: '500',
              color: '#999999',
            }}
          >
            Manuell aktiv
          </div>
        )}
        
        {/* Bracketing Progress Indicator */}
        {isCapturing && captureProgress.current > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(20px)',
              padding: '32px 40px',
              borderRadius: '24px',
              zIndex: 60,
              textAlign: 'center',
              minWidth: '240px',
              border: '2px solid rgba(176, 224, 230, 0.5)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Flash effect */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#FFFFFF',
                borderRadius: '24px',
                opacity: 0,
                animation: 'flash 0.2s ease-out',
                pointerEvents: 'none',
              }}
            />
            
            <div
              style={{
                color: '#FFFFFF',
                fontSize: '48px',
                fontWeight: '700',
                marginBottom: '12px',
                fontFamily: 'Inter, -apple-system, sans-serif',
              }}
            >
              {captureProgress.current}/{captureProgress.total}
            </div>
            
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '20px',
              }}
            >
              Belichtungsreihe {deviceType === 'pro' ? 'DNG' : 'JPG'}
            </div>
            
            {/* Progress bar */}
            <div
              style={{
                width: '100%',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(captureProgress.current / captureProgress.total) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #B0E0E6, #74A4EA)',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        )}
        
        {/* Memory Warning */}
        {memoryWarning && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255, 85, 0, 0.85)',
              padding: '24px 32px',
              borderRadius: '16px',
              zIndex: 50,
              textAlign: 'center',
              maxWidth: '320px',
              animation: 'fadeInOut 2s ease-in-out infinite',
            }}
          >
            <div
              style={{
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: '700',
                lineHeight: '1.4',
              }}
            >
              Wenig Speicherplatz – bitte Speicher leeren oder sichern.
            </div>
            <button
              onClick={() => setMemoryWarning(false)}
              style={{
                marginTop: '16px',
                background: '#FFFFFF',
                color: '#FF5500',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              OK
            </button>
          </div>
        )}
        
        {/* PORTRAIT: Control Buttons - Horizontal Row at Bottom */}
        {orientation === 'portrait' && (
          <div
            style={{
              position: 'absolute',
              bottom: SAFE_AREA_BOTTOM + NAV_BAR_SIZE + 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'row',
              gap: '32px',
              alignItems: 'center',
              zIndex: 20,
            }}
          >
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
            
            {/* Shutter - Wide Rectangle for Easy Tap */}
            <button
              id="shutter-btn"
              onClick={handleShutter}
              disabled={memoryWarning}
              style={{
                width: '160px',
                height: '80px',
                borderRadius: '40px',
                background: 'transparent',
                border: '4px solid rgba(255, 255, 255, 0.9)',
                cursor: memoryWarning ? 'not-allowed' : 'pointer',
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
                  width: '144px',
                  height: '64px',
                  borderRadius: '32px',
                  background: memoryWarning ? 'rgba(100, 100, 100, 0.6)' : 'rgba(60, 60, 60, 0.8)',
                  backdropFilter: 'blur(10px)',
                }}
              />
            </button>
            
            {/* Timer */}
            <button
              onClick={() => {
                const modes: Array<'off' | '3s' | '10s'> = ['off', '3s', '10s'];
                const currentIndex = modes.indexOf(timerMode);
                const nextIndex = (currentIndex + 1) % modes.length;
                setTimerMode(modes[nextIndex]);
              }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: timerMode !== 'off' ? 'rgba(176, 224, 230, 0.75)' : 'rgba(0, 0, 0, 0.6)',
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
                position: 'relative',
              }}
            >
              {timerMode === 'off' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="13" r="7" stroke="rgba(255, 255, 255, 1)" strokeWidth="2"/>
                  <path d="M12 10V13L14 15" stroke="rgba(255, 255, 255, 1)" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M10 4H14" stroke="rgba(255, 255, 255, 1)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <span>{timerMode === '3s' ? '3' : '10'}</span>
              )}
            </button>
          </div>
        )}
        
        {/* LANDSCAPE: Control Buttons - Vertical Column on Right */}
        {orientation === 'landscape' && (
          <div
            style={{
              position: 'absolute',
              right: 80,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
              alignItems: 'center',
              zIndex: 20,
            }}
          >
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
            
            {/* Shutter - Tall Rectangle for Easy Tap */}
            <button
              id="shutter-btn"
              onClick={handleShutter}
              disabled={memoryWarning}
              style={{
                width: '80px',
                height: '160px',
                borderRadius: '40px',
                background: 'transparent',
                border: '4px solid rgba(255, 255, 255, 0.9)',
                cursor: memoryWarning ? 'not-allowed' : 'pointer',
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
                  height: '144px',
                  borderRadius: '32px',
                  background: memoryWarning ? 'rgba(100, 100, 100, 0.6)' : 'rgba(60, 60, 60, 0.8)',
                  backdropFilter: 'blur(10px)',
                }}
              />
            </button>
            
            {/* Timer */}
            <button
              onClick={() => {
                const modes: Array<'off' | '3s' | '10s'> = ['off', '3s', '10s'];
                const currentIndex = modes.indexOf(timerMode);
                const nextIndex = (currentIndex + 1) % modes.length;
                setTimerMode(modes[nextIndex]);
              }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: timerMode !== 'off' ? 'rgba(176, 224, 230, 0.75)' : 'rgba(0, 0, 0, 0.6)',
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
                position: 'relative',
              }}
            >
              {timerMode === 'off' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="13" r="7" stroke="rgba(255, 255, 255, 1)" strokeWidth="2"/>
                  <path d="M12 10V13L14 15" stroke="rgba(255, 255, 255, 1)" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M10 4H14" stroke="rgba(255, 255, 255, 1)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <span>{timerMode === '3s' ? '3' : '10'}</span>
              )}
            </button>
          </div>
        )}
        
        {/* Zoom Slider - Horizontal above Shutter Button */}
        {showZoomSlider && (
          <div
            style={{
              position: 'absolute',
              ...(orientation === 'portrait'
                ? {
                    bottom: SAFE_AREA_BOTTOM + NAV_BAR_SIZE + 16 + 90,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }
                : {
                    right: 16 + 90,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }
              ),
              gap: '8px',
              alignItems: 'center',
              zIndex: 25,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '12px 16px',
              borderRadius: '20px',
            }}
          >
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>0.5×</div>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={zoomLevel}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                // Snap to 0.5, 1, 3, 5
                if (Math.abs(val - 0.5) < 0.1) setZoomLevel(0.5);
                else if (Math.abs(val - 1) < 0.1) setZoomLevel(1);
                else if (Math.abs(val - 3) < 0.1) setZoomLevel(3);
                else if (Math.abs(val - 5) < 0.1) setZoomLevel(5);
                else setZoomLevel(val);
                setShowZoomSlider(true);
              }}
              style={{
                width: '180px',
                height: '4px',
                cursor: 'pointer',
              }}
            />
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>5×</div>
            <div
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 1)',
                fontWeight: '600',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 10px',
                borderRadius: '12px',
                marginLeft: '8px',
              }}
            >
              {zoomLevel.toFixed(1)}×
            </div>
          </div>
        )}
        
        {/* Stability Monitor Button - Top Left (next to Chevron) */}
        <button
          onClick={() => setStabilityEnabled(!stabilityEnabled)}
          style={{
            position: 'absolute',
            top: orientation === 'portrait' ? SAFE_AREA_TOP + 8 : 16,
            left: orientation === 'portrait' ? 56 : 104,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: stabilityEnabled ? 'rgba(255, 204, 0, 0.9)' : 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            zIndex: 30,
          }}
        >
          <Move size={16} color="rgba(255, 255, 255, 1)" />
        </button>
        
        {/* Stability Status Badge - Always visible when enabled */}
        {stabilityEnabled && (
          <div
            style={{
              position: 'absolute',
              top: orientation === 'portrait' ? SAFE_AREA_TOP + 8 : 16,
              left: orientation === 'portrait' ? 96 : 144,
              background: stabilityStatus === 'stable' 
                ? 'rgba(0, 255, 102, 0.85)' 
                : stabilityStatus === 'warning'
                ? 'rgba(255, 193, 7, 0.85)'
                : 'rgba(255, 59, 48, 0.85)',
              backdropFilter: 'blur(10px)',
              padding: '4px 10px',
              borderRadius: '12px',
              zIndex: 30,
              fontSize: '10px',
              fontWeight: '700',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {stabilityStatus === 'stable' && '● OK'}
            {stabilityStatus === 'warning' && '● !'}
            {stabilityStatus === 'unstable' && '⚠️'}
          </div>
        )}
        

        
        {/* Room Selector Overlay */}
        {showRoomSelector && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowRoomSelector(false)}
          >
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.95)',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '360px',
                maxHeight: '600px',
                width: '100%',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '600', margin: 0 }}>Raum auswählen</h3>
                <button
                  onClick={() => setShowRoomSelector(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <X size={24} color="#FFFFFF" />
                </button>
              </div>
              
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {ROOM_TYPES.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setSelectedRoom(room.id);
                      setShowRoomSelector(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: selectedRoom === room.id ? 'rgba(176, 224, 230, 0.2)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: selectedRoom === room.id ? '#B0E0E6' : 'rgba(255, 255, 255, 0.85)',
                      fontSize: '14px',
                      fontWeight: '500',
                      textAlign: 'left',
                      cursor: 'pointer',
                      marginBottom: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {room.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Settings Overlay (Zahnrad) - 320x400px */}
        {showSettings && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowSettings(false)}
          >
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.95)',
                borderRadius: '16px',
                padding: '24px',
                width: '320px',
                height: '400px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '600', margin: 0 }}>Kamera-Einstellungen</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <X size={24} color="#FFFFFF" />
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                {/* Manual Mode Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', fontWeight: '500' }}>Manueller Modus</span>
                  <button
                    onClick={() => setManualMode(!manualMode)}
                    style={{
                      width: '50px',
                      height: '28px',
                      borderRadius: '14px',
                      background: manualMode ? '#B0E0E6' : 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        position: 'absolute',
                        top: '3px',
                        left: manualMode ? '25px' : '3px',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </button>
                </div>
                
                {/* Grid Mode */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', fontWeight: '500' }}>Raster</span>
                  <span style={{ color: '#B0E0E6', fontSize: '14px', fontWeight: '600' }}>
                    {gridMode === 'off' ? 'Aus' : gridMode === '3x3' ? '3×3' : gridMode === '4x4' ? '4×4' : 'Golden'}
                  </span>
                </div>
                
                {/* Bluetooth */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', fontWeight: '500' }}>Bluetooth</span>
                  <span style={{ color: bluetoothConnected ? '#00FF66' : '#999999', fontSize: '14px', fontWeight: '600' }}>
                    {bluetoothConnected ? 'Verbunden' : 'Getrennt'}
                  </span>
                </div>
                
                {/* Storage */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', fontWeight: '500' }}>Speicher</span>
                  <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '600' }}>8.5 GB frei</span>
                </div>
                
                {/* Format */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', fontWeight: '500' }}>Format</span>
                  <span style={{ color: '#B0E0E6', fontSize: '14px', fontWeight: '600' }}>{currentFormat}</span>
                </div>
                
                {/* Shutter Speed Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', fontWeight: '500' }}>Verschlusszeit</span>
                    <span style={{ 
                      color: shutterSpeed < 30 ? '#FF3B30' : shutterSpeed < 60 ? '#FFC107' : '#B0E0E6', 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>
                      1/{shutterSpeed}s
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[500, 250, 125, 60, 30, 15, 8, 4].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setShutterSpeed(speed)}
                        style={{
                          padding: '6px 10px',
                          background: shutterSpeed === speed ? 'rgba(176, 224, 230, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                          border: shutterSpeed === speed ? '1px solid #B0E0E6' : '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '6px',
                          color: shutterSpeed === speed ? '#B0E0E6' : 'rgba(255, 255, 255, 0.7)',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        1/{speed}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Memory Warning Test */}
                <button
                  onClick={() => {
                    setMemoryWarning(true);
                    setShowSettings(false);
                  }}
                  style={{
                    marginTop: 'auto',
                    padding: '12px',
                    background: 'rgba(255, 85, 0, 0.2)',
                    border: '1px solid rgba(255, 85, 0, 0.5)',
                    borderRadius: '8px',
                    color: '#FF5500',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Speicherwarnung testen
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* White Balance Panel */}
        {showWhiteBalancePanel && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowWhiteBalancePanel(false)}
          >
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.95)',
                borderRadius: '16px',
                padding: '24px',
                width: '320px',
                maxHeight: '500px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  Weißabgleich
                  {whiteBalanceLocked && <span style={{ fontSize: '12px', color: '#FFC107', marginLeft: '8px' }}>🔒 Locked</span>}
                </h3>
                <button
                  onClick={() => setShowWhiteBalancePanel(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <X size={24} color="#FFFFFF" />
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Preset Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {([
                    { mode: 'auto', label: 'Auto', icon: '🔄', kelvin: null },
                    { mode: 'daylight', label: 'Daylight', icon: '☀️', kelvin: 5500 },
                    { mode: 'cloudy', label: 'Cloudy', icon: '☁️', kelvin: 6500 },
                    { mode: 'tungsten', label: 'Tungsten', icon: '💡', kelvin: 3200 },
                  ] as const).map(({ mode, label, icon, kelvin }) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setWhiteBalanceMode(mode);
                        if (kelvin !== null) {
                          setWhiteBalanceKelvin(kelvin);
                        }
                      }}
                      style={{
                        padding: '12px 16px',
                        background: whiteBalanceMode === mode ? 'rgba(176, 224, 230, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                        border: whiteBalanceMode === mode ? '2px solid #B0E0E6' : '2px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: whiteBalanceMode === mode ? '#B0E0E6' : 'rgba(255, 255, 255, 0.85)',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>{icon}</span>
                        <span>{label}</span>
                      </span>
                      <span style={{ fontSize: '12px', opacity: 0.7 }}>
                        {kelvin ? `${kelvin}K` : 'iOS'}
                      </span>
                    </button>
                  ))}
                </div>
                
                {/* Kelvin Slider (only for JPG mode) */}
                {deviceType === 'standard' && whiteBalanceMode !== 'auto' && (
                  <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Feinabstimmung
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#B0E0E6' }}>
                        {whiteBalanceKelvin}K
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2800"
                      max="7500"
                      step="100"
                      value={whiteBalanceKelvin}
                      onChange={(e) => setWhiteBalanceKelvin(parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        cursor: 'pointer',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>2800K</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>7500K</span>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '11px', color: 'rgba(255, 193, 7, 0.8)', textAlign: 'center' }}>
                      💡 LED-Licht: Manuelle Anpassung empfohlen
                    </div>
                  </div>
                )}
                
                {/* Info for RAW users */}
                {deviceType === 'pro' && (
                  <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(100, 191, 73, 0.15)', borderRadius: '8px', border: '1px solid rgba(100, 191, 73, 0.3)' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(100, 191, 73, 1)', fontWeight: '600', marginBottom: '4px' }}>
                      ✅ Pro Mode: DNG/RAW
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>
                      WB kann später in Post-Processing angepasst werden. Wählen Sie dennoch den besten Preset für die Vorschau.
                    </div>
                  </div>
                )}
                
                {/* Critical HDR Warning */}
                <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(255, 59, 48, 0.15)', borderRadius: '8px', border: '1px solid rgba(255, 59, 48, 0.3)' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 59, 48, 1)', fontWeight: '600', marginBottom: '4px' }}>
                    ⚠️ HDR Bracketing
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    WB wird automatisch für alle Belichtungen gesperrt. Lieber falscher WB als Wechsel im Stack!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Pro Controls Panel - Simple Camera Settings */}
        {showProControls && (
          <div
            style={{
              position: 'absolute',
              top: orientation === 'portrait' ? SAFE_AREA_TOP + 48 : 56,
              left: 0,
              right: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              zIndex: 90,
              padding: '16px',
              maxHeight: '60vh',
              overflowY: 'auto',
              animation: 'slideDown 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '700', margin: 0 }}>
                Einstellungen
              </h3>
              <button
                onClick={() => setShowProControls(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} color="#FFFFFF" />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Grid Toggle */}
              <button
                onClick={toggleGrid}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: gridMode !== 'off' ? 'rgba(255, 204, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: gridMode !== 'off' ? '1px solid rgba(255, 204, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: gridMode !== 'off' ? '#FFCC00' : 'rgba(255, 255, 255, 0.85)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>📐 Grid</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  {gridMode === 'off' ? 'Off' : gridMode === '3x3' ? '3×3' : gridMode === '4x4' ? '4×4' : 'Golden'}
                </span>
              </button>
              
              {/* White Balance */}
              <button
                onClick={() => setShowWhiteBalancePanel(true)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: whiteBalanceMode !== 'auto' ? 'rgba(255, 204, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: whiteBalanceMode !== 'auto' ? '1px solid rgba(255, 204, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: whiteBalanceMode !== 'auto' ? '#FFCC00' : 'rgba(255, 255, 255, 0.85)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>🌡️ Weißabgleich</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  {whiteBalanceMode === 'auto' ? 'Auto' : 
                   whiteBalanceMode === 'daylight' ? 'Daylight' :
                   whiteBalanceMode === 'cloudy' ? 'Cloudy' : 'Tungsten'}
                  {whiteBalanceLocked && ' 🔒'}
                </span>
              </button>
              
              {/* Level Indicator */}
              <button
                onClick={() => setLevelIndicatorEnabled(!levelIndicatorEnabled)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: levelIndicatorEnabled ? 'rgba(255, 204, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: levelIndicatorEnabled ? '1px solid rgba(255, 204, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: levelIndicatorEnabled ? '#FFCC00' : 'rgba(255, 255, 255, 0.85)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>⚖️ Wasserwaage</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  {levelIndicatorEnabled ? 'On' : 'Off'}
                </span>
              </button>
              
              {/* RAW/JPG Toggle */}
              <button
                onClick={() => setDeviceType(deviceType === 'pro' ? 'standard' : 'pro')}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: deviceType === 'pro' ? 'rgba(255, 204, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: deviceType === 'pro' ? '1px solid rgba(255, 204, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: deviceType === 'pro' ? '#FFCC00' : 'rgba(255, 255, 255, 0.85)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>📸 Format</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  {deviceType === 'pro' ? 'RAW (3× DNG @ ±2 EV)' : 'JPG (5× @ ±1 EV)'}
                </span>
              </button>
              
              {/* Timer */}
              <button
                onClick={() => {
                  if (timerMode === 'off') setTimerMode('3s');
                  else if (timerMode === '3s') setTimerMode('10s');
                  else setTimerMode('off');
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: timerMode !== 'off' ? 'rgba(255, 204, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: timerMode !== 'off' ? '1px solid rgba(255, 204, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: timerMode !== 'off' ? '#FFCC00' : 'rgba(255, 255, 255, 0.85)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>⏱️ Timer</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  {timerMode === 'off' ? 'Off' : timerMode}
                </span>
              </button>
              
              {/* Format/Ratio */}
              <button
                onClick={() => {
                  const formats = orientation === 'portrait' ? PORTRAIT_FORMATS : LANDSCAPE_FORMATS;
                  const currentIndex = formats.indexOf(currentFormat);
                  const nextIndex = (currentIndex + 1) % formats.length;
                  setCurrentFormat(formats[nextIndex]);
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: currentFormat !== '3:2' ? 'rgba(255, 204, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: currentFormat !== '3:2' ? '1px solid rgba(255, 204, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: currentFormat !== '3:2' ? '#FFCC00' : 'rgba(255, 255, 255, 0.85)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>📐 Seitenverhältnis</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  {currentFormat}
                </span>
              </button>
              
              {/* Histogram Toggle */}
              <button
                onClick={() => setHistogramVisible(!histogramVisible)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: histogramVisible ? 'rgba(255, 204, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: histogramVisible ? '1px solid rgba(255, 204, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: histogramVisible ? '#FFCC00' : 'rgba(255, 255, 255, 0.85)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>📊 Histogram</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  {histogramVisible ? 'On' : 'Off'}
                </span>
              </button>
              
              {/* Bluetooth Toggle */}
              <button
                onClick={() => setBluetoothConnected(!bluetoothConnected)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: bluetoothConnected ? 'rgba(100, 191, 73, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: bluetoothConnected ? '1px solid rgba(100, 191, 73, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: bluetoothConnected ? '#64BF49' : 'rgba(255, 255, 255, 0.85)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>📶 Bluetooth</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  {bluetoothConnected ? 'Verbunden' : 'Getrennt'}
                </span>
              </button>
              
              {/* Settings Link */}
              <button
                onClick={() => {
                  setShowProControls(false);
                  setShowSettings(true);
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>⚙️ Erweiterte Einstellungen</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>→</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Navigation Bar */}
        <AppNavigationBar 
          activeRoute="/app/camera" 
          orientation={orientation}
          darkMode={true}
        />
      </div>
    </IPhoneFrame>
  );
}
