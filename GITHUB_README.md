# pix.immo

> Professional Real Estate Media Platform

Transform property photography with AI-powered workflows, seamless uploads, and professional editing management.

[![Status](https://img.shields.io/badge/status-production--ready-success)](https://github.com/Dafort001/EstateSandbox)
[![License](https://img.shields.io/badge/license-proprietary-blue)](./LICENSE)
[![Built with](https://img.shields.io/badge/built%20with-Hono%20%2B%20React-orange)](https://hono.dev)

---

## 🎯 What is pix.immo?

pix.immo is a comprehensive platform connecting real estate professionals with photography services. Built for the modern web, it combines powerful backend infrastructure with intuitive interfaces for photographers, clients, and administrators.

### Two Applications, One Platform

```
📱 Mobile PWA           →  iOS-style camera app for on-site photography
🌐 Web Portal           →  Professional gallery management & client portal
```

---

## ✨ Features

### For Photographers
- 📷 **Native Camera Integration** - High-resolution capture via browser
- 🎨 **iOS Design Patterns** - Familiar interface on any device
- 📤 **Smart Upload System** - Direct to cloud with progress tracking
- 🔌 **Offline Support** - PWA technology for unreliable networks

### For Clients
- 🖼️ **Gallery Upload System** - Multi-workflow upload with editing presets
- 💳 **Integrated Payments** - Stripe checkout for seamless transactions
- 📊 **Order Tracking** - Real-time status updates
- 📥 **Instant Downloads** - Packaged deliveries ready to use

### For Admins
- 👥 **Role-Based Access** - Granular permission system
- 🎯 **13 RAW Format Support** - DNG, CR2, NEF, ARW, ORF, and more
- 🔧 **Editing Presets** - Style, Window, Sky configurations
- 🎨 **Annotation Tools** - Freehand masking for precise edits

---

## 🚀 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Wouter (Routing)
- TanStack Query v5
- Shadcn UI + Tailwind CSS

**Backend:**
- Hono v4 (Cloudflare Workers)
- PostgreSQL (Neon)
- Drizzle ORM
- R2 Object Storage

**Mobile:**
- Progressive Web App (PWA)
- MediaDevices API
- Service Worker (Offline-First)

**Deployment:**
- Cloudflare Workers (Production)
- GitHub Actions (CI/CD)
- Express + Vite (Development)

---

## 📱 Screenshots

### Mobile Camera App
```
┌─────────────────────┐
│   iOS StatusBar     │
├─────────────────────┤
│                     │
│   Camera Preview    │
│   (Live Feed)       │
│                     │
├─────────────────────┤
│  [📷] [🔄] [⚡]   │
└─────────────────────┘
```

### Web Portal
- Dashboard with role-specific navigation
- Gallery grid with drag-drop upload
- Editing presets & annotation tools
- Payment integration & delivery packages

---

## 🏗️ Architecture

### Mono-Repository Structure
```
pix.immo/
├── 📱 Mobile PWA (/app/*)
│   ├── Camera, Gallery, Upload screens
│   ├── iOS design components
│   └── MediaDevices API integration
│
├── 🌐 Web Portal (/portal/*)
│   ├── Gallery Upload System V1.0
│   ├── Payment & Status Tracking
│   └── Admin Management
│
├── 🔧 Shared Backend
│   ├── Hono API routes
│   ├── PostgreSQL + Drizzle
│   └── R2 Object Storage
│
└── 📚 Documentation
    ├── docs/mobile/ - Mobile PWA docs
    ├── docs/portal/ - Web Portal docs
    └── PROJECT_STRUCTURE.md
```

---

## 🎨 Gallery Upload System V1.0

### Three Workflow Types

**1. Customer Upload**
- Clients upload reference images
- JPEG/PNG/HEIC support
- Drag & drop interface

**2. Photographer RAW**
- Professional RAW file upload
- 13 format support (DNG, CR2, NEF, ARW, ORF, RW2, RAF, PEF, SR2, X3F, 3FR, FFF, MEF)
- Automatic thumbnail generation

**3. Final Editing**
- Edited image upload with presets
- Style: PURE | EDITORIAL | CLASSIC
- Window: CLEAR | SCANDINAVIAN | BRIGHT
- Sky: CLEAR BLUE | PASTEL CLOUDS | DAYLIGHT SOFT | EVENING HAZE
- Boolean corrections: Vertical, De-Noise, Removals
- Canvas-based annotation tool

---

## 🚢 Deployment

### Quick Start (Development)
```bash
npm install
npm run dev
# → http://localhost:5000
```

### Production (Cloudflare Workers)
```bash
npm run build
wrangler deploy
```

### Environment Setup
```bash
# Required Secrets
wrangler secret put DATABASE_URL
wrangler secret put SESSION_SECRET
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put CF_R2_ACCESS_KEY
# ... (see docs/portal/DEPLOYMENT.md)
```

---

## 📚 Documentation

### Getting Started
- [Quick Start Guide](./README.md) - Local development setup
- [Project Structure](./PROJECT_STRUCTURE.md) - Architecture overview

### Mobile PWA
- [Mobile README](./docs/mobile/README.md) - Features & screens
- [Architecture](./docs/mobile/ARCHITECTURE.md) - iOS design patterns
- [Camera API](./docs/mobile/CAMERA_API.md) - MediaDevices integration

### Web Portal
- [Portal README](./docs/portal/README.md) - Features & workflows
- [Gallery System](./docs/portal/GALLERY_SYSTEM.md) - Upload system V1.0
- [Deployment](./docs/portal/DEPLOYMENT.md) - Cloudflare setup

---

## 🔐 Security

- ✅ Session-based authentication (HTTP-only cookies)
- ✅ Scrypt password hashing
- ✅ Role-based access control (Admin/Client)
- ✅ Rate limiting on auth endpoints
- ✅ HTTPS required for camera access
- ✅ Presigned URLs for R2 uploads
- ✅ Content-Security-Policy headers

---

## 🧪 Testing

### Self-Test Framework
```bash
tsx server/selftest/cli.ts
```

**Coverage:**
- Authentication flows
- Route validation
- Upload system
- Naming conventions

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

---

## 🤝 Contributing

This is a proprietary platform. For inquiries about access or collaboration, please contact the maintainers.

---

## 📄 License

Proprietary - All rights reserved

---

## 🔗 Links

- **Live Demo:** (Coming soon)
- **Documentation:** [Project Wiki](./docs/)
- **GitHub:** [EstateSandbox](https://github.com/Dafort001/EstateSandbox)

---

## 🎯 Roadmap

### ✅ Completed (v1.0.0)
- Gallery Upload System V1.0
- Mobile PWA Camera Integration
- Session Authentication
- Stripe Payments
- PostgreSQL + R2 Storage
- 13 RAW Format Support

### 🔜 Upcoming (v1.1.0)
- AI Image Analysis (Replicate)
- Mailgun Email Integration
- Advanced Camera Features (HDR Bracketing)
- Background Sync (Upload Queue)
- Native iOS App Export

### 🔮 Future
- Analytics Dashboard
- CRM Integration
- Multi-Language Support
- White-Label Solutions

---

## 👥 Team

**Built with:** Replit Agent + Hono + React  
**Deployment:** Cloudflare Workers  
**Database:** Neon PostgreSQL  
**Storage:** Cloudflare R2

---

## 📞 Support

For technical support or business inquiries:
- **Email:** support@pix.immo (placeholder)
- **GitHub Issues:** [Report a bug](https://github.com/Dafort001/EstateSandbox/issues)

---

<div align="center">

**pix.immo** - Professional Real Estate Media Platform

Built for the modern web • Deployed on the edge

</div>
