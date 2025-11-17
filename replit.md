# pix.immo - Real Estate Media Platform

## Overview
pix.immo is a professional real estate media platform built with Node.js 22, TypeScript, and React. Its primary purpose is to connect real estate professionals with photography services, streamlining the ordering and management of property photography. The platform operates with a **Multi-SPA Architecture**, featuring two independent web applications (pix.immo for professional services and pixcapture.app for DIY smartphone photography) sharing a single backend. Key capabilities include a **complete booking system**, robust session-based authentication with role-based access, and designed for future AI integration for image analysis. The platform currently serves the Hamburg area (30 km radius) and aims to enhance property listings with high-quality, AI-analyzed media.

## User Preferences
- Hono for Cloudflare Workers compatibility
- React SPA with Wouter routing
- Shadcn components for consistent UI
- TypeScript for type safety
- Clean, modern developer-focused interfaces
- Secure environment variable management (no hardcoded secrets)

## System Architecture

### UI/UX Decisions
The frontend is a React 18 SPA using Wouter for routing, Shadcn UI components, and Tailwind CSS for a modern, responsive design with dark/light mode support. Forms are managed with `react-hook-form` and `zod` for validation. Brand colors Sage Dark (#4A5849) and Copper (#A85B2E) define the visual identity.

### Technical Implementations
- **Backend**: Hono v4 framework on Node.js 22, optimized for Cloudflare Workers, shared across both SPAs.
- **Frontend**: React 18 with Wouter, Shadcn UI, Tailwind CSS, `react-hook-form` + `zod`, and TanStack Query v5.
- **Multi-SPA Development Server**: Path-based routing via `server/dev.ts` for simultaneous development of both `pix.immo` (professional) and `pixcapture.app` (budget DIY) on a single port.
- **Database**: PostgreSQL (Neon) with Drizzle ORM.
- **Object Storage**: Replit Object Storage (Google Cloud Storage) for RAW images, edited files, and handoff packages.
- **Authentication**: Custom session-based authentication with HTTP-only cookies and Scrypt password hashing.
- **Order Management**: API for managing property photography orders with role-based authorization.
- **Service Catalog & Booking**: Comprehensive catalog and multi-step booking wizard.
- **Google Maps Integration**: For address verification and thumbnail previews.
- **Google Calendar Integration**: Automated appointment scheduling with CET timezone support (09:00-18:00), time slot query API, and automatic event creation with stored event IDs.
- **SMS Notifications (Twilio)**: Pending user setup - will provide booking confirmations, appointment reminders, and cancellation notifications once Twilio credentials are configured.
- **Photo Workflow System**: Manages jobs, shoots, image stacks, RAW file handling, editor tokens, and ZIP handoff packages.
- **Client Gallery**: Features image viewer, favorites, comments, and download functionality.
- **QA-Autofix System**: Plugin-based framework for validating various aspects of the platform.
- **Mobile Camera Integration (PWA)**: iOS-style PWA for on-site photo capture, leveraging MediaDevices API and a comprehensive upload workflow to R2 storage with offline support.
- **AI Provider System**: Modular system for image editing (upscaling, denoising, background removal, sky enhancement) and captioning/text generation (AI-generated image descriptions, exposé texts, keyword extraction in German/English).
- **Web Portal Gallery Upload System**: Supports multi-file upload, automatic thumbnail generation, editing presets, annotation tools, and bulk settings application.
- **Room Type System**: Consolidated into 20 AI-optimized types.
- **Manual Camera Controls**: Expert mode with extended EV range, HDR brackets, zoom, ISO, shutter speed, Kelvin WB, and file format selection with Pro-gating for RAW/DNG.
- **Tripod & Motion Warnings V1.0**: Pre-capture stability check and post-capture bracket alignment validation for HDR/Night modes.
- **Live Recommendations (Heuristic MVP)**: Real-time scene analysis with intelligent shooting suggestions (e.g., HDR suggestions, window detection, gray-world white balance).
- **Filename Pattern v3.1**: Standardized naming for mobile uploads, implemented in `shared/filename-v31.ts`.
- **Sidecar Export System**: CRM-compatible export with `object_meta.json` and `alt_text.txt`, implemented in `shared/sidecar-export.ts`.
- **Server-Side Job Deduplication**: Offline-first sync queue deduplication using ULID-based localId for idempotent job creation.
- **Edit Queue Worker System**: Asynchronous edit job processing with Cron Worker, file locking, R2 bucket organization, Sharp-based image processing, retry logic, and status tracking.

### Feature Specifications
- **Authentication**: Signup, login, logout, password reset, session management.
- **User Roles**: "admin" and "client" with distinct access.
- **Booking System**: Service Catalog API, multi-step booking wizard, backend validation, and admin bookings management.
- **Core Web Content**: Homepage, Gallery, Blog, Pricing Pages.
- **Mobile App Screens**: SplashScreen, CameraScreen, GalleryScreen, UploadScreen.
- **Web Portal Screens**: UploadsOverview, GallerySelection, Payment, StatusTimeline, and Delivery.

### System Design Choices
The architecture prioritizes Cloudflare Workers compatibility using Hono, maintaining separate development (Express+Vite) and production (Hono) environments. Security features include Scrypt hashing, HTTP-only cookies, and secure environment variable management. SEO is managed via a `SEOHead` component, Schema.org templates, sitemap, and robots.txt. Frontend patterns strictly enforce React's Rules of Hooks, requiring all hooks to be called before any conditional early returns.

## Admin & Media Library Setup

### Admin Setup
- **Admin Seed Script**: `tsx server/seed-admin.ts` - ENV-based admin account creation
- **ENV Variables**: ADMIN_EMAIL, ADMIN_PASSWORD (defaults: admin@piximmo.de / Admin123!)
- **Features**: Idempotent, auto-promotes existing users, password sync

### Media Library Setup
- **Media Library Seed Script**: `./seed-media.sh` or `tsx server/seed-media-library.ts`
- **Purpose**: Imports homepage, PixCapture, and portfolio images into database for visibility in Admin Media Library
- **Images Imported** (62 total):
  - **9 Homepage images** (home-001 to home-009) - Hero images for pix.immo
  - **8 PixCapture images** (pixcap-001 to pixcap-008) - Mobile photography examples
  - **45 Gallery images** (gallery-001 to gallery-045) - Complete portfolio from /gallery page
- **Features**: Idempotent, tracks image location by page, enables SEO optimization and alt-text editing
- **Access**: Visit `/admin/media-library` to view and manage all images

## External Dependencies
- **Database**: PostgreSQL (Neon)
- **Email Service**: Resend
- **Google Calendar API**: Appointment scheduling and time slot management
- **SMS Service**: Twilio (requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER - pending user setup)
- **AI Services**:
  - **Image Processing**: Replicate or Clipdrop
  - **Text & Captions**: OpenAI ChatGPT (GPT-4 Vision)

## Recent Updates (November 2025)
- **Google Calendar Integration**: Complete booking flow with timezone fixes (CET: 09:00-18:00), automated event creation
- **PixCapture.app Layout**: Unified design with pix.immo - identical ScrollingImageStrip component (ref-based hover pause, dynamic aspect ratio width calculation), uniform 3:2 images (540×360px), matching typography and spacing
- **pix.immo Layout**: Mixed aspect ratios (3:2, 16:9, 9:16) for visual variety, identical ScrollingImageStrip implementation
- **User Management**: Single admin account (admin@piximmo.de) for both pix.immo and pixcapture.app
- **Twilio SMS Integration**: Ready for setup - requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER