# 📱 Gallery App - Quick Reference

**File:** `/pages/app-gallery.tsx`  
**Route:** `/app/gallery`  
**Status:** ✅ Production-Ready

---

## 🎯 Was die Gallery kann

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| **Stack Anzeige** | ✅ | 2-Spalten Grid mit allen aufgenommenen Stacks |
| **Stack Expansion** | ✅ | Tap auf Stack → Alle Belichtungen anzeigen |
| **Upload Selection** | ✅ | Stacks für Upload auswählen (blau) |
| **Room Assignment** | ✅ | Räume nachträglich zuordnen (gelb) |
| **LocalStorage Load** | ✅ | Lädt Stacks aus `pix-captured-stacks` |
| **LocalStorage Save** | ✅ | Speichert Room Updates |
| **Upload Navigation** | ✅ | Weiterleitung zu `/app/upload` mit Selection |
| **Empty State** | ✅ | Zeigt Hinweis wenn keine Fotos |
| **Demo Data** | ✅ | Fallback wenn localStorage leer |

---

## 🚀 Wie du es testest

### 1. Gallery mit Demo-Daten öffnen

```bash
# Im Browser:
http://localhost:5173/app/gallery
```

**Du siehst:**
- 3 Demo-Stacks (Wohnzimmer, Küche, Schlafzimmer)
- 2-Spalten Grid
- Stack Badges (3×DNG / 5×JPG)
- Device Badges (Pro / Std)

### 2. Stack expandieren

**Action:** Tap auf einen Stack

**Erwartung:**
- Belichtungsreihe wird unter dem Stack angezeigt
- Horizontales Scroll
- EV Badges (-2EV, 0EV, +2EV)
- Shutter Speeds (1/500s, 1/125s, 1/30s)
- Mittlere Belichtung hat blauen Border

### 3. Upload-Selection testen

**Action:**
1. Tap auf `[Upload]` Button (Header rechts)
2. Tap auf mehrere Stacks
3. Schaue dass FAB erscheint
4. Tap auf FAB

**Erwartung:**
- Stacks bekommen blauen Border wenn selected
- Blaue Checkmarks erscheinen
- Header zeigt `[Alle] [Keine] [Abbrechen]`
- FAB zeigt "X Stapel hochladen" (grün)
- Nach Tap → Navigation zu `/app/upload`
- localStorage `uploadStacks` enthält Selection

**localStorage Check:**
```javascript
JSON.parse(localStorage.getItem('uploadStacks'))
// Sollte Array mit selected Stacks sein
```

### 4. Room Assignment testen

**Action:**
1. Tap auf `[Raum]` Button (Header mitte)
2. Tap auf mehrere Stacks
3. Tap auf FAB "X Stapel zuordnen"
4. Room Picker öffnet sich
5. Wähle einen Raum (z.B. "Badezimmer 🚿")

**Erwartung:**
- Stacks bekommen gelben Border wenn selected
- Gelbe Checkmarks erscheinen
- FAB ist gelb
- Room Picker Modal slide-in von unten
- Nach Raum-Auswahl:
  - Toast: "X Stapel zu 'Badezimmer' zugeordnet"
  - Stacks zeigen neues Room Icon + Name
  - Edit Mode schließt sich
  - localStorage wird aktualisiert

**localStorage Check:**
```javascript
const stacks = JSON.parse(localStorage.getItem('pix-captured-stacks'));
console.log(stacks[0].room); // Sollte "Badezimmer" sein
```

### 5. "Alle" / "Keine" Buttons

**Action:**
- In Selection/Edit Mode: Tap `[Alle]`
- Dann: Tap `[Keine]`

**Erwartung:**
- "Alle": Alle Stacks werden selected
- "Keine": Selection wird geleert

### 6. Abbrechen

**Action:** Tap `[Abbrechen]` in Selection/Edit Mode

**Erwartung:**
- Mode wird deaktiviert
- Selection wird geleert
- FAB verschwindet
- Zurück zu Normal Mode

---

## 🔗 Integration mit Camera App

### Was die Camera App machen muss

