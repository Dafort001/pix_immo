# pix.immo - Documentation Index

Zentrale Navigation durch die gesamte Projekt-Dokumentation.

---

## 📋 Quick Navigation

| Kategorie | Dokument | Beschreibung |
|-----------|----------|--------------|
| 🏗️ **Übersicht** | [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) | Architektur & Deployment-Strategien |
| 📱 **Mobile PWA** | [docs/mobile/](./mobile/) | Komplette Mobile-App Dokumentation |
| 🌐 **Web Portal** | [docs/portal/](./portal/) | Web-Portal & Gallery System |
| 🚀 **Deployment** | [portal/DEPLOYMENT.md](./portal/DEPLOYMENT.md) | Cloudflare Workers Setup |
| 🐙 **GitHub** | [GITHUB_README.md](../GITHUB_README.md) | Public Repository README |

---

## 📱 Mobile PWA Dokumentation

**Verzeichnis:** [`docs/mobile/`](./mobile/)

| Dokument | Zweck |
|----------|-------|
| [README.md](./mobile/README.md) | Features, Routes, API Integration |
| [ARCHITECTURE.md](./mobile/ARCHITECTURE.md) | iOS Design Patterns, Komponenten |
| [CAMERA_API.md](./mobile/CAMERA_API.md) | MediaDevices API Referenz |
| [PLANNING.md](./mobile/PLANNING.md) | Ursprüngliche Planung (Legacy) |

**Key Topics:**
- Camera Integration (MediaDevices API)
- iOS-Style UI Components
- PWA Configuration & Service Worker
- Photo Workflow (Camera → Gallery → Upload)
- Offline-First Architecture

---

## 🌐 Web Portal Dokumentation

**Verzeichnis:** [`docs/portal/`](./portal/)

| Dokument | Zweck |
|----------|-------|
| [README.md](./portal/README.md) | Features, Routes, Database Schema |
| [GALLERY_SYSTEM.md](./portal/GALLERY_SYSTEM.md) | Upload System V1.0 Details |
| [GALLERY_API.md](./portal/GALLERY_API.md) | API Endpoints & Examples |
| [DEPLOYMENT.md](./portal/DEPLOYMENT.md) | Cloudflare Workers Deployment |

**Key Topics:**
- Gallery Upload System V1.0
- Three Workflow Types (Customer, Photographer, Editing)
- Editing Presets & Annotations
- Session Authentication
- Stripe Integration
- PostgreSQL Schema

---

## 🏗️ Architektur & Struktur

### Gesamtübersicht
- [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) - Mono-Repo Architektur
- [replit.md](../replit.md) - Technische Details & Preferences

### Deployment-Strategien

**Aktuell: Bundled Deployment**
```
pix.immo/
├── /           → Web Portal (Homepage)
├── /portal/*   → Web Portal (Gallery System)
└── /app/*      → Mobile PWA (gebündelt)
```

**Zukunft: Separate Deployments (Optional)**
```
portal.pix.immo → Cloudflare Workers (Web Portal)
app.pix.immo    → Vercel/Netlify (Mobile PWA)
```

---

## 🔧 Development Guidelines

### Quick Start
```bash
npm install
npm run dev
# → http://localhost:5000
```

### Mobile Testing
```bash
# Browser DevTools
Chrome → Device Toolbar (Cmd+Shift+M) → iPhone 14 Pro

# Real Device (empfohlen)
npm run dev -- --host
# → https://<local-ip>:5000/app
```

### Database Migrations
```bash
npm run db:push          # Sync schema
npm run db:push --force  # Force sync
```

---

## 🧪 Testing

### Self-Test Framework
```bash
tsx server/selftest/cli.ts
```

**Plugins:**
- Auth Validation
- Routes Validation
- Upload System Checks
- Naming Conventions

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

**Coverage:**
- Mobile camera workflow
- Gallery upload flows
- Payment integration
- Status tracking

---

## 📚 API Reference

### Gallery Endpoints
```
POST   /api/gallery                        Create gallery
GET    /api/gallery/:id                    Get gallery
POST   /api/gallery/:id/upload             Upload image
PATCH  /api/gallery/:id/images/:imageId    Update presets
POST   /api/gallery/:id/finalize           Finalize & export
```

**Full Docs:** [portal/GALLERY_API.md](./portal/GALLERY_API.md)

### Mobile Upload Endpoints
```
POST   /api/ios/upload/init                Init session
POST   /api/ios/upload/presigned           Get R2 URL
POST   /api/ios/upload/confirm             Confirm upload
```

---

## 🎨 Design System

