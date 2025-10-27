import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera as CameraIcon, Layers, Circle, Info, Grid3x3, Timer, Home, ChevronRight, AlertCircle, Sliders, Zap, RefreshCw } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { StatusBar } from '@/components/mobile/StatusBar';
import { BottomNav } from '@/components/mobile/BottomNav';
import { DraggableHistogram } from '@/components/mobile/DraggableHistogram';
import { ManualControls } from '@/components/mobile/ManualControls';
import { GridOverlay, HorizonLevelOverlay, MeteringModeOverlay, FocusPeakingOverlay } from '@/components/mobile/CameraOverlays';
import { LevelIndicator } from '@/components/mobile/LevelIndicator';
import { CaptureThumb } from '@/components/mobile/CaptureThumb';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { useHaptic } from '@/hooks/useHaptic';
import { useLocation } from 'wouter';
import { ALL_ROOM_TYPES, DEFAULT_ROOM_TYPE, type RoomType, getRoomsByGroup, GROUP_DISPLAY_NAMES } from '@shared/room-types';
import { useManualModeStore } from '@/lib/manual-mode/store';
import { buildCameraConstraints, applySettingsToTrack, logCapabilities } from '@/lib/manual-mode/constraints';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function CameraScreen() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { trigger } = useHaptic();
  
  // Route protection - redirect to login if not authenticated
  const { data: authData, isLoading: isAuthLoading } = useQuery<{ user?: { id: string; email: string } }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  // All hooks must be declared before any conditional returns
  const [cameraStarted, setCameraStarted] = useState(false);
  const [hdrEnabled, setHdrEnabled] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string>('');
  const [exposureControl, setExposureControl] = useState<{
    type: 'exposureTime' | 'exposureCompensation' | 'iso' | 'none';
    baseValue: number;
    min: number;
    max: number;
  } | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [showHistogram, setShowHistogram] = useState(true);
  const [photoCount, setPhotoCount] = useState(0);
  
  // Camera Controls
  const [zoom, setZoom] = useState(1);
  const [timerMode, setTimerMode] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentRoomType, setCurrentRoomType] = useState<RoomType>(DEFAULT_ROOM_TYPE);
  const [isLandscape, setIsLandscape] = useState(false);
  const [horizonLineEnabled, setHorizonLineEnabled] = useState(false);
  const [lastCaptureUrl, setLastCaptureUrl] = useState<string | null>(null);
  const [isManualControlsOpen, setIsManualControlsOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'2:3' | '4:3' | '16:9'>('2:3');
  const [brightness, setBrightness] = useState(0);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  
  // Manual Mode Store - Grid Type
  const gridType = useManualModeStore((state) => state.gridType);
  const setGridType = useManualModeStore((state) => state.setGridType);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auth redirect effect
  useEffect(() => {
    if (!isAuthLoading && !authData?.user) {
      setLocation('/app');
    }
  }, [isAuthLoading, authData, setLocation]);

  // R4: Set black background for Safe-Area (Notch)
  useEffect(() => {
    document.body.style.backgroundColor = '#000000';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  // Load photo count
  useEffect(() => {
    const updatePhotoCount = () => {
      const stored = sessionStorage.getItem('appPhotos');
      if (stored) {
        const photos = JSON.parse(stored);
        setPhotoCount(photos.length);
      }
    };
    
    updatePhotoCount();
    
    // Update on storage changes
    window.addEventListener('storage', updatePhotoCount);
    return () => window.removeEventListener('storage', updatePhotoCount);
  }, []);

  // Detect orientation changes
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Apply manual mode settings when they change (debounced to avoid spamming camera)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastSettings: string | null = null;

    const applySettings = async () => {
      if (!streamRef.current || !cameraStarted) return;
      
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (!videoTrack) return;

      const settings = useManualModeStore.getState();
      
      const relevantSettings = JSON.stringify({
        enabled: settings.enabled,
        iso: settings.iso,
        shutterSpeed: settings.shutterSpeed,
        whiteBalanceKelvin: settings.whiteBalanceKelvin,
        focusMode: settings.focusMode,
        focusDistance: settings.focusDistance,
        exposureCompensation: settings.exposureCompensation,
        oisEnabled: settings.oisEnabled,
        tripodMode: settings.tripodMode,
        nightModeEnabled: settings.nightModeEnabled,
      });
      
      if (relevantSettings === lastSettings) {
        return;
      }
      
      lastSettings = relevantSettings;
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(async () => {
        await applySettingsToTrack(videoTrack, settings);
        timeoutId = null;
      }, 300);
    };

    const unsubscribe = useManualModeStore.subscribe(applySettings);
    
    return () => {
      unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [cameraStarted]);

  // Sync brightness with exposure control
  useEffect(() => {
    if (exposureControl?.type === 'exposureCompensation') {
      setBrightness(exposureControl.baseValue);
    } else {
      setBrightness(0);
    }
  }, [exposureControl]);

  // Show nothing while checking auth or if not authenticated
  if (isAuthLoading || !authData?.user) {
    return null;
  }

  const log = (msg: string) => {
    console.log(msg);
    setDebugLog(prev => [...prev.slice(-5), msg]);
  };

  const toggleCamera = async () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    
    // Restart camera with new facing mode
    if (cameraStarted) {
      await startCamera();
    }
  };

  const startCamera = async () => {
    try {
      trigger('medium');
      setError('');
      setDebugLog([]);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (!navigator.mediaDevices) {
        throw new Error('Camera API not available');
      }

      // Use manual mode constraints if enabled, otherwise use basic constraints
      const manualSettings = useManualModeStore.getState();
      const constraints = manualSettings.enabled
        ? buildCameraConstraints(manualSettings, facingMode)
        : {
            video: {
              facingMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            }
          };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints as any);
      const videoTrack = mediaStream.getVideoTracks()[0];
      
      // Log capabilities for manual mode debugging
      if (manualSettings.enabled) {
        logCapabilities(videoTrack);
      }
      
      const capabilities: any = videoTrack.getCapabilities();
      
      // Set default zoom
      setZoom(1);
      
      log('📸 Checking ALL controls...');
      
      // Try to enable manual mode
      try {
        await videoTrack.applyConstraints({
          advanced: [{
            exposureMode: 'manual',
            focusMode: 'manual'
          } as any]
        });
        log('✅ Manual mode ON');
      } catch (e) {
        log('⚠️ Manual mode failed');
      }

      const updatedCaps: any = videoTrack.getCapabilities();
      const updatedSettings: any = videoTrack.getSettings();
      
      // Check exposureTime (BEST)
      if (updatedCaps.exposureTime) {
        const current = updatedSettings.exposureTime || updatedCaps.exposureTime.max / 2;
        setExposureControl({
          type: 'exposureTime',
          baseValue: current,
          min: updatedCaps.exposureTime.min,
          max: updatedCaps.exposureTime.max
        });
        log(`✅ exposureTime: ${current.toFixed(1)}ms`);
      }
      // Check exposureCompensation (GOOD)
      else if (updatedCaps.exposureCompensation) {
        const current = updatedSettings.exposureCompensation || 0;
        setExposureControl({
          type: 'exposureCompensation',
          baseValue: current,
          min: updatedCaps.exposureCompensation.min,
          max: updatedCaps.exposureCompensation.max
        });
        log(`✅ exposureComp: ${current} EV`);
      }
      // Check iso (FALLBACK)
      else if (updatedCaps.iso) {
        const current = updatedSettings.iso || updatedCaps.iso.max / 2;
        setExposureControl({
          type: 'iso',
          baseValue: current,
          min: updatedCaps.iso.min,
          max: updatedCaps.iso.max
        });
        log(`✅ ISO: ${current}`);
      }
      else {
        log('❌ NO exposure controls!');
        log('Software HDR only');
        setError(t('camera.software_hdr_fallback'));
      }

      if (!videoRef.current) return;

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
      log(`❌ ERROR: ${err.message}`);
    }
  };

  // Zoom Handler with Buttons
  const handleZoomChange = async (newZoom: number) => {
    if (!streamRef.current) return;
    
    const videoTrack = streamRef.current.getVideoTracks()[0];
    const capabilities: any = videoTrack.getCapabilities();
    
    // Check if zoom is supported
    if (!capabilities.zoom) {
      log('⚠️ Zoom not available');
      return;
    }
    
    const maxZoom = capabilities.zoom.max || 1;
    const clampedZoom = Math.max(1, Math.min(maxZoom, newZoom));
    
    try {
      await videoTrack.applyConstraints({
        advanced: [{ zoom: clampedZoom } as any]
      });
      setZoom(clampedZoom);
      log(`🔍 Zoom: ${clampedZoom.toFixed(1)}×`);
    } catch (e) {
      log('⚠️ Zoom failed');
    }
  };

  const handleBrightnessChange = async (value: number) => {
    setBrightness(value);
    
    if (!exposureControl) return;
    
    if (exposureControl.type === 'exposureCompensation') {
      await setExposure(value);
    } else if (exposureControl.type === 'exposureTime') {
      const factor = Math.pow(2, value);
      const newExposure = exposureControl.baseValue * factor;
      await setExposure(newExposure);
    } else if (exposureControl.type === 'iso') {
      const factor = Math.pow(2, value);
      const newISO = exposureControl.baseValue * factor;
      await setExposure(newISO);
    }
  };

  const setExposure = async (value: number): Promise<boolean> => {
    if (!streamRef.current || !exposureControl) return false;

    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return false;

    const clampedValue = Math.max(exposureControl.min, Math.min(exposureControl.max, value));

    try {
      let constraint: any = {};
      
      if (exposureControl.type === 'exposureTime') {
        constraint = { exposureTime: clampedValue };
      } else if (exposureControl.type === 'exposureCompensation') {
        constraint = { exposureCompensation: clampedValue };
      } else if (exposureControl.type === 'iso') {
        constraint = { iso: clampedValue };
      }

      await videoTrack.applyConstraints({
        advanced: [constraint as any]
      });
      
      log(`⚡ ${exposureControl.type}: ${clampedValue.toFixed(1)}`);
      return true;
    } catch (err) {
      log(`❌ Set failed`);
      return false;
    }
  };

  const applySoftwareExposure = (imageData: ImageData, evStops: number): ImageData => {
    const factor = Math.pow(2, evStops);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * factor);
      data[i + 1] = Math.min(255, data[i + 1] * factor);
      data[i + 2] = Math.min(255, data[i + 2] * factor);
    }
    
    return imageData;
  };

  const captureWithExposure = async (exposureValue: number, evStops: number): Promise<string> => {
    if (!videoRef.current || !canvasRef.current) {
      throw new Error('No video/canvas');
    }

    const hwSuccess = await setExposure(exposureValue);
    
    if (hwSuccess) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No canvas context');
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (!hwSuccess && evStops !== 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const adjusted = applySoftwareExposure(imageData, evStops);
      ctx.putImageData(adjusted, 0, 0);
      log(`💻 Software: ${evStops} EV`);
    }

    // Higher quality for professional real estate photography
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  const handleCapture = async () => {
    if (capturing || countdown !== null) return;
    
    // Self-Timer Countdown
    if (timerMode > 0) {
      setCountdown(timerMode);
      
      for (let i = timerMode; i > 0; i--) {
        setCountdown(i);
        trigger('light');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setCountdown(null);
    }
    
    setCapturing(true);
    trigger('heavy');

    try {
      const stackId = Date.now();
      const photos = JSON.parse(sessionStorage.getItem('appPhotos') || '[]');
      const manualModeEnabled = useManualModeStore.getState().enabled;

      if (hdrEnabled) {
        log('🎬 HDR Start');
        
        const evStops = [-2, 0, 2];
        let exposureValues: number[];

        if (exposureControl) {
          if (exposureControl.type === 'exposureTime') {
            exposureValues = [
              exposureControl.baseValue / 4,
              exposureControl.baseValue,
              exposureControl.baseValue * 4
            ];
          } else if (exposureControl.type === 'exposureCompensation') {
            exposureValues = [-2, 0, 2];
          } else if (exposureControl.type === 'iso') {
            exposureValues = [
              exposureControl.baseValue / 4,
              exposureControl.baseValue,
              exposureControl.baseValue * 4
            ];
          } else {
            exposureValues = [0, 0, 0];
          }
        } else {
          exposureValues = [0, 0, 0];
        }
        
        for (let i = 0; i < evStops.length; i++) {
          setCaptureProgress({ current: i + 1, total: evStops.length });
          
          const flash = document.getElementById('capture-flash');
          if (flash) {
            flash.classList.remove('hidden');
            setTimeout(() => flash.classList.add('hidden'), 150);
          }

          if (i > 0) trigger('light');

          log(`📷 ${evStops[i]} EV`);
          
          const imageData = await captureWithExposure(exposureValues[i], evStops[i]);
          
          photos.push({
            id: Date.now() + i * 100,
            timestamp: new Date().toISOString(),
            imageData: imageData,
            width: canvasRef.current!.width,
            height: canvasRef.current!.height,
            stackId: stackId,
            stackIndex: i,
            stackTotal: evStops.length,
            evCompensation: evStops[i],
            roomType: currentRoomType,
            isManualMode: manualModeEnabled
          });

          if (i < evStops.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        if (exposureControl) {
          await setExposure(exposureControl.baseValue);
        }
        
        log('✅ Complete!');
      } else {
        setCaptureProgress({ current: 1, total: 1 });
        
        const flash = document.getElementById('capture-flash');
        if (flash) {
          flash.classList.remove('hidden');
          setTimeout(() => flash.classList.add('hidden'), 150);
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Higher quality for professional real estate photography
            const imageData = canvas.toDataURL('image/jpeg', 0.95);
            
            photos.push({
              id: Date.now(),
              timestamp: new Date().toISOString(),
              imageData: imageData,
              width: canvas.width,
              height: canvas.height,
              roomType: currentRoomType,
              isManualMode: manualModeEnabled
            });
            
            log('✅ Photo saved');
          }
        }
      }

      sessionStorage.setItem('appPhotos', JSON.stringify(photos));
      trigger('success');
      
      // Update thumbnail with last captured photo
      if (photos.length > 0) {
        const lastPhoto = photos[photos.length - 1];
        setLastCaptureUrl(lastPhoto.imageData);
      }
      
    } catch (err: any) {
      log(`❌ ${err.message}`);
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

      {/* Status Bar - Only in Portrait */}
      {!isLandscape && <StatusBar variant="light" />}

      {/* VIDEO - Responsive Aspect Ratio Container */}
      <div className={`absolute inset-0 z-0 bg-black flex items-center justify-center ${
        isLandscape ? 'pl-16 pr-44' : ''
      }`}>
        <div 
          className="relative bg-black flex items-center justify-center"
          style={{
            width: isLandscape ? 'auto' : '100%',
            height: 'auto',
            aspectRatio: (() => {
              const ratios = {
                '2:3': isLandscape ? '3/2' : '2/3',
                '4:3': isLandscape ? '4/3' : '3/4',
                '16:9': isLandscape ? '16/9' : '9/16'
              };
              return ratios[aspectRatio];
            })(),
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            data-testid="video-camera-preview"
          />
        </div>
      </div>

      {/* Landscape: Vertical StatusBar Left (Dynamic Island is left, so this is fine as thin strip) */}
      {isLandscape && (
        <div className="absolute left-0 top-0 bottom-0 z-10 w-16 bg-[#1C1C1E]/90 backdrop-blur-xl border-r border-white/10 flex flex-col items-center justify-start pt-6 gap-4">
          <div className="text-white text-xs" data-testid="statusbar-time-landscape">
            {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}
          </div>
          <div className="flex flex-col gap-1">
            <div className="w-0.5 h-2 rounded-full bg-white" />
            <div className="w-0.5 h-2.5 rounded-full bg-white" />
            <div className="w-0.5 h-3 rounded-full bg-white" />
            <div className="w-0.5 h-3.5 rounded-full bg-white" />
          </div>
        </div>
      )}

      {/* Landscape: Right Side Controls */}
      {isLandscape && cameraStarted && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-row items-center gap-4">
          {/* Left Column: Flip + Auslöser + Manual */}
          <div className="flex flex-col items-center gap-6">
            {/* Kamera-Flip - Über Auslöser */}
            <HapticButton
              size="icon"
              variant="ghost"
              onClick={toggleCamera}
              className="w-12 h-12 rounded-full backdrop-blur-md bg-white/20 text-white flex-shrink-0"
              data-testid="button-flip-camera-landscape"
            >
              <RefreshCw className="w-5 h-5" style={{ transform: 'rotate(90deg)' }} />
            </HapticButton>

            {/* BIG CAPTURE BUTTON - Center */}
            <motion.button
              onClick={handleCapture}
              disabled={capturing || countdown !== null}
              whileTap={{ scale: (capturing || countdown !== null) ? 1 : 0.9 }}
              className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center flex-shrink-0 ${
                (capturing || countdown !== null) ? 'opacity-50' : ''
              }`}
              data-testid="button-capture-photo-landscape"
            >
              <div className="w-16 h-16 rounded-full bg-white" />
            </motion.button>

            {/* Manual Controls - Unter Auslöser */}
            <HapticButton
              size="icon"
              variant="ghost"
              onClick={() => {
                setIsManualControlsOpen(!isManualControlsOpen);
                trigger('light');
              }}
              className={`w-12 h-12 rounded-full backdrop-blur-md flex-shrink-0 ${
                isManualControlsOpen 
                  ? 'bg-white/30 text-white' 
                  : 'bg-white/20 text-white/60'
              }`}
              data-testid="button-toggle-manual-controls-landscape"
            >
              <Sliders className="w-5 h-5" style={{ transform: 'rotate(90deg)' }} />
            </HapticButton>
          </div>

          {/* Right Column: 5 Buttons (90° gedreht) */}
          <div className="flex flex-col items-center gap-3">
            {/* Format Button */}
            <HapticButton
              size="icon"
              variant="ghost"
              onClick={() => {
                const formats: Array<'2:3' | '4:3' | '16:9'> = ['2:3', '4:3', '16:9'];
                const currentIndex = formats.indexOf(aspectRatio);
                const nextIndex = (currentIndex + 1) % formats.length;
                setAspectRatio(formats[nextIndex]);
                trigger('light');
              }}
              className="w-12 h-12 rounded-full backdrop-blur-md bg-white/20 text-white flex-shrink-0"
              data-testid="button-format-toggle-landscape"
            >
              <span className="text-xs font-bold" style={{ transform: 'rotate(90deg)', display: 'inline-block' }}>
                {aspectRatio}
              </span>
            </HapticButton>

            {/* Room Type Selector */}
            <Drawer>
              <DrawerTrigger asChild>
                <button
                  onClick={() => trigger('light')}
                  className="w-12 h-12 rounded-full backdrop-blur-md bg-white/20 text-white flex flex-col items-center justify-center flex-shrink-0"
                  style={{ transform: 'rotate(90deg)' }}
                  data-testid="button-select-roomtype-landscape"
                >
                  <span className="text-[9px] opacity-60">#1</span>
                  <span className="text-[10px] font-semibold leading-tight">{currentRoomType.substring(0, 4)}</span>
                </button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh] bg-white">
                <div className="mx-auto w-full max-w-md">
                  <DrawerHeader className="px-4 pt-4 pb-2 border-b border-gray-200 relative">
                    <DrawerTitle className="text-lg font-semibold">{t('camera.room_title')}</DrawerTitle>
                    <DrawerDescription className="text-sm text-gray-500">
                      {t('camera.room_types_available', { count: ALL_ROOM_TYPES.length })}
                    </DrawerDescription>
                    <DrawerClose asChild>
                      <button
                        onClick={() => trigger('light')}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        data-testid="button-close-roomtype-drawer-landscape"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </DrawerClose>
                  </DrawerHeader>
                  <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
                    {Object.entries(getRoomsByGroup()).map(([group, rooms]) => {
                      if (rooms.length === 0) return null;
                      return (
                        <div key={group} className="py-2">
                          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                            {GROUP_DISPLAY_NAMES[group as keyof typeof GROUP_DISPLAY_NAMES]}
                          </div>
                          <div className="divide-y divide-gray-100">
                            {rooms.map((room) => (
                              <button
                                key={room}
                                onClick={() => {
                                  setCurrentRoomType(room);
                                  trigger('success');
                                }}
                                className={`w-full text-left px-4 py-3 transition-colors ${
                                  currentRoomType === room
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'hover:bg-gray-50 text-gray-900'
                                }`}
                                data-testid={`roomtype-option-${room.replace(/\s+/g, '-').toLowerCase()}`}
                              >
                                {room}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>

            {/* Grid Toggle */}
            <HapticButton
              size="icon"
              variant="ghost"
              onClick={() => {
                setGridType(gridType === 'none' ? '3x3' : 'none');
                trigger('light');
              }}
              className={`w-12 h-12 rounded-full backdrop-blur-md flex-shrink-0 ${
                gridType !== 'none'
                  ? 'bg-white/30 text-white' 
                  : 'bg-white/20 text-white/60'
              }`}
              data-testid="button-toggle-grid-landscape"
            >
              <Grid3x3 className="w-5 h-5" style={{ transform: 'rotate(90deg)' }} />
            </HapticButton>

            {/* Histogram Button */}
            <HapticButton
              size="icon"
              variant="ghost"
              onClick={() => setShowHistogram(!showHistogram)}
              className={`w-12 h-12 rounded-full backdrop-blur-md flex-shrink-0 ${
                showHistogram 
                  ? 'bg-white/30 text-white' 
                  : 'bg-white/20 text-white/60'
              }`}
              data-testid="button-toggle-histogram-landscape"
            >
              <svg 
                className="w-5 h-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{ transform: 'rotate(90deg)' }}
              >
                <rect x="3" y="12" width="4" height="9" />
                <rect x="10" y="8" width="4" height="13" />
                <rect x="17" y="4" width="4" height="17" />
              </svg>
            </HapticButton>

            {/* Timer Mode */}
            <HapticButton
              size="icon"
              variant="ghost"
              onClick={() => {
                const modes: Array<0 | 3 | 10> = [0, 3, 10];
                const currentIndex = modes.indexOf(timerMode);
                const nextIndex = (currentIndex + 1) % modes.length;
                setTimerMode(modes[nextIndex]);
                trigger('light');
              }}
              className={`w-12 h-12 rounded-full backdrop-blur-md flex-shrink-0 ${
                timerMode > 0
                  ? 'bg-white/30 text-white' 
                  : 'bg-white/20 text-white/60'
              }`}
              data-testid="button-toggle-timer-landscape"
            >
              {timerMode > 0 ? (
                <span className="text-sm font-bold" style={{ transform: 'rotate(90deg)', display: 'inline-block' }}>
                  {timerMode}s
                </span>
              ) : (
                <Timer className="w-5 h-5" style={{ transform: 'rotate(90deg)' }} />
              )}
            </HapticButton>
          </div>
        </div>
      )}


      {/* CONTROLS */}
      {cameraStarted ? (
        <>
          {/* Top Bar - Only Debug Toggle if needed */}
          {showDebug && (
            <div className={`absolute top-0 right-0 z-20 pt-14 px-4 pb-4 ${
              isLandscape ? 'hidden' : ''
            }`}>
              <HapticButton
                size="icon"
                variant="ghost"
                onClick={() => setShowDebug(!showDebug)}
                className="bg-white/20 backdrop-blur-md text-white rounded-full"
              >
                <Info className="w-5 h-5" />
              </HapticButton>
            </div>
          )}

          {/* Professional Camera Overlays */}
          <div className="absolute inset-0 pointer-events-none z-40">
            <GridOverlay />
            <HorizonLevelOverlay />
            <MeteringModeOverlay />
            <FocusPeakingOverlay />
            <LevelIndicator />
          </div>

          {/* Capture Thumbnail */}
          <CaptureThumb
            imageUrl={lastCaptureUrl}
            progress={captureProgress.total > 1 ? {
              current: captureProgress.current,
              total: captureProgress.total
            } : null}
            onDismiss={() => setLastCaptureUrl(null)}
          />

          {/* Histogram - Draggable */}
          <AnimatePresence>
            {showHistogram && (
              <DraggableHistogram
                videoElement={videoRef.current}
                onClose={() => {
                  setShowHistogram(false);
                  trigger('light');
                }}
                onBrightnessChange={handleBrightnessChange}
                currentBrightness={brightness}
                isLandscape={isLandscape}
              />
            )}
          </AnimatePresence>

          {/* Debug Overlay */}
          <AnimatePresence>
            {showDebug && debugLog.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="absolute top-32 right-4 z-30"
              >
                <div className="bg-black/90 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-green-500/30 min-w-[220px]">
                  <div className="text-xs text-green-400 font-mono space-y-1 leading-tight">
                    {debugLog.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Countdown Overlay */}
          <AnimatePresence>
            {countdown !== null && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50"
              >
                <motion.div
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white text-9xl font-bold"
                >
                  {countdown}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Capture Progress */}
          <AnimatePresence>
            {capturing && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-32 left-0 right-0 z-60 flex justify-center"
              >
                <div className="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(captureProgress.total)].map((_, i) => (
                      <Circle
                        key={i}
                        className={`w-2 h-2 ${
                          i < captureProgress.current
                            ? 'text-white fill-white'
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

          {/* Bottom Controls - Portrait Mode */}
          <div className={`absolute bottom-0 left-0 right-0 z-20 pb-36 px-4 ${
            isLandscape ? 'hidden' : ''
          }`}>
            {/* Control Buttons Row */}
            <div className="flex items-center justify-center gap-2">
              {/* Format Button - Ganz links */}
              <HapticButton
                size="icon"
                variant="ghost"
                onClick={() => {
                  const formats: Array<'2:3' | '4:3' | '16:9'> = ['2:3', '4:3', '16:9'];
                  const currentIndex = formats.indexOf(aspectRatio);
                  const nextIndex = (currentIndex + 1) % formats.length;
                  setAspectRatio(formats[nextIndex]);
                  trigger('light');
                }}
                className="w-12 h-12 rounded-full backdrop-blur-md bg-white/20 text-white flex-shrink-0"
                data-testid="button-format-toggle"
              >
                <span className="text-xs font-bold">{aspectRatio}</span>
              </HapticButton>

              {/* Room Type Selector */}
              <Drawer>
                <DrawerTrigger asChild>
                  <button
                    onClick={() => trigger('light')}
                    className="w-12 h-12 rounded-full backdrop-blur-md bg-white/20 text-white flex flex-col items-center justify-center flex-shrink-0"
                    data-testid="button-select-roomtype"
                  >
                    <span className="text-[9px] opacity-60">#1</span>
                    <span className="text-[10px] font-semibold leading-tight">{currentRoomType.substring(0, 4)}</span>
                  </button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[85vh] bg-white">
                  <div className="mx-auto w-full max-w-md">
                    <DrawerHeader className="px-4 pt-4 pb-2 border-b border-gray-200 relative">
                      <DrawerTitle className="text-lg font-semibold">{t('camera.room_title')}</DrawerTitle>
                      <DrawerDescription className="text-sm text-gray-500">
                        {t('camera.room_types_available', { count: ALL_ROOM_TYPES.length })}
                      </DrawerDescription>
                      <DrawerClose asChild>
                        <button
                          onClick={() => trigger('light')}
                          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          data-testid="button-close-roomtype-drawer"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </DrawerClose>
                    </DrawerHeader>
                    <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
                      {Object.entries(getRoomsByGroup()).map(([group, rooms]) => {
                        if (rooms.length === 0) return null;
                        return (
                          <div key={group} className="py-2">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                              {GROUP_DISPLAY_NAMES[group as keyof typeof GROUP_DISPLAY_NAMES]}
                            </div>
                            <div className="divide-y divide-gray-100">
                              {rooms.map((room) => (
                                <button
                                  key={room}
                                  onClick={() => {
                                    setCurrentRoomType(room);
                                    trigger('success');
                                  }}
                                  className={`w-full text-left px-4 py-3 transition-colors ${
                                    currentRoomType === room
                                      ? 'bg-blue-50 text-blue-700 font-medium'
                                      : 'hover:bg-gray-50 text-gray-900'
                                  }`}
                                  data-testid={`roomtype-option-${room.replace(/\s+/g, '-').toLowerCase()}`}
                                >
                                  {room}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>

              {/* BIG CAPTURE BUTTON - Center */}
              <motion.button
                onClick={handleCapture}
                disabled={capturing || countdown !== null}
                whileTap={{ scale: (capturing || countdown !== null) ? 1 : 0.9 }}
                className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center flex-shrink-0 ${
                  (capturing || countdown !== null) ? 'opacity-50' : ''
                }`}
                data-testid="button-capture"
              >
                <div className="w-16 h-16 rounded-full bg-white" />
              </motion.button>

              {/* Grid Toggle */}
              <HapticButton
                size="icon"
                variant="ghost"
                onClick={() => {
                  setGridType(gridType === 'none' ? '3x3' : 'none');
                  trigger('light');
                }}
                className={`w-12 h-12 rounded-full backdrop-blur-md flex-shrink-0 ${
                  gridType !== 'none'
                    ? 'bg-white/30 text-white' 
                    : 'bg-white/20 text-white/60'
                }`}
                data-testid="button-toggle-grid"
              >
                <Grid3x3 className="w-5 h-5" />
              </HapticButton>

              {/* Histogram Button */}
              <HapticButton
                size="icon"
                variant="ghost"
                onClick={() => setShowHistogram(!showHistogram)}
                className={`w-12 h-12 rounded-full backdrop-blur-md flex-shrink-0 ${
                  showHistogram 
                    ? 'bg-white/30 text-white' 
                    : 'bg-white/20 text-white/60'
                }`}
                data-testid="button-toggle-histogram"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="12" width="4" height="9" />
                  <rect x="10" y="8" width="4" height="13" />
                  <rect x="17" y="4" width="4" height="17" />
                </svg>
              </HapticButton>

              {/* Timer Mode - Ganz rechts */}
              <HapticButton
                size="icon"
                variant="ghost"
                onClick={() => {
                  const modes: Array<0 | 3 | 10> = [0, 3, 10];
                  const currentIndex = modes.indexOf(timerMode);
                  const nextIndex = (currentIndex + 1) % modes.length;
                  setTimerMode(modes[nextIndex]);
                  trigger('light');
                }}
                className={`w-12 h-12 rounded-full backdrop-blur-md flex-shrink-0 ${
                  timerMode > 0
                    ? 'bg-white/30 text-white' 
                    : 'bg-white/20 text-white/60'
                }`}
                data-testid="button-toggle-timer"
              >
                {timerMode > 0 ? (
                  <span className="text-sm font-bold">{timerMode}s</span>
                ) : (
                  <Timer className="w-5 h-5" />
                )}
              </HapticButton>
            </div>
          </div>
        </>
      ) : (
        /* Start Camera Screen */
        <div className="absolute inset-0 flex items-center justify-center z-60 bg-black/90 px-6 pointer-events-none">
          <div className="text-center pointer-events-auto">
            {error ? (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-xl">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <p className="text-white text-sm">{error}</p>
                </div>
                {/* R8: Explicit Retry Button */}
                <HapticButton
                  onClick={() => {
                    setError('');
                    startCamera();
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  hapticStyle="medium"
                  data-testid="button-retry-camera"
                >
                  {t('camera.camera_retry')}
                </HapticButton>
              </div>
            ) : (
              <HapticButton
                onClick={() => startCamera()}
                className="w-full bg-white text-black px-8 py-4 font-bold rounded-xl text-lg"
                hapticStyle="medium"
                data-testid="button-start-camera"
              >
                <CameraIcon className="w-6 h-6 mr-3 inline" />
                {t('camera.start_camera')}
              </HapticButton>
            )}
          </div>
        </div>
      )}

      {/* Manual Mode Controls - Landscape Only, When Open */}
      {cameraStarted && isLandscape && isManualControlsOpen && (
        <ManualControls onClose={() => setIsManualControlsOpen(false)} />
      )}

      {/* BottomNav - Always Visible */}
      <BottomNav photoCount={photoCount} variant="dark" isLandscape={isLandscape} />
    </div>
  );
}
