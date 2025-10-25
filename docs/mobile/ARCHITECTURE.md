# Mobile PWA - Architecture & Design Patterns

## iOS-Inspired Design System

Die Mobile App folgt iOS Design Guidelines für eine native App-Erfahrung im Browser.

---

## 🎨 Design Patterns

### 1. StatusBar Component

**Zweck:** iOS-Style Statusleiste mit Notch-Support

**Implementation:**
```typescript
// components/mobile/StatusBar.tsx
export function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="status-bar safe-area-top">
      <div className="status-left">
        <span className="time">{time}</span>
      </div>
      <div className="status-center">
        <div className="notch" />
      </div>
      <div className="status-right">
        <BatteryIcon />
        <SignalIcon />
      </div>
    </div>
  );
}
```

**Safe-Area CSS:**
```css
.safe-area-top {
  padding-top: max(20px, env(safe-area-inset-top));
}

.safe-area-bottom {
  padding-bottom: max(20px, env(safe-area-inset-bottom));
}
```

---

### 2. HapticButton Component

**Zweck:** Touch-Feedback via Vibration API

**Implementation:**
```typescript
// components/mobile/HapticButton.tsx
import { useHaptic } from '@/hooks/useHaptic';

interface HapticButtonProps extends ButtonProps {
  hapticType?: 'light' | 'medium' | 'heavy';
}

export function HapticButton({ 
  hapticType = 'light',
  onClick,
  ...props 
}: HapticButtonProps) {
  const { vibrate } = useHaptic();
  
  const handleClick = (e: React.MouseEvent) => {
    vibrate(hapticType);
    onClick?.(e);
  };

  return (
    <Button 
      {...props} 
      onClick={handleClick}
      className="touch-none"
    />
  );
}
```

**Vibration Patterns:**
```typescript
// hooks/useHaptic.ts
const HAPTIC_PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10],
  error: [50, 100, 50]
};

export function useHaptic() {
  const vibrate = (type: keyof typeof HAPTIC_PATTERNS) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(HAPTIC_PATTERNS[type]);
    }
  };
  
  return { vibrate };
}
```

---

### 3. BottomNav Component

**Zweck:** iOS-Style Tab-Navigation

**Implementation:**
```typescript
// components/mobile/BottomNav.tsx
const NAV_ITEMS = [
  { icon: Camera, label: 'Camera', path: '/app/camera' },
  { icon: Image, label: 'Gallery', path: '/app/gallery' },
  { icon: Upload, label: 'Upload', path: '/app/upload' }
];

export function BottomNav() {
  const [location] = useLocation();
  
  return (
    <nav className="bottom-nav safe-area-bottom">
      {NAV_ITEMS.map(item => (
        <Link 
          key={item.path}
          href={item.path}
          className={cn(
            'nav-item',
            location === item.path && 'active'
          )}
        >
          <item.icon className="nav-icon" />
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
```

**CSS:**
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-item {
  flex: 1;
  padding: 8px;
  text-align: center;
  transition: opacity 0.2s;
}

.nav-item.active {
  color: var(--primary);
}
```

---

## 📱 Screen Architecture

### Workflow-Struktur

```
┌─────────────────────┐
│   SplashScreen      │ → /app
│   (Landing)         │
└──────────┬──────────┘
           │
           ├─→ CameraScreen (/app/camera)
           │   ├─ MediaDevices API
           │   ├─ Photo Capture
           │   └─ Front/Back Flip
           │
           ├─→ GalleryScreen (/app/gallery)
           │   ├─ Thumbnail Grid
           │   ├─ Photo Review
           │   └─ Delete/Select
           │
           └─→ UploadScreen (/app/upload)
               ├─ Progress Tracking
               ├─ R2 Upload
               └─ Error Recovery
