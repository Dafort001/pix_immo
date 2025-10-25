# Camera API Integration - Technical Reference

Detaillierte Dokumentation der MediaDevices API Integration in der Mobile PWA.

---

## 📷 MediaDevices API Overview

### Browser Support

**Unterstützte Browser:**
- ✅ iOS Safari 14.3+ (HTTPS erforderlich)
- ✅ Chrome Mobile 90+
- ✅ Edge Mobile 90+
- ✅ Samsung Internet 15+
- ❌ Firefox Mobile (eingeschränkt)

**Feature Detection:**
```typescript
const checkCameraSupport = () => {
  return {
    supported: !!(navigator.mediaDevices?.getUserMedia),
    httpsRequired: location.protocol !== 'https:' && location.hostname !== 'localhost',
    facingMode: MediaDevices.getSupportedConstraints().facingMode,
    exposureCompensation: MediaDevices.getSupportedConstraints().exposureCompensation
  };
};
```

---

## 🎥 Camera Initialization

### Basic Setup

```typescript
// hooks/useCamera.ts
import { useRef, useState, useEffect } from 'react';

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const startCamera = async (facingMode: 'user' | 'environment' = 'environment') => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 4032 },
          height: { ideal: 3024 },
          aspectRatio: { ideal: 4/3 }
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = mediaStream;
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setError(null);
    } catch (err) {
      handleCameraError(err);
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  return {
    stream,
    videoRef,
    error,
    startCamera,
    stopCamera
  };
}
```

---

## 📸 Photo Capture

### High-Resolution Capture

```typescript
const capturePhoto = async (
  videoElement: HTMLVideoElement,
  quality: number = 0.95
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      
      // Use actual video dimensions (high-res)
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      // Draw current frame
      ctx.drawImage(videoElement, 0, 0);
      
      // Convert to JPEG Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        quality
      );
    } catch (error) {
      reject(error);
    }
  });
};
```

### EXIF Data Handling

```typescript
import ExifReader from 'exifreader';

const addExifData = async (blob: Blob, metadata: any): Promise<Blob> => {
  const arrayBuffer = await blob.arrayBuffer();
  const tags = ExifReader.load(arrayBuffer);
  
  // Add custom EXIF tags
  const exifData = {
    ...tags,
    Make: 'pix.immo',
    Model: 'Web Camera',
    DateTime: new Date().toISOString(),
    Orientation: metadata.orientation || 1,
    GPSLatitude: metadata.latitude,
    GPSLongitude: metadata.longitude
  };
  
  // Note: Writing EXIF requires additional library (piexifjs)
  return blob; // Simplified - implement full EXIF writing if needed
};
```

---

## 🔄 Camera Flip (Front/Back)

### Implementation

```typescript
const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

const flipCamera = async () => {
  // Stop current stream
  stopCamera();
  
  // Start with opposite camera
  const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
  setFacingMode(newFacingMode);
  
  await startCamera(newFacingMode);
};
```

**UI Component:**
```typescript
<HapticButton
  size="icon"
  variant="ghost"
  onClick={flipCamera}
  data-testid="button-flip-camera"
  hapticType="medium"
>
  <FlipHorizontal className="w-6 h-6" />
</HapticButton>
```

---

## 🎛️ Advanced Camera Controls

### Zoom

```typescript
const [zoom, setZoom] = useState(1);

const applyZoom = async (zoomLevel: number) => {
  if (!streamRef.current) return;
  
  const track = streamRef.current.getVideoTracks()[0];
  const capabilities = track.getCapabilities();
  
  if ('zoom' in capabilities) {
    const { min, max } = capabilities.zoom as { min: number; max: number };
    const clampedZoom = Math.max(min, Math.min(max, zoomLevel));
    
    await track.applyConstraints({
      advanced: [{ zoom: clampedZoom }]
    });
    
    setZoom(clampedZoom);
  }
};
```

**UI Slider:**
```typescript
<Slider
  min={1}
  max={5}
  step={0.1}
  value={[zoom]}
  onValueChange={([value]) => applyZoom(value)}
  className="w-32"
/>
```

