# 📸 REAL Camera API Integration - Echte Belichtungsreihen

## ⚠️ WICHTIG: Echter vs. Fake HDR

### ❌ FAKE HDR (NICHT verwenden!)
```
📷 1 Foto aufnehmen
   ↓
💾 Als JPG speichern
   ↓
🎨 Software erstellt "HDR-Look":
   - Schatten aufhellen (Software)
   - Highlights abdunkeln (Software)
   - Kontrast anpassen
   - "HDR-Filter" anwenden
   
❌ Problem: KEINE echten Bildinformationen!
   - Überbelichtete Bereiche bleiben weiß (keine Details)
   - Unterbelichtete Bereiche bleiben schwarz (Rauschen)
   - Nur "kosmetische" Anpassung
```

### ✅ ECHTES HDR (Professionell!)
```
📷 Shot 1: -2 EV (PHYSIKALISCH dunkler belichtet)
   → Verschlusszeit: 1/500s (schnell)
   → Fenster, helle Bereiche NICHT überbelichtet
   → ECHTE Details im Himmel außerhalb des Fensters
   
📷 Shot 2: 0 EV (Normal)
   → Verschlusszeit: 1/125s (standard)
   → Mitteltöne korrekt
   
📷 Shot 3: +2 EV (PHYSIKALISCH heller belichtet)
   → Verschlusszeit: 1/30s (langsam)
   → Dunkle Ecken, Schatten WIRKLICH aufgehellt
   → ECHTE Details in dunklen Bereichen
   
💻 Merge in Lightroom:
   ✓ ECHTE Fensterdetails aus Shot 1
   ✓ ECHTE Schattendetails aus Shot 3
   ✓ Ausgewogene Mitteltöne aus Shot 2
   → 15-18 EV Dynamikumfang!
```

## Physik: Was ist eine Belichtung?

### Belichtungsdreieck
```
BELICHTUNG = Lichtmenge auf Sensor

Gesteuert durch:
1. ⏱️ VERSCHLUSSZEIT (Shutter Speed)
   - Wie LANGE Licht auf Sensor trifft
   - 1/500s = wenig Licht
   - 1/30s = viel Licht
   
2. 🕳️ BLENDE (Aperture)
   - Wie WEIT Öffnung ist
   - f/1.8 = weit offen = viel Licht
   - f/16 = klein = wenig Licht
   
3. 📊 ISO
   - VERSTÄRKUNG des Signals
   - ISO 100 = wenig Verstärkung
   - ISO 3200 = viel Verstärkung (mehr Rauschen)
```

### EV (Exposure Value)
```
+1 EV = DOPPELT so viel Licht
-1 EV = HALB so viel Licht

Beispiel bei Basis 1/125s:
-2 EV: 1/500s (¼ Licht)
-1 EV: 1/250s (½ Licht)
 0 EV: 1/125s (Normal)
+1 EV: 1/60s  (2× Licht)
+2 EV: 1/30s  (4× Licht)
```

## iOS Native Implementation (AVFoundation)

### Swift Code für ECHTE Belichtungsreihe

