# 🌐 pix.immo Web Portal

Professionelles Client/Admin Portal für Property Photography Management.

## Übersicht

Das Web Portal ist die Hauptanwendung für Desktop-Nutzer (Clients, Admins, Fotografen) zur Verwaltung von Aufträgen, Gallerien und Zahlungen.

### Features

- ✅ **Gallery Upload System V1.0** - Multi-Workflow Upload mit Presets
- ✅ **Role-Based Access** - Admin/Client Rollen
- ✅ **Session Authentication** - HTTP-only Cookies, Scrypt Hashing
- ✅ **Stripe Integration** - Payment Processing
- ✅ **Google Maps Integration** - Address Verification
- ✅ **PostgreSQL (Neon)** - Managed Database
- ✅ **R2 Object Storage** - RAW Files & Assets

---

## Routes

### Public Routes
```
/                    → Homepage
/gallery             → Public Gallery (Client View)
/pricing             → Service Pricing
/login               → Login Page
/register            → Registration
```

### Portal Routes (Authentication Required)
```
/dashboard                      → User Dashboard
/portal/uploads                 → Upload Overview
/portal/gallery-upload          → Customer Upload
/portal/gallery-photographer    → Photographer RAW Upload
/portal/gallery-editing         → Final Editing Gallery
/portal/payment/:jobId          → Stripe Checkout
/portal/status/:jobId           → Order Status Timeline
/portal/delivery/:jobId         → Download Packages
```

### Admin Routes (Admin Role Required)
```
/admin-editorial                → Editorial Management
/admin-seo                      → SEO Settings
```

---

## Gallery Upload System V1.0

### Workflow-Typen

**1. Customer Upload** (`/portal/gallery-upload`)
- Client lädt Referenzbilder hoch
- JPEG/PNG/HEIC Support
- Drag & Drop Interface

**2. Photographer RAW** (`/portal/gallery-photographer`)
- Fotograf lädt RAW-Dateien hoch
- 13 RAW-Formate (DNG, CR2, NEF, ARW, etc.)
- Automatic Thumbnail Generation

**3. Final Editing** (`/portal/gallery-editing`)
- Editor lädt bearbeitete JPEGs hoch
- Editing Presets (Style, Window, Sky)
- Annotation Tool (Freehand Masking)

### Features

**Upload:**
- Multi-File Drag & Drop
- Progress Tracking
- Error Recovery mit Retry-Button

**Editing Presets:**
```typescript
Style: PURE | EDITORIAL | CLASSIC
Window: CLEAR | SCANDINAVIAN | BRIGHT
Sky: "CLEAR BLUE" | "PASTEL CLOUDS" | "DAYLIGHT SOFT" | "EVENING HAZE"
```

**Boolean Corrections:**
- ✅ Vertical Correction (Stürzende Linien)
- ✅ De-Noise (Rauschreduzierung)
- ✅ Removals (Objekte entfernen)

**Annotation Tool:**
- Canvas-basierte Freehand-Zeichnung
- PNG-Mask Export
- Per-File Annotations

---

## Komponenten

### Portal Pages
```typescript
client/src/pages/portal/
├── uploads-overview.tsx        → Job List & Status
├── gallery-upload.tsx          → Customer Upload Workflow
├── gallery-photographer.tsx    → RAW Upload Workflow
├── gallery-editing.tsx         → Final Editing Workflow
├── gallery-selection.tsx       → Image Selection Interface
├── payment.tsx                 → Stripe Checkout
├── status-timeline.tsx         → 5-Step Progress Tracker
└── delivery.tsx                → Download Packages
```

### Gallery Components
```typescript
client/src/components/gallery/
├── GalleryGrid.tsx             → Responsive Image Grid
├── UploadDialog.tsx            → Multi-File Upload Dialog
├── DetailSidebar.tsx           → Image Detail & Presets
└── MaskEditor.tsx              → Canvas Annotation Tool
```

### Shared Components
```typescript
client/src/components/
├── WebHeader.tsx               → Desktop Navigation
├── AddressAutocomplete.tsx     → Google Maps Places
├── StaticMapThumbnail.tsx      → Map Previews
└── SEOHead.tsx                 → Meta Tags Component
```

---

## Database Schema

### Key Tables

**Users:**
```typescript
users {
  id: serial
  email: varchar
  passwordHash: varchar
  role: 'admin' | 'client'
  firstName: varchar
  lastName: varchar
}
```

**Galleries:**
```typescript
galleries {
  id: serial
  type: 'customer_upload' | 'photographer_raw' | 'final_edited'
  status: 'active' | 'finalized'
  createdAt: timestamp
}
```

**Gallery Images:**
```typescript
gallery_images {
  id: serial
  galleryId: integer
  originalFilename: varchar
  r2Key: varchar
  thumbnailR2Key: varchar
  editingPresets: jsonb          // Style, Window, Sky, Booleans
  annotationMask: varchar        // PNG mask R2 key
}
```

**Full Schema:** See `shared/schema.ts`

---

## API Reference

### Gallery Endpoints

**Create Gallery:**
```
POST /api/gallery
Body: { type: 'customer_upload' | 'photographer_raw' | 'final_edited' }
Response: { id: number, type: string, status: string }
```

**Get Gallery:**
```
GET /api/gallery/:id
Response: { gallery: {...}, images: [...] }
```

**Upload Image:**
```
POST /api/gallery/:id/upload
Body: FormData with 'file' field
Response: { imageId: number, thumbnailUrl: string }
```

**Update Image Presets:**
```
PATCH /api/gallery/:id/images/:imageId
Body: { 
  editingPresets: {
    style: 'PURE' | 'EDITORIAL' | 'CLASSIC',
    window: 'CLEAR' | 'SCANDINAVIAN' | 'BRIGHT',
    sky: 'CLEAR BLUE' | ...,
    verticalCorrection: true,
    deNoise: false,
    removals: false
  }
}
```

**Finalize Gallery:**
```
POST /api/gallery/:id/finalize
Response: { metadataUrl: string } // JSON export URL
```

**Full API Docs:** See `docs/GALLERY_API.md`

---

## Authentication

### Session-Based Auth

**Login:**
```typescript
POST /api/auth/login
Body: { email: string, password: string }
Response: Set-Cookie: sessionId (HTTP-only)
```

**Session Storage:**
- PostgreSQL with `connect-pg-simple`
- HTTP-only Cookies
- SameSite=Lax
- 7-day expiration

**Password Hashing:**
- Scrypt (Lucia-compatible)
- 64-byte salt
- 64-byte hash

### Role-Based Access

**Middleware:**
```typescript
// server/routes.ts
app.use('/portal/*', requireAuth);
app.use('/admin-*', requireRole('admin'));
```

**Frontend Guards:**
```typescript
// client/src/App.tsx
<Route path="/portal/*" component={ProtectedRoute} />
```

---

## Deployment (Cloudflare Workers)

### Build Process

```bash
npm run build        # Vite Build → dist/
wrangler deploy      # Deploy to Cloudflare
```

### Environment Variables

**Required Secrets:**
```bash
DATABASE_URL              # Neon PostgreSQL
SESSION_SECRET            # Session Encryption
JWT_SECRET                # Token Signing
CF_R2_*                   # R2 Object Storage Credentials
STRIPE_SECRET_KEY         # Stripe Payments
VITE_STRIPE_PUBLIC_KEY    # Stripe Frontend
```

**Setup:**
```bash
wrangler secret put DATABASE_URL
wrangler secret put SESSION_SECRET
# ... etc
```

### Wrangler Configuration

**wrangler.toml:**
```toml
name = "pix-immo"
main = "server/index.ts"
compatibility_date = "2024-01-01"

[vars]
NODE_ENV = "production"

[[r2_buckets]]
binding = "R2"
bucket_name = "pix-immo-storage"
```

---

## Development

### Local Setup

```bash
npm install
npm run dev              # Express + Vite (HMR)
# App: http://localhost:5000
```

### Database Migrations

```bash
npm run db:push          # Sync schema to DB
npm run db:push --force  # Force sync (data loss)
```

**Never manually write SQL migrations!** Use Drizzle's push command.

### Testing

**E2E Tests (Playwright):**
```bash
npm run test:e2e
```

**Self-Test Framework:**
```bash
tsx server/selftest/cli.ts
```

---

## Production Checklist

### Pre-Deployment

- [ ] `npm run lint` passes
- [ ] `npm run check` (TypeScript) passes
- [ ] `npm run build` succeeds
- [ ] All environment secrets configured
- [ ] Database migrations applied
- [ ] Wrangler dry-run passes

### Post-Deployment

- [ ] Health check: `GET /api/health`
- [ ] Session authentication working
- [ ] Gallery upload functional
- [ ] Stripe webhook configured
- [ ] Google Maps API quotas set

---

## Troubleshooting

### "Gallery creation failed"

**Retry Button implementiert:**
- User sieht Retry-UI bei Fehler
- Button resettet `useRef` guard
- Keine Page-Reload nötig

**Debug:**
```bash
# Check logs
wrangler tail

# Check database
psql $DATABASE_URL
SELECT * FROM galleries ORDER BY id DESC LIMIT 5;
```

### Stripe Payment fails

**Checklist:**
1. ✅ STRIPE_SECRET_KEY korrekt?
2. ✅ Webhook-Endpoint configured?
3. ✅ Test-Mode vs. Live-Mode?

### Upload zu groß

**R2 Limits:**
- Max. 5GB per file (R2)
- Adjust `maxFileSize` in UploadDialog

---

## Weitere Dokumentation

- 📄 [GALLERY_SYSTEM.md](./GALLERY_SYSTEM.md) - Upload System Details
- 📄 [DEPLOYMENT.md](./DEPLOYMENT.md) - Cloudflare Setup
- 📄 [../../CLOUDFLARE_SETUP_GUIDE.md](../../CLOUDFLARE_SETUP_GUIDE.md) - CI/CD Pipeline

---

**Status:** ✅ Production Ready (Gallery V1.0)  
**Version:** 1.0.0  
**Deployment:** Cloudflare Workers  
**Letztes Update:** Oktober 2025
