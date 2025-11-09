# 🏷️ Gallery Room Assignment System

## Überblick

Das **Room Assignment System** ermöglicht es Fotografen, Belichtungsreihen in der Galerie nachträglich den korrekten Räumen zuzuordnen – essentiell für Organisation und professionellen Workflow.

## Warum Room Assignment?

### Use Cases

**1. Korrektur bei Aufnahme**
```
Problem:
📸 Fotograf wählt bei Aufnahme falschen Raum
   → Schnell fotografiert
   → "Wohnzimmer" statt "Esszimmer"
   
Lösung:
🏷️ Nachträglich in Galerie korrigieren
   → Alle Shots des Stacks gleichzeitig
   → Metadaten aktualisiert
```

**2. Nachträgliche Organisation**
```
Problem:
📸 Bei Aufnahme "Allgemein" gewählt
   → Später konkretisieren
   → Bessere Organisation
   
Lösung:
🏷️ Bulk-Assignment mehrerer Stacks
   → Z.B. alle Außenaufnahmen
   → Alle Badezimmer-Shots
```

**3. Upload-Vorbereitung**
```
Problem:
☁️ Processing Team braucht korrekte Raum-Info
   → Für Benennung
   → Für Sortierung
   → Für Client-Delivery
   
Lösung:
🏷️ Vor Upload überprüfen & korrigieren
   → Konsistente Metadaten
   → Professionelle Abwicklung
```

## Features

### 1. Edit Mode

**Aktivierung:**
```
Galerie-Header:
┌────────────────────────────────┐
│ Galerie          [Raum] [Upload]│
└────────────────────────────────┘
                    ↑
              Edit Mode Button
```

