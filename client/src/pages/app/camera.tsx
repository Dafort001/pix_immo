import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera as CameraIcon, Layers, Circle, Info, Grid3x3, Timer, Home, ChevronRight } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { StatusBar } from '@/components/mobile/StatusBar';
import { BottomNav } from '@/components/mobile/BottomNav';
import { Histogram } from '@/components/mobile/Histogram';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from '@/components/ui/drawer';
import { useHaptic } from '@/hooks/useHaptic';
import { useLocation } from 'wouter';
import { ALL_ROOM_TYPES, DEFAULT_ROOM_TYPE, type RoomType } from '@shared/room-types';

export default function CameraScreen() {
  const [, setLocation] = useLocation();
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
  
  // Camera Controls
  const [gridEnabled, setGridEnabled] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [timerMode, setTimerMode] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentRoomType, setCurrentRoomType] = useState<RoomType>(DEFAULT_ROOM_TYPE);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trigger } = useHaptic();

  const log = (msg: string) => {
    console.log(msg);
    setDebugLog(prev => [...prev.slice(-5), msg]);
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

      const constraints: any = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          exposureMode: 'manual',
          focusMode: 'manual',
          whiteBalanceMode: 'manual'
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTrack = mediaStream.getVideoTracks()[0];
      
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
        setError('Software-HDR Modus (keine Hardware-Kontrolle)');
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

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

    return canvas.toDataURL('image/jpeg', 0.90);
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
            roomType: currentRoomType
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
            const imageData = canvas.toDataURL('image/jpeg', 0.90);
            
            photos.push({
              id: Date.now(),
              timestamp: new Date().toISOString(),
              imageData: imageData,
              width: canvas.width,
              height: canvas.height,
              roomType: currentRoomType
            });
            
            log('✅ Photo saved');
          }
        }
      }

      sessionStorage.setItem('appPhotos', JSON.stringify(photos));
      trigger('success');
      
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

      {/* Status Bar */}
      <StatusBar variant="light" />

      {/* VIDEO - 2:3 Aspect Ratio Portrait */}
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <div className="relative w-full" style={{ aspectRatio: '2/3', maxHeight: '100%' }}>
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

      {/* CONTROLS */}
      {cameraStarted ? (
        <>
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-50 pt-14 px-4 pb-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center justify-between">
              {/* HDR Toggle - Sage Color */}
              <HapticButton
                onClick={() => {
                  setHdrEnabled(!hdrEnabled);
                  trigger('light');
                }}
                className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                  hdrEnabled 
                    ? 'text-white' 
                    : 'bg-white/20 backdrop-blur-md text-white'
                }`}
                style={hdrEnabled ? { backgroundColor: '#4A5849' } : {}}
                data-testid="button-toggle-hdr"
              >
                <Layers className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-semibold">
                  {hdrEnabled ? 'HDR' : 'Normal'}
                </span>
                {exposureControl && hdrEnabled && (
                  <span className="text-xs opacity-75">
                    {exposureControl.type === 'exposureTime' 
                      ? `${exposureControl.baseValue.toFixed(0)}ms`
                      : exposureControl.type === 'exposureCompensation'
                      ? `${exposureControl.baseValue} EV`
                      : `ISO${exposureControl.baseValue.toFixed(0)}`
                    }
                  </span>
                )}
              </HapticButton>

              <div className="flex items-center gap-2">
                {/* Grid Toggle */}
                <HapticButton
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setGridEnabled(!gridEnabled);
                    trigger('light');
                  }}
                  className={`backdrop-blur-md rounded-full ${
                    gridEnabled 
                      ? 'bg-white/30 text-white' 
                      : 'bg-white/20 text-white'
                  }`}
                  data-testid="button-toggle-grid"
                >
                  <Grid3x3 className="w-5 h-5" />
                </HapticButton>
                
                {/* Timer Toggle */}
                <HapticButton
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    const modes: (0 | 3 | 10)[] = [0, 3, 10];
                    const currentIndex = modes.indexOf(timerMode);
                    const nextIndex = (currentIndex + 1) % modes.length;
                    setTimerMode(modes[nextIndex]);
                    trigger('light');
                  }}
                  className={`backdrop-blur-md rounded-full ${
                    timerMode > 0 
                      ? 'bg-white/30 text-white' 
                      : 'bg-white/20 text-white'
                  }`}
                  data-testid="button-toggle-timer"
                >
                  <div className="relative">
                    <Timer className="w-5 h-5" />
                    {timerMode > 0 && (
                      <div className="absolute -bottom-1 -right-1 bg-black rounded-full w-3 h-3 flex items-center justify-center">
                        <span className="text-[8px] font-bold">{timerMode}</span>
                      </div>
                    )}
                  </div>
                </HapticButton>
                
                {/* Debug Toggle */}
                {showDebug && (
                  <HapticButton
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowDebug(!showDebug)}
                    className="bg-white/20 backdrop-blur-md text-white rounded-full"
                  >
                    <Info className="w-5 h-5" />
                  </HapticButton>
                )}
                
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
          </div>

          {/* Grid Overlay */}
          {gridEnabled && (
            <div className="absolute inset-0 pointer-events-none z-40">
              <svg className="w-full h-full">
                <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="white" strokeWidth="1" opacity="0.5" />
                <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="white" strokeWidth="1" opacity="0.5" />
                <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="white" strokeWidth="1" opacity="0.5" />
                <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="white" strokeWidth="1" opacity="0.5" />
              </svg>
            </div>
          )}

          {/* Histogram - Kleiner, unten, wegklickbar */}
          {showHistogram && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-40 left-4 z-50"
            >
              <div className="bg-black/90 backdrop-blur-md rounded-lg p-2 border border-white/20 relative">
                <button
                  onClick={() => setShowHistogram(false)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-white text-xs hover:bg-white/30"
                  data-testid="button-close-histogram"
                >
                  <X className="w-3 h-3" />
                </button>
                <Histogram 
                  videoElement={videoRef.current} 
                  width={140}
                  height={40}
                />
              </div>
            </motion.div>
          )}

          {/* Debug Overlay */}
          <AnimatePresence>
            {showDebug && debugLog.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="absolute top-32 right-4 z-50"
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
                className="absolute top-32 left-0 right-0 z-50 flex justify-center"
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

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-50 pb-28 px-4">
            {/* Zoom Buttons - Wie im Figma */}
            <div className="mb-4 flex justify-center gap-2">
              {[0.5, 1, 1.5, 2].map((zoomLevel) => (
                <button
                  key={zoomLevel}
                  onClick={() => handleZoomChange(zoomLevel)}
                  className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                    zoom === zoomLevel
                      ? 'text-white'
                      : 'bg-white/20 backdrop-blur-md text-white/70'
                  }`}
                  style={zoom === zoomLevel ? { backgroundColor: '#4A5849' } : {}}
                  data-testid={`button-zoom-${zoomLevel}x`}
                >
                  {zoomLevel}×
                </button>
              ))}
            </div>
            
            {/* Capture & Room Type Row */}
            <div className="flex items-center justify-between">
              {/* Room Type Button */}
              <Drawer>
                <DrawerTrigger asChild>
                  <HapticButton
                    hapticStyle="medium"
                    className="bg-white/20 backdrop-blur-md text-white rounded-full px-4 py-3 flex items-center gap-2"
                    data-testid="button-select-roomtype"
                  >
                    <Home className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-semibold">
                      {currentRoomType}
                    </span>
                  </HapticButton>
                </DrawerTrigger>
                <DrawerContent className="max-h-[80vh]">
                  <div className="mx-auto w-full max-w-md p-4">
                    <DrawerHeader className="p-0 mb-4">
                      <DrawerTitle>Raumtyp auswählen</DrawerTitle>
                      <DrawerDescription>
                        Wähle den Raum für die nächsten Aufnahmen ({ALL_ROOM_TYPES.length} verfügbar)
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="space-y-2 overflow-y-scroll pr-2" style={{ maxHeight: '50vh' }}>
                      {ALL_ROOM_TYPES.map((room) => (
                        <button
                          key={room}
                          onClick={() => {
                            setCurrentRoomType(room);
                            trigger('success');
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                            currentRoomType === room
                              ? 'bg-gray-200 font-semibold'
                              : 'hover:bg-gray-100'
                          }`}
                          data-testid={`roomtype-option-${room.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                          <span style={{ fontSize: '16px' }}>{room}</span>
                          {currentRoomType === room && (
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4A5849' }} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
              
              {/* Capture Button - Sage Border */}
              <motion.button
                onClick={handleCapture}
                disabled={capturing || countdown !== null}
                whileTap={{ scale: (capturing || countdown !== null) ? 1 : 0.9 }}
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${
                  (capturing || countdown !== null) ? 'opacity-50' : ''
                }`}
                style={{ borderColor: hdrEnabled ? '#4A5849' : 'white' }}
                data-testid="button-capture-photo"
              >
                <div 
                  className="w-16 h-16 rounded-full"
                  style={{ backgroundColor: hdrEnabled ? '#4A5849' : 'white' }}
                />
              </motion.button>
              
              {/* Spacer for symmetry */}
              <div className="w-[100px]" />
            </div>
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
              onClick={() => startCamera()}
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
