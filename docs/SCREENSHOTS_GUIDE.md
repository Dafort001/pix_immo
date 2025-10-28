# Auto-Screenshots Guide

## ⚠️ Replit Compatibility Notice

**Status**: ❌ Not functional on Replit (requires system dependencies)

Both Playwright and Puppeteer require system libraries that are not available in Replit's default environment:
- `libglib-2.0.so.0`
- `libnspr4`, `libnss3`, `libdbus-1-3`
- `libatk`, `libcups`, `libxcb`, `libx11`, etc.

**Solution**: Use the tools on a local machine with proper system dependencies installed.

---

## ✅ Mock Tool (Replit Smoke Test)

For testing the export structure on Replit, use the mock tool:

```bash
tsx tools/page-screenshots-mock.ts
```

This generates minimal 1×1 PNG files (70 bytes each) to verify:
- Export directory structure works
- Filename generation is correct
- Breakpoint naming is consistent

**Mock Output**:
```
export/screens/
├── _root-mobile.png
├── _root-tablet.png
├── _root-desktop.png
├── _about-mobile.png
├── _about-tablet.png
├── _about-desktop.png
└── ...
```

---

## 🖥️ Real Screenshots (Local Machine)

### Prerequisites

**Install System Dependencies** (Linux):
```bash
# Debian/Ubuntu
sudo apt-get install libglib2.0-0 libnspr4 libnss3 libdbus-1-3 \
  libatk1.0-0 libatk-bridge2.0-0 libcups2 libxcb1 libxkbcommon0 \
  libx11-6 libxcomposite1 libxdamage1 libxext6 libxfixes3 \
  libxrandr2 libgbm1 libcairo2 libpango-1.0-0 libasound2

# OR use Playwright installer
npx playwright install-deps
```

**macOS/Windows**: No additional dependencies needed.

### Usage

```bash
# Using tsx directly (recommended):
tsx tools/page-screenshots.ts

# Or use shell script:
./export-screens.sh

# Or add to package.json scripts (manually):
# "export:screens": "tsx tools/page-screenshots.ts"
# Then run: npm run export:screens
```

### What it does

Generates screenshots of all pages using Puppeteer headless browser:

1. **Parses routes** from `App.tsx`
2. **Launches Puppeteer** headless Chrome
3. **Captures each route** at 3 breakpoints:
   - Mobile: 390×844px (iPhone 12 Pro)
   - Tablet: 768×1024px (iPad)
   - Desktop: 1280×800px
4. **Saves PNGs** to `export/screens/{route}-{breakpoint}.png`
5. **Skips dynamic routes** (e.g., `/portal/job/:jobId`)

---

## 📊 Output Structure

```
export/screens/
├── _root-mobile.png           # Homepage @ 390×844
├── _root-tablet.png           # Homepage @ 768×1024
├── _root-desktop.png          # Homepage @ 1280×800
├── _about-mobile.png
├── _about-tablet.png
├── _about-desktop.png
├── _app_camera-mobile.png     # Mobile PWA routes
├── _app_camera-tablet.png
├── _app_camera-desktop.png
└── ...
```

**Filename Pattern**: `{sanitized_route}-{breakpoint}.png`

**Sanitization**:
- `/` → `_`
- `:` → `_`
- `?` → `_`
- `/` (root) → `_root`

---

## 🔧 Configuration

Edit `tools/page-screenshots.ts`:

### Change Breakpoints

```typescript
const BREAKPOINTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
  
  // Add custom breakpoints:
  { name: 'wide', width: 1920, height: 1080 },
];
```

### Change Base URL

```typescript
// Auto-detects Replit domain, or falls back to localhost:5000
const BASE_URL = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : 'http://localhost:5000';
```

### Enable Audit Mode

Audit mode appends `?__audit=1` query parameter:

```typescript
await captureRoute(page, route, true); // Audit mode enabled
```

