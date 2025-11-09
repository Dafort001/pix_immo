# Gallery - Raum-Zuordnung Nachträglich 🏷️

## ✅ Komplett Implementiert

Die Galerie-App ermöglicht es, Räume **nachträglich** zuzuordnen - perfekt für Fotografen, die beim Shooting zu beschäftigt waren oder es vergessen haben.

---

## 📱 User Flow

### 1️⃣ Edit-Modus Aktivieren

```
Galerie → [Raum] Button (oben rechts)
```

**Visuell:**
- Header zeigt "Alle" / "Keine" Buttons (Gold)
- "Raum" Button → "Abbrechen" Button
- Alle Stacks haben **leere gelbe Checkmarks** (unten rechts)

---

### 2️⃣ Stacks Auswählen

**Methode A: Einzeln**
- Auf Stack tippen → **Gelber Border + Gelbes Checkmark ✓**
- Erneut tippen → Deselektieren

**Methode B: Mehrfach**
- "Alle" Button → Alle Stacks auswählen
- "Keine" Button → Alle Stacks abwählen

**Visuell:**
```
┌─────────────────────────────────────┐
│ [Alle]  [Keine]      [Abbrechen]   │
├─────────────────────────────────────┤
│ Galerie                             │
│ 15 Stapel · 60 Fotos                │
├─────────────────────────────────────┤
│                                     │
│ ┌────────┐ ┌────────┐ ┌────────┐  │
│ │🛋️      │ │🍳 ✓    │ │🍽️      │  │
│ │        │ │ GOLD   │ │        │  │
│ └────────┘ └────────┘ └────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

### 3️⃣ Zuordnen-Button Erscheint

**Wenn mindestens 1 Stack ausgewählt:**

```
┌─────────────────────────────────────┐
│                                     │
│         ┌─────────────────┐         │
│         │ 🏷️ 3 Stapel     │ ← FAB   │
│         │   zuordnen      │         │
│         └─────────────────┘         │
│                                     │
└─────────────────────────────────────┘
```

**Design:**
- Position: Bottom Center (über Navigation Bar)
- Farbe: **#C9B55A** (Gold)
- Shadow: 0 4px 12px rgba(201, 181, 90, 0.4)
- Icon: Tag (Lucide)
- Text: "X Stapel zuordnen"

---

### 4️⃣ Room Picker Modal

**Click auf FAB → Modal öffnet sich:**

```
┌─────────────────────────────────────┐
│ [Backdrop Blur]                     │
│                                     │
│     ┌───────────────────────────┐   │
│     │ Raum zuordnen         [X] │   │
│     │ 3 Stapel ausgewählt       │   │
│     ├───────────────────────────┤   │
│     │ 📍 Allgemein              │   │
│     │ 🛋️ Wohnzimmer             │   │
│     │ 🍽️ Esszimmer              │   │
│     │ 🍳 Küche                  │   │
│     │ 🛏️ Schlafzimmer           │   │
│     │ 👑 Hauptschlafzimmer      │   │
│     │ 🧸 Kinderzimmer           │   │
│     │ 🚪 Gästezimmer            │   │
│     │ 🚿 Badezimmer             │   │
│     │ 🛁 Hauptbadezimmer        │   │
│     │ 🚽 Gästebad               │   │
│     │ 🚻 WC                     │   │
│     │ 💼 Arbeitszimmer          │   │
│     │ 🚶 Flur                   │   │
│     │ 🏠 Eingangsbereich        │   │
│     │ 🌤️ Balkon                 │   │
│     │ 🌿 Terrasse               │   │
│     │ 🌳 Garten                 │   │
│     │ ... [scrollable]          │   │
│     └───────────────────────────┘   │
└─────────────────────────────────────┘
```

**Features:**
- **29 vordefinierte Raum-Typen** (wie in Camera)
- Scrollable Liste
- Hover-Effekt (#F6F6F6 → #E5E5E5)
- Emoji + Name für jeden Raum
- Schließen via [X] Button oder Backdrop Click

---

### 5️⃣ Raum Auswählen

**Click auf Raum-Button:**

1. ✅ Raum wird **allen ausgewählten Stacks** zugeordnet
2. ✅ Änderung wird in **localStorage** gespeichert
3. ✅ Toast Notification: "3 Stapel zu 'Wohnzimmer' zugeordnet"
4. ✅ Modal schließt automatisch
5. ✅ Edit-Modus wird deaktiviert
6. ✅ Auswahl wird geleert

**Persistenz:**
- Änderungen sofort in localStorage
- Überleben App-Restart
- Werden beim Upload mitgesendet

---

## 🎯 Code-Flow

### States

```typescript
const [editMode, setEditMode] = useState(false);
const [editingStackIds, setEditingStackIds] = useState<string[]>([]);
const [showRoomPicker, setShowRoomPicker] = useState(false);
```

### Funktionen

```typescript
// 1. Stack auswählen/abwählen
const toggleEditSelection = (stackId: string) => {
  setEditingStackIds(prev => 
    prev.includes(stackId)
      ? prev.filter(id => id !== stackId)
      : [...prev, stackId]
  );
};

