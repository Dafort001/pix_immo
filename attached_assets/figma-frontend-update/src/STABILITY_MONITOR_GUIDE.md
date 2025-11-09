# 🎯 Stability Monitor Guide

## Überblick

Der **Adaptive Stability Monitor** ist ein intelligentes Feature für die PIX.IMMO Camera App, das Fotografen in Echtzeit vor Verwacklungen warnt – mit adaptiven Schwellenwerten basierend auf der Verschlusszeit.

## Motivation

**Professionelle Immobilienfotografie** erfordert scharfe Aufnahmen. Die kritische Regel:
- **Faustregel**: Handheld-Fotografie möglich bis **1/(Brennweite)**
- **16-24mm Weitwinkel**: Kritische Grenze bei **1/30s**
- **< 1/30s**: Stativ wird zur Pflicht

## Features

### 1️⃣ Live-Stabilität Tracking
- **DeviceMotion API** misst Gerätebewegung in Echtzeit
- **Beschleunigung** in m/s² (alle 3 Achsen: x, y, z)
- **Kontinuierliche Überwachung** während der Nutzung

### 2️⃣ Adaptive Schwellenwerte

#### Schnell (≥ 1/60s)
```javascript
Stabil:   < 0.05 m/s²
Warnung:  0.05-0.15 m/s²
Unstabil: > 0.15 m/s²
```
✅ Normale Handheld-Fotografie möglich

#### Kritisch (1/30s - 1/60s)
```javascript
Stabil:   < 0.03 m/s²   (strenger!)
Warnung:  0.03-0.10 m/s²
Unstabil: > 0.10 m/s²
```
⚠️ Erhöhte Vorsicht erforderlich

#### Langzeit (< 1/30s)
```javascript
Stabil:   < 0.02 m/s²   (sehr streng!)
Warnung:  0.02-0.05 m/s²
Unstabil: > 0.05 m/s²
```
🚨 Stativ fast Pflicht

### 3️⃣ Visual Feedback

**Stability Badge (immer sichtbar wenn aktiv):**
```
🟢 ● Stabil          - Perfekt, los geht's!
🟡 ● Vorsicht        - Leichte Bewegung erkannt
🔴 ⚠ Stativ          - Stativ empfohlen
🔴 ⚠ PFLICHT         - Bei < 1/30s + instabil
     1/15s           - Zeigt Verschlusszeit
```

**Position:**
- **Portrait**: Neben Grid Button (oben links)
- **Landscape**: Über Grid Button (links vertikal)

### 4️⃣ Toast-Warnungen

Beim Auslösen mit instabiler Haltung:
```javascript
// Normal (≥ 1/30s)
"⚠️ Verwenden Sie ein Stativ für beste Ergebnisse"

// Kritisch (< 1/30s)
"⚠️ Stativ erforderlich bei 1/15s!"
```

### 5️⃣ EXIF-Metadaten

Jedes Foto wird dokumentiert:
```javascript
{
  shutterSpeed: "1/125s",
  stability: {
    enabled: true,
    status: "stable",
    acceleration: "0.032",
    adaptiveThresholds: {
      stable: 0.05,
      warning: 0.15
    },
    timestamp: "2025-11-05T14:30:00.000Z"
  }
}
```

## Bedienung

### Button aktivieren
1. **Portrait**: Zweiter Button oben links (neben Grid)
2. **Landscape**: Oberer Button links (über Grid)
3. **Icon**: Move (Lucide React)

### Verschlusszeit einstellen
1. **Settings** öffnen (Zahnrad-Button)
2. **Verschlusszeit** Sektion
3. **8 Presets** auswählen:
   - 1/500s - Action
   - 1/250s - Schnell
   - 1/125s - Standard
   - 1/60s - Kritisch
   - 1/30s - Langsam
   - 1/15s - Sehr langsam
   - 1/8s - Langzeit
   - 1/4s - Stativ Pflicht

**Farbcodierung im Settings:**
- 🔵 Blau (≥ 1/60s): Sicher
- 🟡 Gelb (1/30-1/60s): Vorsicht
- 🔴 Rot (< 1/30s): Kritisch

### Badge interpretieren
- **Nur Symbol**: Normale Verschlusszeit, Standard-Stabilität
- **Symbol + 1/Xs**: Kritische/langsame Verschlusszeit aktiv
- **Farbe**: Immer aktueller Status (Grün/Gelb/Rot)

## Technische Details

### DeviceMotion API
```javascript
window.addEventListener('devicemotion', (event) => {
  const { x, y, z } = event.acceleration;
  const magnitude = Math.sqrt(x² + y² + z²);
  // Vergleiche mit adaptiven Schwellenwerten
});
```

### Fallback für Desktop
Bei fehlender DeviceMotion-Unterstützung:
- Simulierte Zufallswerte für Testing
- Ermöglicht Entwicklung ohne physisches Device

### State Management
```typescript
const [stabilityEnabled, setStabilityEnabled] = useState(false);
const [currentAcceleration, setCurrentAcceleration] = useState(0);
const [stabilityStatus, setStabilityStatus] = useState<'stable' | 'warning' | 'unstable'>('stable');
const [shutterSpeed, setShutterSpeed] = useState(125);
```

### Dependencies
- `lucide-react` - Move Icon
- `sonner@2.0.3` - Toast Notifications
- DeviceMotion API - Nativer Browser Support

## Best Practices

### Für Fotografen
1. **Aktiviere Monitor** bei kritischen Aufnahmen
2. **Warte auf Grün** vor dem Auslösen
3. **Bei < 1/60s**: Immer Stativ verwenden
4. **Atmen**: Ausatmen und kurz anhalten beim Auslösen

### Für Entwickler
1. **Native App**: DeviceMotion benötigt HTTPS oder native App
2. **Permissions**: iOS benötigt Motion-Permission
3. **Calibration**: Erste 2-3 Sekunden können ungenau sein
4. **Battery**: Kontinuierliches Monitoring verbraucht Akku

## Roadmap

### Geplante Erweiterungen
- [ ] **Vibration Feedback** bei stabilem Moment
- [ ] **Countdown mit Stabilität**: Timer startet nur wenn stabil
- [ ] **Statistik**: Durchschnittliche Stabilität pro Session
- [ ] **Kalibrierung**: Nutzer-definierte Schwellenwerte
- [ ] **ISO-Integration**: Höhere ISO → lockerere Schwellenwerte

## Kompatibilität

### Native App (iOS)
✅ **Volle Unterstützung** nach Motion-Permission
- Präzise Werte
- Kontinuierliches Tracking
- Niedrige Latenz

### Web (Desktop)
⚠️ **Fallback-Modus** mit simulierten Werten
- Nur für Testing/Development
- Keine echte Stabilität-Messung

### Web (Mobile Browser)
⚠️ **Limitiert** abhängig vom Browser
- HTTPS erforderlich
- iOS Safari: Gute Unterstützung
- Android Chrome: Variable Unterstützung

## Zusammenfassung

Der **Adaptive Stability Monitor** ist ein professionelles Tool, das:
- ✅ Verschlusszeit berücksichtigt
- ✅ In Echtzeit warnt
- ✅ Metadaten dokumentiert
- ✅ Intuitive visuelle Feedback gibt
- ✅ Best Practices durchsetzt

**Ergebnis**: Schärfere Aufnahmen, weniger Ausschuss, professionellere Immobilienfotografie! 🏠📸

---
*Dokumentation: v6.1 - 05.11.2025*