This can be used to:
- Bypass auth checks (if implemented)
- Show hidden debug panels
- Enable test data

---

## 📈 Example Output

```
📸 Auto-Screenshots Tool (Puppeteer)

🌐 Base URL: http://localhost:5000
📊 Breakpoints: mobile, tablet, desktop

✅ Found 45 routes (excluding dynamic routes)

🚀 Launching headless browser (Puppeteer)...

📸 Capturing: /
  ✓ mobile (390×844)
  ✓ tablet (768×1024)
  ✓ desktop (1280×800)
📸 Capturing: /about
  ✓ mobile (390×844)
  ✓ tablet (768×1024)
  ✓ desktop (1280×800)
...

📈 Progress: 5/45 routes...
📈 Progress: 10/45 routes...
...

✨ Done!

📈 Summary:
   - Routes captured: 45/45
   - Screenshots: 135 (45 routes × 3 breakpoints)
   - Errors: 0
   - Output: /home/runner/workspace/export/screens

💡 View screenshots:
   ls -lh export/screens/*.png | head -10
```

---

## 🐛 Troubleshooting

### Server not running

```
❌ Error: Server not running on port 5000

Start the server first:
  npm run dev
```

**Solution**: Ensure dev server is running before taking screenshots.

### Timeout errors

```
❌ Failed: Timeout waiting for network to be idle
```

**Solutions**:
1. Increase timeout in `page.goto()`:
   ```typescript
   timeout: 30000, // 30 seconds
   ```
2. Change `waitUntil` strategy:
   ```typescript
   waitUntil: 'domcontentloaded', // Less strict
   ```

### Empty/black screenshots

**Causes**:
- Page JavaScript not loaded
- Content loading asynchronously

**Solutions**:
1. Increase wait time:
   ```typescript
   await page.waitForTimeout(2000); // 2 seconds
   ```
2. Wait for specific element:
   ```typescript
   await page.waitForSelector('main', { timeout: 5000 });
   ```

### Auth-protected routes show login page

**Solutions**:
1. Implement audit mode bypass in app
2. Mock authentication in Puppeteer:
   ```typescript
   // Set cookies before navigation
   await page.setCookie({
     name: 'session',
     value: 'mock_token',
     domain: 'localhost',
   });
   ```

---

## 🔍 Smoke Test Results (Replit)

```
=== SMOKE TEST: Screenshots Generated ===

-rw-r--r-- 1 runner runner 70 Oct 28 12:36 export/screens/_root-mobile.png
-rw-r--r-- 1 runner runner 70 Oct 28 12:36 export/screens/_root-tablet.png
-rw-r--r-- 1 runner runner 70 Oct 28 12:36 export/screens/_root-desktop.png
-rw-r--r-- 1 runner runner 70 Oct 28 12:36 export/screens/_about-mobile.png
-rw-r--r-- 1 runner runner 70 Oct 28 12:36 export/screens/_about-tablet.png
-rw-r--r-- 1 runner runner 70 Oct 28 12:36 export/screens/_about-desktop.png
-rw-r--r-- 1 runner runner 70 Oct 28 12:36 export/screens/_galerie-mobile.png
-rw-r--r-- 1 runner runner 70 Oct 28 12:36 export/screens/_galerie-tablet.png
-rw-r--r-- 1 runner runner 70 Oct 28 12:36 export/screens/_galerie-desktop.png

Total files: 9 ✅
```

**Status**: ✅ Mock tool works, real screenshots require local machine

---

## 📚 Related Documentation

- `tools/README.md` - Tools overview
- `tools/page-screenshots.ts` - Full implementation (Puppeteer)
- `tools/page-screenshots-mock.ts` - Mock version for Replit
- `export-screens.sh` - Shell wrapper script

---

**Last Updated**: 2025-10-28  
**Status**: Implemented (requires local machine for real screenshots)  
**Mock Screenshots**: 9 files generated (3 routes × 3 breakpoints)
