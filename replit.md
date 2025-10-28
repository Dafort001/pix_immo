# pix.immo - Real Estate Media Platform

## Recent Changes
**Last Updated: October 28, 2025**

### Room Type System Consolidation V2.0 ✅
- **Simplified Taxonomy**: Reduced from 57 to 20 room types for improved usability and AI caption accuracy
- **Centralized Types**: New `shared/room-types.ts` with type-safe exports (`RoomType`, `Orientation`)
- **AI Integration**: Each room type includes optimized German caption prompts for AI image analysis
- **Orientation Support**: Optional orientation field (Vorne/Hinten/Seitlich) for exterior rooms (Fassade, Eingang, Terrasse, Garten)
- **Migration Complete**: Updated all components (Camera, Gallery, Demo Data) to use centralized `ALL_ROOM_TYPES`
- **Status**: Production-ready, architect-reviewed ✅

### Mobile PWA Upload Workflow V1.0 - Production Ready ✅
- **Upload Infrastructure**: Complete sessionStorage → Blob → FormData → R2 pipeline with progress tracking
- **Retry Logic**: Exponential backoff (1s/2s/4s), max 3 attempts per photo, graceful degradation on failures
- **Success State**: Full-screen animated checkmark overlay with SVG path drawing effects
- **Critical Bug Fix**: Upload success handler now properly removes uploaded photos from `appPhotos` array in sessionStorage, preventing stale stack issues
- **PWA Enhancements**: Service Worker with cache-first/network-first strategies, manifest.json with App Shortcuts (Kamera/Galerie/Upload)
- **E2E Testing**: Playwright tests PASS - All navigation flows verified (/app → /camera → /gallery → /upload)
- **Status**: Production-ready (R2 backend integration pending)

## Overview
pix.immo is a professional real estate media platform built with Node.js 22, TypeScript, and React. Its core purpose is to connect real estate professionals with photography services, streamlining the ordering and management of property photography. 

**The project consists of two logically separate applications:**
1. **Mobile PWA** (`/app/*`) - iOS-style camera app for photographers on-site
2. **Web Portal** (`/portal/*`) - Client/Admin management with Gallery Upload System V1.0

Key features include an order management system, robust session-based authentication with role-based access control, a React SPA frontend, and a Progressive Web App (PWA) mobile camera integration for on-site photo capture. The platform is designed for future integration with AI for image analysis and deployment to Cloudflare Workers, aiming to enhance property listings with high-quality, AI-analyzed media.

**Documentation Structure:**
- 📂 `docs/mobile/` - Mobile PWA documentation
- 📂 `docs/portal/` - Web Portal documentation
- 📄 `PROJECT_STRUCTURE.md` - Architecture & deployment strategies

### Brand Colors - Sage & Clay v3
- **Sage Dark #4A5849** (HSL: 140 15% 29%) - Primary color, main text, navigation
- **UI-Sage #6E7E6B** (HSL: 140 9% 46%) - Secondary UI, borders, muted elements
- **Copper #A85B2E** (HSL: 21 57% 42%) - Accent color for CTAs and highlights
- **Copper Dark #8F4C28** (HSL: 21 55% 36%) - Hover and active states
- **Neutral White #FAFAFA** (HSL: 0 0% 98%) - Page backgrounds
- **Pure White #FFFFFF** (HSL: 0 0% 100%) - Content containers and cards
- **Border Gray #E5E5E5** (HSL: 0 0% 90%) - Dividing lines and borders

## User Preferences
- Hono for Cloudflare Workers compatibility
- React SPA with Wouter routing
- Shadcn components for consistent UI
- TypeScript for type safety
- Clean, modern developer-focused interfaces
- Secure environment variable management (no hardcoded secrets)

## System Architecture

### UI/UX Decisions
The frontend is a React 18 SPA using Wouter for routing, Shadcn UI components, and Tailwind CSS for a modern, responsive design with dark/light mode support. Forms are managed with `react-hook-form` and `zod` for validation.

