# Tools Directory

## 1. Page Inventory Tool

**Script**: `tools/page-inventory.ts`

### Usage

```bash
# Using tsx directly (recommended):
tsx tools/page-inventory.ts

# Or add this to package.json scripts (manually):
# "audit:pages": "tsx tools/page-inventory.ts"
# Then run: npm run audit:pages
```

### What it does

Scans all pages in `client/src/pages/**` and generates:

1. **Markdown Report**: `docs/page_inventory.md`
   - Overview table with routes, titles, layouts, components
   - Layout distribution statistics

2. **CSV Export**: `docs/page_inventory.csv`
   - Semicolon-separated (Excel-compatible)
   - All page metadata for spreadsheet analysis

### Output Fields

- **Route**: Path from App.tsx router
- **Title**: Extracted from h1, title prop, or SEOHead
- **Layout**: Detected layout type (Web, Mobile PWA, Portal, Form, Simple)
- **Components**: List of used JSX components
- **Last Modified**: File modification date (YYYY-MM-DD)
- **File Path**: Relative path to page file

### Example Output

```
📊 Page Inventory Tool

📂 Scanning: /home/runner/workspace/client/src/pages
✅ Found 51 pages

📝 Markdown report: /home/runner/workspace/docs/page_inventory.md
📊 CSV report: /home/runner/workspace/docs/page_inventory.csv

✨ Done!

📈 Summary:
   - Routes: 51
   - Markdown: 12.45 KB
   - CSV: 8.23 KB
```

### Adding NPM Script (Manual)

Since Replit restricts `package.json` edits via agent, add this manually:

1. Open `package.json`
2. Add to `"scripts"` section:
   ```json
   "audit:pages": "tsx tools/page-inventory.ts"
   ```
3. Run: `npm run audit:pages`

### Troubleshooting

**Error: "Cannot find module 'tsx'"**
- Run: `npm install tsx` (already installed in this project)

**Empty output files**
- Check if `client/src/pages/` exists
- Verify `App.tsx` contains route definitions

**Less than 5 routes warning**
- Script expects at least 5 pages (this project has 51+)

---

## 2. Wireframe Export Tool

**Script**: `tools/wireframe-export.ts`

### Usage

```bash
# Using tsx directly (recommended):
tsx tools/wireframe-export.ts

# Or use shell script:
./export-wireframes.sh

# Or add to package.json scripts (manually):
# "export:wireframes": "tsx tools/wireframe-export.ts"
# Then run: npm run export:wireframes
```

### What it does

Generates visual wireframes and HTML skeletons for all pages:

1. **SVG Wireframes**: `export/wireframes/{route}.svg`
   - Vector-based layout diagrams
   - Figma-compatible (drag & drop import)
   - Color-coded sections (header, nav, main, aside, footer)
   - Responsive sizing (Web: 1200×800px, Mobile: 375×800px)

2. **HTML Skeletons**: `export/skeletons/{route}.html`
   - Interactive HTML files with Grid/Flexbox layouts
   - Minimal CSS for spacing and structure
   - No real content - only layout containers
   - Open in browser to preview structure

3. **Site Map**: `export/site_map.svg`
   - Complete visual overview of all routes
   - Grouped by hierarchy (root, app, portal, admin, etc.)
   - Figma-compatible sitemap diagram

### Output Structure

Each route generates:
- **SVG**: Wireframe boxes with labels (`<g>` groups for Figma)
- **HTML**: Skeleton with CSS Grid, Flexbox, placeholder elements

**Example SVG Structure**:
```xml
<svg width="1200" height="800">
  <g id="header">
    <rect class="wireframe-box wireframe-header"/>
    <text>Header</text>
  </g>
  <g id="main">
    <rect class="wireframe-box wireframe-main"/>
  </g>
</svg>
```

**Example HTML Structure**:
```html
<div class="wireframe-container">
  <header class="skeleton-header">...</header>
  <div class="skeleton-main-wrapper">
    <aside class="skeleton-aside">...</aside>
    <main class="skeleton-main">
      <div class="skeleton-cards">...</div>
    </main>
  </div>
  <footer class="skeleton-footer">...</footer>
</div>
```

### Example Output

```
🎨 Wireframe & Skeleton Export Tool

📂 Scanning: /home/runner/workspace/client/src/pages
✅ Found 52 pages

  Processed 10/52 pages...
  Processed 20/52 pages...
  Processed 50/52 pages...

📊 Generating sitemap...

✨ Done!

📈 Summary:
   - SVG Wireframes: 52
   - HTML Skeletons: 52
   - Sitemap: export/site_map.svg
```

### Using in Figma

1. Open Figma
2. Drag & drop any `.svg` file from `export/wireframes/`
3. SVG imports as vector layers with groups preserved
4. Edit colors, spacing, add real content
5. Use as design foundation

### Troubleshooting

**Empty export directories**
- Check if `client/src/pages/` exists
- Verify `App.tsx` contains route definitions

**SVG doesn't import to Figma**
- Make sure file extension is `.svg`
- Try copy/paste SVG content into Figma
- Check Figma → Edit → Paste as SVG

**HTML skeleton has no layout**
- CSS is embedded in `<style>` tag
- Should work offline
- Check browser console for errors

### Advanced Usage

**Custom Styling**: Edit SVG/HTML generation in `tools/wireframe-export.ts`
- SVG colors: Lines ~200-220
- HTML CSS: Lines ~400-500

**Filter Routes**: Modify scanner to export specific routes only

---

---

## 3. Auto-Screenshots Tool

**Script**: `tools/page-screenshots.ts`

### ⚠️ Replit Compatibility

**Status**: ❌ Not functional on Replit (requires system dependencies)

Both Playwright and Puppeteer need system libraries not available in Replit:
- `libglib-2.0.so.0`, `libnspr4`, `libnss3`, etc.

**Solution**: Use on local machine with system dependencies installed, OR use the mock tool for structure testing.

### Usage (Local Machine)

```bash
# Using tsx directly:
tsx tools/page-screenshots.ts

# Or use shell script:
./export-screens.sh

# Or add to package.json scripts (manually):
# "export:screens": "tsx tools/page-screenshots.ts"
# Then run: npm run export:screens
```

### Mock Tool (Replit)

For testing the export structure:

```bash
tsx tools/page-screenshots-mock.ts
```

Generates minimal 1×1 PNG files (70 bytes each) to verify structure.

### What it does

Captures screenshots of all routes using Puppeteer:

1. **Parses routes** from `App.tsx`
2. **Launches Puppeteer** headless Chrome
3. **Captures each route** at 3 breakpoints:
   - Mobile: 390×844px (iPhone 12 Pro)
   - Tablet: 768×1024px (iPad)
   - Desktop: 1280×800px
4. **Saves PNGs** to `export/screens/{route}-{breakpoint}.png`
5. **Skips dynamic routes** (e.g., `/portal/job/:jobId`)

### Example Output

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
...

✨ Done!

📈 Summary:
   - Routes captured: 45/45
   - Screenshots: 135
   - Output: export/screens/
```

### Troubleshooting

**Server not running**:
```bash
npm run dev  # Start server first
```

**Timeout errors**:
- Increase timeout in `page.goto()` options
- Change `waitUntil: 'domcontentloaded'`

**Empty screenshots**:
- Increase wait time after page load
- Wait for specific selectors to appear

---

## 4. Component Map Tool

**Script**: `tools/component-map.ts`

### Usage

```bash
# Using tsx directly:
tsx tools/component-map.ts

# Or use shell script:
./audit-components.sh

# Or add to package.json scripts (manually):
# "audit:components": "tsx tools/component-map.ts"
# Then run: npm run audit:components
```

### What it does

Analyzes component usage across all pages and generates bidirectional mapping:

1. **Scans components** in `client/src/components/**/*.{ts,tsx}`
2. **Parses routes** from `App.tsx`
3. **Analyzes imports** in each page file
4. **Creates bidirectional map**:
   - Components → Routes (which pages use this component)
   - Routes → Components (which components does this page use)
5. **Generates outputs**:
   - `docs/component_map.json` - Machine-readable mapping
   - `docs/component_map.md` - Human-readable report

### Output Structure

**JSON** (`docs/component_map.json`):
```json
{
  "components": {
    "SEOHead": ["/about", "/kontakt", "/", ...],
    "WebHeader": ["/portal/uploads", ...]
  },
  "routes": {
    "/": ["SEOHead", "SchemaTemplates"],
    "/about": ["SEOHead"]
  },
  "statistics": {
    "totalComponents": 27,
    "totalRoutes": 50,
    "averageComponentsPerRoute": 1.3,
    "mostUsedComponents": [...]
  }
}
```

**Markdown** (`docs/component_map.md`):
- Statistics overview
- Top 10 most used components (ranked table)
- Component → Routes mapping (alphabetical)
- Routes → Components mapping (alphabetical)

### Example Output

```
🗺️  Component Map Tool