### Flash/Torch

```typescript
const [torchEnabled, setTorchEnabled] = useState(false);

const toggleTorch = async () => {
  if (!streamRef.current) return;
  
  const track = streamRef.current.getVideoTracks()[0];
  const capabilities = track.getCapabilities();
  
  if ('torch' in capabilities) {
    await track.applyConstraints({
      advanced: [{ torch: !torchEnabled }]
    });
    
    setTorchEnabled(!torchEnabled);
  }
};
```

### Exposure Compensation

```typescript
const adjustExposure = async (ev: number) => {
  if (!streamRef.current) return;
  
  const track = streamRef.current.getVideoTracks()[0];
  const capabilities = track.getCapabilities();
  
  if ('exposureCompensation' in capabilities) {
    const { min, max } = capabilities.exposureCompensation as { min: number; max: number };
    const clampedEV = Math.max(min, Math.min(max, ev));
    
    await track.applyConstraints({
      advanced: [{ exposureCompensation: clampedEV }]
    });
  }
};
```

---

## 📊 Camera Capabilities

### Query Available Features

```typescript
const getCameraCapabilities = (stream: MediaStream) => {
  const track = stream.getVideoTracks()[0];
  const capabilities = track.getCapabilities();
  const settings = track.getSettings();
  
  return {
    // Resolution
    maxWidth: capabilities.width?.max || 0,
    maxHeight: capabilities.height?.max || 0,
    currentWidth: settings.width || 0,
    currentHeight: settings.height || 0,
    
    // Features
    hasZoom: 'zoom' in capabilities,
    hasTorch: 'torch' in capabilities,
    hasExposureCompensation: 'exposureCompensation' in capabilities,
    hasFocusDistance: 'focusDistance' in capabilities,
    
    // Zoom range
    zoomMin: capabilities.zoom?.min || 1,
    zoomMax: capabilities.zoom?.max || 1,
    
    // Exposure range
    exposureMin: capabilities.exposureCompensation?.min || 0,
    exposureMax: capabilities.exposureCompensation?.max || 0,
    
    // Device info
    facingMode: settings.facingMode,
    deviceId: settings.deviceId,
    groupId: settings.groupId
  };
};
```

---

## 🔍 Focus & Exposure Lock

### Tap-to-Focus

```typescript
const handleTapToFocus = async (
  event: React.TouchEvent,
  videoElement: HTMLVideoElement
) => {
  const rect = videoElement.getBoundingClientRect();
  const x = (event.touches[0].clientX - rect.left) / rect.width;
  const y = (event.touches[0].clientY - rect.top) / rect.height;
  
  if (!streamRef.current) return;
  
  const track = streamRef.current.getVideoTracks()[0];
  const capabilities = track.getCapabilities();
  
  if ('focusMode' in capabilities && 'pointsOfInterest' in capabilities) {
    await track.applyConstraints({
      advanced: [{
        focusMode: 'manual',
        pointsOfInterest: [{ x, y }]
      }]
    });
    
    // Show focus indicator
    showFocusIndicator(x * rect.width, y * rect.height);
  }
};
```

---

## 🎞️ HDR Bracketing

### Capture Multiple Exposures

```typescript
const captureHDRBracket = async (
  videoElement: HTMLVideoElement,
  evSteps: number[] = [-2, 0, 2]
): Promise<Blob[]> => {
  if (!streamRef.current) throw new Error('No camera stream');
  
  const track = streamRef.current.getVideoTracks()[0];
  const capabilities = track.getCapabilities();
  
  if (!('exposureCompensation' in capabilities)) {
    throw new Error('Exposure compensation not supported');
  }
  
  const bracket: Blob[] = [];
  
  for (const ev of evSteps) {
    // Apply exposure compensation
    await track.applyConstraints({
      advanced: [{ exposureCompensation: ev }]
    });
    
    // Wait for exposure to settle
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Capture frame
    const blob = await capturePhoto(videoElement, 0.98);
    bracket.push(blob);
  }
  
  // Reset to default exposure
  await track.applyConstraints({
    advanced: [{ exposureCompensation: 0 }]
  });
  
  return bracket;
};
```