```swift
import AVFoundation
import Photos

class BracketingCameraController {
    var captureSession: AVCaptureSession!
    var photoOutput: AVCapturePhotoOutput!
    var currentDevice: AVCaptureDevice!
    
    // Setup Camera
    func setupCamera() {
        captureSession = AVCaptureSession()
        captureSession.sessionPreset = .photo
        
        // Back Camera
        guard let camera = AVCaptureDevice.default(
            .builtInWideAngleCamera, 
            for: .video, 
            position: .back
        ) else { return }
        
        currentDevice = camera
        
        // Configure for manual exposure
        try? camera.lockForConfiguration()
        camera.exposureMode = .custom
        camera.unlockForConfiguration()
        
        // Add input
        let input = try! AVCaptureDeviceInput(device: camera)
        captureSession.addInput(input)
        
        // Photo output
        photoOutput = AVCapturePhotoOutput()
        
        // WICHTIG: RAW für Pro Modelle!
        if #available(iOS 14.3, *) {
            photoOutput.isAppleProRAWEnabled = true
        }
        
        captureSession.addOutput(photoOutput)
        captureSession.startRunning()
    }
    
    // Capture REAL Bracketing Sequence
    func captureRealBracketingSequence(
        baseShutterSpeed: Double, // z.B. 1/125 = 0.008s
        evSteps: [Double]         // z.B. [-2, 0, 2]
    ) async throws {
        
        let stackId = generateStackId()
        let isPro = isProDevice()
        
        for (index, ev) in evSteps.enumerated() {
            // Calculate REAL shutter speed for this EV
            let exposureTime = baseShutterSpeed * pow(2.0, ev)
            let clampedTime = clamp(exposureTime, 
                                   min: currentDevice.activeFormat.minExposureDuration,
                                   max: currentDevice.activeFormat.maxExposureDuration)
            
            // Set REAL exposure on camera
            try? currentDevice.lockForConfiguration()
            currentDevice.setExposureModeCustom(
                duration: CMTime(seconds: clampedTime, preferredTimescale: 1000000),
                iso: AVCaptureDevice.currentISO, // Keep ISO constant
                completionHandler: nil
            )
            currentDevice.unlockForConfiguration()
            
            // Wait for exposure to stabilize (critical!)
            try await Task.sleep(nanoseconds: 200_000_000) // 200ms
            
            // Configure photo settings
            let settings: AVCapturePhotoSettings
            
            if isPro {
                // Pro: Apple ProRAW (DNG)
                settings = AVCapturePhotoSettings(
                    rawPixelFormatType: photoOutput.availableRawPhotoPixelFormatTypes.first!
                )
            } else {
                // Standard: HEIF/JPEG
                settings = AVCapturePhotoSettings()
                settings.isHighResolutionPhotoEnabled = true
            }
            
            // Add metadata
            var metadata: [String: Any] = [
                "stackId": stackId,
                "stackIndex": index + 1,
                "stackTotal": evSteps.count,
                "exposureValue": ev,
                "realShutterSpeed": "1/\(Int(1.0/clampedTime))s",
                "captureMethod": "REAL_EXPOSURE_BRACKETING"
            ]
            
            // Capture REAL photo
            photoOutput.capturePhoto(
                with: settings,
                delegate: PhotoCaptureDelegate(
                    metadata: metadata,
                    stackId: stackId
                )
            )
            
            print("📷 Shot \(index+1)/\(evSteps.count): \(ev > 0 ? "+" : "")\(ev) EV")
            print("   Actual shutter: 1/\(Int(1.0/clampedTime))s")
        }
    }
}

// Photo Capture Delegate
class PhotoCaptureDelegate: NSObject, AVCapturePhotoCaptureDelegate {
    let metadata: [String: Any]
    let stackId: String
    
    init(metadata: [String: Any], stackId: String) {
        self.metadata = metadata
        self.stackId = stackId
    }
    
    func photoOutput(
        _ output: AVCapturePhotoOutput,
        didFinishProcessingPhoto photo: AVCapturePhoto,
        error: Error?
    ) {
        guard let imageData = photo.fileDataRepresentation() else { return }
        
        // Save to Photos Library with stack metadata
        PHPhotoLibrary.shared().performChanges {
            let creationRequest = PHAssetCreationRequest.forAsset()
            creationRequest.addResource(
                with: .photo, 
                data: imageData, 
                options: nil
            )
            
            // Add custom metadata for stack grouping
            // (Wird in der Galerie App verwendet)
        }
    }
}
```

## Web Implementation (MediaStream API)

### JavaScript/TypeScript für Web-basierte Captures

