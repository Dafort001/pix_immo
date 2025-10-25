# Web Portal Deployment Guide

Komplette Anleitung für Cloudflare Workers Deployment mit CI/CD Pipeline.

---

## 📋 Prerequisites

### Erforderliche Accounts
- ✅ GitHub Account (Repository erstellt)
- ✅ Cloudflare Account (Workers enabled)
- ✅ Neon PostgreSQL Account (Database provisioniert)
- ✅ Stripe Account (für Payments)

### Lokale Requirements
- Node.js 22+
- npm oder pnpm
- Git
- Wrangler CLI (`npm install -g wrangler`)

---

## 🚀 Deployment-Übersicht

### Deployment-Flow

```
Local Dev → GitHub → CI/CD → Cloudflare Workers → Production
```

**1. Local Development:**
```bash
npm run dev              # Express + Vite (HMR)
```

**2. Build & Test:**
```bash
npm run build            # Vite Build
npm run lint             # ESLint
npm run check            # TypeScript
```

**3. Deployment:**
```bash
wrangler deploy          # Deploy to Cloudflare
```

---

## ⚙️ STEP 1: Repository Setup

### GitHub Repository

**Bereits vorhanden:**
- Repository: https://github.com/Dafort001/EstateSandbox
- CI/CD Pipeline: `.github/workflows/piximmo-ci.yml`

**Dateien im Repo:**
- ✅ `wrangler.toml` - Cloudflare Config
- ✅ `.github/workflows/piximmo-ci.yml` - CI/CD
- ✅ `scripts/audit.sh` - Local Validation
- ✅ `AUDIT_CHECKLIST.md` - Requirements Tracker

---

## 🔐 STEP 2: Secrets Configuration

### 2.1 Cloudflare Secrets

**API Token erstellen:**
1. https://dash.cloudflare.com/profile/api-tokens
2. "Create Token" → "Edit Cloudflare Workers" Template
3. Permissions:
   - Account - Cloudflare Workers Scripts - **Edit**
   - Account - Account Settings - **Read**
4. Token kopieren (sicher speichern!)

**GitHub Secret hinzufügen:**
1. https://github.com/Dafort001/EstateSandbox/settings/secrets/actions
2. "New repository secret"
3. Name: `CLOUDFLARE_API_TOKEN`
4. Value: `<paste token>`
5. "Add secret"

### 2.2 Environment Secrets (Cloudflare)

**Required Secrets:**
```bash
wrangler secret put DATABASE_URL
wrangler secret put SESSION_SECRET
wrangler secret put JWT_SECRET
wrangler secret put CF_R2_ACCESS_KEY
wrangler secret put CF_R2_SECRET_KEY
wrangler secret put CF_R2_BUCKET
wrangler secret put CF_R2_ENDPOINT
wrangler secret put CF_R2_ACCOUNT_ID
wrangler secret put STRIPE_SECRET_KEY
```

**Optional Secrets:**
```bash
wrangler secret put MAILGUN_API_KEY
wrangler secret put MAILGUN_DOMAIN
wrangler secret put REPLICATE_API_TOKEN
```

**Environment Variables (public):**
```toml
# wrangler.toml
[vars]
NODE_ENV = "production"
VITE_STRIPE_PUBLIC_KEY = "pk_live_..."
```

---

## 🔧 STEP 3: Wrangler Configuration

### wrangler.toml

```toml
name = "pix-immo"
main = "server/index.ts"
compatibility_date = "2024-01-01"
node_compat = true

[vars]
NODE_ENV = "production"
VITE_STRIPE_PUBLIC_KEY = "pk_live_..."

# R2 Bucket Binding
[[r2_buckets]]
binding = "R2"
bucket_name = "pix-immo-storage"

# Database (via environment variable)
# Set DATABASE_URL as secret

# Build Configuration
[build]
command = "npm run build"

# Routes
routes = [
  { pattern = "pix.immo/*", zone_name = "pix.immo" }
]
```

**Custom Domain Setup:**
1. Cloudflare Dashboard → Workers & Pages
2. "Custom Domains" → "Add Custom Domain"
3. `pix.immo` oder `portal.pix.immo`

---

## 🏗️ STEP 4: Build Configuration

### Vite Config

