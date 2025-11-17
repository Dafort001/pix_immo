# pix.immo - Real Estate Media Platform

## Overview
pix.immo is a professional real estate media platform built with Node.js 22, TypeScript, and React, aiming to connect real estate professionals with photography services. It streamlines the ordering and management of property photography. **Multi-SPA Architecture**: The platform now consists of TWO independent web applications sharing a single backend - (1) **pix.immo** - professional web portal at `/` for full-service photography, and (2) **pixcapture.app** - budget-conscious mobile-first SPA at `/pixcapture` for DIY smartphone photography. Both share ~90% backend infrastructure (PostgreSQL/Neon database, Cloudflare Workers backend, session auth) while maintaining separate frontends (`client/src/` and `client/pixcapture/src/`). The platform features a **complete booking system** (service catalog, multi-step wizard, admin management), robust session-based authentication with role-based access, and is designed for future AI integration for image analysis and deployment to Cloudflare Workers. **Service area: Hamburg only (30 km radius)** - Berlin location removed as of January 2025. The ultimate goal is to enhance property listings with high-quality, AI-analyzed media.

## User Preferences
- Hono for Cloudflare Workers compatibility
- React SPA with Wouter routing
- Shadcn components for consistent UI
- TypeScript for type safety
- Clean, modern developer-focused interfaces
- Secure environment variable management (no hardcoded secrets)

## Audit & Documentation Tooling

**Complete Suite (8 Tools)**:
1. **Page Inventory** (`tools/page-inventory.ts`) - 52 routes inventoried
2. **Wireframe Export** (`tools/wireframe-export.ts`) - 50 SVG wireframes + site map
3. **Auto-Screenshots** (`tools/page-screenshots.ts`) - Puppeteer-based (local only, Replit: mock version)
4. **Component Map** (`tools/component-map.ts`) - 27 components, 50 routes, bidirectional mapping
5. **Content Dump** (`tools/content-dump.ts`) - 3195 text entries extracted (i18n migration ready)
6. **Routes Manifest** (`tools/routes-manifest.ts`) - 51 routes with guards/params/orphans
7. **Figma Bundle** (`tools/figma-bundle.ts`) - Complete design asset package
8. **Audit ZIP** (`tools/audit-zip.ts`) - 296 KB complete audit package

**Outputs**: `/export/` (JSON, SVG, PNG), `/docs/` (MD reports), `site_audit_package.zip` (complete bundle)

**Shell Scripts**: `audit-*.sh`, `export-*.sh`, `bundle-*.sh`, `create-audit-zip.sh`

## System Architecture