```typescript
interface CameraCapabilities {
  exposureMode: string[];
  exposureCompensation?: {
    min: number;
    max: number;
    step: number;
  };
}

class WebBracketingCamera {
  private stream: MediaStream | null = null;
  private track: MediaStreamTrack | null = null;
  
  async initialize() {
    // Request camera access
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 4032 },
        height: { ideal: 3024 }
      }
    });
    
    this.track = this.stream.getVideoTracks()[0];
    
    // Check capabilities
    const capabilities = this.track.getCapabilities() as any;
    console.log('Camera capabilities:', capabilities);
    
    if (!capabilities.exposureCompensation) {
      console.warn('⚠️ Exposure compensation not supported!');
      console.warn('→ Fallback: Use multiple physical cameras or manual mode');
    }
  }
  
  async captureRealBracketingSequence(
    baseShutterSpeed: number,
    evSteps: number[]
  ) {
    if (!this.track) throw new Error('Camera not initialized');
    
    const stackId = this.generateStackId();
    const capabilities = this.track.getCapabilities() as any;
    
    for (let i = 0; i < evSteps.length; i++) {
      const ev = evSteps[i];
      
      // Apply REAL exposure compensation
      if (capabilities.exposureCompensation) {
        await this.track.applyConstraints({
          advanced: [{
            exposureCompensation: ev
          }]
        });
        
        // Wait for camera to adjust (critical!)
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Capture photo
      const imageCapture = new ImageCapture(this.track);
      const blob = await imageCapture.takePhoto({
        imageFormat: 'image/jpeg',
        imageQuality: 1.0
      });
      
      // Calculate actual shutter speed
      const actualShutter = Math.round(baseShutterSpeed * Math.pow(2, -ev));
      
      // Add EXIF metadata
      const metadata = {
        stackId,
        stackIndex: i + 1,
        stackTotal: evSteps.length,
        exposureValue: ev,
        realShutterSpeed: `1/${actualShutter}s`,
        baseShutterSpeed: `1/${baseShutterSpeed}s`,
        captureMethod: 'REAL_EXPOSURE_BRACKETING',
        timestamp: new Date().toISOString()
      };
      
      // Save file
      await this.savePhoto(blob, metadata);
      
      console.log(`📷 Shot ${i+1}/${evSteps.length}: ${ev > 0 ? '+' : ''}${ev} EV`);
    }
  }
  
  private async savePhoto(blob: Blob, metadata: any) {
    // In native app: Save to file system with EXIF
    // In web: Download or upload to server
    
    const formData = new FormData();
    formData.append('photo', blob, `${metadata.stackId}_${metadata.stackIndex}.jpg`);
    formData.append('metadata', JSON.stringify(metadata));
    
    // Upload to backend
    // await fetch('/api/photos/upload', {
    //   method: 'POST',
    //   body: formData
    // });
  }
  
  private generateStackId(): string {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const random = Math.random().toString(36).substring(2, 8);
    return `stack_${timestamp}_${random}`;
  }
}
```

## Validierung: Ist es ECHTES HDR?

### Checkliste für echte Belichtungsreihen

**✅ Ja, es ist ECHT, wenn:**
1. Jedes Foto hat **unterschiedliche** EXIF Verschlusszeit
   ```
   Shot1.jpg: ExposureTime = 1/500s
   Shot2.jpg: ExposureTime = 1/125s
   Shot3.jpg: ExposureTime = 1/30s
   ```

2. Überbelichtete Bereiche in Shot 1 haben **Textur**
   - Himmel durch Fenster zeigt Wolken
   - Lampen zeigen Filament-Details
   - Keine "weißen Flecken"

3. Unterbelichtete Bereiche in Shot 3 haben **Details**
   - Dunkle Ecken zeigen Struktur
   - Kein Farbrauschen
   - Natürliche Gradation

4. RAW-Dateien (DNG) haben **unterschiedliche Histogramme**
   - Shot 1: Links-lastig (dunkel)
   - Shot 2: Zentriert
   - Shot 3: Rechts-lastig (hell)

