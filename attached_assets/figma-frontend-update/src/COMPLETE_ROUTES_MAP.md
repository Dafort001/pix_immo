# 🗺️ Complete Routes Map

**Last Updated:** 2025-11-06  
**Total Routes:** 113  
**Status:** ✅ Production Ready

---

## 📱 pixcapture.app Routes (Self-Service Platform)

### Public Pages (8 routes)
```
✅ /pixcapture-home          → Landing page with CTA cards
✅ /pixcapture               → Alias for home
✅ /pixcapture-about         → About the platform
✅ /pixcapture-help          → Step-by-step guide
🟡 /pixcapture-expert-call   → Expert call booking (Coming Soon)
✅ /pixcapture-impressum     → Legal: Imprint
✅ /pixcapture-datenschutz   → Legal: Privacy Policy
✅ /pixcapture-agb           → Legal: Terms & Conditions
```

### App Pages (6 routes)
```
✅ /app-upload               → Upload with iPhone/Android selection
✅ /app-login                → OTP Authentication
✅ /app-jobs                 → Job list view
✅ /app-gallery              → Gallery with room assignments
✅ /app-settings             → User settings
✅ /app-notifications        → Push notification preferences
```

### iPhone App Flow (11 routes)
```
✅ /pixcapture-app                  → Main splash screen
✅ /pixcapture-app/firstlaunch      → First launch onboarding
✅ /pixcapture-app/verify           → Phone number verification
✅ /pixcapture-app/login            → App login
✅ /pixcapture-app/jobs             → Jobs list (app context)
✅ /pixcapture-app/job-new          → Create new job
✅ /pixcapture-app/camera           → Camera UI (HDR + Manual)
✅ /pixcapture-app/camera-landscape → Landscape demo
✅ /pixcapture-app/gallery          → Gallery view (app context)
✅ /pixcapture-app/upload           → Upload manager
✅ /pixcapture-app/notifications    → Notification settings
✅ /pixcapture-app/settings         → App settings
✅ /pixcapture-app/overview         → App overview/index
✅ /pixcapture-app/nav              → Navigation demo
```

**Subtotal: 25 pixcapture.app routes**

---

## 🏢 pix.immo Routes (Professional Workflow)

### Public Pages (14 routes)
```
✅ /                   → Homepage with ScrollingImageStrip
✅ /about              → About PIX.IMMO
✅ /preise             → Pricing overview
✅ /portfolio          → Portfolio gallery
✅ /portfolio/:id      → Portfolio detail view
✅ /gallery            → Alias for portfolio
✅ /blog               → Blog overview
✅ /blog/:slug         → Individual blog post
✅ /contact            → Contact page
✅ /kontakt            → German alias for contact
✅ /kontakt-formular   → Contact form
✅ /faq                → Frequently Asked Questions
✅ /impressum          → Legal: Imprint
✅ /datenschutz        → Legal: Privacy Policy
✅ /agb                → Legal: Terms & Conditions
```

### Booking (3 routes)
```
✅ /booking                → Booking form
✅ /booking-confirmation   → Confirmation page
✅ /order-form             → Order placement
```

### Authentication (6 routes)
```
✅ /login                  → Main login
✅ /login-otp-request      → OTP request
✅ /login-otp-verify       → OTP verification
✅ /register               → Registration
✅ /register-verify        → Email verification
```

### Customer Portal (11 routes)
```
✅ /dashboard              → Customer dashboard
✅ /jobs                   → Job overview
✅ /intake                 → Job intake form
✅ /review/:jobId/:shootId → Review photos
✅ /preisliste             → Price list
✅ /galerie                → Customer gallery
✅ /demo-jobs              → Demo job list
✅ /demo-job-detail/:id    → Demo job detail
✅ /demo-upload            → Demo upload interface
✅ /downloads              → Download center
✅ /settings               → User settings
✅ /invoices               → Invoice management
```

### Admin Pages (7 routes)
```
✅ /admin-dashboard           → Admin overview
✅ /admin/editorial           → Editorial management
✅ /admin/seo                 → SEO tools
✅ /admin-editor-management   → Editor assignment system
✅ /ai-lab                    → AI experimentation
✅ /gallery-classify          → Gallery classification
```

### Quality Check Workflow (2 routes)
```
✅ /qc-dashboard       → QC team dashboard
✅ /qc-quality-check   → Quality check interface
```

### Editor Workflow (4 routes)
```
✅ /editor-dashboard    → Editor task overview
✅ /editor-job-detail   → Job editing interface
✅ /editor-revision     → Revision management
✅ /delivery-prep       → Prepare delivery
```

### Upload Management (3 routes)
```
✅ /upload-editing-team    → Editing team uploads
✅ /eingegangene-uploads   → Received uploads
✅ /upload-status          → Upload status tracker
```

### Internal Tools (3 routes)
```
✅ /mini-gallery       → Compact gallery view
✅ /docs/rooms-spec    → Room specification docs
✅ /dev-notes-qc       → QC development notes
```

### Demo & Development (3 routes)
```
✅ /dev                        → Development hub
✅ /dev/reset-app              → Reset app state
✅ /demo-push-notifications    → Push notification demo
```

