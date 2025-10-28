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

## Related Documentation

- `docs/WIREFRAME_EXPORT_GUIDE.md` - Complete guide
- `docs/page_inventory.md` - Route list
- `export/wireframes/` - Generated SVG wireframes
- `export/skeletons/` - Generated HTML skeletons
- `export/site_map.svg` - Site architecture diagram