// 2. Alle auswählen
const selectAllForEdit = () => {
  setEditingStackIds(stacks.map(s => s.stackId));
};

// 3. Alle abwählen
const deselectAllEdit = () => {
  setEditingStackIds([]);
};

// 4. Raum zuweisen
const handleRoomAssignment = (roomId: string) => {
  if (editingStackIds.length === 0) {
    toast.error('Bitte wählen Sie mindestens einen Stack aus');
    return;
  }

  const room = ROOM_TYPES.find(r => r.id === roomId);
  if (!room) return;

  // Update room for selected stacks
  const updatedStacks = stacks.map(stack => 
    editingStackIds.includes(stack.stackId)
      ? { 
          ...stack, 
          room: room.name,
          shots: stack.shots.map(shot => ({ ...shot, room: room.name })),
          thumbnail: { ...stack.thumbnail, room: room.name }
        }
      : stack
  );

  setStacks(updatedStacks);
  saveStacksToStorage(updatedStacks);

  toast.success(`${editingStackIds.length} Stapel zu "${room.name}" zugeordnet`);
  setShowRoomPicker(false);
  setEditingStackIds([]);
  setEditMode(false);
};
```

---

## 🎨 Visuelle States

### Normal Mode
```
┌─────────────────────────────────────┐
│ [Raum] [Hochladen]                  │
│                                     │
│ ┌────────┐ ┌────────┐ ┌────────┐  │
│ │🛋️      │ │🍳      │ │🍽️      │  │
│ │1px grey│ │1px grey│ │1px grey│  │
│ └────────┘ └────────┘ └────────┘  │
└─────────────────────────────────────┘
```

### Edit Mode - Nichts Ausgewählt
```
┌─────────────────────────────────────┐
│ [Alle] [Keine]      [Abbrechen]    │
│                                     │
│ ┌────────┐ ┌────────┐ ┌────────┐  │
│ │🛋️   ○  │ │🍳   ○  │ │🍽️   ○  │  │
│ │1px grey│ │1px grey│ │1px grey│  │
│ └────────┘ └────────┘ └────────┘  │
└─────────────────────────────────────┘
```

### Edit Mode - Auswahl Aktiv
```
┌─────────────────────────────────────┐
│ [Alle] [Keine]      [Abbrechen]    │
│                                     │
│ ┌────────┐ ┌────────┐ ┌────────┐  │
│ │🛋️   ○  │ │🍳   ✓  │ │🍽️   ○  │  │
│ │1px grey│ │2px GOLD│ │1px grey│  │
│ └────────┘ └────────┘ └────────┘  │
│                                     │
│         ┌─────────────────┐         │
│         │ 🏷️ 1 Stapel     │         │
│         │   zuordnen      │         │
│         └─────────────────┘         │
└─────────────────────────────────────┘
```

---

## 🔧 Technische Details

### Border States
```typescript
border: stack.selected 
  ? '2px solid #74A4EA'     // Selection Mode (Blue)
  : editingStackIds.includes(stack.stackId)
  ? '2px solid #C9B55A'     // Edit Mode (Gold)
  : '1px solid #E5E5E5'     // Normal (Grey)
