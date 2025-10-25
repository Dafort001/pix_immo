import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera as CameraIcon, Layers, Circle, Info, SwitchCamera, Zap, Grid3x3, ZoomIn, ZoomOut, Timer } from 'lucide-react';
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
  const [exposureControl, setExposureControl] = useState<{
    type: 'exposureTime' | 'exposureCompensation' | 'iso' | 'none';
    baseValue: number;
    min: number;
    max: number;
  } | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(true);
  
  // New Camera Controls
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [timerMode, setTimerMode] = useState<0 | 3 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trigger } = useHaptic();

  const log = (msg: string) => {
    console.log(msg);
    setDebugLog(prev => [...prev.slice(-5), msg]);
  };

  const startCamera = async (newFacingMode?: 'environment' | 'user') => {
    try {
      trigger('medium');
      setError('');
      setDebugLog([]);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (!navigator.mediaDevices) {
        throw new Error('Camera API not available');
      }

      const targetFacingMode = newFacingMode || facingMode;
      log(`🔍 ${targetFacingMode === 'environment' ? 'Back' : 'Front'} Camera`);

      // Request with manual exposure mode
      const constraints: any = {
        video: {
          facingMode: targetFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          // Try to request manual mode upfront
          exposureMode: 'manual',
          focusMode: 'manual',
          whiteBalanceMode: 'manual'
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTrack = mediaStream.getVideoTracks()[0];
      
      // Get ALL capabilities
      const capabilities: any = videoTrack.getCapabilities();
      const settings: any = videoTrack.getSettings();
      
      // Detect Zoom Capability
      if (capabilities.zoom) {
        setMaxZoom(capabilities.zoom.max || 1);
        setZoom(1);
        log(`🔍 Zoom: 1.0× - ${capabilities.zoom.max.toFixed(1)}×`);
      } else {
        setMaxZoom(1);
        setZoom(1);
        log('⚠️ Zoom not available');
      }
      
      log('📸 Checking ALL controls...');
      
      // Try to enable manual mode FIRST
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

      // Re-check capabilities after manual mode
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
        log(`   Range: ${updatedCaps.exposureTime.min}-${updatedCaps.exposureTime.max}ms`);
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
        log(`   Range: ${updatedCaps.exposureCompensation.min} to ${updatedCaps.exposureCompensation.max}`);
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
        log(`   Range: ${updatedCaps.iso.min}-${updatedCaps.iso.max}`);
      }
      else {
        log('❌ NO exposure controls!');
        log('Software HDR only');
        setError('Software-HDR Modus (keine Hardware-Kontrolle)');
      }

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

  // Camera Flip Handler
  const handleFlipCamera = async () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);
    setCameraStarted(false);
    await startCamera(newFacingMode);
    trigger('medium');
  };

  // Flash Toggle Handler
  const handleToggleFlash = async () => {
    if (!streamRef.current) return;
    
    const videoTrack = streamRef.current.getVideoTracks()[0];
    const capabilities: any = videoTrack.getCapabilities();
    
    if (capabilities.torch) {
      try {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !flashEnabled } as any]
        });
        setFlashEnabled(!flashEnabled);
        trigger('light');
        log(flashEnabled ? '💡 Flash OFF' : '⚡ Flash ON');
      } catch (e) {
        log('⚠️ Flash not available');
      }
    } else {
      log('⚠️ Flash not supported');
    }
  };

  // Zoom Handler
  const handleZoomChange = async (newZoom: number) => {
    if (!streamRef.current || maxZoom === 1) return;
    
    const videoTrack = streamRef.current.getVideoTracks()[0];
    const clampedZoom = Math.max(1, Math.min(maxZoom, newZoom));
    
    try {
      await videoTrack.applyConstraints({
        advanced: [{ zoom: clampedZoom } as any]
      });
      setZoom(clampedZoom);
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

    // Try hardware control
    const hwSuccess = await setExposure(exposureValue);
    
    if (hwSuccess) {
      // Wait for camera to adjust
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

    // If hardware failed, use software
    if (!hwSuccess && evStops !== 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const adjusted = applySoftwareExposure(imageData, evStops);
      ctx.putImageData(adjusted, 0, 0);
      log(`💻 Software: ${evStops} EV`);
    }

    return canvas.toDataURL('image/jpeg', 0.90);
  };

  const handleCapture = async () => {
    // Prevent concurrent captures or countdowns
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
            // Exposure time: 1/4, 1x, 4x
            exposureValues = [
              exposureControl.baseValue / 4,
              exposureControl.baseValue,
              exposureControl.baseValue * 4
            ];
          } else if (exposureControl.type === 'exposureCompensation') {
            // Compensation: -2, 0, +2
            exposureValues = [-2, 0, 2];
          } else if (exposureControl.type === 'iso') {
            // ISO: 1/4, 1x, 4x
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
            evCompensation: evStops[i]
          });

          if (i < evStops.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        // Reset to base
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
              height: canvas.height
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
                {/* Flash Toggle */}
                <HapticButton
                  size="icon"
                  variant="ghost"
                  onClick={handleToggleFlash}
                  className={`backdrop-blur-md rounded-full ${
                    flashEnabled 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-white/20 text-white'
                  }`}
                  data-testid="button-toggle-flash"
                >
                  <Zap className={`w-5 h-5 ${flashEnabled ? 'fill-current' : ''}`} />
                </HapticButton>
                
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
                      ? 'bg-blue-500 text-white' 
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
                      ? 'bg-orange-500 text-white' 
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
                <HapticButton
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowDebug(!showDebug)}
                  className="bg-white/20 backdrop-blur-md text-white rounded-full"
                >
                  <Info className="w-5 h-5" />
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
          </div>

          {/* Grid Overlay */}
          {gridEnabled && (
            <div className="absolute inset-0 pointer-events-none z-40">
              <svg className="w-full h-full">
                {/* Vertical Lines */}
                <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="white" strokeWidth="1" opacity="0.5" />
                <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="white" strokeWidth="1" opacity="0.5" />
                {/* Horizontal Lines */}
                <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="white" strokeWidth="1" opacity="0.5" />
                <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="white" strokeWidth="1" opacity="0.5" />
              </svg>
            </div>
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
                      <div key={i}>
                        {log}
                      </div>
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

          {/* Bottom Controls */}
          <div className="absolute bottom-24 left-0 right-0 z-50">
            <div className="flex items-center justify-between px-8">
              {/* Zoom Out */}
              {maxZoom > 1 && (
                <HapticButton
                  size="icon"
                  variant="ghost"
                  onClick={() => handleZoomChange(Math.max(1, zoom - 0.5))}
                  disabled={zoom <= 1}
                  className="bg-white/20 backdrop-blur-md text-white rounded-full"
                  data-testid="button-zoom-out"
                >
                  <ZoomOut className="w-6 h-6" />
                </HapticButton>
              )}
              
              {/* Spacer wenn kein Zoom */}
              {maxZoom === 1 && <div className="w-12" />}
              
              {/* Capture Button */}
              <motion.button
                onClick={handleCapture}
                disabled={capturing || countdown !== null}
                whileTap={{ scale: (capturing || countdown !== null) ? 1 : 0.9 }}
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${
                  hdrEnabled
                    ? 'border-yellow-500'
                    : 'border-white'
                } ${(capturing || countdown !== null) ? 'opacity-50' : ''}`}
                data-testid="button-capture-photo"
              >
                <div className={`w-16 h-16 rounded-full ${
                  hdrEnabled
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                    : 'bg-white'
                }`} />
              </motion.button>
              
              {/* Zoom In */}
              {maxZoom > 1 && (
                <HapticButton
                  size="icon"
                  variant="ghost"
                  onClick={() => handleZoomChange(Math.min(maxZoom, zoom + 0.5))}
                  disabled={zoom >= maxZoom}
                  className="bg-white/20 backdrop-blur-md text-white rounded-full"
                  data-testid="button-zoom-in"
                >
                  <ZoomIn className="w-6 h-6" />
                </HapticButton>
              )}
              
              {/* Spacer wenn kein Zoom */}
              {maxZoom === 1 && <div className="w-12" />}
            </div>
            
            {/* Zoom Level Indicator */}
            {maxZoom > 1 && zoom > 1 && (
              <div className="flex justify-center mt-3">
                <div className="bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {zoom.toFixed(1)}×
                </div>
              </div>
            )}
          </div>
          
          {/* Camera Flip Button */}
          <div className="absolute bottom-32 right-8 z-50">
            <HapticButton
              size="icon"
              variant="ghost"
              onClick={handleFlipCamera}
              className="bg-white/20 backdrop-blur-md text-white rounded-full w-12 h-12"
              data-testid="button-flip-camera"
            >
              <SwitchCamera className="w-6 h-6" />
            </HapticButton>
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
