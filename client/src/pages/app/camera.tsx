import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, Timer, Image, X, Camera as CameraIcon, BarChart3, Layers, RotateCw } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { Badge } from '@/components/ui/badge';
import { StatusBar } from '@/components/mobile/StatusBar';
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
  const [cameraLoading, setCameraLoading] = useState(true);
  const [videoRotation, setVideoRotation] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { trigger } = useHaptic();

  const zoomLevels = [0.5, 1, 1.5, 2];

  // Kamera-Stream initialisieren
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      setCameraLoading(true);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        
        if (mounted && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setCameraError('');
        }
      } catch (err: any) {
        console.log('Kamera-Initialisierung:', err.name, err.message);
        
        if (mounted) {
          setCameraError('demo');
        }
      } finally {
        setCameraLoading(false);
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
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

  const rotateVideo = () => {
    trigger('medium');
    setVideoRotation((prev) => (prev + 180) % 360);
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
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: `scale(${zoom}) rotate(${videoRotation}deg)` }}
            data-testid="video-camera-preview"
          />
        ) : cameraLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-600 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <CameraIcon className="w-16 h-16 mb-4 mx-auto text-blue-500" strokeWidth={1} />
              </motion.div>
              <p className="text-sm text-white" style={{ fontSize: '14px' }} data-testid="text-camera-loading">
                Kamera wird geladen...
              </p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900">
            <div className="text-center px-6 max-w-sm">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                <CameraIcon className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
              </div>
              <p className="text-white mb-2" style={{ fontSize: '16px' }} data-testid="text-demo-mode-title">
                Demo-Modus
              </p>
              <p className="text-gray-400 mb-4" style={{ fontSize: '14px' }} data-testid="text-demo-mode-subtitle">
                Live-Kamera nur auf echten Geräten mit HTTPS verfügbar
              </p>
              <p className="text-xs text-gray-500" style={{ fontSize: '12px' }} data-testid="text-demo-mode-description">
                Alle Funktionen sind testbar. Die Kamera wird automatisch aktiviert, wenn die App auf einem iPhone über HTTPS läuft.
              </p>
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
            <div className="relative w-full h-px bg-blue-500">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-blue-500 rounded-full" />
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
                showGrid ? 'text-blue-400' : 'text-white'
              }`}
              data-testid="button-toggle-grid"
            >
              <Grid3x3 className="w-5 h-5" strokeWidth={1.5} />
            </HapticButton>
            <HapticButton
              size="icon"
              variant="ghost"
              onClick={rotateVideo}
              hapticStyle="medium"
              className={`bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 ${
                videoRotation !== 0 ? 'text-blue-400' : 'text-white'
              }`}
              data-testid="button-rotate-video"
            >
              <RotateCw className="w-5 h-5" strokeWidth={1.5} />
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
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center" style={{ fontSize: '10px' }} data-testid="text-timer-value">
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
                className="bg-blue-500/80 backdrop-blur-md text-white border border-blue-400/30 cursor-pointer hover:bg-blue-500/90 transition-colors flex items-center gap-1"
                onClick={() => {
                  trigger('light');
                  setHdrMode(hdrMode === 3 ? 5 : 3);
                }}
                style={{ fontSize: '11px', padding: '3px 8px' }}
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
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
                style={{ fontSize: '14px' }}
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
    </div>
  );
}
