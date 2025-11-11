# pix.immo - Real Estate Media Platform

Professional real estate media platform connecting photographers with clients.

## 🏗️ Projekt-Struktur

pix.immo besteht aus **zwei logisch getrennten Anwendungen** im Mono-Repository:

### 📱 [Mobile PWA](./docs/mobile/README.md)
Progressive Web App für Fotografen vor Ort
- Kamera-Integration (MediaDevices API)
- iOS Design Patterns
- Offline-First
- Routes: `/app/*`, `/capture/*` (legacy)

**→ [Mobile Dokumentation](./docs/mobile/README.md)**

### 🌐 [Web Portal](./docs/portal/README.md)
Client/Admin Management & Gallery Upload System
- Gallery Upload System V1.0
- Stripe Integration
- PostgreSQL (Neon) + R2 Storage
- Routes: `/portal/*`, Root-Routes

**→ [Portal Dokumentation](./docs/portal/README.md)**

---

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
# App: http://localhost:5000
```

### Production Build & Deployment

**Cloudflare Workers (HALT B1 - Edge API):**
```bash
# Install wrangler CLI
npm install -g wrangler

# Set required secrets (one-time)
wrangler secret put DATABASE_URL
wrangler secret put SESSION_SECRET
wrangler secret put JWT_SECRET

# Deploy to preview (staging)
wrangler deploy --env preview

# Deploy to production
wrangler deploy --env production

# Verify deployment
curl https://api-preview.pix.immo/healthz  # Preview
curl https://api.pix.immo/healthz          # Production
```

**Configuration:**
- **wrangler.toml**: R2 Bindings (piximmo-media), CORS, Routes
- **Canary Routing**: X-Canary: 1 header enables native handlers
- **Proxy Fallback**: Origin API for non-canary traffic

### Cloudflare Pages Frontend Deployment

**Prerequisites:**
- Cloudflare account with Pages enabled
- GitHub repository connected to Cloudflare Pages

**Build Configuration:**
```
Build command: npm run build
Build output directory: dist/public
Node version: 22.x
```

**Environment Variables (Cloudflare Pages Dashboard):**

Production:
```env
VITE_API_BASE_URL=https://api.pix.immo
VITE_APP_ENV=production
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

Preview:
```env
VITE_API_BASE_URL=https://api-preview.pix.immo
VITE_APP_ENV=preview
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

**Local Verification:**
```bash
# Build frontend
npm run build

# Check build output
node scripts/check-deploy.js

