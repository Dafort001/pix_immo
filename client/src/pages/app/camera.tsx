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
  const [debugInfo, setDebugInfo] = useState<string[]>(['Ready - V2.0']);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { trigger } = useHaptic();

  const log = (msg: string) => {
    const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry = `${time}: ${msg}`;
    console.log(entry);
    setDebugInfo(prev => [...prev, entry]);
  };

  const startCamera = async () => {
    try {
      trigger('medium');
      setError('');
      setDebugInfo([]);
      
      log('🔍 Starting...');
      
      // Safari detection
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      log(`Safari: ${isSafari ? '✅' : '❌'}`);
      
      log(`HTTPS: ${window.location.protocol === 'https:' ? '✅' : '❌'}`);
      log(`Device: ${navigator.mediaDevices ? '✅' : '❌'}`);
      log(`getUserMedia: ${typeof navigator.mediaDevices?.getUserMedia === 'function' ? '✅' : '❌'}`);

      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error('Camera API not available');
      }

      log('📸 Requesting...');
      
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      log('✅ Permission OK');
      log(`Active: ${mediaStream.active}`);
      log(`Tracks: ${mediaStream.getVideoTracks().length}`);

      if (videoRef.current) {
        log('🎬 Setting srcObject...');
        
        // SAFARI FIX: Set srcObject and wait for loadedmetadata
        videoRef.current.srcObject = mediaStream;
        streamRef.current = mediaStream;
        
        videoRef.current.onloadedmetadata = async () => {
          log('📊 Metadata loaded');
          
          if (videoRef.current) {
            log(`Video size: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
            
            // SAFARI FIX: Delay play() to ensure stream is ready
            try {
              await new Promise(resolve => setTimeout(resolve, 100));
              await videoRef.current.play();
              log('▶️ Playing!');
              setStream(mediaStream);
            } catch (err: any) {
              log(`❌ Play error: ${err.message}`);
              setError('Video play failed');
            }
          }
        };

        videoRef.current.onerror = (err) => {
          log(`❌ Video error: ${err}`);
        };
      }
    } catch (err: any) {
      log(`❌ ERROR: ${err.name}`);
      log(`Msg: ${err.message}`);
      
      let errorMsg = '';
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Permission denied';
        log('💡 Settings → Safari → Camera');
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera found';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Camera in use';
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
          log('🛑 Stopped');
        });
      }
    };
  }, []);

  const handleCapture = () => {
    trigger('heavy');
    log('📷 Captured');
    
    const flash = document.getElementById('capture-flash');
    if (flash) {
      flash.classList.remove('hidden');
      setTimeout(() => flash.classList.add('hidden'), 150);
    }

    const photos = JSON.parse(sessionStorage.getItem('appPhotos') || '[]');
    photos.push({ id: Date.now(), timestamp: new Date().toISOString() });
    sessionStorage.setItem('appPhotos', JSON.stringify(photos));
    
    log(`Photos: ${photos.length}`);
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Flash */}
      <div id="capture-flash" className="hidden fixed inset-0 bg-white z-[100]" />

      {/* Status Bar */}
      <StatusBar variant="light" />

      {/* VERSION BANNER */}
      <div className="flex-1 flex flex-col p-3 pt-14">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-lime-400 to-emerald-500 rounded-2xl p-4 shadow-2xl border-2 border-lime-300"
        >
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-white animate-pulse" strokeWidth={3} />
            <div className="text-center">
              <p className="text-white font-bold text-xl">VERSION 2.0</p>
              <p className="text-white/90 text-xs">Safari Fix</p>
            </div>
            <Zap className="w-5 h-5 text-white animate-pulse" strokeWidth={3} />
          </div>

          {/* DEBUG LOGS */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 mb-3 max-h-40 overflow-y-auto">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <p className="text-white font-bold text-xs">DEBUG CONSOLE</p>
            </div>
            <div className="space-y-0.5">
              {debugInfo.map((info, i) => (
                <p key={i} className="text-white text-xs font-mono break-all leading-tight">
                  {info}
                </p>
              ))}
            </div>
          </div>

          {/* START BUTTON */}
          {!stream && (
            <div className="text-center">
              {error && (
                <p className="text-white text-sm mb-2 font-bold">⚠️ {error}</p>
              )}
              <HapticButton
                onClick={startCamera}
                className="w-full bg-white text-lime-600 px-6 py-4 text-lg font-bold rounded-xl shadow-lg hover:bg-lime-50"
                hapticStyle="medium"
                data-testid="button-start-camera"
              >
                <CameraIcon className="w-6 h-6 mr-2 inline" strokeWidth={2.5} />
                START CAMERA
              </HapticButton>
            </div>
          )}
        </motion.div>

        {/* Video Preview - Mit Safari Fixes! */}
        {stream && (
          <div className="flex-1 relative mt-4 rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              webkit-playsinline="true"
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              className="absolute inset-0"
              data-testid="video-camera-preview"
            />

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

            {/* Capture Button */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center">
              <motion.button
                onClick={handleCapture}
                whileTap={{ scale: 0.9 }}
                className="w-20 h-20 rounded-full border-4 border-lime-400 flex items-center justify-center shadow-2xl"
                data-testid="button-capture-photo"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full" />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <BottomNav variant="dark" />
    </div>
  );
}