📂 Scanning components: /home/runner/workspace/client/src/components
📂 Scanning pages: /home/runner/workspace/client/src/pages

✅ Analysis complete

📊 Statistics:
   - Components found: 27
   - Routes analyzed: 50
   - Avg components/route: 1.3

📄 Wrote: /home/runner/workspace/docs/component_map.json
📄 Wrote: /home/runner/workspace/docs/component_map.md

🏆 Top 5 Components:
   1. SEOHead (19 routes)
   2. WebHeader (5 routes)
   3. BottomNav (5 routes)
   4. HapticButton (5 routes)
   5. StatusBar (5 routes)

✨ Done!
```

### Use Cases

**Refactoring**: Find all routes affected by component changes
```bash
# Which routes use SEOHead?
grep -A 20 '"SEOHead"' docs/component_map.json
```

**Dead Code Detection**: Find unused components
```json
{
  "MasonryGrid": []  // Not used anywhere!
}
```

**Impact Analysis**: Understand blast radius of changes

**Testing Strategy**: Prioritize testing for most-used components

**Documentation**: Show stakeholders component reuse metrics

### Troubleshooting

**No components found**:
- Check if `client/src/components/` exists
- Verify components have `export` statements

**Wrong route paths**:
- Check `App.tsx` for route definitions
- Tool falls back to directory structure if no match

**Missing imports**:
- Only static imports are detected
- Dynamic imports (`await import()`) not supported

---

---

## 5. Content Dump Tool

**Script**: `tools/content-dump.ts`

### Usage

```bash
# Using tsx directly:
tsx tools/content-dump.ts

# Or use shell script:
./export-content.sh

# Or add to package.json scripts (manually):
# "export:content": "tsx tools/content-dump.ts"
# Then run: npm run export:content
```

### What it does

Extracts all text content from the codebase:

1. **Scans pages** for hardcoded strings
2. **Scans components** for JSX text content
3. **Scans shared** for constants
4. **Extracts patterns**:
   - JSX text: `<h1>Text here</h1>`
   - Props: `title="Text here"`
   - Constants: `const TEXT = "Text here"`
5. **Generates outputs**:
   - `export/content_dump.json` - All entries with metadata
   - `docs/content_index.md` - Grouped by route

### Output Structure

**JSON** (`export/content_dump.json`):
```json
{
  "totalEntries": 3195,
  "byType": {
    "hardcoded": 3195,
    "constant": 0
  },
  "entries": [
    {
      "key": "pages/home.tsx:42:h1",
      "value": "Professional Real Estate Photography",
      "route": "/",
      "file": "pages/home.tsx",
      "line": 42,
      "type": "hardcoded"
    }
  ]
}
```

### Use Cases

**i18n Migration**: Find all strings that need translation
**Copy Audit**: Review all user-facing text
**Content Inventory**: Track marketing copy
**SEO Audit**: Extract headings and descriptions

---

## 6. Routes Manifest Tool

**Script**: `tools/routes-manifest.ts`

### Usage

```bash
# Using tsx directly:
tsx tools/routes-manifest.ts

# Or use shell script:
./audit-routes.sh

# Or add to package.json scripts (manually):
# "audit:routes": "tsx tools/routes-manifest.ts"
# Then run: npm run audit:routes
```

### What it does

Generates complete route manifest with metadata:

1. **Parses App.tsx** for route definitions
2. **Enriches metadata** by scanning page files:
   - Auth requirements (`useAuth()`)
   - Role guards (`role === "admin"`)
   - Feature flags
3. **Detects orphan routes** (not linked anywhere)
4. **Finds link sources** (what links to each route)
5. **Generates outputs**:
   - `export/routes_manifest.json` - Complete manifest
   - `docs/routes_manifest.md` - Human-readable report

### Output Structure

**JSON** (`export/routes_manifest.json`):
```json
{
  "totalRoutes": 51,
  "stats": {
    "publicRoutes": 51,
    "authRoutes": 0,
    "guardedRoutes": 0,
    "orphanRoutes": 48,
    "dynamicRoutes": 8
  },
  "routes": [
    {
      "path": "/portal/job/:jobId",
      "params": ["jobId"],
      "layout": "portal",
      "file": "pages/portal/job-detail.tsx",
      "isOrphan": false,
      "linkedFrom": ["/portal/jobs"]
    }
  ]
}
```

### Use Cases

**Security Audit**: Find unprotected routes
**Dead Code**: Identify orphan routes
**Navigation Design**: See linking structure
**API Planning**: Extract dynamic parameters

---

## 7. Figma Bundle Tool

**Script**: `tools/figma-bundle.ts`

### Usage

```bash
# Using tsx directly:
tsx tools/figma-bundle.ts