# Preview production build (port 4173)
npx vite preview --port 4173
```

**Deploy Checklist:**
- ✅ `dist/public/index.html` exists
- ✅ `dist/public/_redirects` exists (SPA routing)
- ✅ `dist/public/_headers` exists (caching rules)
- ✅ Environment variables configured in Cloudflare Pages
- ✅ Custom domain configured (optional)

**Troubleshooting:**
- **404 on routes:** Verify `_redirects` file is deployed
- **API calls fail:** Check `VITE_API_BASE_URL` environment variable
- **Build fails:** Ensure Node version is 22.x
- **CORS errors:** Backend needs CORS configuration for frontend domain

### QA0 - Preview Smoke Checks

**Purpose:** Verify API connectivity and CORS configuration before deploying to production.

**Access:**  
- Route: `/qa` (only visible when `VITE_FEATURE_QA_GUARD=true`)
- Enable in Preview: Set `VITE_FEATURE_QA_GUARD=true` in Cloudflare Pages environment variables

**What it checks:**
1. **API Base URL**: Verifies `VITE_API_BASE_URL` is configured correctly
2. **CORS Preflight**: Tests basic CORS configuration without credentials (expects 200/401/403, not CORS block)
3. **Cookie Credentials**: Tests authenticated requests with `credentials:include` (expects 200/401, not CORS block)
4. **Signed URL Format**: Validates upload endpoint URL structure (dry-run only)
5. **Download Endpoints**: Validates download URL structure (dry-run only)

**Expected Results:**
- ✅ **PASS**: Check succeeded
- ⚠️ **WARN**: Minor issue, may still work
- ❌ **FAIL**: Critical error, deployment not recommended
- ⏭️ **SKIPPED**: Check not applicable (e.g., no login)

**Rollback Banner:**
- Appears automatically when checks FAIL
- Warns against publishing preview
- Provides link to `/qa` for details

**Common Issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| Missing API URL | `VITE_API_BASE_URL` not set | Configure in Cloudflare Pages → Settings → Environment Variables |
| CORS Blocked | Backend missing CORS headers | Add `Access-Control-Allow-Origin` header for frontend domain |
| Cookie Issues | SameSite policy mismatch | Ensure backend uses `SameSite=None; Secure` for HTTPS cross-origin |
| Network Errors | Backend not running/accessible | Check backend health and firewall rules |

**Production:**  
- QA checks are **disabled by default** in production (`VITE_FEATURE_QA_GUARD` not set)
- `/qa` route will return 404 in production builds

---

## 📚 Dokumentation

### Projekt-Übersicht
- 📄 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Architektur & Deployment-Strategien
- 📄 [replit.md](./replit.md) - Technische Details & User Preferences

### Mobile PWA
- 📂 [docs/mobile/](./docs/mobile/) - Mobile App Dokumentation
  - [README.md](./docs/mobile/README.md) - Übersicht & Features
  - [ARCHITECTURE.md](./docs/mobile/ARCHITECTURE.md) - iOS Design (geplant)
  - [CAMERA_API.md](./docs/mobile/CAMERA_API.md) - MediaDevices (geplant)

### Web Portal
- 📂 [docs/portal/](./docs/portal/) - Portal Dokumentation
  - [README.md](./docs/portal/README.md) - Übersicht & Features
  - [GALLERY_SYSTEM.md](./docs/GALLERY_SYSTEM.md) - Upload System V1.0
  - [GALLERY_API.md](./docs/GALLERY_API.md) - API Reference

### Deployment & CI/CD
- 📄 [CLOUDFLARE_SETUP_GUIDE.md](./CLOUDFLARE_SETUP_GUIDE.md) - Cloudflare Workers Setup
- 📄 [CI_SCRIPTS_READY.md](./CI_SCRIPTS_READY.md) - GitHub Actions Pipeline

### Legacy Dokumentation
- 📄 [MOBILE_CAMERA_INTEGRATION.md](./MOBILE_CAMERA_INTEGRATION.md) - Ursprüngliche Planung

---

## 🎯 Features

### Mobile App
- ✅ Native Kamera-Integration
- ✅ Photo Workflow (Camera → Gallery → Upload)
- ✅ Offline-Support (PWA)
- ✅ iOS Design Patterns

### Web Portal
- ✅ Gallery Upload System V1.0
- ✅ Session Authentication (Scrypt)
- ✅ Role-Based Access (Admin/Client)
- ✅ Stripe Payments
- ✅ Google Maps Integration
- ✅ 13 RAW Format Support

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Wouter (Routing)
- TanStack Query v5
- Shadcn UI + Tailwind CSS

### Backend
- Hono v4 (Cloudflare Workers)
- PostgreSQL (Neon) + Drizzle ORM
- R2 Object Storage
- Session-based Auth

### Deployment
- Cloudflare Workers (Production)
- Express + Vite (Development)

---

## 📦 Scripts

```bash
# Development
npm run dev              # Start dev server (HMR)

# Build
npm run build            # Vite build

# Database
npm run db:push          # Sync schema to DB
npm run db:push --force  # Force sync

# Testing
tsx server/selftest/cli.ts   # Self-test framework
npm run lint                 # ESLint
npm run check                # TypeScript

# Deployment
wrangler deploy              # Deploy to Cloudflare

