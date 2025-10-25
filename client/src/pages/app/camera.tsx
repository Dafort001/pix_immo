import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Camera as CameraIcon } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { StatusBar } from '@/components/mobile/StatusBar';
import { BottomNav } from '@/components/mobile/BottomNav';
import { useHaptic } from '@/hooks/useHaptic';
import { useLocation } from 'wouter';

export default function CameraScreen() {
  const [, setLocation] = useLocation();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
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
      log(`getUserMedia: ${navigator.mediaDevices?.getUserMedia ? '✅' : '❌'}`);

      if (!navigator.mediaDevices?.getUserMedia) {
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
        
        // Wait for video to be ready
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

  // Cleanup
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
    
    // Flash effect
    const flash = document.getElementById('capture-flash');
    if (flash) {
      flash.classList.remove('hidden');
      setTimeout(() => flash.classList.add('hidden'), 150);
    }

    // Store photo
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

      {/* Debug Info - ALWAYS VISIBLE AT TOP */}
      {debugInfo.length > 0 && (
        <div className="absolute top-12 left-2 right-2 z-50 bg-black/90 backdrop-blur-md rounded-lg p-3 border border-green-500/30 max-h-48 overflow-y-auto">
          <div className="text-green-400 text-xs font-mono space-y-0.5">
            {debugInfo.map((info, i) => (
              <div key={i} className="break-all">{info}</div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {stream ? (
          // Camera Preview
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            data-testid="video-camera-preview"
          />
        ) : (
          // Start Screen
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6 max-w-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#4A5849]/20 flex items-center justify-center">
                <CameraIcon className="w-10 h-10 text-[#4A5849]" strokeWidth={1.5} />
              </div>

              {error ? (
                <>
                  <p className="text-white text-lg mb-2">Camera Error</p>
                  <p className="text-red-400 text-sm mb-6">{error}</p>
                  <HapticButton
                    onClick={startCamera}
                    className="bg-[#4A5849] text-white px-6 py-3"
                    hapticStyle="medium"
                    data-testid="button-retry-camera"
                  >
                    Retry
                  </HapticButton>
                </>
              ) : (
                <>
                  <p className="text-white text-lg mb-2">Start Camera</p>
                  <p className="text-gray-400 text-sm mb-6">
                    Tap to activate camera
                  </p>
                  <HapticButton
                    onClick={startCamera}
                    className="bg-[#4A5849] text-white px-8 py-3"
                    hapticStyle="medium"
                    data-testid="button-start-camera"
                  >
                    <CameraIcon className="w-5 h-5 mr-2 inline" />
                    Start Camera
                  </HapticButton>
                </>
              )}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="absolute top-14 right-4 z-10">
          <HapticButton
            size="icon"
            variant="ghost"
            onClick={() => {
              trigger('light');
              setLocation('/app');
            }}
            hapticStyle="medium"
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white"
            data-testid="button-close-camera"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </HapticButton>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-black py-6 px-6 pb-20 safe-area-bottom">
        <div className="flex items-center justify-center">
          <motion.button
            onClick={handleCapture}
            whileTap={{ scale: 0.95 }}
            disabled={!stream}
            className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-opacity ${
              !stream ? 'opacity-30' : 'opacity-100'
            }`}
            data-testid="button-capture-photo"
          >
            <div className="w-16 h-16 bg-white rounded-full" />
          </motion.button>
        </div>
      </div>

      <BottomNav variant="dark" />
    </div>
  );
}