### UI/UX Decisions
The frontend is a React 18 SPA utilizing Wouter for routing, Shadcn UI components, and Tailwind CSS for a modern, responsive design with dark/light mode support. Forms are handled with `react-hook-form` and `zod` for validation. Brand colors Sage Dark (#4A5849) and Copper (#A85B2E) define the visual identity.

### Technical Implementations
- **Backend**: Hono v4 framework on Node.js 22, optimized for Cloudflare Workers. Shared across both SPAs.
- **Frontend**: React 18 with Wouter, Shadcn UI, Tailwind CSS, `react-hook-form` + `zod`, and TanStack Query v5.
- **Multi-SPA Development Server**: Path-based routing via `server/dev.ts` enables simultaneous development of both apps on single port (5000). Routes: `/` → pix.immo (professional), `/pixcapture` → pixcapture.app (budget DIY). Both access shared backend APIs without CORS. Import strategy: `@/components/ui/*` for shared Shadcn components, `../components/*` for app-specific components, `@shared/*` for cross-app utilities (SEOHead, room types).
- **Database**: PostgreSQL (Neon) with Drizzle ORM.
- **Object Storage**: Replit Object Storage (Google Cloud Storage) for RAW images, edited files, and handoff packages.
- **Authentication**: Custom session-based authentication with HTTP-only cookies and Scrypt password hashing, designed to be Lucia-compatible, including password reset and rate limiting.
- **Order Management**: API for managing property photography orders with role-based authorization.
- **Service Catalog & Booking**: Comprehensive catalog and multi-step booking wizard.
- **Google Maps Integration**: For accurate address verification and thumbnail previews.
- **Photo Workflow System**: Manages jobs, shoots, image stacks, RAW file handling, secure editor tokens, and ZIP handoff packages.
- **Client Gallery**: Features image viewer, favorites, comments, and download functionality.
- **QA-Autofix System**: Plugin-based framework validating authentication, routes, upload, naming conventions, and room taxonomy.
- **Mobile Camera Integration (PWA)**: iOS-style PWA (`/app/*`) for on-site photo capture, leveraging MediaDevices API, sessionStorage for photo management, and a comprehensive upload workflow to R2 storage. Includes Service Worker for offline support and install-to-homescreen capability.
- **AI Provider System**: Modulares System mit zwei Haupt-Anbindungen:
  - **Bildbearbeitung**: Replicate oder Clipdrop (via `AI_IMAGE_PROVIDER` Environment Variable wählbar). Unterstützt Upscaling, Denoise, Background Removal, Sky Enhancement.
  - **Captioning & Text**: OpenAI ChatGPT (GPT-4o mit Vision) für KI-generierte Bildbeschreibungen, Exposé-Texte und Keyword-Extraktion. Deutsche und englische Sprache unterstützt.
- **Mobile PWA Upload Workflow**: Production-ready system with retry logic, real-time progress tracking, and animated success states.
- **Web Portal Gallery Upload System**: Supports multi-file upload (JPEG/PNG/HEIC and 13 RAW formats), automatic thumbnail generation, per-file editing presets, annotation tools, and bulk settings application.
- **Room Type System**: Consolidated into 20 types with AI-optimized German caption prompts.
- **Manual Camera Controls**: Expert mode with extended EV range, HDR brackets, zoom levels, ISO, shutter speed, Kelvin WB, and file format selection with Pro-gating for RAW/DNG.
- **Tripod & Motion Warnings V1.0**: Pre-capture stability check (700ms DeviceMotionEvent sampling) for HDR/Night modes with "Stativ empfohlen" dialog. Post-capture bracket alignment validation with congruency scoring (<70%/80% triggers "Bewegung erkannt" warning). Long exposure tip (>1/30s) with auto-dismiss. Feature flags: tripodCheck, congruencyCheck, longShutterTip (config-toggleable).
- **Live Recommendations (Heuristic MVP)**: Real-time scene analysis with intelligent shooting suggestions. Histogram-based clipping detection (both highlights & shadows >10% triggers HDR 5 + EV −0.3 suggestion). Window detection heuristic using edge brightness analysis. Gray-world white balance estimation for neutral scenes. Max 1 recommendation per 8-10 seconds with 1-tap apply. Optional toggle in expert settings (liveRecommendations flag).
- **Filename Pattern v3.1**: Standardized naming for mobile uploads. Final JPEG: `{date}-{shootcode}_{room_type}_{index}_v{ver}.jpg` (e.g., `2025-10-28-AB3KQ_fassade_001_v1.jpg`). RAW/HDR frames: `{date}-{shootcode}_{room_type}_{index}_g{stack}_e{ev}.{ext}` (e.g., `2025-10-28-AB3KQ_fassade_001_g001_e-2.dng`). Date format YYYY-MM-DD, shootCode from shoots table (5 chars), room_type lowercase, index auto-increments per room type within shoot, version starts at v1 for re-exports. Orientation stored ONLY in JSON metadata, NOT in filename. Implemented in `shared/filename-v31.ts` with helper functions for generation, parsing, index tracking, and version tracking.
- **Sidecar Export System**: CRM-compatible export with object_meta.json (mandatory fields: job_id, display_id, date, shoot_code, user_code, room_type, orientation; optional fields: lens, ev, wb_mode/wb_k, hdr_brackets, file_format, capture_time, filenames, version) and alt_text.txt (German captions with orientation suffixes, tab-separated format). Upload validation warns on missing optional fields without blocking. Implemented in `shared/sidecar-export.ts` with `generateObjectMeta()`, `serializeObjectMeta()`, `generateAltText()`, `generateAltTextTxt()`, and `validateMetadata()` functions.
- **Server-Side Job Deduplication**: Complete offline-first sync queue deduplication with client-generated ULID-based localId. POST /api/jobs endpoint validates optional localId (stored in jobs.local_id with UNIQUE constraint), checks for existing jobs via storage.findJobByLocalId(), returns 409 Conflict + existing job for duplicates, or 201 Created for new submissions. Enables queue retry logic with idempotent server responses, preventing duplicate job creation from network failures. Legacy clients without localId supported (backward compatible).
- **Edit Queue Worker System (HALT F4a)**: Asynchronous edit job processing with Cron Worker running every 2 minutes in both dev and production. Worker architecture: (1) File locking during processing (uploadedFiles.locked + lockedAt timestamp prevents race conditions), (2) R2 bucket organization (raw/, processed/, preview/), (3) Sharp-based image processing (resize to 1280px for previews), (4) Retry logic with max 3 attempts and stale job detection (>15min), (5) Batch processing (10 jobs per tick), (6) Status tracking (queued → in_progress → done/failed). Implements EditJob table (userId, retryCount, previewPath, error fields) with 11 new Storage methods (createEditJob, lockFile, unlockFile, getEditJobsByStatus, updateEditJobStatus, etc.). API routes: POST /api/orders/:id/submit-edits (creates jobs with lock check), GET /api/orders/:id/status (real job counts), GET /api/files/:id/preview (R2 preview URLs). Worker logs: `[WORKER] No queued jobs, idle.` confirms successful operation. Node.js-compatible streamToBuffer() using SDK's transformToByteArray for AWS S3 streams.

### Feature Specifications
- **Authentication**: Signup, login, logout, password reset, session management.
- **User Roles**: "admin" and "client" with distinct access.
- **Booking System** (COMPLETED):
  - Service Catalog API with DTO conversion (cents → euros)
  - Multi-step booking wizard (/buchen) with region selection, service selection, property details
  - Backend validation (Zod schemas, auth enforcement, session-based userId)
  - Admin bookings management (/admin/bookings) with table view, status updates, filtering (status/region), details dialog
  - Booking items with quantity, unit price, total price calculations
  - E2E tested and verified (login → booking creation → admin management → status updates → filtering)
- **Homepage, Gallery, Blog, Pricing Pages**: Standard web content.
- **Mobile App Screens**: SplashScreen, CameraScreen (with self-timer, zoom, grid), GalleryScreen (photo stacks, bulk operations), UploadScreen (job selection, multi-stack upload with progress).
- **Web Portal Screens**: UploadsOverview, GallerySelection, Payment, StatusTimeline, and Delivery for complete photo order workflow.

### System Design Choices
The architecture prioritizes Cloudflare Workers compatibility using Hono. It maintains separate development (Express+Vite) and production (Hono) environments. Security features include Scrypt hashing, HTTP-only cookies, and secure environment variable management. SEO is managed via a `SEOHead` component, Schema.org templates, sitemap, and robots.txt.

### Frontend Patterns – Auth Guards

**React Hook Order with useAuthGuard:**

When using `useAuthGuard` or any other Hooks in React components, **ALL Hooks MUST be called BEFORE any conditional early returns** to comply with React's Rules of Hooks. Violating this pattern causes "Rendered more hooks than during the previous render" errors.

**❌ INCORRECT (Hook after conditional return):**
```typescript
export default function AdminPage() {
  const { isLoading: authLoading } = useAuthGuard({ requiredRole: "admin" });
  
  if (authLoading) return null;  // ❌ Early return BEFORE other Hooks
  
  const [state, setState] = useState(false);      // ❌ Hook after conditional return
  const { data } = useQuery({ ... });             // ❌ Hook after conditional return
  const mutation = useMutation({ ... });          // ❌ Hook after conditional return
  
  // Component logic...
}
```

**✅ CORRECT (All Hooks before conditional returns):**
```typescript
export default function AdminPage() {
  const { isLoading: authLoading } = useAuthGuard({ requiredRole: "admin" });
  const [state, setState] = useState(false);      // ✅ All Hooks first
  const { data } = useQuery({ ... });             // ✅ All Hooks first
  const mutation = useMutation({ ... });          // ✅ All Hooks first
  
  if (authLoading) return null;  // ✅ Conditional returns AFTER all Hooks
  if (!data) return null;
  
  // Component logic...
}
```

**PR Review Checklist:**
- [ ] All Hooks (`useState`, `useQuery`, `useMutation`, `useEffect`, `useAuthGuard`, etc.) are called BEFORE any conditional `return` statements
- [ ] Admin pages reuse `AdminLayout` wrapper pattern (consistent sidebar + header)
- [ ] No conditional Hook calls (e.g., Hooks inside `if` statements)

## Admin Setup
- **Admin Seed Script**: `tsx server/seed-admin.ts` - ENV-based admin account creation
- **ENV Variables**:
  - `ADMIN_EMAIL` - Admin email address (default: `admin@piximmo.de`)
  - `ADMIN_PASSWORD` - Admin password (default: `Admin123!`)
- **Features**: Idempotent (can run multiple times), auto-promotes existing users, synchronizes passwords
- **Documentation**: See `ADMIN_SETUP.md` for detailed setup instructions
- **Alternative Scripts**: 
  - `tsx server/create-admin.ts` - Hardcoded `admin@pix.immo` / `Admin2025!`
  - `tsx server/create-test-admin.ts` - Test admin `admin@example.com` / `admin123`

## External Dependencies
- **Database**: PostgreSQL (Neon)
- **Email Service**: Resend (API key stored in RESEND_API_KEY environment variable)
- **AI Services**: 
  - **Image Processing**: Replicate oder Clipdrop (konfigurierbar)
  - **Text & Captions**: OpenAI ChatGPT (GPT-4 Vision)