### Technical Implementations
- **Backend**: Hono v4 framework (Cloudflare Workers compatible) on Node.js 22.
- **Frontend**: React 18 SPA with Wouter, Shadcn UI, Tailwind CSS, `react-hook-form` + `zod`, and TanStack Query v5.
- **Database**: PostgreSQL (Neon) with Drizzle ORM.
- **Object Storage**: Replit Object Storage (Google Cloud Storage) for RAW images, edited files, and handoff packages.
- **Authentication**: Custom session-based authentication with HTTP-only cookies and Scrypt password hashing, designed to be Lucia-compatible, with password reset flows and rate limiting.
- **Order Management**: API for creating, viewing, and updating property photography orders with role-based authorization.
- **Service Catalog & Booking System**: Comprehensive catalog of 25 services across 7 categories, an internal price list, and a multi-step booking wizard.
- **Google Maps Integration**: Rooftop-accurate address verification using Google Places Autocomplete, Geocoding API for validation, and Static Maps API for thumbnail previews. Address data (lat/lng/placeId/formatted) stored in orders, jobs, and bookings tables.
- **Photo Workflow System**: Manages jobs, shoots, image stacks (bracketed images), RAW file handling, secure editor tokens, filename conventions, auto-stacking, ZIP handoff packages, and editor returns.
- **Client Gallery with Collaboration Features**: Displays completed projects, an image viewer with lightbox, a favorites system, and a comments system for client feedback on images. Includes bulk and individual image download functionality.
- **QA-Autofix System with Naming Policy v3.1**: System-Check Framework with plugin-based architecture validating authentication, routes, upload system, naming conventions, room taxonomy (34 types). Reports in JSON/Markdown format, severity-based exit codes (0/1/2/3). CLI: `tsx server/selftest/cli.ts`
- **Mobile Camera Integration (PWA)**: Progressive Web App with /capture routes for on-site photo capture. Features: Camera page with MediaDevices API, front/back camera flip, photo capture, review page, upload integration with R2 storage. Includes Service Worker for offline support and install-to-homescreen capability.
- **Mobile App (/app/\*)**: Standalone mobile-first PWA app with 4 screens implementing complete photo workflow. Uses iOS design patterns with StatusBar, HapticButton, BottomNav components. Includes Safe-Area CSS utilities for notch support, MediaDevices API with proper cleanup (streamRef pattern), sessionStorage photo management, and comprehensive data-testid coverage for QA automation.
- **Upload Workflow V1.0**: Production-ready upload system with retry logic (exponential backoff: 1s→2s→4s, max 3 attempts), real-time progress tracking per stack, animated success state with SVG checkmark, and proper sessionStorage cleanup preventing stale metadata. Job selection via API integration, batch upload with graceful failure handling. Backend endpoint `/api/mobile-uploads` prepared for R2 integration.
- **PWA Infrastructure**: Service Worker (`sw.js`) with cache-first strategy for static assets, network-first for API calls, Background Sync API for offline upload queue, Push Notification support. Manifest.json with App Shortcuts enabling direct navigation to Kamera/Galerie/Upload from home screen. PWA initialized in production via `initializePWA()`, icons 72-512px present.
- **Development Server**: Express + Vite middleware for HMR and proxied API requests.
- **Production Server**: Hono serves static files and API requests, optimized for Cloudflare Workers.

