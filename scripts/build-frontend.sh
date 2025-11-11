#!/bin/bash
# HALT F3: Frontend Build Script
# Builds React SPA for Cloudflare Pages deployment

set -e

echo "🏗️  Building Frontend for Cloudflare Pages..."

# Set production environment variables
export VITE_APP_ENV=production
export VITE_API_BASE_URL=https://api.pixcapture.dev

# Build with Vite
npx vite build --outDir dist/client

echo "✅ Frontend build complete → dist/client/"
echo "📦 Ready for deployment to Cloudflare Pages"