### Brand Colors - Sage & Clay v3
```css
--sage-dark: #4A5849      /* Primary */
--ui-sage: #6E7E6B        /* Secondary */
--copper: #A85B2E         /* Accent */
--copper-dark: #8F4C28    /* Hover */
--neutral-white: #FAFAFA  /* Background */
```

**Full Guidelines:** [design_guidelines.md](../design_guidelines.md)

---

## 🔐 Security

### Authentication
- Session-based (HTTP-only cookies)
- Scrypt password hashing
- Role-based access (Admin/Client)
- Rate limiting

### Data Protection
- HTTPS required for camera
- Presigned R2 URLs
- Content-Security-Policy
- SQL injection protection (Drizzle)

---

## 🚀 CI/CD Pipeline

**Workflow:** `.github/workflows/piximmo-ci.yml`

**Jobs:**
1. **lint-and-build** - ESLint, TypeScript, Vite Build
2. **wrangler-dry-run** - Config validation
3. **deploy-staging** - Staging deployment (develop branch)
4. **deploy-production** - Production deployment (main branch)

**Manual Trigger:**
1. https://github.com/Dafort001/EstateSandbox/actions
2. "Run workflow"

---

## 📦 File Structure

```
pix.immo/
├── 📄 README.md                    → Local dev overview
├── 📄 GITHUB_README.md             → Public repo README
├── 📄 PROJECT_STRUCTURE.md         → Architecture
├── 📄 replit.md                    → Tech details
│
├── 📂 docs/
│   ├── INDEX.md                    → This file
│   ├── mobile/                     → Mobile PWA docs
│   │   ├── README.md
│   │   ├── ARCHITECTURE.md
│   │   ├── CAMERA_API.md
│   │   └── PLANNING.md
│   └── portal/                     → Web Portal docs
│       ├── README.md
│       ├── GALLERY_SYSTEM.md
│       ├── GALLERY_API.md
│       └── DEPLOYMENT.md
│
├── 📂 client/src/
│   ├── pages/
│   │   ├── app/                    → Mobile screens
│   │   ├── portal/                 → Portal screens
│   │   └── ...                     → Public pages
│   └── components/
│       ├── mobile/                 → Mobile components
│       ├── gallery/                → Gallery components
│       └── ui/                     → Shadcn components
│
├── 📂 server/
│   ├── routes.ts                   → API routes
│   ├── storage.ts                  → Database interface
│   └── selftest/                   → Test framework
│
└── 📂 shared/
    └── schema.ts                   → Drizzle models
```

---

## 🔍 Troubleshooting

### Common Issues

**Camera nicht verfügbar:**
- ✅ HTTPS erforderlich (localhost OK)
- ✅ Browser-Permissions erteilt?
- ✅ Kamera nicht blockiert?

**Upload schlägt fehl:**
- ✅ R2 Credentials korrekt?
- ✅ Network online?
- ✅ File size limits?

**Database connection failed:**
- ✅ DATABASE_URL secret gesetzt?
- ✅ Neon database aktiv?
- ✅ Connection pooling enabled?

**Deployment failed:**
- ✅ wrangler.toml validiert?
- ✅ Secrets konfiguriert?
- ✅ Build successful?

---

## 📞 Support

**Für Entwickler:**
- GitHub Issues: [EstateSandbox](https://github.com/Dafort001/EstateSandbox/issues)
- Docs: Diese Index-Datei

**Für Business-Anfragen:**
- Email: support@pix.immo (placeholder)

---

## 🎯 Version History

| Version | Status | Features |
|---------|--------|----------|
| **1.0.0** | ✅ Production Ready | Gallery Upload V1.0, Mobile PWA, Session Auth |
| **1.1.0** | 🔜 Planned | AI Analysis, Email Integration, Advanced Camera |
| **2.0.0** | 🔮 Future | Analytics, CRM, Multi-Language |

---

## 🗺️ Documentation Roadmap

### Completed ✅
- [x] Mobile PWA Documentation
- [x] Web Portal Documentation
- [x] Deployment Guide
- [x] API Reference
- [x] Architecture Overview
- [x] GitHub README

### Geplant 🔜
- [ ] Video Tutorials
- [ ] Component Storybook
- [ ] Swagger/OpenAPI Spec
- [ ] Admin User Guide
- [ ] Client User Guide

---

<div align="center">

**pix.immo Documentation**

Vollständige Referenz für Entwickler, Admins & Clients

[Mobile Docs](./mobile/) • [Portal Docs](./portal/) • [Architecture](../PROJECT_STRUCTURE.md) • [Deployment](./portal/DEPLOYMENT.md)

</div>