---

## 🖼️ Image Processing

### Thumbnail Generation

```typescript
const generateThumbnail = async (
  blob: Blob,
  maxSize: number = 200
): Promise<Blob> => {
  const img = await createImageBitmap(blob);
  
  // Calculate scaled dimensions
  const scale = Math.min(maxSize / img.width, maxSize / img.height);
  const width = Math.floor(img.width * scale);
  const height = Math.floor(img.height * scale);
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);
  
  return new Promise(resolve => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/jpeg',
      0.7  // Lower quality for thumbnails
    );
  });
};
```

### Image Compression

```typescript
const compressImage = async (
  blob: Blob,
  maxSizeMB: number = 5
): Promise<Blob> => {
  let quality = 0.9;
  let compressed = blob;
  
  while (compressed.size > maxSizeMB * 1024 * 1024 && quality > 0.3) {
    const img = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    compressed = await new Promise(resolve => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/jpeg',
        quality
      );
    });
    
    quality -= 0.1;
  }
  
  return compressed;
};
```

---

## ⚠️ Error Handling

### Permission Errors

```typescript
const handleCameraError = (error: any) => {
  console.error('Camera error:', error);
  
  switch (error.name) {
    case 'NotAllowedError':
      setError('Camera permission denied. Please allow camera access.');
      break;
      
    case 'NotFoundError':
      setError('No camera found on this device.');
      break;
      
    case 'NotReadableError':
      setError('Camera is already in use by another application.');
      break;
      
    case 'OverconstrainedError':
      setError('Camera does not support requested resolution.');
      break;
      
    case 'SecurityError':
      setError('Camera access requires HTTPS.');
      break;
      
    default:
      setError(`Camera error: ${error.message}`);
  }
};
```

### Fallback UI

```typescript
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}

{error && error.includes('permission') && (
  <Button onClick={() => window.open('app-settings:')}>
    Open Settings
  </Button>
)}
```

---

## 🧪 Testing

### Mock MediaDevices

```typescript
// __tests__/mocks/mediaDevices.ts
export const mockMediaStream = {
  getTracks: jest.fn(() => [mockVideoTrack]),
  getVideoTracks: jest.fn(() => [mockVideoTrack])
};

export const mockVideoTrack = {
  stop: jest.fn(),
  getCapabilities: jest.fn(() => ({
    facingMode: ['user', 'environment'],
    zoom: { min: 1, max: 5 },
    torch: true
  })),
  getSettings: jest.fn(() => ({
    width: 1920,
    height: 1080,
    facingMode: 'environment'
  })),
  applyConstraints: jest.fn()
};

global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue(mockMediaStream),
  getSupportedConstraints: jest.fn(() => ({
    facingMode: true,
    zoom: true,
    torch: true
  }))
} as any;
```

---

## 📱 iOS-Specific Considerations

### 1. HTTPS Requirement

```typescript
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  throw new Error('Camera requires HTTPS on iOS');
}
```

### 2. Video Autoplay

```html
<!-- iOS requires playsinline -->
<video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  className="camera-preview"
/>
```

### 3. Orientation Lock

```typescript
if ('screen' in window && 'orientation' in window.screen) {
  try {
    await (window.screen.orientation as any).lock('portrait');
  } catch (error) {
    console.log('Orientation lock not supported');
  }
}
```

---

## 📚 References

**Official Documentation:**
- [MDN - MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [W3C Media Capture Spec](https://www.w3.org/TR/mediacapture-streams/)
- [iOS Safari Feature Support](https://webkit.org/blog/)

**Libraries:**
- [exifreader](https://github.com/mattiasw/ExifReader) - EXIF data parsing
- [piexifjs](https://github.com/hMatoba/piexifjs) - EXIF writing
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)

---

**Status:** ✅ Complete API Reference  
**Version:** 1.0.0  
**Last Updated:** Oktober 2025