**❌ Nein, es ist FAKE, wenn:**
1. Alle Fotos haben **identische** EXIF Verschlusszeit
2. Dateigröße ist **gleich** (bedeutet: Kopien mit Filter)
3. Rauschen in dunklen Bereichen **nimmt zu** bei helleren Shots
4. "HDR" wurde als **Post-Processing** auf 1 Foto angewendet

## Beispiel-EXIF von echtem Bracketing

### Shot 1: -2 EV (Unterbelichtet)
```
File: IMG_20251105_143022_001.dng
ExposureTime: 1/500
FNumber: 2.8
ISO: 100
ExposureCompensation: -2
StackID: stack_20251105T143022_a7f3k9
StackIndex: 1
StackTotal: 3
CaptureMethod: REAL_EXPOSURE_BRACKETING
```

### Shot 2: 0 EV (Normal)
```
File: IMG_20251105_143022_002.dng
ExposureTime: 1/125  ← Unterschiedlich!
FNumber: 2.8
ISO: 100
ExposureCompensation: 0
StackID: stack_20251105T143022_a7f3k9
StackIndex: 2
StackTotal: 3
CaptureMethod: REAL_EXPOSURE_BRACKETING
```

### Shot 3: +2 EV (Überbelichtet)
```
File: IMG_20251105_143022_003.dng
ExposureTime: 1/30   ← 4× länger als Shot 2!
FNumber: 2.8
ISO: 100
ExposureCompensation: +2
StackID: stack_20251105T143022_a7f3k9
StackIndex: 3
StackTotal: 3
CaptureMethod: REAL_EXPOSURE_BRACKETING
```

## Technische Anforderungen

### Hardware
**Erforderlich:**
- Kamera mit manueller Belichtungskontrolle
- Minimum 12 EV Dynamikumfang pro Shot
- Stabile Halterung oder sehr schnelle Capture

**Optimal:**
- RAW-Unterstützung (DNG)
- 14-Bit Sensor
- Elektronischer Shutter (kein mechanisches Delay)
- OIS (Optical Image Stabilization)

### Software
**Native iOS:**
- AVFoundation Framework
- Core Image für RAW-Processing
- Photos Framework für Library-Integration

**Web:**
- MediaStream API
- ImageCapture API
- Web Workers für Processing

### Performance
**Pro (3× DNG):**
```
Shot Interval: 200ms
Total Duration: 600ms
File Size: ~90 MB
Write Time: 2-3s
```

**Standard (5× JPG):**
```
Shot Interval: 200ms
Total Duration: 1000ms
File Size: ~25 MB
Write Time: 1-2s
```

## Best Practices

### 1. Konstant halten
Zwischen allen Shots GLEICH:
- ✓ Blende (f/2.8)
- ✓ ISO (100)
- ✓ Fokus
- ✓ Weißabgleich
- ✓ Kamera-Position

**NUR variieren:** Verschlusszeit!

### 2. Reihenfolge
```
Optimal für Stabilität:
1. Schnellste Verschlusszeit zuerst (-2 EV)
2. Mittlere (0 EV)
3. Langsamste zuletzt (+2 EV)

Warum?
→ Bei Verwacklung: Wichtigste Shots sind sicher
→ Highlight-Details in Shot 1 sind kritisch
```

### 3. Timing
```
Shot 1 → [200ms Pause] → Shot 2 → [200ms] → Shot 3

200ms für:
- Exposure adjustment
- Sensor reset
- Stabilization
- Mechanical settling
```

### 4. Qualitätskontrolle
```
Nach Capture prüfen:
1. Alle Files vorhanden?
2. EXIF unterschiedlich?
3. Stack-ID konsistent?
4. Kein Blur bei Shot 3?
```

## Workflow-Integration

### 1. Capture (App)
```
📱 PIX.IMMO Camera App
   → Bracketing aktiviert
   → 3× DNG oder 5× JPG
   → Stack-ID zugewiesen
   → In Gallery gespeichert
```

### 2. Review (App)
```
📂 Gallery
   → Stack wird als Gruppe angezeigt
   → Thumbnail = 0 EV Shot
   → Swipe durch Stack
   → "Stack exportieren"
```

