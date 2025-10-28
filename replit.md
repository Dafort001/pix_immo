# pix.immo - Real Estate Media Platform

## Overview
pix.immo is a professional real estate media platform built with Node.js 22, TypeScript, and React, aiming to connect real estate professionals with photography services. It streamlines the ordering and management of property photography. The platform consists of a Mobile PWA for on-site photo capture and a Web Portal for client/admin management and gallery uploads. It features an order management system, robust session-based authentication with role-based access, and is designed for future AI integration for image analysis and deployment to Cloudflare Workers. The ultimate goal is to enhance property listings with high-quality, AI-analyzed media.

## User Preferences
- Hono for Cloudflare Workers compatibility
- React SPA with Wouter routing
- Shadcn components for consistent UI
- TypeScript for type safety
- Clean, modern developer-focused interfaces
- Secure environment variable management (no hardcoded secrets)

## System Architecture

### UI/UX Decisions
The frontend is a React 18 SPA utilizing Wouter for routing, Shadcn UI components, and Tailwind CSS for a modern, responsive design with dark/light mode support. Forms are handled with `react-hook-form` and `zod` for validation. Brand colors Sage Dark (#4A5849) and Copper (#A85B2E) define the visual identity.

### Technical Implementations
- **Backend**: Hono v4 framework on Node.js 22, optimized for Cloudflare Workers.
- **Frontend**: React 18 SPA with Wouter, Shadcn UI, Tailwind CSS, `react-hook-form` + `zod`, and TanStack Query v5.
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
- **Mobile PWA Upload Workflow**: Production-ready system with retry logic, real-time progress tracking, and animated success states.
- **Web Portal Gallery Upload System**: Supports multi-file upload (JPEG/PNG/HEIC and 13 RAW formats), automatic thumbnail generation, per-file editing presets, annotation tools, and bulk settings application.
- **Room Type System**: Consolidated into 20 types with AI-optimized German caption prompts.
- **Manual Camera Controls**: Expert mode with extended EV range, HDR brackets, zoom levels, ISO, shutter speed, Kelvin WB, and file format selection with Pro-gating for RAW/DNG.
- **Tripod & Motion Warnings V1.0**: Pre-capture stability check (700ms DeviceMotionEvent sampling) for HDR/Night modes with "Stativ empfohlen" dialog. Post-capture bracket alignment validation with congruency scoring (<70%/80% triggers "Bewegung erkannt" warning). Long exposure tip (>1/30s) with auto-dismiss. Feature flags: tripodCheck, congruencyCheck, longShutterTip (config-toggleable).

### Feature Specifications
- **Authentication**: Signup, login, logout, password reset, session management.
- **User Roles**: "admin" and "client" with distinct access.
- **Order Management**: Create, view, and update orders with defined statuses.
- **Homepage, Gallery, Blog, Pricing Pages**: Standard web content.
- **Mobile App Screens**: SplashScreen, CameraScreen (with self-timer, zoom, grid), GalleryScreen (photo stacks, bulk operations), UploadScreen (job selection, multi-stack upload with progress).
- **Web Portal Screens**: UploadsOverview, GallerySelection, Payment, StatusTimeline, and Delivery for complete photo order workflow.

### System Design Choices
The architecture prioritizes Cloudflare Workers compatibility using Hono. It maintains separate development (Express+Vite) and production (Hono) environments. Security features include Scrypt hashing, HTTP-only cookies, and secure environment variable management. SEO is managed via a `SEOHead` component, Schema.org templates, sitemap, and robots.txt.

## External Dependencies
- **Database**: PostgreSQL (Neon)
- **Email Service**: Mailgun (planned)
- **AI Services**: Modal Labs (USA) for image analysis, Replicate (USA) for advanced retouching.