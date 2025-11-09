# 🗺️ pixcapture.app – Sitemap & Routes

## Öffentliche Seiten

| Route | Komponente | Beschreibung |
|-------|------------|--------------|
| `/pixcapture-home` | PixCaptureHome | Startseite (Self-Service Platform) |
| `/pixcapture-about` | PixCaptureAbout | Über pixcapture.app |
| `/pixcapture-help` | **PixCaptureHelp** | **Hilfe & Funktionen** (NEU) |
| `/pixcapture-expert-call` | **PixCaptureExpertCall** | **Experten-Call buchen** (NEU) |
| `/pixcapture-impressum` | PixCaptureImpressum | Impressum |
| `/pixcapture-datenschutz` | PixCaptureDatenschutz | Datenschutz |
| `/pixcapture-agb` | PixCaptureAGB | AGB |

---

## App-Seiten (pixcapture.app – iPhone/Android)

| Route | Komponente | Beschreibung |
|-------|------------|--------------|
| `/pixcapture-app` | AppSplash | Splash Screen |
| `/pixcapture-app/firstlaunch` | AppSplashFirstLaunch | First Launch Screen |
| `/pixcapture-app/verify` | AppVerifyUser | OTP-Verifizierung |
| `/pixcapture-app/login` | AppLogin | Login |
| `/pixcapture-app/jobs` | AppJobs | Job-Übersicht |
| `/pixcapture-app/job-new` | AppJobNew | Neuer Job erstellen |
| `/app-camera` | AppCamera | **Kamera (iPhone)** (Erweitert) |
| `/app-upload` | AppUpload | **Upload** (Android-Support) |
| `/app-gallery` | AppGallery | Galerie |
| `/app-settings` | AppSettings | Einstellungen |

---

## Editor-System (Neu)

| Route | Komponente | Beschreibung |
|-------|------------|--------------|
| `/qc-dashboard` | QCDashboard | QC Dashboard (alt) |
| `/qc-quality-check` | **QCQualityCheck** | **Quality Check + Editor-Zuweisung** |
| `/editor-dashboard` | **EditorDashboard** | **Editor Job-Übersicht** |
| `/editor-job-detail` | **EditorJobDetail** | **Einzelner Job (Bearbeitung)** |
| `/admin-editor-management` | **AdminEditorManagement** | **Editor-Verwaltung** |
| `/editor-revision` | EditorRevision | Revision-Workflow |

---

## Admin-Seiten

| Route | Komponente | Beschreibung |
|-------|------------|--------------|
| `/admin-dashboard` | AdminDashboard | Admin-Dashboard |
| `/admin/editorial` | AdminEditorial | Content-Management |
| `/admin/seo` | AdminSEO | SEO-Verwaltung |
| `/eingegangene-uploads` | EingegangeneUploads | Upload-Inbox |
| `/upload-editing-team` | UploadEditingTeam | Upload für Editing-Team |

---

## Workflow-Seiten (pix.immo Professional)

| Route | Komponente | Beschreibung |
|-------|------------|--------------|
| `/dashboard` | Dashboard | Kunden-Dashboard |
| `/jobs` | Jobs | Job-Übersicht |
| `/galerie` | Galerie | Bild-Galerie |
| `/intake` | Intake | Shooting-Aufnahme |
| `/delivery-prep` | DeliveryPrep | Delivery-Vorbereitung |
| `/upload-status` | UploadStatus | Upload-Status |

---

## Navigation-Struktur

### pixcapture.app Main Menu

```
┌─────────────────────────────────────────┐
│ pixcapture.app                          │
├─────────────────────────────────────────┤
│ Start            → /pixcapture-home     │
│ Upload           → /app-upload          │
│ Hilfe            → /pixcapture-help (NEU) │
│ Expertengespräch → /pixcapture-expert-call (NEU) │
│ Mein Konto       → /app-login           │
└─────────────────────────────────────────┘
```

### Footer-Links

```
Hilfe | Experten-Support | Impressum | Datenschutz | AGB
  ↓            ↓
/help    /expert-call
```

---

## Routing-Hierarchie

```
pixcapture.app/
├── Home                    (Landing)
├── Help                    (Anleitung)
│   └── Expert Call         (Support)
├── Upload                  (App/Android)
│   ├── Camera (iPhone)
│   └── Files (Android)
└── App
    ├── Login
    ├── Jobs
    ├── Gallery
    └── Settings

pix.immo/
├── Home
├── Professional
└── Backend
    ├── QC Quality Check
    ├── Editor Dashboard
    ├── Editor Management
    └── Admin
```

---

## Deep-Links (App)

