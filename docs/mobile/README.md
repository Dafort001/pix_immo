# 📱 pix.immo Mobile PWA

Progressive Web App für Fotografen mit nativer Kamera-Integration.

## Übersicht

Die Mobile App ist eine eigenständige PWA mit iOS-Design, die Fotografen vor Ort bei Property Shoots unterstützt.

### Features

- ✅ **Native Kamera-Integration** - MediaDevices API für hochauflösende Fotos
- ✅ **iOS Design Patterns** - StatusBar, Safe-Area, Notch-Support
- ✅ **Offline-First** - SessionStorage + Service Worker
- ✅ **Install-to-Homescreen** - PWA Manifest
- ✅ **Haptic Feedback** - Vibration API für Touch-Interaktionen
- ✅ **Photo Workflow** - Camera → Gallery → Upload

---

## Routes

```
/app/                → Splash Screen (Startseite)
/app/camera          → Kamera-Interface
/app/gallery         → Foto-Review & Auswahl
/app/upload          → Upload-Workflow mit Progress
```

**Legacy Routes (DEPRECATED):**
```
/capture/*           → Alte PWA-Implementation
```

---

## Komponenten

### Screens
```typescript
client/src/pages/app/
├── splash.tsx       → App-Startseite mit Navigation
├── camera.tsx       → Kamera-Interface mit MediaDevices API
├── gallery.tsx      → Foto-Review mit Thumbnail-Grid
└── upload.tsx       → Upload-Queue mit Progress-Tracking
```

### Mobile Components
```typescript
client/src/components/mobile/
├── StatusBar.tsx        → iOS-Style StatusBar (Notch-Support)
├── HapticButton.tsx     → Button mit Vibration-Feedback
├── BottomNav.tsx        → Tab-Navigation (iOS-Style)
└── Histogram.tsx        → Foto-Analyse (Exposure Check)
```

### Hooks
```typescript
client/src/hooks/
├── useCamera.ts         → MediaDevices API Wrapper
└── useHaptic.ts         → Vibration API Wrapper
```

---

## Technische Details

### Camera API

**Browser Compatibility:**
- ✅ iOS Safari 14+ (getUserMedia)
- ✅ Chrome Mobile 90+
- ✅ Android WebView

**Features:**
- High-Resolution Capture (bis 12MP)
- Front/Back Camera Flip
- Auto-Focus & Exposure
- JPEG Compression (95% Quality)

**Code-Beispiel:**
```typescript
import { useCamera } from '@/hooks/useCamera';

const { stream, videoRef, startCamera, capturePhoto } = useCamera();

// Kamera starten
await startCamera('environment'); // Rückkamera

// Foto aufnehmen
const blob = await capturePhoto();
```

### Photo Workflow

**Ablauf:**
```
1. Camera Screen → Foto aufnehmen
2. Gallery Screen → Fotos reviewen/löschen
3. Upload Screen → Upload zu R2 Storage
```

**SessionStorage:**
- Fotos werden in `sessionStorage` als Base64 gespeichert
- Cleanup beim Upload oder bei App-Neustart
- Max. 50 Fotos pro Session (Memory-Limit)

### PWA Configuration

**Manifest:**
```json
{
  "name": "pix.immo Camera",
  "start_url": "/app",
  "display": "standalone",
  "orientation": "portrait"
}
```

**Service Worker:**
- Offline-Support für `/app/*` Routes
- Asset-Caching (CSS, JS)
- Background Sync (geplant)

---

## Development

### Lokaler Test

```bash
npm run dev
# App verfügbar unter: http://localhost:5000/app
```

### Mobile Testing

**Option 1: Browser DevTools**
```
Chrome DevTools → Device Toolbar (Cmd+Shift+M)
→ iPhone 14 Pro auswählen
```

**Option 2: Reales Gerät (empfohlen)**
```bash
# App auf lokalem Netzwerk freigeben
npm run dev -- --host

# Dann auf iPhone:
# https://<your-local-ip>:5000/app
```

**Option 3: Replit Webview**
```
Replit öffnet automatisch Webview
→ "Open in new tab" für mobile Tests
```

---

## Deployment

### Aktuell: Bundled mit Web Portal

Die Mobile App wird mit dem Web Portal zusammen deployed:

```bash
npm run build        # Vite Build (inkl. /app/*)
wrangler deploy      # Cloudflare Workers
```

**Verfügbar unter:**
- https://pix.immo/app

### Zukunft: Separate Deployment-Option

**Option A: Static Hosting (Vercel/Netlify)**
```bash
npm run build:mobile
# Deploy nur /app/* Routes
```

**Option B: Native iOS App**
```bash
# React Native Export
npx react-native init PixImmoApp
# Komponenten von /app/* migrieren
```

---

## Testing

### E2E Tests (Playwright)

**Mobile Emulation:**
```typescript
// playwright.config.ts
devices: [
  devices['iPhone 14 Pro'],
  devices['Pixel 7']
]
```

**Test-Beispiel:**
```typescript
test('should capture photo and upload', async ({ page }) => {
  // Grant camera permissions
  await context.grantPermissions(['camera']);
  
  // Navigate to camera
  await page.goto('/app/camera');
  
  // Capture photo
  await page.click('[data-testid="button-capture"]');
  
  // Verify in gallery
  await page.goto('/app/gallery');
  expect(await page.locator('[data-testid="photo-0"]')).toBeVisible();
});
```

---

## API Integration

### Upload Endpoints

**Backend APIs (shared mit Web Portal):**
```
POST /api/ios/upload/init          → Session starten
POST /api/ios/upload/presigned     → R2 Upload-URL holen
POST /api/ios/upload/confirm       → Upload bestätigen
```

**Flow:**
```typescript
// 1. Init Upload Session
const session = await apiRequest('/api/ios/upload/init', {
  method: 'POST',
  body: JSON.stringify({ shootCode })
});

// 2. Get Presigned URL
const { uploadUrl } = await apiRequest('/api/ios/upload/presigned', {
  method: 'POST',
  body: JSON.stringify({ 
    fileName: 'photo_1.jpg',
    contentType: 'image/jpeg'
  })
});

// 3. Upload to R2
await fetch(uploadUrl, {
  method: 'PUT',
  body: photoBlob,
  headers: { 'Content-Type': 'image/jpeg' }
});

// 4. Confirm
await apiRequest('/api/ios/upload/confirm', {
  method: 'POST',
  body: JSON.stringify({ fileName: 'photo_1.jpg' })
});
```

---

## Troubleshooting

### Kamera funktioniert nicht

**Checkliste:**
1. ✅ HTTPS erforderlich (localhost ist OK)
2. ✅ Browser-Permissions erteilt?
3. ✅ Kamera nicht von anderer App blockiert?
4. ✅ iOS Safari Einstellungen → Kamera erlauben

**Fallback:**
```typescript
if (!navigator.mediaDevices) {
  // Fallback auf File-Upload
  return <input type="file" accept="image/*" capture="environment" />;
}
```

### Upload schlägt fehl

**Debug-Schritte:**
```typescript
// 1. Check Network
console.log('Online:', navigator.onLine);

// 2. Check File Size
console.log('Blob size:', photoBlob.size);

// 3. Check R2 Response
const response = await fetch(uploadUrl, { method: 'PUT', body: photoBlob });
console.log('Upload status:', response.status);
```

---

## Weitere Dokumentation

- 📄 [ARCHITECTURE.md](./ARCHITECTURE.md) - iOS Design Patterns
- 📄 [CAMERA_API.md](./CAMERA_API.md) - MediaDevices Integration
- 📄 [../../MOBILE_CAMERA_INTEGRATION.md](../../MOBILE_CAMERA_INTEGRATION.md) - Ursprüngliche Planung

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Letztes Update:** Oktober 2025
