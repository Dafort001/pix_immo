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
  const [cameraStarted, setCameraStarted] = useState(false);
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
      
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      log(`Safari: ${isSafari ? '✅' : '❌'}`);
      log(`HTTPS: ${window.location.protocol === 'https:' ? '✅' : '❌'}`);
      log(`Device: ${navigator.mediaDevices ? '✅' : '❌'}`);

      if (!navigator.mediaDevices) {
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

      if (!videoRef.current) {
        log('❌ No video element');
        return;
      }

      log('🎬 Setting srcObject...');
      videoRef.current.srcObject = mediaStream;
      streamRef.current = mediaStream;
      
      videoRef.current.onloadedmetadata = async () => {
        log('📊 Metadata loaded');
        
        if (videoRef.current) {
          log(`Video size: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
          
          try {
            await new Promise(resolve => setTimeout(resolve, 100));
            await videoRef.current.play();
            log('▶️ Playing!');
            setCameraStarted(true);
            log(`State: cameraStarted=true`);
          } catch (err: any) {
            log(`❌ Play error: ${err.message}`);
          }
        }
      };
      
    } catch (err: any) {
      log(`❌ ERROR: ${err.name}: ${err.message}`);
      setError(err.message || 'Camera error');
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
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
    <div className="h-full w-full flex flex-col bg-black overflow-hidden">
      {/* Flash */}
      <div id="capture-flash" className="hidden fixed inset-0 bg-white z-[200]" />

      {/* Status Bar */}
      <StatusBar variant="light" />

      {/* ULTRA SIMPLE LAYOUT */}
      <div className="flex-1 flex flex-col">
        
        {/* DEBUG BANNER - OBEN */}
        <div className="relative z-50 p-3 pt-14">
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-lime-400 to-emerald-500 rounded-xl p-3 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-white" strokeWidth={3} />
              <p className="text-white font-bold text-sm">V2.0 - {cameraStarted ? 'RUNNING' : 'READY'}</p>
              <Zap className="w-4 h-4 text-white" strokeWidth={3} />
            </div>

            <div className="bg-black/30 rounded-lg p-2 mb-2 max-h-28 overflow-y-auto">
              <div className="space-y-0.5">
                {debugInfo.map((info, i) => (
                  <p key={i} className="text-white text-xs font-mono leading-tight">
                    {info}
                  </p>
                ))}
              </div>
            </div>

            {!cameraStarted && (
              <div>
                {error && <p className="text-white text-sm mb-2">⚠️ {error}</p>}
                <HapticButton
                  onClick={startCamera}
                  className="w-full bg-white text-lime-600 px-4 py-3 font-bold rounded-xl"
                  hapticStyle="medium"
                  data-testid="button-start-camera"
                >
                  <CameraIcon className="w-5 h-5 mr-2 inline" />
                  START CAMERA
                </HapticButton>
              </div>
            )}
          </motion.div>
        </div>

        {/* VIDEO - FULLSCREEN BEHIND BANNER */}
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

        {/* CONTROLS - OVER VIDEO */}
        {cameraStarted && (
          <>
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-50">
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

            {/* Capture Button */}
            <div className="absolute bottom-24 left-0 right-0 flex justify-center z-50">
              <motion.button
                onClick={handleCapture}
                whileTap={{ scale: 0.9 }}
                className="w-20 h-20 rounded-full border-4 border-lime-400 flex items-center justify-center"
                data-testid="button-capture-photo"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full" />
              </motion.button>
            </div>
          </>
        )}
      </div>

      <BottomNav variant="dark" />
    </div>
  );
}
