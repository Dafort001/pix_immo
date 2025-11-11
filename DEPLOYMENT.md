# Deployment Guide - pix.immo Platform

## HALT F3: Cloudflare Pages Frontend Deployment
**Status:** ✅ Complete  
**Latest Milestone:** HALT F4a (Edit Queue Worker) abgeschlossen am 11. Nov 2025, 13:51 UTC

## Architecture Overview

**Dual Deployment Strategy:**
- **Frontend (SPA)**: Cloudflare Pages → `https://pixcapture.pages.dev`
- **Backend (API)**: Cloudflare Workers → `https://api.pixcapture.dev`

Both deployments share:
- PostgreSQL database (Neon)
- R2 object storage (Cloudflare)
- Session authentication system

---

## Frontend Deployment (Cloudflare Pages)

### Build & Deploy Scripts

**Shell Scripts (Workaround for blocked package.json):**

```bash
# Build frontend only
./scripts/build-frontend.sh

# Build + Deploy to Pages
./scripts/deploy-frontend.sh
```

**What these scripts do:**
1. Set environment variables: `VITE_APP_ENV=production`, `VITE_API_BASE_URL=https://api.pixcapture.dev`
2. Build React SPA: `vite build --outDir dist/client`
3. Deploy to Cloudflare Pages: `wrangler pages deploy ./dist/client`

### Manual Deployment

```bash
# Build
VITE_APP_ENV=production \
VITE_API_BASE_URL=https://api.pixcapture.dev \
  npx vite build --outDir dist/client

# Deploy
npx wrangler pages deploy ./dist/client \
  --project-name=pixcapture-frontend \
  --branch=main
```

### CORS Configuration

Backend must allow Pages origin (production and previews):

```typescript
// server/routes.ts + server/index.ts
const productionOrigins = [
  'https://pixcapture.pages.dev',
  'https://pixcapture.app',
  'https://pix.immo',
];

// Also accepts *.pixcapture.pages.dev for preview deployments
// SECURITY: Never use *.pages.dev wildcard (allows arbitrary CF Pages sites)
```

**Preview URL pattern:** `https://<commit-hash>.pixcapture.pages.dev`

### Smoke Test Checklist

- [ ] Homepage loads: `https://pixcapture.pages.dev/`
- [ ] Routes work: `/login`, `/orders/:id/stacks`, `/orders/:id/review`, `/orders/:id/exports`
- [ ] API calls successful (check Network tab)
- [ ] CORS headers present
- [ ] No console errors

---

## Backend Deployment (Cloudflare Workers)

### Workers Deployment

```bash
# Build backend
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/server

# Deploy
wrangler deploy
```

Configuration in `wrangler.toml` (unchanged).

## Verfügbare Scripts

- `npm run dev` - Development Server starten
- `npm run build` - Production Build erstellen
- `npm start` - Production Server starten
- `tsx scripts/db-push-wrapper.ts` - Datenbank-Schema validieren
- `tsx scripts/migrate.ts` - Migrationen ausführen (nur bei ersten Deployment)
- `npm run db:generate` - Neue Migration-Dateien generieren

## Migrations-Dateien

Die Migrations-Dateien befinden sich in `./migrations/`:
- `0000_brown_sugar_man.sql` - Initiale Schema-Migration
- `meta/_journal.json` - Migration-Journal
- `meta/0000_snapshot.json` - Schema-Snapshot

## Datenbank-Status überprüfen

Um zu überprüfen, ob die Datenbank korrekt konfiguriert ist:

```bash
tsx scripts/db-push-wrapper.ts
```

Dies sollte ausgeben:
```
✅ Database schema validated (5/5 core tables exist)
```

## Umgebungsvariablen

Stellen Sie sicher, dass folgende Umgebungsvariablen gesetzt sind:
- `DATABASE_URL` - PostgreSQL Connection String
- `NODE_ENV` - `production` für Deployment
- Alle anderen Secrets aus `.env`

## Troubleshooting

### "Database schema incomplete" Fehler

Falls Sie die Fehlermeldung sehen:
```
❌ Database schema incomplete (X/5 core tables exist)
```

Führen Sie die Migrationen manuell aus:
```bash
tsx scripts/migrate.ts
```

### "drizzle-kit push" hängt

Dies ist das bekannte Problem. Verwenden Sie stattdessen:
```bash
tsx scripts/db-push-wrapper.ts
```

### Datenbank-Verbindungsfehler

Testen Sie die Verbindung direkt:
```bash
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT 1\`.then(() => console.log('✓ Connected'));
"
```
