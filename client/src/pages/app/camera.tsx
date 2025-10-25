import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Camera as CameraIcon, Zap } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { StatusBar } from '@/components/mobile/StatusBar';
import { BottomNav } from '@/components/mobile/BottomNav';
import { useHaptic } from '@/hooks/useHaptic';
import { useLocation } from 'wouter';

export default function CameraScreen() {
  const [, setLocation] = useLocation();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string[]>(['Waiting...']);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { trigger } = useHaptic();

  const log = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    const entry = `${time}: ${msg}`;
    console.log(entry);
    setDebugInfo(prev => [...prev, entry]);
  };

  const startCamera = async () => {
    try {
      trigger('medium');
      setError('');
      setDebugInfo([]);
      
      log('🔍 Starting camera...');
      log(`HTTPS: ${window.location.protocol === 'https:' ? '✅' : '❌'}`);
      log(`MediaDevices: ${navigator.mediaDevices ? '✅' : '❌'}`);
      log(`getUserMedia: ${typeof navigator.mediaDevices?.getUserMedia === 'function' ? '✅' : '❌'}`);

      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error('Camera API not available');
      }

      log('📸 Requesting camera...');
      
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      log('✅ Camera permission granted');
      log(`Stream active: ${mediaStream.active}`);
      log(`Tracks: ${mediaStream.getVideoTracks().length}`);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        streamRef.current = mediaStream;
        setStream(mediaStream);
        
        videoRef.current.onloadedmetadata = () => {
          log('🎬 Video metadata loaded');
          videoRef.current?.play().then(() => {
            log('▶️ Video playing');
          }).catch(err => {
            log(`❌ Play error: ${err.message}`);
          });
        };
      }
    } catch (err: any) {
      log(`❌ ERROR: ${err.name}`);
      log(`Message: ${err.message}`);
      
      let errorMsg = '';
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Camera permission denied';
        log('💡 Fix: Settings → Safari → Camera → Allow');
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera found';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Camera already in use';
      } else {
        errorMsg = err.message || 'Camera error';
      }
      setError(errorMsg);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          log('🛑 Camera stopped');
        });
      }
    };
  }, []);

  const handleCapture = () => {
    trigger('heavy');
    log('📷 Photo captured');
    
    const flash = document.getElementById('capture-flash');
    if (flash) {
      flash.classList.remove('hidden');
      setTimeout(() => flash.classList.add('hidden'), 150);
    }

    const photos = JSON.parse(sessionStorage.getItem('appPhotos') || '[]');
    photos.push({ id: Date.now(), timestamp: new Date().toISOString() });
    sessionStorage.setItem('appPhotos', JSON.stringify(photos));
    
    log(`Total photos: ${photos.length}`);
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Flash */}
      <div id="capture-flash" className="hidden fixed inset-0 bg-white z-[100]" />

      {/* Status Bar */}
      <StatusBar variant="light" />

      {/* VERSION BANNER MIT DEBUG LOGS - OBEN! */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute top-12 left-0 right-0 z-50 px-4"
      >
        <div className="bg-gradient-to-r from-lime-400 to-emerald-500 rounded-2xl p-4 shadow-2xl border-2 border-lime-300">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Zap className="w-6 h-6 text-white animate-pulse" strokeWidth={2.5} />
            <div className="text-center">
              <p className="text-white font-bold text-xl">VERSION 2.0</p>
              <p className="text-white/90 text-xs">Mini Camera Test</p>
            </div>
            <Zap className="w-6 h-6 text-white animate-pulse" strokeWidth={2.5} />
          </div>
          
          {/* DEBUG LOGS DIREKT IM BANNER! */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 max-h-48 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <p className="text-white font-bold text-xs">DEBUG CONSOLE</p>
            </div>
            <div className="space-y-1">
              {debugInfo.map((info, i) => (
                <p key={i} className="text-white text-xs font-mono break-all">
                  {info}
                </p>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden mt-80 bg-gradient-to-b from-gray-900 to-black">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            data-testid="video-camera-preview"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-28 h-28 mb-8 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shadow-2xl"
            >
              <CameraIcon className="w-14 h-14 text-white" strokeWidth={2} />
            </motion.div>

            {error ? (
              <div className="text-center max-w-sm">
                <p className="text-red-400 text-xl font-bold mb-4">Error</p>
                <p className="text-white text-lg mb-6">{error}</p>
                <HapticButton
                  onClick={startCamera}
                  className="bg-gradient-to-r from-lime-400 to-emerald-500 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg"
                  hapticStyle="medium"
                  data-testid="button-retry-camera"
                >
                  Retry Camera
                </HapticButton>
              </div>
            ) : (
              <div className="text-center max-w-sm">
                <p className="text-white text-2xl font-bold mb-3">Camera Test</p>
                <p className="text-gray-300 text-base mb-8">
                  Tap button to activate
                </p>
                <HapticButton
                  onClick={startCamera}
                  className="bg-gradient-to-r from-lime-400 to-emerald-500 text-white px-10 py-5 text-xl font-bold rounded-xl shadow-2xl"
                  hapticStyle="medium"
                  data-testid="button-start-camera"
                >
                  <CameraIcon className="w-6 h-6 mr-3 inline" />
                  START CAMERA
                </HapticButton>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <HapticButton
            size="icon"
            variant="ghost"
            onClick={() => {
              trigger('light');
              setLocation('/app');
            }}
            hapticStyle="medium"
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 border-2 border-white/40 text-white rounded-full"
            data-testid="button-close-camera"
          >
            <X className="w-6 h-6" strokeWidth={2.5} />
          </HapticButton>
        </div>
      </div>

      {/* Bottom Controls */}
      {stream && (
        <div className="bg-black/50 backdrop-blur-md py-6 px-6 pb-20 border-t-2 border-lime-400/30">
          <div className="flex items-center justify-center">
            <motion.button
              onClick={handleCapture}
              whileTap={{ scale: 0.9 }}
              className="w-24 h-24 rounded-full border-4 border-lime-400 flex items-center justify-center shadow-2xl"
              data-testid="button-capture-photo"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full" />
            </motion.button>
          </div>
        </div>
      )}

      <BottomNav variant="dark" />
    </div>
  );
}
