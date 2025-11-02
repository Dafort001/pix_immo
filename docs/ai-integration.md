# AI-Integration pix.immo

## Übersicht

Das pix.immo AI-System nutzt zwei spezialisierte Anbindungen:

### 1. Bildbearbeitung (Replicate oder Clipdrop)
Für professionelle Bildoptimierung und -bearbeitung.

### 2. Text & Captioning (OpenAI ChatGPT)
Für intelligente Bildbeschreibungen und Exposé-Texte.

---

## Konfiguration

### Environment Variables

```bash
# Bildbearbeitung (wähle einen Provider)
AI_IMAGE_PROVIDER=replicate  # oder 'clipdrop'

# Replicate API
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxx

# Clipdrop API (Alternative)
CLIPDROP_API_KEY=xxxxxxxxxxxx

# OpenAI für Captioning
OPENAI_API_KEY=sk-xxxxxxxxxxxx
```

---

## 1. Bildbearbeitung

### Provider-Auswahl

Setze `AI_IMAGE_PROVIDER` auf einen der folgenden Werte:

- **`replicate`** (Standard) - Replicate AI Platform
- **`clipdrop`** - Clipdrop API

### Replicate Features

**API-Key beantragen**: https://replicate.com/account/api-tokens

**Verfügbare Tools**:
- ✨ **Upscale 2x/4x** - KI-basiertes Super-Resolution
- 🎨 **Denoise** - Rauschunterdrückung
- 🌈 **White Balance** - Farbkorrektur
- ☁️ **Sky Enhancement** - Himmel-Austausch
- 📸 **HDR Merge** - Belichtungsreihen zusammenfügen

**Kosten**: ~€0.05-€0.20 pro Bild (je nach Tool)

### Clipdrop Features

**API-Key beantragen**: https://clipdrop.co/apis/pricing

**Verfügbare Tools**:
- ✨ **Upscale 2x/4x** - Hochauflösende Vergrößerung
- 🎭 **Background Removal** - Hintergrund entfernen
- 🧹 **Object Removal** - Objekte aus Bildern entfernen
- 💡 **Relighting** - Portrait-Beleuchtung
- ☁️ **Sky Replacement** - Himmel ersetzen

**Kosten**: ~€0.05-€0.15 pro Bild

---

## 2. OpenAI ChatGPT (Captioning)

### Setup

**API-Key beantragen**: https://platform.openai.com/api-keys

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx
```

### Features

#### 📝 Automatische Bildbeschreibungen

```typescript
import { generateCaption } from './server/openai-adapter';

const result = await generateCaption({
  imageUrl: 'https://example.com/image.jpg',
  options: {
    language: 'de',
    style: 'marketing',
    roomType: 'Wohnzimmer',
    maxLength: 150,
  },
});

console.log(result.caption);
// "Helles, großzügiges Wohnzimmer mit modernem Design. 
//  Bodentiefe Fenster sorgen für natürliches Licht..."
```

#### 📋 Exposé-Generierung

```typescript
import { generateExposeText } from './server/openai-adapter';

const expose = await generateExposeText({
  propertyName: 'Moderne Stadtvilla',
  propertyAddress: 'Musterstraße 123, 20095 Hamburg',
  roomCaptions: [
    { roomType: 'Wohnzimmer', caption: 'Großzügiger...' },
    { roomType: 'Küche', caption: 'Hochwertige...' },
  ],
  additionalInfo: '4 Zimmer, 120 qm, Baujahr 2020',
});
```

#### 🎯 Batch-Verarbeitung

```typescript
import { generateCaptionBatch } from './server/openai-adapter';

const results = await generateCaptionBatch([
  { url: 'image1.jpg', roomType: 'Küche' },
  { url: 'image2.jpg', roomType: 'Bad' },
  { url: 'image3.jpg', roomType: 'Schlafzimmer' },
]);
```

### Supported Models

- **gpt-4o** - Multimodal mit Vision (Standard)
- **gpt-4o-mini** - Schnellere Alternative
- **gpt-4-turbo** - Legacy

### Kosten

- **GPT-4o**: ~$0.005 pro Bild (Vision)
- **GPT-4o-mini**: ~$0.0015 pro Bild

**Tipp**: Nutze `maxLength` Parameter um Token-Kosten zu kontrollieren.

---

## Code-Beispiele

### Bildbearbeitung mit Replicate

```typescript
import { runAITool } from './server/replicate-adapter';

