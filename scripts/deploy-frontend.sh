#!/bin/bash
# HALT F3: Frontend Deployment Script
# Deploys to Cloudflare Pages (pixcapture-frontend)

set -e

# Build first
./scripts/build-frontend.sh

echo ""
echo "🚀 Deploying to Cloudflare Pages..."

# Deploy using wrangler
npx wrangler pages deploy ./dist/client \
  --project-name=pixcapture-frontend \
  --branch=main

echo ""
echo "✅ Deployment complete!"
echo "🌐 URL: https://pixcapture.pages.dev"
