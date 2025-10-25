import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera as CameraIcon, Layers, Circle } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { StatusBar } from '@/components/mobile/StatusBar';
import { BottomNav } from '@/components/mobile/BottomNav';
import { useHaptic } from '@/hooks/useHaptic';
import { useLocation } from 'wouter';

export default function CameraScreen() {
  const [, setLocation] = useLocation();
  const [cameraStarted, setCameraStarted] = useState(false);
  const [hdrEnabled, setHdrEnabled] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trigger } = useHaptic();

  const startCamera = async () => {
    try {
      trigger('medium');
      setError('');
      
      if (!navigator.mediaDevices) {
        throw new Error('Camera API not available');
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!videoRef.current) {
        return;
      }

      videoRef.current.srcObject = mediaStream;
      streamRef.current = mediaStream;
      
      videoRef.current.onloadedmetadata = async () => {
        if (videoRef.current) {
          try {
            await new Promise(resolve => setTimeout(resolve, 100));
            await videoRef.current.play();
            setCameraStarted(true);
          } catch (err: any) {
            console.error('Play error:', err);
          }
        }
      };
      
    } catch (err: any) {
      setError(err.message || 'Camera error');
      console.error('Camera error:', err);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureWithEV = async (evCompensation: number): Promise<string> => {
    if (!videoRef.current || !canvasRef.current) {
      throw new Error('No video/canvas');
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No canvas context');
    }

    // Apply exposure compensation via brightness filter
    // EV to brightness: -2 EV = 25%, 0 EV = 100%, +2 EV = 400%
    const brightness = Math.pow(2, evCompensation);
    ctx.filter = `brightness(${brightness})`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    return canvas.toDataURL('image/jpeg', 0.90);
  };

  const handleCapture = async () => {
    if (capturing) return;
    
    setCapturing(true);
    trigger('heavy');

    try {
      const stackId = Date.now();
      const photos = JSON.parse(sessionStorage.getItem('appPhotos') || '[]');

      if (hdrEnabled) {
        // 3-Shot HDR: -2 EV, 0 EV, +2 EV
        const evStops = [-2, 0, 2];
        
        for (let i = 0; i < evStops.length; i++) {
          setCaptureProgress({ current: i + 1, total: evStops.length });
          
          // Flash
          const flash = document.getElementById('capture-flash');
          if (flash) {
            flash.classList.remove('hidden');
            setTimeout(() => flash.classList.add('hidden'), 150);
          }

          // Haptic feedback per shot
          if (i > 0) trigger('light');

          const imageData = await captureWithEV(evStops[i]);
          
          photos.push({
            id: Date.now() + i,
            timestamp: new Date().toISOString(),
            imageData: imageData,
            width: canvasRef.current!.width,
            height: canvasRef.current!.height,
            stackId: stackId,
            stackIndex: i,
            stackTotal: evStops.length,
            evCompensation: evStops[i]
          });

          // Delay between shots
          if (i < evStops.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      } else {
        // Single shot
        setCaptureProgress({ current: 1, total: 1 });
        
        const flash = document.getElementById('capture-flash');
        if (flash) {
          flash.classList.remove('hidden');
          setTimeout(() => flash.classList.add('hidden'), 150);
        }

        const imageData = await captureWithEV(0);
        
        photos.push({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          imageData: imageData,
          width: canvasRef.current!.width,
          height: canvasRef.current!.height
        });
      }

      sessionStorage.setItem('appPhotos', JSON.stringify(photos));
      trigger('success');
      
    } catch (err: any) {
      console.error('Capture error:', err);
      trigger('error');
    } finally {
      setCapturing(false);
      setCaptureProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-black overflow-hidden">
      {/* Flash */}
      <div id="capture-flash" className="hidden fixed inset-0 bg-white z-[200]" />

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Status Bar */}
      <StatusBar variant="light" />

      {/* VIDEO - FULLSCREEN */}
      <div className="absolute inset-0 bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          data-testid="video-camera-preview"
        />
      </div>

      {/* CONTROLS */}
      {cameraStarted ? (
        <>
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-50 pt-14 px-4 pb-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between">
              {/* HDR Toggle */}
              <HapticButton
                onClick={() => {
                  setHdrEnabled(!hdrEnabled);
                  trigger('light');
                }}
                className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                  hdrEnabled 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-white/20 backdrop-blur-md text-white'
                }`}
                data-testid="button-toggle-hdr"
              >
                <Layers className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-semibold">
                  {hdrEnabled ? 'HDR' : 'Normal'}
                </span>
              </HapticButton>

              {/* Close Button */}
              <HapticButton
                size="icon"
                variant="ghost"
                onClick={() => {
                  trigger('light');
                  setLocation('/app');
                }}
                className="bg-white/20 backdrop-blur-md text-white rounded-full"
                data-testid="button-close-camera"
              >
                <X className="w-6 h-6" />
              </HapticButton>
            </div>
          </div>

          {/* Capture Progress */}
          <AnimatePresence>
            {capturing && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-32 left-0 right-0 z-50 flex justify-center"
              >
                <div className="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(captureProgress.total)].map((_, i) => (
                      <Circle
                        key={i}
                        className={`w-2 h-2 ${
                          i < captureProgress.current
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">
                    {captureProgress.current}/{captureProgress.total}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Capture Button */}
          <div className="absolute bottom-24 left-0 right-0 flex justify-center z-50">
            <motion.button
              onClick={handleCapture}
              disabled={capturing}
              whileTap={{ scale: capturing ? 1 : 0.9 }}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${
                hdrEnabled
                  ? 'border-yellow-500'
                  : 'border-white'
              } ${capturing ? 'opacity-50' : ''}`}
              data-testid="button-capture-photo"
            >
              <div className={`w-16 h-16 rounded-full ${
                hdrEnabled
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                  : 'bg-white'
              }`} />
            </motion.button>
          </div>
        </>
      ) : (
        /* Start Camera Screen */
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/90 px-6">
          <div className="text-center">
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-xl">
                <p className="text-white text-sm">⚠️ {error}</p>
              </div>
            )}
            <HapticButton
              onClick={startCamera}
              className="w-full bg-white text-black px-8 py-4 font-bold rounded-xl text-lg"
              hapticStyle="medium"
              data-testid="button-start-camera"
            >
              <CameraIcon className="w-6 h-6 mr-3 inline" />
              Kamera starten
            </HapticButton>
          </div>
        </div>
      )}

      <BottomNav variant="dark" />
    </div>
  );
}