const result = await runAITool({
  toolId: 'upscale_x2',
  sourceImageUrl: 'https://example.com/image.jpg',
  webhookUrl: 'https://my-app.com/api/webhooks/ai',
});
```

### Bildbearbeitung mit Clipdrop

```typescript
import { runClipDropFromUrl } from './server/clipdrop-adapter';

const result = await runClipDropFromUrl(
  'remove_background',
  'https://example.com/image.jpg'
);

// Speichere das Ergebnis
await fs.writeFile('output.png', result.outputBuffer);
```

### Caption-Generierung

```typescript
import { generateCaption } from './server/openai-adapter';

const caption = await generateCaption({
  imageUrl: 'https://example.com/living-room.jpg',
  options: {
    language: 'de',
    style: 'marketing',
    roomType: 'Wohnzimmer',
  },
});
```

---

## Provider-Vergleich

| Feature | Replicate | Clipdrop | OpenAI |
|---------|-----------|----------|--------|
| **Upscaling** | ✅ | ✅ | ❌ |
| **Background Removal** | ❌ | ✅ | ❌ |
| **Sky Replacement** | ✅ | ✅ | ❌ |
| **Image Captioning** | ❌ | ❌ | ✅ |
| **Text Generation** | ❌ | ❌ | ✅ |
| **Kosten/Bild** | €0.08-€0.20 | €0.05-€0.15 | €0.005 |
| **Processing Zeit** | 10-30s | 5-15s | 2-5s |

---

## Best Practices

### 1. Provider-Wahl

- **Replicate**: Beste Qualität für Upscaling und HDR
- **Clipdrop**: Schneller, günstiger, gut für Batch-Processing
- **OpenAI**: Unschlagbar für Texte und Captions

### 2. Kosten-Optimierung

```typescript
// Batch-Verarbeitung für bessere Performance
const images = [...]; // Array von Bildern
const captions = await generateCaptionBatch(images);

// Rate Limiting vermeiden
// OpenAI: Max 3500 requests/min
// Replicate: Unlimitiert (Pay-per-use)
```

### 3. Error Handling

```typescript
try {
  const result = await generateCaption({ ... });
} catch (error) {
  if (error.message.includes('quota')) {
    // API-Limit erreicht
  } else if (error.message.includes('401')) {
    // Ungültiger API-Key
  }
}
```

### 4. Caching

```typescript
// Caption cachen um wiederholte API-Calls zu vermeiden
const cachedCaption = await redis.get(`caption:${imageId}`);
if (cachedCaption) return cachedCaption;

const caption = await generateCaption({ ... });
await redis.set(`caption:${imageId}`, caption, 'EX', 86400);
```

---

## Migration von Modal Labs

Die veraltete Modal Labs Integration wurde durch das neue System ersetzt:

### Alte Konfiguration (veraltet)
```bash
MODAL_API_TOKEN=xxx  # ❌ Nicht mehr verwendet
```

### Neue Konfiguration
```bash
# Bildbearbeitung
AI_IMAGE_PROVIDER=replicate  # oder clipdrop
REPLICATE_API_TOKEN=xxx

# Captioning
OPENAI_API_KEY=xxx
```

### Code-Migration

**Alt** (Modal):
```typescript
// ❌ Veraltet
const result = await modalClient.run('image-upscale', { ... });
```

**Neu** (Replicate/Clipdrop + OpenAI):
```typescript
// ✅ Bildbearbeitung
const enhanced = await runAITool({
  toolId: 'upscale_x2',
  sourceImageUrl: imageUrl,
});

// ✅ Captioning
const caption = await generateCaption({
  imageUrl: imageUrl,
  options: { language: 'de' },
});
```

---

## Support & Troubleshooting

### Häufige Fehler

**1. "API key not configured"**
```bash
# Prüfe Environment Variables
echo $REPLICATE_API_TOKEN
echo $OPENAI_API_KEY
```

**2. "Rate limit exceeded"**
- Warte 60 Sekunden
- Implementiere exponentielles Backoff
- Upgrade API-Plan

**3. "Invalid image URL"**
- URLs müssen öffentlich zugänglich sein
- HTTPS-URLs bevorzugt
- Max. 20MB Bildgröße

### Logs

```typescript
// Debug-Modus aktivieren
process.env.DEBUG = 'ai:*';
```

---

## Links

- **Replicate**: https://replicate.com/docs
- **Clipdrop**: https://clipdrop.co/apis/docs
- **OpenAI**: https://platform.openai.com/docs
- **pix.immo Docs**: https://github.com/your-repo/docs