**Wichtig:** Vite muss für Cloudflare Workers optimiert sein:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['__STATIC_CONTENT_MANIFEST']
    }
  },
  resolve: {
    alias: {
      '@': '/client/src',
      '@assets': '/attached_assets'
    }
  }
});
```

### Production Build

```bash
npm run build
# Output: dist/
#   ├── index.html
#   ├── assets/
#   │   ├── index-[hash].js
#   │   └── index-[hash].css
#   └── ...
```

---

## 🔄 STEP 5: CI/CD Pipeline

### GitHub Actions Workflow

**Datei:** `.github/workflows/piximmo-ci.yml`

**Jobs:**

**1. lint-and-build:**
- Install dependencies
- Run ESLint
- Run TypeScript check
- Build application
- **BLOCKS deployment if fails**

**2. wrangler-dry-run:**
- Validates Cloudflare config
- Tests deployment without publishing
- **BLOCKS if wrangler.toml invalid**

**3. deploy-staging:**
- Triggers on `develop` branch
- Deploys to staging environment

**4. deploy-production:**
- Triggers on `main` branch
- Deploys to production
- Requires manual approval (optional)

### Trigger CI/CD

**Option A: Manual Trigger**
1. https://github.com/Dafort001/EstateSandbox/actions
2. "pix.immo CI/CD Pipeline"
3. "Run workflow"

**Option B: Push to main**
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

**Monitor:**
- https://github.com/Dafort001/EstateSandbox/actions

**Expected Results:**
- ✅ lint-and-build: PASS
- ✅ wrangler-dry-run: PASS
- ✅ deploy-production: SUCCESS

---

## 📊 STEP 6: Verify Deployment

### Health Checks

**1. API Health:**
```bash
curl https://pix.immo/api/health
# Expected: { "status": "ok", "timestamp": "..." }
```

**2. Static Assets:**
```bash
curl -I https://pix.immo/
# Expected: 200 OK
```

**3. Database Connection:**
```bash
curl https://pix.immo/api/auth/status
# Expected: { "authenticated": false }
```

### Cloudflare Dashboard

**Metrics:**
1. https://dash.cloudflare.com/
2. Workers & Pages → pix-immo
3. Check:
   - ✅ Request count
   - ✅ Error rate (<1%)
   - ✅ CPU time (<50ms)
   - ✅ Success rate (>99%)

---

## 🔍 STEP 7: Database Migration

### Sync Schema to Production

**WARNING:** Never run migrations against production without backup!

**1. Backup Database:**
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

**2. Dry-Run Migration:**
```bash
npm run db:push
# Review changes
```

**3. Apply Migration:**
```bash
npm run db:push --force
```

**4. Verify:**
```bash
psql $DATABASE_URL
\dt  # List tables
SELECT * FROM users LIMIT 1;
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "wrangler: command not found"**
```bash
npm install -g wrangler
wrangler login
```

**2. "Database connection failed"**
```bash
# Check DATABASE_URL secret
wrangler secret list
wrangler secret put DATABASE_URL
```

**3. "Build failed: TypeScript errors"**
```bash
npm run check
# Fix errors, then rebuild
```

**4. "R2 upload failed"**
```bash
# Verify R2 credentials
wrangler secret list | grep R2
wrangler r2 bucket list
```

**5. "Session not persisting"**
```bash
# Check SESSION_SECRET
wrangler secret put SESSION_SECRET
# Generate: openssl rand -base64 32
```

### Logs & Debugging

**Wrangler Tail (Live Logs):**
```bash
wrangler tail
# Watch live request logs
```

**Filter by severity:**
```bash
wrangler tail --format pretty | grep ERROR
```

**Cloudflare Dashboard Logs:**
1. Workers & Pages → pix-immo
2. Logs tab
3. Filter by status code, method, etc.

---

## 📈 Performance Optimization

### 1. Edge Caching

**Static Assets:**
```typescript
// server/index.ts
app.get('/assets/*', async (c) => {
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
  return c.asset(c.req.path);
});
```

### 2. Database Connection Pooling

**Neon Serverless:**
```typescript
import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;
const sql = neon(env.DATABASE_URL);
```

### 3. R2 Presigned URLs

**Reduce Worker CPU:**
```typescript
// Generate presigned URLs for direct uploads
const presignedUrl = await generatePresignedUrl(bucket, key, 3600);
// Client uploads directly to R2 (bypasses Worker)
```

---

## 🔐 Security Checklist

**Pre-Deployment:**
- [ ] All secrets configured (`wrangler secret list`)
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] SQL injection protection (Drizzle ORM)
- [ ] XSS protection (Content-Security-Policy)
- [ ] Session cookies: HTTP-only, Secure, SameSite=Lax
- [ ] Database credentials not in code
- [ ] API keys in environment variables

**Post-Deployment:**
- [ ] Security headers verified
- [ ] SSL certificate valid
- [ ] No exposed secrets in logs
- [ ] Auth endpoints rate-limited
- [ ] CSRF protection enabled

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] `npm run lint` passes
- [ ] `npm run check` passes
- [ ] `npm run build` succeeds
- [ ] All tests pass
- [ ] Database migrations reviewed
- [ ] Environment secrets configured
- [ ] `wrangler.toml` validated

### Deployment
- [ ] Git commit pushed to main
- [ ] CI/CD pipeline green
- [ ] `wrangler deploy` successful
- [ ] Health checks pass

### Post-Deployment
- [ ] API responds correctly
- [ ] Static assets loading
- [ ] Database queries working
- [ ] Session auth functional
- [ ] Gallery upload tested
- [ ] Stripe payments tested
- [ ] Logs show no errors

---

## 🆘 Rollback Procedure

### Quick Rollback

**1. Revert to previous version:**
```bash
# List deployments
wrangler deployments list

# Rollback to specific version
wrangler rollback <deployment-id>
```

**2. Database Rollback:**
```bash
# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD.sql
```

**3. Verify:**
```bash
curl https://pix.immo/api/health
```

---

## 📚 Additional Resources

**Cloudflare:**
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [R2 Storage](https://developers.cloudflare.com/r2/)

**Neon Database:**
- [Neon Serverless](https://neon.tech/docs/serverless/serverless-driver)
- [Connection Pooling](https://neon.tech/docs/connect/connection-pooling)

**Monitoring:**
- [Cloudflare Analytics](https://dash.cloudflare.com/)
- [Sentry Error Tracking](https://sentry.io/) (optional)

---

## 🎯 Next Steps

1. **Custom Domain:** Configure `pix.immo` in Cloudflare
2. **Monitoring:** Setup alerts for errors/downtime
3. **Backup Strategy:** Automated database backups
4. **Performance:** Enable edge caching
5. **Security:** Add WAF rules for DDoS protection

---

**Status:** ✅ Deployment Guide Complete  
**Version:** 1.0.0  
**Last Updated:** Oktober 2025