**Nach jedem Capture:**
```typescript
// 1. Stack erstellen
const newStack: PhotoStack = {
  stackId: `stack_${timestamp}_${randomId}`,
  shots: [...], // Alle Belichtungen
  thumbnail: shots[middleIndex], // Mittlere Belichtung
  deviceType: isPro ? 'pro' : 'standard',
  format: rawEnabled ? 'DNG' : 'JPG',
  timestamp: new Date(),
  room: selectedRoom, // Aus Room Selector
  selected: false
};

// 2. Zu existing stacks hinzufügen
const existingStacks = JSON.parse(
  localStorage.getItem('pix-captured-stacks') || '[]'
);
existingStacks.push(newStack);

// 3. Speichern
localStorage.setItem(
  'pix-captured-stacks',
  JSON.stringify(existingStacks)
);

// 4. User feedback
toast.success('Stack in Galerie gespeichert');
```

### Was die Gallery App macht

**Beim Mount:**
```typescript
useEffect(() => {
  const storedStacks = localStorage.getItem('pix-captured-stacks');
  
  if (storedStacks) {
    // Parse und konvertiere Timestamps
    const stacks = JSON.parse(storedStacks).map(stack => ({
      ...stack,
      timestamp: new Date(stack.timestamp),
      // ... etc
    }));
    setStacks(stacks);
  } else {
    // Demo data
    setStacks(demoStacks);
  }
}, []);
```

---

## 🗂️ LocalStorage Keys

| Key | Type | Beschreibung |
|-----|------|--------------|
| `pix-captured-stacks` | `PhotoStack[]` | Alle aufgenommenen Stacks |
| `uploadStacks` | `PhotoStack[]` | Für Upload ausgewählte Stacks |
| `pix-histogram-visible` | `boolean` | Histogram State (Camera) |

---

## 📱 Navigation

### Von Gallery zu anderen Seiten

**Navigation Bar (Bottom):**
- 🏠 Start → `/app/jobs`
- 📷 Kamera → `/app/camera`
- 🖼️ **Galerie** → `/app/gallery` (aktiv)
- ⬆️ Upload → `/app/upload`
- ⚙️ Manuell → `/app/settings`

**Header:**
- `[← Zurück]` → `/app` (App Index)
- `[Upload]` → Selection Mode → FAB → `/app/upload`

---

## 🎨 UI Modi

### Normal Mode (Default)

```
┌─────────────────────────────┐
│ [← Zurück]  [Raum] [Upload] │
├─────────────────────────────┤
│ Galerie                     │
│ 3 Stapel · 11 Fotos         │
├─────────────────────────────┤
│                             │
│ ┌─────┐ ┌─────┐            │
│ │3×DNG│ │5×JPG│            │
│ │Pro  │ │Std  │            │
│ │🛋️ Wo│ │🍳 Kü│            │
│ └─────┘ └─────┘            │
│                             │
└─────────────────────────────┘
```

### Selection Mode (Blau)

```
┌─────────────────────────────┐
│ [← Zurück] [Alle] [Keine]   │
│ [Abbrechen]                 │
├─────────────────────────────┤
│ Galerie                     │
│ 3 Stapel · 11 Fotos         │
├─────────────────────────────┤
│                             │
│ ┏━━━━━┓ ┌─────┐ ← Blau     │
│ ┃  ✓  ┃ │5×JPG│            │
│ ┃Pro  ┃ │Std  │            │
│ ┃🛋️ Wo┃ │🍳 Kü│            │
│ ┗━━━━━┛ └─────┘            │
│                             │
│    [2 Stapel hochladen]  🟢│
└─────────────────────────────┘
```

### Edit Mode (Gelb)

```
┌─────────────────────────────┐
│ [← Zurück] [Alle] [Keine]   │
│ [Abbrechen]                 │
├─────────────────────────────┤
│ Galerie                     │
│ 3 Stapel · 11 Fotos         │
├─────────────────────────────┤
│                             │
│ ┏━━━━━┓ ┌─────┐ ← Gelb     │
│ ┃  ✓  ┃ │5×JPG│            │
│ ┃Pro  ┃ │Std  │            │
│ ┃🛋️ Wo┃ │🍳 Kü│            │
│ ┗━━━━━┛ └─────┘            │
│                             │
│    [2 Stapel zuordnen]  🟡 │
└─────────────────────────────┘
```

---

## 🐛 Debugging

### Stacks werden nicht angezeigt

**Check:**
```javascript
// Console:
localStorage.getItem('pix-captured-stacks')

// Sollte JSON String sein
// Wenn null → Demo Data wird verwendet
```

**Fix:**
- Stelle sicher Camera App speichert Stacks
- Oder: Manuell Demo-Stacks in localStorage setzen:

```javascript
const demoStack = {
  stackId: 'stack_20251105T143022_test',
  deviceType: 'pro',
  format: 'DNG',
  timestamp: new Date().toISOString(),
  room: 'Wohnzimmer',
  selected: false,
  thumbnail: {
    id: 'photo_1_2',
    stackId: 'stack_20251105T143022_test',
    stackIndex: 2,
    stackTotal: 3,
    exposureValue: 0,
    fileFormat: 'DNG',
    realShutterSpeed: '1/125s',
    room: 'Wohnzimmer',
    timestamp: new Date().toISOString(),
    thumbnailUrl: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400'
  },
  shots: [/* ... */]
};

localStorage.setItem(
  'pix-captured-stacks',
  JSON.stringify([demoStack])
);

// Reload Gallery
```

### Room Assignment wird nicht gespeichert

**Check:**
```javascript
// Nach Room Assignment:
const stacks = JSON.parse(localStorage.getItem('pix-captured-stacks'));
console.log(stacks[0].room);
// Sollte neuer Raum-Name sein
```

**Fix:** Bereits implementiert mit `saveStacksToStorage()` Helper! ✅

### Upload Selection funktioniert nicht

**Check:**
```javascript
// Nach Upload-FAB tap:
localStorage.getItem('uploadStacks')
// Sollte Selected Stacks enthalten
```

**Fix:**
- Sicherstellen dass Selection Mode aktiviert ist (blauer Border)
- Mindestens 1 Stack selected
- FAB anklicken

---

## 📊 TypeScript Interfaces

```typescript
interface PhotoStack {
  stackId: string;           // Format: stack_YYYYMMDDTHHmmss_xxxxx
  shots: Photo[];            // Array aller Belichtungen
  thumbnail: Photo;          // Mittlere Belichtung (für Preview)
  deviceType: 'pro' | 'standard';
  format: 'DNG' | 'JPG';
  timestamp: Date;
  room: string;              // Raumbezeichnung
  selected: boolean;         // Für Upload-Selection
}

interface Photo {
  id: string;
  stackId: string;
  stackIndex: number;
  stackTotal: number;
  exposureValue: number;     // -2, 0, +2 (Pro) oder -2..-1, 0, +1..+2 (Standard)
  fileFormat: string;
  realShutterSpeed: string;  // z.B. "1/125s"
  room: string;
  timestamp: Date;
  thumbnailUrl: string;      // Data URL oder Blob URL
}
```

---

## ✅ Testing Checklist

**Für jeden Test: Öffne `/app/gallery`**

- [ ] Gallery lädt und zeigt Stacks
- [ ] Stack Expansion funktioniert
- [ ] Selection Mode: Blaue Borders
- [ ] Selection Mode: FAB erscheint
- [ ] Selection Mode: Navigation zu Upload
- [ ] Edit Mode: Gelbe Borders
- [ ] Edit Mode: Room Picker öffnet
- [ ] Edit Mode: Room Assignment funktioniert
- [ ] Edit Mode: Toast erscheint
- [ ] Edit Mode: localStorage wird aktualisiert
- [ ] "Alle" Button funktioniert
- [ ] "Keine" Button funktioniert
- [ ] "Abbrechen" Button funktioniert
- [ ] Empty State zeigt sich (wenn localStorage leer)
- [ ] Demo Data lädt (Fallback)

---

## 🎯 Next Steps

1. **Camera App Integration:**
   - Stacks in `pix-captured-stacks` speichern
   - Echte Thumbnails (Blob URLs statt Unsplash)

2. **Upload App Integration:**
   - `uploadStacks` aus localStorage laden
   - Upload-Flow implementieren

3. **Optional Features:**
   - Stack Deletion
   - Filter nach Raum
   - Sortierung
   - Pull-to-Refresh

---

**Happy Testing!** 🚀✨