# Testing (Task 8 - B1 Integration Tests)
npm test                     # Run all tests
npm run test:watch           # Watch mode
npm run test:ui              # Vitest UI
npm run test:integration     # B1 upload parity tests only
```

---

## 🧪 Testing

### HALT B1 Integration Tests (Task 8)

Integration tests validating **canary parity** between native Cloudflare Workers handlers and origin (Express) API delegation.

**Test Coverage:**
- ✅ Upload Intent (POST /api/pixcapture/upload/intent) - Canary vs Proxy
- ✅ Upload Finalize (POST /api/pixcapture/upload/finalize) - R2 verification + DB delegation
- ✅ Auth validation (Session cookies + X-Device-Token)
- ✅ Response schema parity (status codes, headers, JSON fields)
- ✅ Error handling (400/401/409/429)

**Test Infrastructure:**
- **Framework**: Vitest (Node.js integration tests)
- **Mocking**: R2 HEAD mock + Origin API mock (fetch-mock)
- **Auth**: Session cookie generator (JWT-based)
- **Fixtures**: `tests/fixtures/upload.json` (test payloads)

**Run Tests:**
```bash
npm run test:integration  # Run B1 upload parity tests
npm run test:watch        # Watch mode for TDD
npm run test:ui           # Interactive Vitest UI
```

**Test Files:**
- `tests/integration/b1.uploads.test.ts` - 8+ test cases (canary vs proxy)
- `tests/helpers/workerTestRunner.ts` - Hono worker execution with mocked bindings
- `tests/helpers/r2Mock.ts` - R2 Bucket HEAD mock
- `tests/helpers/fetchMock.ts` - Origin API HTTP mock
- `tests/helpers/jwtSession.ts` - Session cookie generator

---

## 🔐 Environment Variables

### Required Secrets
```bash
DATABASE_URL              # Neon PostgreSQL
SESSION_SECRET            # Session encryption
JWT_SECRET                # Token signing
CF_R2_*                   # R2 Storage credentials
STRIPE_SECRET_KEY         # Stripe payments
VITE_STRIPE_PUBLIC_KEY    # Stripe frontend
```

**Setup:**
```bash
wrangler secret put DATABASE_URL
wrangler secret put SESSION_SECRET
# ... etc
```

---

## 🧪 Testing

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

### Self-Test Framework
```bash
tsx server/selftest/cli.ts
```

**Test Coverage:**
- ✅ Authentication
- ✅ Routes
- ✅ Upload System
- ✅ Naming Conventions

---

## 📖 API Documentation

### Gallery Endpoints
```
POST   /api/gallery              Create gallery
GET    /api/gallery/:id          Get gallery
POST   /api/gallery/:id/upload   Upload image
PATCH  /api/gallery/:id/images/:imageId  Update presets
POST   /api/gallery/:id/finalize Finalize gallery
```

**Full API:** See [docs/GALLERY_API.md](./docs/GALLERY_API.md)

---

## 🎨 Design Guidelines

**Brand Colors - Sage & Clay v3:**
- Sage Dark `#4A5849` - Primary
- UI-Sage `#6E7E6B` - Secondary
- Copper `#A85B2E` - Accent
- Neutral White `#FAFAFA` - Background

**See:** [design_guidelines.md](./design_guidelines.md)

---

## 🚢 Deployment Strategy

### Aktuell: Bundled Deployment
Beide Apps zusammen deployed auf Cloudflare Workers:
```
pix.immo/
├── /           → Web Portal (Homepage)
├── /portal/*   → Web Portal (Gallery System)
└── /app/*      → Mobile PWA (gebündelt)
```

### Zukunft: Separate Deployments (Optional)
```
portal.pix.immo → Cloudflare Workers (Web Portal)
app.pix.immo    → Vercel/Netlify (Mobile PWA)
```

**Details:** [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

---

## 📝 License

Proprietary - All rights reserved

---

## 👥 Team

**Developer:** Replit Agent  
**Platform:** Replit  
**Framework:** Hono + React  
**Deployment:** Cloudflare Workers

---

## 🔗 Links

- **Repository:** https://github.com/Dafort001/EstateSandbox
- **Production:** (Cloudflare Workers URL)
- **Mobile App:** pix.immo/app
- **Web Portal:** pix.immo/portal

---

**Status:** ✅ Production Ready (Gallery Upload System V1.0)  
**Version:** 1.0.0  
**Last Updated:** Oktober 2025