| Deep-Link | Route | Beschreibung |
|-----------|-------|--------------|
| `pixcapture://` | `/pixcapture-app` | App-Start |
| `pixcapture://camera` | `/app-camera` | Kamera öffnen |
| `pixcapture://upload` | `/app-upload` | Upload starten |
| `pixcapture://app-gallery` | `/app-gallery` | Galerie öffnen |
| `pixcapture://jobs` | `/app-jobs` | Job-Übersicht |
| `pixcapture://dashboard` | `/dashboard` | Professional-Dashboard |
| `pixcapture://help` | `/pixcapture-help` | Hilfe öffnen |
| `pixcapture://expert-call` | `/pixcapture-expert-call` | Call buchen |

---

## Query-Parameter

### /app-upload

```
/app-upload?source=camera      → Von Kamera
/app-upload?source=android     → Von Android-Galerie
/app-upload?jobId=20251106-AB123  → Zu Job hinzufügen
```

### /qc-quality-check

```
/qc-quality-check?id=20251106-AB123   → Job-ID
/qc-quality-check?source=app         → Filter nach Source
```

### /editor-dashboard

```
/editor-dashboard?status=neu          → Filter Status
/editor-dashboard?source=professional → Filter Source
/editor-dashboard?editor=editor-001   → Filter Editor
```

### /editor-job-detail

```
/editor-job-detail?id=20251106-AB123  → Job-ID
```

---

## Redirects

| Von | Nach | Grund |
|-----|------|-------|
| `/help` | `/pixcapture-help` | Kürzer |
| `/expert` | `/pixcapture-expert-call` | Kürzer |
| `/upload` | `/app-upload` | Konsistenz |
| `/camera` | `/app-camera` | Konsistenz |
| `/qc` | `/qc-dashboard` | Kürzer |
| `/editor` | `/editor-dashboard` | Kürzer |

---

## 404-Handling

```tsx
// App.tsx
<Route component={NotFound} />

// NotFound.tsx
function NotFound() {
  return (
    <div>
      <h1>404 - Seite nicht gefunden</h1>
      <Link href="/pixcapture-home">Zur Startseite</Link>
    </div>
  );
}
```

---

## Protected Routes (Zukünftig)

```tsx
// Authentifizierung erforderlich
const ProtectedRoute = ({ component: Component }) => {
  const isAuthenticated = checkAuth();
  return isAuthenticated ? <Component /> : <Redirect to="/app-login" />;
};

// Routes
<Route path="/app-upload" component={ProtectedRoute(AppUpload)} />
<Route path="/editor-dashboard" component={ProtectedRoute(EditorDashboard)} />
<Route path="/admin-dashboard" component={ProtectedRoute(AdminDashboard)} />
```

---

## Breadcrumbs

### Help-Seite

```
Home > Hilfe
```

### Expert-Call

```
Home > Hilfe > Expertengespräch
```

### QC Quality Check

```
Admin > QC > Job 20251106-AB123
```

### Editor Job Detail

```
Editor Dashboard > Job 20251106-AB123
```

---

## SEO-Friendly URLs

| Aktuell | SEO-Optimiert |
|---------|---------------|
| `/pixcapture-home` | `/` (pixcapture.app) |
| `/pixcapture-help` | `/hilfe` |
| `/pixcapture-expert-call` | `/experten-gespraech` |
| `/app-upload` | `/upload` |

**Implementierung:**
```tsx
// Redirect-Regel
<Route path="/hilfe" component={() => {
  setLocation('/pixcapture-help');
  return null;
}} />
```

---

## Analytics Tracking

```typescript
// Track Route Changes
useEffect(() => {
  analytics.page(window.location.pathname);
}, [location]);

// Track Key Pages
analytics.track('page_viewed', {
  page: '/pixcapture-help',
  category: 'support',
  platform: 'web'
});
```

---

## Sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pixcapture.app/pixcapture-home</loc>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>https://pixcapture.app/pixcapture-help</loc>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>https://pixcapture.app/pixcapture-expert-call</loc>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>
  <!-- ... -->
</urlset>
```

---

## Deployment

### Vercel

```json
// vercel.json
{
  "redirects": [
    { "source": "/help", "destination": "/pixcapture-help" },
    { "source": "/expert", "destination": "/pixcapture-expert-call" }
  ],
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api.pixcapture.app/:path*" }
  ]
}
```

### Nginx

```nginx
# Redirects
location /help {
  return 301 /pixcapture-help;
}

location /expert {
  return 301 /pixcapture-expert-call;
}

# SPA Fallback
location / {
  try_files $uri $uri/ /index.html;
}
```

---

**Last Updated:** 2025-11-06  
**Total Routes:** 50+  
**New Routes:** 6
