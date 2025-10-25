# pix.immo – Galerie Upload & Editing System (V1.0)

## 🧭 Ziel
Dieses Replit-Projekt implementiert das komplette Upload- und Galeriesystem für pix.immo:
- Upload (RAW + JPG)
- Annotation (Kommentare + Masken)
- Bearbeitung & Freigabe
- Übergabe an Worker (AI-Analyse)
- stabile, produktionsfertige V1 ohne geplante Nachreichungen

---

## ⚙️ Projektstruktur
/api          → Express/CF API-Endpunkte  
/web          → Frontend-UI (React/Vue/Svelte oder Hono JSX)  
/docs         → Spezifikationen & technische Dokumentation  
/schemas      → JSON-Schemas für Validierung  
/scripts      → Utility- und CI-Skripte  

---

## 🧩 Setup

### 1️⃣ Environment
Kopiere `.env.example` zu `.env` und fülle deine Zugangsdaten aus:
```bash
cp .env.example .env
```

Erforderliche Schlüssel:
```
R2_ACCOUNT_ID
R2_BUCKET
R2_ACCESS_KEY
R2_SECRET
JWT_SECRET
```

---

### 2️⃣ Dependencies installieren
```bash
npm install
```
Empfohlene Pakete:
```
ajv ajv-formats dotenv express busboy file-type jsonwebtoken sharp axios
```

---

### 3️⃣ Startbefehle
**Development:**
```bash
npm run dev
```
→ Startet Server auf Port 3000 mit automatischem Reload.

**Schema-Test:**
```bash
node scripts/validate-meta.js
```
→ Validiert Beispiel `sample_gallery_meta.json` gegen das Schema.

---

## 🧠 CI / QA
- Alle `P0`-Tasks aus `prelaunch_qa_checklist_v1.md` müssen erfüllt sein.
- `npm test` sollte Schema-Validierungen und API-Smoke-Tests enthalten.
- Upload-Flow: `Upload → Annotate → Save → Finalize → Worker Trigger` muss vollständig durchlaufen.

---

## 📦 Deployment
- Backend: Cloudflare Workers oder Node (z. B. via Replit / Modal)
- Storage: Cloudflare R2
- CDN: Cloudflare Images / R2 Public Endpoint
- Monitoring: Sentry oder Cloudflare Logs

---

## ✅ Definition of Done
- Upload + Bearbeitung vollständig stabil  
- gallery_meta.json validiert  
- Logs, Auth, Fehler-Handling integriert  
- Keine „Version 2“ erforderlich