```

### State Management

**SessionStorage für Photo Persistence:**
```typescript
// utils/photoStorage.ts
export const PhotoStorage = {
  save: (photos: string[]) => {
    sessionStorage.setItem('photos', JSON.stringify(photos));
  },
  
  load: (): string[] => {
    const data = sessionStorage.getItem('photos');
    return data ? JSON.parse(data) : [];
  },
  
  clear: () => {
    sessionStorage.removeItem('photos');
  }
};
```

**Warum SessionStorage?**
- ✅ Überlebt Page-Reloads
- ✅ Automatisches Cleanup bei Browser-Close
- ✅ Max. 5-10 MB (ausreichend für 50 Thumbnails)
- ❌ Nicht für große RAW-Dateien geeignet

---

## 🎥 Camera Integration

### MediaDevices API

**Browser Support:**
```typescript
const isCameraSupported = () => {
  return !!(
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia
  );
};
```

**Permission Handling:**
```typescript
const requestCameraPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    
    // Success! Camera available
    return stream;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // User denied permission
      showPermissionDialog();
    } else if (error.name === 'NotFoundError') {
      // No camera found
      showNoCameraError();
    }
    throw error;
  }
};
```

### High-Resolution Capture

**Constraints:**
```typescript
const HD_CONSTRAINTS = {
  video: {
    facingMode: 'environment',
    width: { ideal: 4032 },   // 12MP
    height: { ideal: 3024 },
    aspectRatio: { ideal: 4/3 }
  },
  audio: false
};

const stream = await navigator.mediaDevices.getUserMedia(HD_CONSTRAINTS);
```

**Capture Implementation:**
```typescript
const capturePhoto = (videoElement: HTMLVideoElement): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(videoElement, 0, 0);
    
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/jpeg',
      0.95  // 95% quality
    );
  });
};
```

### Camera Cleanup Pattern

**Problem:** MediaStream muss gestoppt werden, sonst bleibt Kamera aktiv

**Lösung:**
```typescript
// pages/app/camera.tsx
export default function CameraPage() {
  const streamRef = useRef<MediaStream | null>(null);
  
  useEffect(() => {
    startCamera();
    
    // Cleanup on unmount OR navigation
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);
  
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streamRef.current = stream;
    videoRef.current!.srcObject = stream;
  };
}
```

**Wichtig:** `useRef` statt `useState` für MediaStream, da State-Updates Race-Conditions verursachen können.

---

## 🔋 Performance Optimizations

### 1. Lazy Loading

**Komponenten erst bei Bedarf laden:**
```typescript
const CameraScreen = lazy(() => import('./pages/app/camera'));
const GalleryScreen = lazy(() => import('./pages/app/gallery'));

<Suspense fallback={<LoadingSpinner />}>
  <Route path="/app/camera" component={CameraScreen} />
</Suspense>
```

### 2. Image Compression

**Thumbnails für Gallery:**
```typescript
const createThumbnail = async (blob: Blob): Promise<Blob> => {
  const img = await createImageBitmap(blob);
  
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 150;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, 200, 150);
  
  return new Promise(resolve => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/jpeg',
      0.7  // 70% quality für Thumbnails
    );
  });
};
```

### 3. Battery Optimization

**Camera Stream pausieren wenn App im Hintergrund:**
```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Pause camera
      streamRef.current?.getTracks().forEach(track => {
        track.enabled = false;
      });
    } else {
      // Resume camera
      streamRef.current?.getTracks().forEach(track => {
        track.enabled = true;
      });
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
```

---

## 🌐 PWA Configuration

### Manifest.json

```json
{
  "name": "pix.immo Camera",
  "short_name": "pix.immo",
  "description": "Professional Real Estate Photography",
  "start_url": "/app",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "permissions": ["camera", "storage"],
  "categories": ["photography", "productivity"]
}
```

### Service Worker

**Offline-First Strategy:**
```javascript
// public/sw.js
const CACHE_NAME = 'pix-immo-v1';
const STATIC_ASSETS = [
  '/app',
  '/app/camera',
  '/app/gallery',
  '/app/upload',
  '/styles/main.css',
  '/scripts/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Cache-First für Static Assets
  if (event.request.url.match(/\.(css|js|png|jpg)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
  
  // Network-First für API Calls
  else if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});
```

---

## 📊 Data Flow Architecture

```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       │
       ├─→ Camera Page
       │   ├─ MediaDevices.getUserMedia()
       │   ├─ Capture Photo (Blob)
       │   └─ Save to SessionStorage (Base64)
       │
       ├─→ Gallery Page
       │   ├─ Load from SessionStorage
       │   ├─ Display Thumbnails
       │   └─ Delete/Select Photos
       │
       └─→ Upload Page
           ├─ POST /api/ios/upload/init
           ├─ GET Presigned URL
           ├─ PUT to R2 (Direct Upload)
           ├─ POST /api/ios/upload/confirm
           └─ Clear SessionStorage
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// __tests__/useCamera.test.ts
describe('useCamera', () => {
  it('should request camera permission', async () => {
    const mockGetUserMedia = jest.fn().mockResolvedValue(mockStream);
    global.navigator.mediaDevices.getUserMedia = mockGetUserMedia;
    
    const { result } = renderHook(() => useCamera());
    await act(() => result.current.startCamera());
    
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: { facingMode: 'environment' },
      audio: false
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/mobile-workflow.spec.ts
test('complete photo workflow', async ({ page, context }) => {
  await context.grantPermissions(['camera']);
  
  // 1. Navigate to camera
  await page.goto('/app/camera');
  
  // 2. Capture photo
  await page.click('[data-testid="button-capture"]');
  
  // 3. Navigate to gallery
  await page.goto('/app/gallery');
  expect(await page.locator('[data-testid="photo-0"]')).toBeVisible();
  
  // 4. Upload
  await page.goto('/app/upload');
  await page.click('[data-testid="button-start-upload"]');
  
  // 5. Verify success
  await expect(page.locator('[data-testid="status-uploaded"]')).toBeVisible();
});
```

---

## 🔐 Security Considerations

### 1. Camera Permissions

**Nur HTTPS (außer localhost):**
```typescript
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  showError('Camera requires HTTPS');
}
```

### 2. Photo Storage

**SessionStorage Limits:**
- Max. 5-10 MB pro Domain
- Nicht für sensible Daten ohne Encryption
- Auto-Cleanup bei Session-Ende

**Best Practice:**
```typescript
// Encrypt vor SessionStorage
const encrypted = await encryptPhoto(photoBlob);
sessionStorage.setItem('photos', JSON.stringify(encrypted));
```

### 3. Upload Security

**Presigned URLs:**
- ✅ Keine API-Keys im Frontend
- ✅ Time-Limited URLs (1 Stunde)
- ✅ Content-Type validation
- ✅ File-Size limits

---

## 📈 Future Enhancements

### 1. Advanced Camera Features

**HDR Bracketing:**
```typescript
const captureHDRBracket = async () => {
  const track = stream.getVideoTracks()[0];
  const capabilities = track.getCapabilities();
  
  if (capabilities.exposureCompensation) {
    const bracket = [];
    for (const ev of [-2, 0, 2]) {
      await track.applyConstraints({
        advanced: [{ exposureCompensation: ev }]
      });
      await sleep(200);
      bracket.push(await capturePhoto());
    }
    return bracket;
  }
};
```

### 2. Background Sync

**Upload bei Netzwerk-Wiederherstellung:**
```javascript
// Service Worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'upload-photos') {
    event.waitUntil(uploadPendingPhotos());
  }
});
```

### 3. Native iOS App Migration

**React Native Export:**
```bash
npx react-native init PixImmoApp
# Migrate components from /app/*
# Use react-native-camera for native features
```

---

**Status:** ✅ Architecture Documented  
**Version:** 1.0.0  
**Last Updated:** Oktober 2025
