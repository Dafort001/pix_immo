import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, Timer, Image, X, Camera as CameraIcon, BarChart3, Layers, RotateCw } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { Badge } from '@/components/ui/badge';
import { StatusBar } from '@/components/mobile/StatusBar';
import { BottomNav } from '@/components/mobile/BottomNav';
import { Histogram } from '@/components/mobile/Histogram';
import { useHaptic } from '@/hooks/useHaptic';
import { useLocation } from 'wouter';

export default function CameraScreen() {
  const [, setLocation] = useLocation();
  const [showGrid, setShowGrid] = useState(true);
  const [showHorizon, setShowHorizon] = useState(true);
  const [showHistogram, setShowHistogram] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [format, setFormat] = useState<'DNG' | 'HEIC'>('DNG');
  const [timer, setTimer] = useState<0 | 3 | 10>(0);
  const [hdrMode, setHdrMode] = useState<3 | 5>(3);
  const [hdrEnabled, setHdrEnabled] = useState(true);
  const [horizonTilt, setHorizonTilt] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [cameraReady, setCameraReady] = useState(false);
  const [videoRotation, setVideoRotation] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { trigger } = useHaptic();

  const zoomLevels = [0.5, 1, 1.5, 2];

  // Automatische iOS-Orientierungskorrektur
  useEffect(() => {
    const updateOrientation = () => {
      // iOS-spezifische Orientierung
      const orientation = (window as any).orientation || screen.orientation?.angle || 0;
      // Kompensiere iOS Kamera-Rotation (environment camera ist um 180° pre-rotiert)
      setVideoRotation(-orientation);
    };

    updateOrientation();
    window.addEventListener('orientationchange', updateOrientation);
    
    return () => {
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  // Kamera-Stream initialisieren (nur bei User-Klick!)
  const startCamera = async () => {
    trigger('medium');
    setCameraError('');
    
    console.log('[Camera] Starting camera...');
    console.log('[Camera] HTTPS:', window.location.protocol === 'https:');
    console.log('[Camera] Has MediaDevices:', !!navigator.mediaDevices);
    console.log('[Camera] Has getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const error = !navigator.mediaDevices 
          ? 'MediaDevices API nicht verfügbar (HTTPS erforderlich)'
          : 'getUserMedia nicht verfügbar';
        console.error('[Camera] Not supported:', error);
        throw new Error(error);
      }

      console.log('[Camera] Requesting camera permission...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      console.log('[Camera] Permission granted! Stream:', mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // iOS braucht explizites play()
        await videoRef.current.play();
        streamRef.current = mediaStream;
        setStream(mediaStream);
        setCameraReady(true);
        console.log('[Camera] Camera ready!');
      }
    } catch (err: any) {
      console.error('[Camera] Error:', err);
      console.error('[Camera] Error name:', err.name);
      console.error('[Camera] Error message:', err.message);
      
      // Spezifische Error-Messages
      let errorMsg = '';
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Kamera-Berechtigung verweigert. Bitte in Browser-Einstellungen erlauben.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'Keine Kamera gefunden.';
      } else if (err.name === 'NotSupportedError' || err.message.includes('not supported')) {
        errorMsg = 'Kamera-API nicht unterstützt. HTTPS erforderlich.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Kamera wird bereits verwendet.';
      } else {
        errorMsg = `Kamera-Fehler: ${err.message}`;
      }
      
      setCameraError(errorMsg);
    }
  };

  // Cleanup beim Verlassen
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Simuliere Horizont-Neigung
  useEffect(() => {
    const interval = setInterval(() => {
      setHorizonTilt(Math.sin(Date.now() / 1000) * 2);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleCapture = () => {
    trigger('heavy');
    const flash = document.getElementById('capture-flash');
    if (flash) {
      flash.classList.remove('hidden');
      setTimeout(() => flash.classList.add('hidden'), 150);
    }

    // Store photo
    const photos = JSON.parse(sessionStorage.getItem('appPhotos') || '[]');
    photos.push({ id: Date.now(), timestamp: new Date().toISOString() });
    sessionStorage.setItem('appPhotos', JSON.stringify(photos));
  };

  const cycleTimer = () => {
    trigger('light');
    const timers: Array<0 | 3 | 10> = [0, 3, 10];
    const currentIndex = timers.indexOf(timer);
    setTimer(timers[(currentIndex + 1) % timers.length]);
  };

  const handleZoomChange = (level: number) => {
    trigger('light');
    setZoom(level);
  };

  const toggleGrid = () => {
    trigger('light');
    setShowGrid(!showGrid);
  };

  const toggleFormat = () => {
    trigger('medium');
    setFormat(format === 'DNG' ? 'HEIC' : 'DNG');
  };

  const toggleHistogram = () => {
    trigger('light');
    setShowHistogram(!showHistogram);
  };


  return (
    <div className="h-full flex flex-col bg-black">
      {/* Capture Flash */}
      <div id="capture-flash" className="hidden fixed inset-0 bg-white z-[100]" />

      {/* Status Bar */}
      <StatusBar variant="light" />

      {/* Camera Viewfinder */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* Live-Kamera-Vorschau oder Fallback */}
        {stream && cameraReady ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: `scale(${zoom}) rotate(${videoRotation}deg)` }}
            data-testid="video-camera-preview"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center px-6 max-w-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(74, 88, 73, 0.2)' }}>
                <CameraIcon className="w-10 h-10" style={{ color: '#6B8268' }} strokeWidth={1.5} />
              </div>
              
              {cameraError === 'demo' ? (
                <>
                  <p className="text-white mb-2" style={{ fontSize: '16px' }} data-testid="text-camera-demo-title">
                    Demo-Modus
                  </p>
                  <p className="text-gray-400 mb-4" style={{ fontSize: '14px' }} data-testid="text-camera-demo-subtitle">
                    Live-Kamera nur auf echten Geräten mit HTTPS verfügbar
                  </p>
                  <p className="text-xs text-gray-500 mb-6" style={{ fontSize: '12px' }}>
                    Alle Funktionen sind testbar. Die Kamera wird automatisch aktiviert, wenn die App auf einem iPhone über HTTPS läuft.
                  </p>
                  <HapticButton
                    onClick={startCamera}
                    className="text-white px-6 py-3 rounded-lg"
                    style={{ backgroundColor: '#4A5849' }}
                    hapticStyle="medium"
                    data-testid="button-retry-camera"
                  >
                    Erneut versuchen
                  </HapticButton>
                </>
              ) : cameraError ? (
                <>
                  <p className="text-white mb-2" style={{ fontSize: '16px' }} data-testid="text-camera-error-title">
                    Kamera-Fehler
                  </p>
                  <p className="text-red-400 mb-4" style={{ fontSize: '14px' }} data-testid="text-camera-error-message">
                    {cameraError}
                  </p>
                  <HapticButton
                    onClick={startCamera}
                    className="text-white px-6 py-3 rounded-lg"
                    style={{ backgroundColor: '#4A5849' }}
                    hapticStyle="medium"
                    data-testid="button-retry-camera"
                  >
                    Erneut versuchen
                  </HapticButton>
                </>
              ) : (
                <>
                  <p className="text-white mb-2" style={{ fontSize: '16px' }} data-testid="text-camera-start-title">
                    Kamera starten
                  </p>
                  <p className="text-gray-400 mb-6" style={{ fontSize: '14px' }} data-testid="text-camera-start-subtitle">
                    Tippe auf den Button um die Kamera zu aktivieren
                  </p>
                  <HapticButton
                    onClick={startCamera}
                    className="text-white px-6 py-3 rounded-lg"
                    style={{ backgroundColor: '#4A5849' }}
                    hapticStyle="medium"
                    data-testid="button-start-camera"
                  >
                    <CameraIcon className="w-5 h-5 mr-2 inline" />
                    Kamera aktivieren
                  </HapticButton>
                </>
              )}
            </div>
          </div>
        )}

        {/* Grid Overlay */}
        {showGrid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="h-full w-full grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </motion.div>
        )}

        {/* Horizont-Linie mit Animation */}
        {showHorizon && (
          <motion.div
            animate={{ rotate: horizonTilt }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-none"
          >
            <div className="relative w-full h-px" style={{ backgroundColor: '#4A5849' }}>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 rounded-full" style={{ borderColor: '#4A5849' }} />
            </div>
          </motion.div>
        )}

        {/* Top Controls mit Safe Area */}
        <div className="absolute top-14 left-0 right-0 px-4 flex items-start justify-between z-10">
          <div className="flex gap-2">
            <HapticButton
              size="icon"
              variant="ghost"
              onClick={toggleGrid}
              hapticStyle="light"
              className={`bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 ${
                showGrid ? 'text-white' : 'text-white/60'
              }`}
              data-testid="button-toggle-grid"
            >
              <Grid3x3 className="w-5 h-5" strokeWidth={1.5} />
            </HapticButton>
            <HapticButton
              size="icon"
              variant="ghost"
              onClick={cycleTimer}
              hapticStyle="light"
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white relative"
              data-testid="button-cycle-timer"
            >
              <Timer className="w-5 h-5" strokeWidth={1.5} />
              {timer > 0 && (
                <span className="absolute -top-1 -right-1 text-white rounded-full w-5 h-5 flex items-center justify-center" style={{ fontSize: '10px', backgroundColor: '#4A5849' }} data-testid="text-timer-value">
                  {timer}
                </span>
              )}
            </HapticButton>
          </div>

          <HapticButton
            size="icon"
            variant="ghost"
            onClick={() => setLocation('/app/gallery')}
            hapticStyle="medium"
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white"
            data-testid="button-close-camera"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </HapticButton>
        </div>

        {/* Format Badge (rechts) mit Glassmorphism */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Badge
              variant="secondary"
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
              onClick={toggleFormat}
              style={{ fontSize: '12px', padding: '4px 10px' }}
              data-testid="badge-format"
            >
              {format}
            </Badge>
          </motion.div>
          
          {/* HDR Bracketing Badge */}
          {hdrEnabled && (
            <motion.div 
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Badge
                variant="secondary"
                className="backdrop-blur-md text-white border cursor-pointer transition-colors flex items-center gap-1"
                onClick={() => {
                  trigger('light');
                  setHdrMode(hdrMode === 3 ? 5 : 3);
                }}
                style={{ backgroundColor: 'rgba(74, 88, 73, 0.8)', borderColor: 'rgba(107, 130, 104, 0.3)', fontSize: '11px', padding: '3px 8px' }}
                data-testid="badge-hdr-mode"
              >
                <Layers className="w-3 h-3" strokeWidth={2} />
                <span>{hdrMode}×</span>
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Zoom Overlay mit Glassmorphism */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-lg">
            {zoomLevels.map((level) => (
              <motion.button
                key={level}
                onClick={() => handleZoomChange(level)}
                whileTap={{ scale: 0.9 }}
                className={`min-w-10 px-3 py-1.5 rounded-full transition-all ${
                  zoom === level
                    ? 'text-white shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
                style={zoom === level ? { backgroundColor: '#4A5849', fontSize: '14px' } : { fontSize: '14px' }}
                data-testid={`button-zoom-${level}x`}
              >
                {level}×
              </motion.button>
            ))}
          </div>
        </div>

        {/* Histogram Overlay mit Glassmorphism */}
        {showHistogram && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-20 left-4 z-10"
          >
            <div className="bg-black/40 backdrop-blur-xl rounded-lg border border-white/20 p-2 shadow-lg">
              <Histogram
                videoElement={videoRef.current}
                width={200}
                height={60}
                className="rounded"
              />
              <div className="flex justify-between mt-1 px-1">
                <span className="text-white/60 text-xs" style={{ fontSize: '10px' }}>
                  Shadows
                </span>
                <span className="text-white/60 text-xs" style={{ fontSize: '10px' }}>
                  Midtones
                </span>
                <span className="text-white/60 text-xs" style={{ fontSize: '10px' }}>
                  Highlights
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-black py-6 px-6 pb-20 safe-area-bottom">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Galerie Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              trigger('medium');
              setLocation('/app/gallery');
            }}
            className="w-12 h-12 rounded-lg border-2 border-white/50 flex items-center justify-center bg-gray-700 hover:border-white transition-colors"
            data-testid="button-goto-gallery"
          >
            <Image className="w-6 h-6 text-white" strokeWidth={1.5} />
          </motion.button>

          {/* Auslöser */}
          <motion.button
            onClick={handleCapture}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-transform"
            data-testid="button-capture-photo"
          >
            <div className="w-16 h-16 bg-white rounded-full" />
          </motion.button>

          {/* Histogram Button */}
          <HapticButton
            size="icon"
            variant="ghost"
            onClick={toggleHistogram}
            hapticStyle="light"
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white"
            data-testid="button-toggle-histogram"
          >
            <BarChart3 className="w-5 h-5" strokeWidth={1.5} />
          </HapticButton>
        </div>
      </div>

      <BottomNav variant="dark" />
    </div>
  );
}