```

### Checkmark States
```typescript
// Selection Mode (unten rechts, blau)
{selectionMode && (
  <div style={{ 
    background: stack.selected ? '#74A4EA' : 'rgba(255, 255, 255, 0.3)',
    border: stack.selected ? 'none' : '2px solid #FFFFFF'
  }}>
    {stack.selected && <Check size={14} color="#FFFFFF" />}
  </div>
)}

// Edit Mode (unten rechts, gold)
{editMode && (
  <div style={{ 
    background: editingStackIds.includes(stack.stackId) ? '#C9B55A' : 'rgba(255, 255, 255, 0.3)',
    border: editingStackIds.includes(stack.stackId) ? 'none' : '2px solid #FFFFFF'
  }}>
    {editingStackIds.includes(stack.stackId) && <Check size={14} color="#FFFFFF" />}
  </div>
)}
```

---

## 📊 Use Cases

### Szenario 1: Einzelner vergessener Stack
```
1. Raum vergessen bei einem Foto
2. [Raum] → Stack antippen → [1 Stapel zuordnen]
3. Raum wählen → Fertig
```

### Szenario 2: Ganzes Zimmer falsch
```
1. Alle 3 Badezimmer-Stacks als "Allgemein" markiert
2. [Raum] → 3 Stacks antippen → [3 Stapel zuordnen]
3. "Badezimmer" wählen → Fertig
```

### Szenario 3: Alles war falsch
```
1. Fotograf war zu faul, alles als "Allgemein"
2. [Raum] → [Alle] → [15 Stapel zuordnen]
3. ... Ups, doch nicht
4. [Abbrechen] oder einzeln bearbeiten
```

### Szenario 4: Bulk-Zuordnung
```
1. 5 Außenfotos (Garten, Terrasse, Eingang)
2. Alle 5 auswählen
3. [5 Stapel zuordnen] → "Außenansicht"
4. Später einzeln verfeinern
```

---

## 🎯 Best Practices

### ✅ DO
- Raum direkt beim Fotografieren zuordnen (schneller)
- Edit-Modus für nachträgliche Korrekturen nutzen
- "Alle" Button nur mit Vorsicht verwenden
- Regelmäßig kontrollieren, ob Räume korrekt sind

### ❌ DON'T
- Nicht alle Stacks mit "Allgemein" markieren
- Nicht Edit-Modus und Selection-Modus verwechseln
- Nicht vergessen, dass Änderungen sofort gespeichert werden
- Keine Panik bei falscher Zuordnung (jederzeit editierbar)

---

## 🚀 Status

| Feature | Status | Notes |
|---------|--------|-------|
| Edit-Modus Toggle | ✅ | Via "Raum" Button |
| Stack-Auswahl | ✅ | Gelbe Borders + Checkmarks |
| Alle/Keine Buttons | ✅ | Bulk-Selection |
| FAB Anzeige | ✅ | Nur bei Auswahl |
| Room Picker Modal | ✅ | 29 Raum-Typen |
| Raum-Zuweisung | ✅ | Multi-Stack Support |
| LocalStorage Sync | ✅ | Persistent |
| Toast Notifications | ✅ | Feedback |
| Auto-Close | ✅ | Nach Zuweisung |
| Responsive | ✅ | 3-Spalten Grid |

**Komplette Funktionalität ist bereits implementiert und einsatzbereit! 🎉**