### Feature Specifications
- **Authentication**: Signup, login, logout, password reset, session management, and optional JWT token refresh.
- **User Roles**: "admin" and "client" with distinct access.
- **Order Management**: Create, view, and update orders with defined statuses.
- **Rate Limiting**: IP-based rate limiting on authentication endpoints.
- **Homepage**: Minimalist design with a sticky header, hero section, horizontal scrolling image strip, and minimalist footer.
- **Gallery**: JavaScript-driven masonry layout with responsive columns, progressive image loading, and a lightbox modal.
- **Blog**: Two-page system with an overview grid and detailed post pages, using mock data.
- **Preise (Pricing Page)**: Comprehensive pricing for 8 service sections including photography, drone, video, virtual tours, staging, image optimization, and travel fees.
- **Legal & Information Pages**: Includes Impressum, AGB, Datenschutz, Kontakt, Kontakt-Formular, About, and FAQ pages.
- **Mobile Camera Capture**: PWA-enabled camera interface at /capture/* with 4 pages (index, camera, review, upload). Uses browser MediaDevices API for native camera access, supports front/back flip, captures high-res photos, integrates with existing R2 upload endpoints. Camera cleanup uses ref pattern to ensure MediaStream stops on all navigation methods.
- **Mobile App Screens (/app/\*)**: 
  - **SplashScreen** (/app): Landing page with camera quick-start button
  - **CameraScreen** (/app/camera): MediaDevices API with front/back flip, flash toggle, grid overlay, zoom controls, 3s/10s self-timer with countdown animation
  - **GalleryScreen** (/app/gallery): Photo stacks with auto-grouping, bulk operations (select all, bulk delete, bulk room assignment), photo count tracking
  - **UploadScreen** (/app/upload): Job selection via API, multi-stack upload with retry logic, progress tracking (per-stack and total), animated success overlay, sessionStorage cleanup on success
  - **Design**: iOS-style with StatusBar (notch support), HapticButton (vibration feedback), BottomNav (3-tab navigation). All dynamic elements have data-testid for QA automation.
  - **Workflow**: camera → gallery → upload with sessionStorage persistence, animated progress indicators, E2E tested with Playwright.
- **Web Portal (/portal/\*)**: Professional client portal with 5 screens for complete photo order workflow. Includes UploadsOverview (/portal/uploads) with job listing and status tracking, GallerySelection (/portal/gallery/:jobId) with multi-select image interface, Payment (/portal/payment/:jobId) with Stripe checkout integration, StatusTimeline (/portal/status/:jobId) with 5-step progress tracker, and Delivery (/portal/delivery/:jobId) with download packages. All screens implement comprehensive loading skeletons, explicit error states with retry/navigation, apiRequest mutation pattern, queryClient cache invalidation, and complete data-testid coverage for QA automation.
- **Gallery Upload System V1.0 (/portal/gallery-\*)**: Complete gallery management system for three workflow types - Customer Upload (/portal/gallery-upload), Photographer RAW (/portal/gallery-photographer), and Final Editing (/portal/gallery-editing). Features: Multi-file upload with drag-drop support for JPEG/PNG/HEIC and 13 RAW formats (DNG/CR2/NEF/ARW/ORF/RW2/RAF/PEF/SR2/X3F/3FR/FFF/MEF), automatic Sharp-based thumbnail generation (600x600 JPEG), per-file editing presets (Style: PURE/EDITORIAL/CLASSIC, Window: CLEAR/SCANDINAVIAN/BRIGHT, Sky: CLEAR BLUE/PASTEL CLOUDS/DAYLIGHT SOFT/EVENING HAZE), boolean settings for corrections (vertical, de-noise, removals), canvas-based freehand annotation tool with PNG mask export, bulk settings application, gallery finalization with JSON metadata export. Validation schemas centralized in shared/schema.ts, boolean conversion helper (boolToString) ensures proper database serialization. Role-based navigation in Dashboard: Admin sees "Photo Upload" and "Final Editing" buttons, Client sees "Bilder hochladen" button. All components use data-testid attributes for QA automation.
- **Legacy Routes (/capture/\*)**: DEPRECATED - Original PWA camera implementation at /capture/* (index, camera, review, upload) pages. Superseded by improved /app/* mobile app with better iOS design patterns, haptic feedback, and sessionStorage workflow. Legacy routes remain for backwards compatibility but new development should use /app/* routes.

### System Design Choices
The architecture emphasizes Cloudflare Workers compatibility using Hono. It separates development (Express+Vite) and production (Hono) environments. Security features include Scrypt hashing, HTTP-only cookies, `SameSite=lax`, and secure environment variable management. Specific implementations for the homepage, gallery, and blog use custom JavaScript and CSS techniques for precise layout and responsiveness. SEO is handled via a `SEOHead` component, Schema.org templates, a sitemap, and robots.txt.

### Quality Assurance & CI/CD
**Safe-Check Framework (v2.0.0 Planned):**
- **Current (v1.0.0)**: Plugin-based validation system with 4 operational plugins (Auth, Routes, Upload, Naming). Reports real issues, detected missing endpoints in production code.
- **Planned Extensions**: OpenAPI schema validation, TypeScript/Lint checks, mock services (R2/Stripe/Mailgun), database migration dry-run, E2E smoke flow (Upload→Payment→AI→Delivery).
- **CI/CD Integration**: GitHub Actions workflow, pre-commit hooks (Husky), automated PR comments, deployment gates based on severity.
- **Architecture**: See `server/selftest/ARCHITECTURE.md` for detailed plugin specs, roadmap, and technical decisions.

## External Dependencies
- **Database**: PostgreSQL (Neon)
- **Email Service**: Mailgun (planned)
- **AI Services**: Modal Labs (USA) for image analysis, Replicate (USA) for advanced retouching. Both process anonymous, encrypted data.