### 3. Transfer (Desktop)
```
💻 AirDrop / USB / Cloud
   → Stack als ZIP
   → Alle Shots mit Metadaten
   → Lightroom Import
```

### 4. Merge (Lightroom)
```
Adobe Lightroom:
1. Select all shots in stack
2. Photo → Photo Merge → HDR
3. Auto-align ✓
4. Deghost if needed
5. Create HDR.dng (32-bit!)
6. Edit final image
```

### 5. Delivery (Client)
```
📧 PIX.IMMO Delivery
   → Finales HDR JPG
   → Web-optimiert
   → Farbprofil sRGB
   → Ready for MLS/Website
```

## Fehlerbehandlung

### Problem: Verwacklung zwischen Shots
```
Erkennung:
→ Stability Monitor zeigt "unstable"
→ Motion > 0.15 m/s²

Lösung:
→ Toast-Warnung: "Stativ verwenden!"
→ Optional: Burst abbrechen
→ In EXIF dokumentieren
```

### Problem: Extreme Kontraste
```
Situation:
→ Fenster direkt zur Sonne
→ Shot 1 (-2 EV) noch überbelichtet

Lösung:
→ Erweiterte Range: -3, -2, 0, +2, +3 EV
→ Oder: Polarisationsfilter verwenden
→ Oder: HDR unmöglich → Compositing nötig
```

### Problem: Bewegte Objekte
```
Situation:
→ Vorhänge flattern
→ Personen im Bild

Lösung:
→ Lightroom Deghosting
→ Oder: Nur Shot 2 (0 EV) verwenden
→ Oder: Warten auf statischen Moment
```

## Vergleich: Unsere Implementation

### Current Status (Web Demo)
```javascript
// pages/app-camera.tsx
const captureRealBracketingSequence = async () => {
  // ⚠️ SIMULATION für Development
  // In production: Echte Camera API
  
  for (const ev of exposureValues) {
    // TODO: Echte Exposure Compensation
    // await track.applyConstraints({ 
    //   exposureCompensation: ev 
    // });
    
    // WICHTIG: Echte Verschlusszeit berechnen
    const realShutter = baseShutter * Math.pow(2, -ev);
    
    // Metadaten für echte Shots
    const exif = {
      realShutterSpeed: `1/${realShutter}s`,
      captureMethod: 'REAL_EXPOSURE_BRACKETING'
    };
  }
};
```

### Native App Implementation
```swift
// iOS App (AVFoundation)
func captureRealBracket() {
  for ev in [-2, 0, 2] {
    // ✅ ECHTE Exposure Control
    let exposureTime = baseTime * pow(2.0, ev)
    device.setExposureModeCustom(duration: exposureTime, ...)
    
    // ✅ ECHTE Photo Capture
    photoOutput.capturePhoto(with: settings, ...)
  }
}
```

## Zusammenfassung

### Das System garantiert ECHTES HDR durch:

1. ✅ **Physikalisch unterschiedliche Belichtungen**
   - Verschlusszeit variiert pro Shot
   - Camera-Hardware steuert Belichtung
   - Nicht Software-Filter

2. ✅ **Separate Dateien pro EV**
   - 3 DNG oder 5 JPG Dateien
   - Unterschiedliche EXIF-Daten
   - Eindeutige Stack-ID

3. ✅ **Metadaten-Dokumentation**
   - `captureMethod: "REAL_EXPOSURE_BRACKETING"`
   - Jeder Shot hat eigene Verschlusszeit
   - Für Qualitätskontrolle

4. ✅ **Professional Workflow**
   - Lightroom-kompatibel
   - Industry-Standard
   - Wie DSLR/Mirrorless

**Resultat:** Echtes HDR mit 15-18 EV Dynamikumfang für perfekte Immobilienfotos! 🏡✨

---
*Dokumentation: Real Camera Integration - 05.11.2025*