# Or use shell script:
./bundle-figma.sh
```

### What it does

Packages all design assets for Figma import:

1. **Copies wireframes** from `export/wireframes/` (50 SVGs)
2. **Copies screenshots** from `export/screens/` (PNGs)
3. **Copies site map** from `export/site_map.svg`
4. **Copies design tokens** (if available)
5. **Generates README_FIGMA.md** with import instructions
6. **Creates .figmap.json** for Figma plugins

### Bundle Structure

```
export/figma_bundle/
├── wireframes/        # 50 SVG wireframes
├── screenshots/       # PNG screenshots (3 breakpoints each)
├── maps/              # site_map.svg
├── tokens/            # design_tokens.json (optional)
├── README_FIGMA.md    # Import guide
└── .figmap.json       # Plugin metadata
```

### Use Cases

**Design Handoff**: Share assets with designers
**Figma Import**: Batch import all wireframes
**Design System**: Use tokens in Figma
**Documentation**: Visual site architecture

---

## 8. Audit ZIP Tool

**Script**: `tools/audit-zip.ts`

### Usage

```bash
# Using tsx directly:
tsx tools/audit-zip.ts

# Or use shell script:
./create-audit-zip.sh
```

### What it does

Creates complete audit package:

1. **Generates AUDIT_INDEX.md** with links to all reports
2. **Creates ZIP archive** containing:
   - All `/docs` markdown reports
   - All `/export` JSON/SVG/PNG files
   - Figma bundle
3. **Checks size** (<80 MB preferred)
4. **Lists top 5 largest files**

### Package Contents

```
site_audit_package.zip
├── docs/
│   ├── page_inventory.md
│   ├── content_index.md
│   ├── routes_manifest.md
│   ├── component_map.md
│   └── *.md guides
└── export/
    ├── wireframes/
    ├── screenshots/
    ├── figma_bundle/
    ├── content_dump.json
    ├── routes_manifest.json
    └── AUDIT_INDEX.md
```

### Use Cases

**Stakeholder Reports**: Single ZIP for stakeholders
**Archival**: Snapshot of current state
**Handoff**: Complete documentation package
**Backup**: Audit baseline for future comparison

---

## Quick Reference

| Tool | Script | Output | Use Case |
|------|--------|--------|----------|
| Page Inventory | `page-inventory.ts` | `docs/page_inventory.md` | Route list |
| Wireframes | `wireframe-export.ts` | `export/wireframes/*.svg` | Design mockups |
| Screenshots | `page-screenshots.ts` | `export/screens/*.png` | Visual testing |
| Component Map | `component-map.ts` | `docs/component_map.md` | Refactoring |
| Content Dump | `content-dump.ts` | `export/content_dump.json` | i18n migration |
| Routes Manifest | `routes-manifest.ts` | `export/routes_manifest.json` | Security audit |
| Figma Bundle | `figma-bundle.ts` | `export/figma_bundle/` | Design handoff |
| Audit ZIP | `audit-zip.ts` | `export/site_audit_package.zip` | Complete package |

---

## Related Documentation

- `docs/WIREFRAME_EXPORT_GUIDE.md` - Wireframe export guide
- `docs/SCREENSHOTS_GUIDE.md` - Screenshots guide
- `docs/COMPONENT_MAP_GUIDE.md` - Component map guide
- `docs/page_inventory.md` - Route list
- `docs/content_index.md` - Content audit
- `docs/routes_manifest.md` - Route manifest
- `export/wireframes/` - Generated SVG wireframes
- `export/skeletons/` - Generated HTML skeletons
- `export/screens/` - Generated screenshots (or mocks)
- `export/site_map.svg` - Site architecture diagram
- `export/figma_bundle/` - Figma import package
- `export/AUDIT_INDEX.md` - Complete audit index