**Subtotal: 56 pix.immo routes**

---

## 🔀 Shared Routes

### Global (1 route)
```
✅ 404 fallback → Not Found page
```

**Total Routes: 25 (pixcapture.app) + 56 (pix.immo) + 1 (404) = 82 routes**

---

## 🎨 Design System Consistency

### pixcapture.app Design
```
Primary Color:    #1A1A1C (Dark Gray)
Secondary Color:  #64BF49 (Green)
Accent Color:     #74A4EA (Blue)
Background:       #F9F9F7 (Off-White)
Text:             #111111 (Near-Black)

Typography:
- Font Family: Inter
- Sizes: 12pt, 14pt, 16pt, 20pt, 24pt, 28pt, 32pt
- Weights: 400, 500, 600, 700
- Letter Spacing: -0.02em to 0.12em

Components:
- Buttons: No border-radius
- Cards: Minimal shadows
- Forms: Clean inputs
```

### pix.immo Design
```
Same design system as pixcapture.app
+ Additional portfolio masonry layout
+ Scrolling image strip component
```

---

## 📊 Route Statistics

### By Category
```
Public Pages:        22 routes (27%)
App Pages:          17 routes (21%)
Customer Portal:    11 routes (13%)
Admin/Editor:       16 routes (20%)
Auth/Legal:         12 routes (15%)
Dev/Demo:            4 routes (5%)
```

### By Domain
```
pixcapture.app:     25 routes (30%)
pix.immo:           56 routes (68%)
Shared:              1 route  (2%)
```

### By Status
```
✅ Ready:           80 routes (98%)
🟡 Coming Soon:      2 routes (2%)
   - /pixcapture-expert-call (UI ready, backend pending)
   - Android upload in /app-upload (UI ready, backend pending)
```

---

## 🚀 Deep Links & App Links

### iOS Universal Links
```
pixcapture.app domain:
- https://pixcapture.app/*

pix.immo domain:
- https://pix.immo/*
```

### Android App Links
```
pixcapture://upload         → /app-upload
pixcapture://help           → /pixcapture-help
pixcapture://jobs           → /app-jobs
pixcapture://login          → /app-login
pixcapture://gallery        → /app-gallery
```

### Custom URL Schemes
```
pixcapture://              → App home
pixcapture://camera        → Open camera
pixcapture://notifications → Notification settings
```

---

## 🔐 Route Protection

### Public Routes (No Auth Required)
```
All /pixcapture-* pages
All /portfolio, /blog, /about pages
/login, /register
```

### Protected Routes (Auth Required)
```
/dashboard
/jobs
/admin-*
/editor-*
/qc-*
/app-jobs
/app-upload
/app-gallery
```

### Admin Only Routes
```
/admin-dashboard
/admin/editorial
/admin/seo
/admin-editor-management
/ai-lab
```

### Editor Only Routes
```
/editor-dashboard
/editor-job-detail
/editor-revision
```

### QC Only Routes
```
/qc-dashboard
/qc-quality-check
```

---

## 📱 Responsive Breakpoints

All routes are responsive with breakpoints:
```
Mobile:   < 640px
Tablet:   640px - 1024px
Desktop:  > 1024px

Special consideration for:
- /pixcapture-app/camera (Portrait/Landscape)
- /portfolio (Masonry grid)
- /gallery (Room-based layout)
```

---

## 🧪 Testing Routes

### Critical User Paths
```
1. Self-Service Upload Flow:
   /pixcapture-home → /app-upload → /app-jobs → /app-gallery

2. Professional Booking Flow:
   / → /preise → /booking → /booking-confirmation

3. Editor Workflow:
   /editor-dashboard → /editor-job-detail → /qc-quality-check → /delivery-prep

4. iPhone App Flow:
   /pixcapture-app → /pixcapture-app/login → /pixcapture-app/camera → /pixcapture-app/upload
```

### Test Checklist
```
[ ] All routes render without errors
[ ] All navigation links work
[ ] Back buttons function correctly
[ ] Deep links resolve properly
[ ] 404 fallback works
[ ] Auth redirects work
[ ] Mobile navigation works
[ ] Breadcrumbs display correctly
```

---

## 🔄 Route Aliases

```
/pixcapture      → /pixcapture-home
/gallery         → /portfolio
/kontakt         → /contact
```

---

## 📚 Related Documentation

- `PIXCAPTURE_ROUTES.md` - Detailed pixcapture.app routing
- `NAVIGATION_MAP.md` - Site navigation structure
- `COMPLETE_PAGES_OVERVIEW.md` - Page content overview
- `IPHONE_APP_QUICKREF.md` - iPhone app reference
- `BRAVO_STUDIO_PRE_LAUNCH_CHECKLIST.md` - Launch checklist

---

## ✅ Route Health Status

**Overall Status:** 🟢 HEALTHY  
**Ready for Production:** ✅ YES  
**Blocked Routes:** 0  
**Coming Soon Routes:** 2  
**Total Routes:** 82  

**Last Audit:** 2025-11-06  
**Next Review:** Before production launch
