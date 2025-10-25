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

### Production Build
```bash
npm run build
wrangler deploy  # Cloudflare Workers
```

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
```

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