**Funktion:**
- Aktiviert Auswahl-Modus für Raum-Zuordnung
- Gelbe Highlights (#C9B55A) statt blaue
- Check-Marks auf ausgewählten Stacks
- "Alle" / "Keine" Buttons für Bulk-Selection

### 2. Stack Selection

**Multi-Select:**
```
┌─────┐  ┌─────┐  ┌─────┐
│  ✓  │  │     │  │  ✓  │  ← Gelbe Checkmarks
│ 🛋️ │  │ 🍳  │  │ 🛏️ │
│Wohnz.│  │Küche │  │Schlaf│
└─────┘  └─────┘  └─────┘
  ↑                  ↑
Ausgewählt      Ausgewählt

[2 Stapel zuordnen] ← FAB Button
```

**Interaktion:**
```typescript
// Einzeln: Tippen auf Stack
onClick={() => toggleEditSelection(stack.stackId)}

// Alle: "Alle" Button
onClick={selectAllForEdit}

// Keine: "Keine" Button  
onClick={deselectAllEdit}
```

### 3. Room Picker Modal

**UI:**
```
┌──────────────────────────────────┐
│ Raum zuordnen               [X] │
│ 2 Stapel ausgewählt             │
├──────────────────────────────────┤
│                                  │
│ ┌────────────────────────────┐  │
│ │ 📍 Allgemein               │  │
│ └────────────────────────────┘  │
│ ┌────────────────────────────┐  │
│ │ 🛋️ Wohnzimmer              │  │
│ └────────────────────────────┘  │
│ ┌────────────────────────────┐  │
│ │ 🍽️ Esszimmer               │  │
│ └────────────────────────────┘  │
│ ┌────────────────────────────┐  │
│ │ 🍳 Küche                   │  │
│ └────────────────────────────┘  │
│ ┌────────────────────────────┐  │
│ │ 🛏️ Schlafzimmer            │  │
│ └────────────────────────────┘  │
│                                  │
│ ... (weitere Räume) ...         │
│                                  │
└──────────────────────────────────┘
```

**Design:**
- Modal von unten eingeschoben
- Backdrop mit Blur
- Scrollbare Raum-Liste
- Icons für jeden Raumtyp
- Hover-Effekt auf Buttons

### 4. Room Assignment

**Flow:**
```
1. Edit Mode aktivieren
   ↓
2. Stacks auswählen (1 oder mehrere)
   ↓
3. FAB "X Stapel zuordnen" tippen
   ↓
4. Room Picker Modal öffnet sich
   ↓
5. Raum auswählen (z.B. "Küche 🍳")
   ↓
6. Metadaten werden aktualisiert
   ↓
7. Toast: "2 Stapel zu 'Küche' zugeordnet"
   ↓
8. Edit Mode schließt sich
   ↓
9. Stacks zeigen neuen Raum
```

**Code:**
```typescript
const handleRoomAssignment = (roomId: string) => {
  const room = ROOM_TYPES.find(r => r.id === roomId);
  
  // Update ALL selected stacks
  setStacks(stacks.map(stack => 
    editingStackIds.includes(stack.stackId)
      ? { 
          ...stack, 
          room: room.name,
          shots: stack.shots.map(shot => ({ 
            ...shot, 
            room: room.name 
          })),
          thumbnail: { 
            ...stack.thumbnail, 
            room: room.name 
          }
        }
      : stack
  ));
  
  toast.success(`${editingStackIds.length} Stapel zu "${room.name}" zugeordnet`);
  
  // Reset state
  setShowRoomPicker(false);
  setEditingStackIds([]);
  setEditMode(false);
};
```

## Verfügbare Räume

### Komplett-Liste (31 Räume)

**Wohnbereiche:**
- 📍 Allgemein
- 🛋️ Wohnzimmer
- 🍽️ Esszimmer
- 🍳 Küche
- 💼 Arbeitszimmer

**Schlafbereiche:**
- 🛏️ Schlafzimmer
- 👑 Hauptschlafzimmer
- 🧸 Kinderzimmer
- 🚪 Gästezimmer
- 👔 Ankleidezimmer

**Sanitär:**
- 🚿 Badezimmer
- 🛁 Hauptbadezimmer
- 🚽 Gästebad
- 🚻 WC

**Verkehrsflächen:**
- 🚶 Flur
- 🏠 Eingangsbereich

**Außenbereiche:**
- 🌤️ Balkon
- 🌿 Terrasse
- 🌳 Garten
- 🏘️ Außenansicht

**Nebenräume:**
- 🚗 Garage
- 🅿️ Carport
- ⬇️ Keller
- ⬆️ Dachboden
- 📦 Abstellraum
- 🧺 Waschraum
- 🧹 Hauswirtschaftsraum
- 🥫 Speisekammer

**Wellness:**
- 💪 Fitnessraum
- 🧖 Sauna
- 🏊 Pool

## UI States & Modes

### Normal Mode (Default)

```
Funktionen:
✓ Stack expandieren (Belichtungen ansehen)
✓ Navigieren
✓ Zum Camera/Jobs zurück

UI:
- Kein Border um Stacks
- Keine Checkmarks
- Buttons: [Raum] [Upload]
```

### Selection Mode (Upload)

```
Aktiviert durch: [Upload] Button

Funktionen:
✓ Stacks für Upload auswählen
✓ Multi-Select
✓ "Alle" / "Keine"

UI:
- Blaue Border (#74A4EA) um ausgewählte Stacks
- Blaue Checkmarks
- FAB: "X Stapel hochladen" (grün)
- Button: [Abbrechen]
```

### Edit Mode (Room Assignment)

```
Aktiviert durch: [Raum] Button

Funktionen:
✓ Stacks für Raum-Zuordnung auswählen
✓ Multi-Select
✓ "Alle" / "Keine"
✓ Room Picker öffnen

UI:
- Gelbe Border (#C9B55A) um ausgewählte Stacks
- Gelbe Checkmarks
- FAB: "X Stapel zuordnen" (gelb)
- Button: [Abbrechen]
```

### Visual Comparison

```
┌─────────────────────────────────────┐
│ NORMAL MODE                         │
├─────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │     │ │     │ │     │  ← Neutral │
│ └─────┘ └─────┘ └─────┘            │
│                                     │
│        [Raum] [Upload]              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ SELECTION MODE                      │
├─────────────────────────────────────┤
│ ┏━━━━━┓ ┌─────┐ ┏━━━━━┓            │
│ ┃  ✓  ┃ │     │ ┃  ✓  ┃  ← Blau   │
│ ┗━━━━━┛ └─────┘ ┗━━━━━┛            │
│                                     │
│     [2 Stapel hochladen] 🟢         │
│          [Abbrechen]                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ EDIT MODE                           │
├─────────────────────────────────────┤
│ ┏━━━━━┓ ┌─────┐ ┏━━━━━┓            │
│ ┃  ✓  ┃ │     │ ┃  ✓  ┃  ← Gelb   │
│ ┗━━━━━┛ └─────┘ ┗━━━━━┛            │
│                                     │
│     [2 Stapel zuordnen] 🟡          │
│          [Abbrechen]                │
└─────────────────────────────────────┘
```

## Metadaten-Updates

### Was wird aktualisiert?

**Stack-Level:**
```typescript
interface PhotoStack {
  stackId: string;
  room: string;  // ← UPDATED!
  // ...
}
```

**Shot-Level:**
```typescript
interface Photo {
  id: string;
  stackId: string;
  room: string;  // ← UPDATED!
  // ...
}
```

**Thumbnail:**
```typescript
interface Photo {
  // ... thumbnail is also a Photo
  room: string;  // ← UPDATED!
}
```

### Warum alle Shots?

```
Stack = 1 Motiv mit mehreren Belichtungen
   ↓
Alle Belichtungen gehören zum GLEICHEN Raum
   ↓
Wenn Stack → "Küche"
   dann ALLE shots → "Küche"
```

**Beispiel:**
```javascript
// VORHER:
stack_xyz {
  room: "Wohnzimmer"  ← Falsch
  shots: [
    { ev: -2, room: "Wohnzimmer" },
    { ev:  0, room: "Wohnzimmer" },
    { ev: +2, room: "Wohnzimmer" }
  ]
}

// User wählt "Küche"

// NACHHER:
stack_xyz {
  room: "Küche"  ← Korrekt
  shots: [
    { ev: -2, room: "Küche" },
    { ev:  0, room: "Küche" },
    { ev: +2, room: "Küche" }
  ]
}
```

## Persistence

### LocalStorage

**Aktuelle Implementation:**
```typescript
// Galerie lädt Demo-Stacks
useEffect(() => {
  const demoStacks = [...];
  setStacks(demoStacks);
}, []);

// Änderungen werden NUR im State gespeichert
// Bei Reload → zurück zu Demo-Daten
```

**Production Implementation:**
```typescript
// Stacks aus Backend/LocalStorage laden
useEffect(() => {
  const storedStacks = localStorage.getItem('capturedStacks');
  if (storedStacks) {
    setStacks(JSON.parse(storedStacks));
  }
}, []);

// Bei Änderung speichern
const handleRoomAssignment = (roomId: string) => {
  const updatedStacks = /* ... */;
  
  setStacks(updatedStacks);
  
  // Persist!
  localStorage.setItem('capturedStacks', JSON.stringify(updatedStacks));
  
  // Optional: Auch an Backend senden
  await supabase
    .from('photo_stacks')
    .update({ room: room.name })
    .in('stack_id', editingStackIds);
};
```

## Upload Integration

### Metadaten beim Upload

```typescript
// Wenn Stack hochgeladen wird
const uploadPayload = {
  jobId: generateJobId(),
  stacks: selectedStacks.map(stack => ({
    stackId: stack.stackId,
    room: stack.room,  // ← Korrekte Raum-Info!
    shots: stack.shots.map(shot => ({
      id: shot.id,
      room: shot.room,  // ← Konsistent!
      exposureValue: shot.exposureValue,
      // ...
    }))
  }))
};

// Processing Team erhält:
{
  "stack_20251105_143022_a7f3k9": {
    "room": "Küche",  // ← Korrekt zugeordnet!
    "shots": [
      { "ev": -2, "room": "Küche", "file": "..." },
      { "ev":  0, "room": "Küche", "file": "..." },
      { "ev": +2, "room": "Küche", "file": "..." }
    ]
  }
}
```

### Dateinamen-Generierung

```typescript
// Processing Team exportiert mit Raum-Namen
const generateFileName = (jobId, stack, shotIndex) => {
  const roomSlug = stack.room
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, '_');
  
  return `${jobId}_${roomSlug}_${shotIndex}.jpg`;
};

// Beispiele:
// job_20251105_001_kueche_01.jpg
// job_20251105_001_wohnzimmer_01.jpg
// job_20251105_001_hauptschlafzimmer_01.jpg
```

## UX Guidelines

### Best Practices

**1. Klare Modi-Trennung**
```
✓ Nur EIN Modus aktiv (Upload ODER Edit)
✓ Unterschiedliche Farben (Blau vs. Gelb)
✓ Klare Button-Labels
✗ Nicht: Beide Modi gleichzeitig
```

**2. Feedback**
```
✓ Toast nach erfolgreicher Zuordnung
✓ Visual Highlight (gelber Border)
✓ Count in FAB ("2 Stapel zuordnen")
✗ Nicht: Stille Änderungen
```

**3. Abbruch-Möglichkeit**
```
✓ [Abbrechen] Button
✓ Modal-Backdrop klickbar
✓ [X] Button im Modal
✗ Nicht: Keine Escape-Route
```

**4. Bulk-Operations**
```
✓ "Alle" / "Keine" Buttons
✓ Multi-Select möglich
✓ Count zeigt Anzahl
✗ Nicht: Nur einzeln bearbeitbar
```

### Error Prevention

```
1. Mindestens 1 Stack auswählen
   → Sonst FAB nicht sichtbar

2. Raum-Liste scrollbar
   → Alle 31 Räume erreichbar

3. Modal stoppt Event-Propagation
   → Kein versehentliches Schließen

4. State Reset nach Assignment
   → Keine "Stuck"-Zustände
```

## Accessibility

### Keyboard Navigation

```
Tab:       Durch Stacks navigieren
Enter:     Stack auswählen/abwählen
Escape:    Modal schließen
Arrow Up:  Im Room Picker nach oben
Arrow Down: Im Room Picker nach unten
```

### Screen Reader

```html
<!-- Stack Card -->
<div
  role="checkbox"
  aria-checked={isSelected}
  aria-label={`Stack ${stack.room}, ${stack.shots.length} Fotos`}
>

<!-- Room Button -->
<button
  role="option"
  aria-label={`Zuordnen zu ${room.name}`}
>
  {room.icon} {room.name}
</button>
```

## Performance

### Optimization

**State Updates:**
```typescript
// ✓ Immutable Updates
setStacks(stacks.map(stack => 
  condition ? { ...stack, room: newRoom } : stack
));

// ✗ Mutable (React re-render issues)
stacks.forEach(stack => {
  if (condition) stack.room = newRoom;
});
```

**Rendering:**
```typescript
// Nur betroffene Stacks re-rendern
const isModified = editingStackIds.includes(stack.stackId);

// Border nur wenn nötig
border: isModified ? '3px solid #C9B55A' : '1px solid #E5E5E5'
```

## Testing Checklist

### Functional Tests

```
✓ Edit Mode aktivieren/deaktivieren
✓ Stack auswählen/abwählen
✓ "Alle" auswählen
✓ "Keine" auswählen
✓ FAB erscheint bei Auswahl
✓ FAB zeigt korrekte Anzahl
✓ Room Picker öffnet sich
✓ Raum zuordnen funktioniert
✓ Toast erscheint mit korrekter Anzahl
✓ Raum-Icon aktualisiert sich
✓ Raum-Name aktualisiert sich
✓ Metadaten sind konsistent (Stack + Shots)
✓ Edit Mode schließt sich nach Assignment
✓ Selection wird zurückgesetzt
```

### Edge Cases

```
✓ 0 Stacks ausgewählt → FAB nicht sichtbar
✓ 1 Stack ausgewählt → "1 Stapel zuordnen"
✓ Alle Stacks ausgewählt → Funktioniert
✓ Modal während Edit Mode → Stoppt Interaktion
✓ Abbruch im Modal → Keine Änderungen
✓ Schnelles Klicken → Keine Race Conditions
```

### Visual Tests

```
✓ Gelber Border (#C9B55A) sichtbar
✓ Gelber Checkmark sichtbar
✓ Icons in Room Picker korrekt
✓ Scrollbar im Room Picker funktioniert
✓ Modal Animation smooth
✓ Backdrop Blur funktioniert
✓ FAB Shadow korrekt
```

## Zusammenfassung

Das Room Assignment System bietet:

✅ **Nachträgliche Korrektur** von Raum-Zuordnungen  
✅ **Bulk-Operations** für effiziente Bearbeitung  
✅ **31 Raumtypen** für komplette Immobilien  
✅ **Visual Icons** für schnelle Orientierung  
✅ **Konsistente Metadaten** über alle Shots  
✅ **Upload-Integration** für Processing Team  
✅ **Intuitive UX** mit klaren Modi  

**Resultat:** Perfekt organisierte Foto-Stacks für professionellen Workflow! 🏷️✨

---
*Dokumentation: Gallery Room Assignment - 05.11.2025*
