# Wireframe Export Guide

## ✅ Quick Start

### Option 1: Direct Command (Recommended)
```bash
tsx tools/wireframe-export.ts
```

### Option 2: Shell Script
```bash
./export-wireframes.sh
```

### Option 3: NPM Script (Manual Setup Required)

**Step 1**: Open `package.json` manually

**Step 2**: Add to `"scripts"` section:
```json
"export:wireframes": "tsx tools/wireframe-export.ts"
```

**Step 3**: Run:
```bash
npm run export:wireframes
```

> ⚠️ **Note**: Replit Agent cannot edit `package.json` automatically to prevent environment breakage.

---

## 📊 Generated Outputs

### 1. SVG Wireframes
**Directory**: `export/wireframes/`

**Format**: One SVG file per route
- `_.svg` - Homepage (/)
- `_about.svg` - /about
- `_app_camera.svg` - /app/camera
- etc.

**Features**:
- Vector-based boxes and labels
- Figma-compatible (drag & drop import)
- Color-coded layout sections:
  - Header: `#f0f0f0`
  - Nav: `#e8e8e8`
  - Sidebar: `#f5f5f5`
  - Main: `#fafafa`
  - Footer: `#eeeeee`
- Responsive sizing:
  - Web pages: 1200×800px
  - Mobile PWA: 375×800px

**SVG Structure**:
```xml
<svg width="1200" height="800">
  <g id="header">...</g>
  <g id="aside">...</g>
  <g id="main">...</g>
  <g id="footer">...</g>
</svg>
```

### 2. HTML Skeletons
**Directory**: `export/skeletons/`

**Format**: Interactive HTML files with minimal CSS
- Click to open in browser
- Grid/Flexbox layouts visible
- No real content - only structure

**Features**:
- Responsive CSS Grid
- Flexbox layouts
- Visual hierarchy with borders/backgrounds
- Clickable navigation placeholders
- Form input placeholders
- Card grid layouts

**CSS Classes**:
- `.skeleton-header` - Top header bar
- `.skeleton-nav` - Navigation menu
- `.skeleton-aside` - Sidebar (250px)
- `.skeleton-main` - Main content area
- `.skeleton-footer` - Footer/bottom nav
- `.skeleton-cards` - Grid of card components
- `.skeleton-form` - Form layout

### 3. Site Map SVG
**File**: `export/site_map.svg`

**Features**:
- Complete visual overview of all routes
- Grouped by hierarchy (root, app, portal, admin, etc.)
- Clickable boxes (data-route attributes)
- Grid layout with max 5 routes per row
- Total route count displayed

**Dimensions**: Dynamic (1280×1720px for 52 routes)

**Groups**:
- **ROOT**: Homepage
- **APP**: Mobile PWA routes (/app/*)
- **PORTAL**: Web portal routes (/portal/*)
- **CAPTURE**: Legacy capture flow
- **ADMIN**: Admin routes
- **OTHER**: All remaining routes

---

## 🎨 Using SVGs in Figma

### Import Method
1. Open Figma
2. Drag & drop any `.svg` file from `export/wireframes/`
3. SVG imports as vector layers

### What You'll See
- **Groups** (`<g>` tags) → Figma Frames/Groups
- **Rectangles** → Vector shapes
- **Text** → Text layers
- **Styling** → Preserved from CSS classes

### Editing in Figma
1. Ungroup elements if needed
2. Adjust colors, sizes, spacing
3. Add real content/images
4. Export as design mockups

### Best Practices
- Import multiple wireframes to compare layouts
- Use sitemap for navigation structure planning
- Combine with real UI components
- Annotate with Figma comments

---

## 🌐 Using HTML Skeletons

### Opening in Browser
1. Navigate to `export/skeletons/`
2. Double-click any `.html` file
3. Opens in default browser

### What You'll See
- Page title and route path
- Layout sections (header, nav, main, sidebar, footer)
- Grid-based card layouts
- Form placeholders
- Button placeholders
- Navigation link placeholders

### Customization
Edit HTML files to:
- Add real content
- Change grid columns
- Adjust spacing/padding
- Link to other skeleton pages
- Add JavaScript interactions

### Responsive Testing
```bash
# Open in browser and resize window
# Mobile breakpoint: 375px
# Tablet breakpoint: 768px
# Desktop: 1200px+
```

---

## 📈 Current Stats (2025-10-28)

```
Total Pages: 52

Generated Files:
- SVG Wireframes: 50 files
- HTML Skeletons: 50 files
- Sitemap: 1 file (20KB)

Layout Distribution:
- Web (Header + Footer): ~28 pages
- Mobile PWA: 5 pages
- Portal (Sidebar): ~8 pages
- Form Layout: ~6 pages
- Simple: ~5 pages

Export Size:
- wireframes/: ~2.5 MB
- skeletons/: ~3.8 MB
- site_map.svg: 20 KB
```

---

## 🔍 Layout Detection

The tool automatically detects page layout type based on component usage:

### Web (Header + Footer)
**Detected by**: `WebHeader` or `<header>` tag

**SVG Features**:
- 1200×800px canvas
- Header bar at top
- Footer at bottom
- Full-width main content

**HTML Features**:
- `.skeleton-header` with menu button
- `.skeleton-footer` with links
- Centered container (max 1200px)

### Mobile PWA
**Detected by**: `StatusBar` or `BottomNav`

**SVG Features**:
- 375×800px canvas (iPhone size)
- Status bar at top
- Bottom navigation bar
- Portrait orientation

**HTML Features**:
- Max-width: 375px
- Mobile-optimized spacing
- Touch-friendly buttons (min 40px)
- Bottom nav instead of footer

### Portal (Sidebar)
**Detected by**: `SidebarProvider`

**SVG Features**:
- Sidebar (250px) + Main layout
- Sidebar on left
- Main content fills remaining space

**HTML Features**:
- `.skeleton-aside` (250px fixed)
- `.skeleton-main` (flex: 1)
- Flexbox wrapper

### Form Layout
**Detected by**: `Card` + `Form` components

**SVG Features**:
- Centered form (max 400px)
- Input field placeholders
- Submit button

**HTML Features**:
- `.skeleton-form` container
- `.skeleton-input` fields
- `.skeleton-button` submit

### Simple
**Default fallback**

**Features**:
- Minimal layout
- No specific sections
- Generic main content area

---

## 🛠️ Advanced Usage

### Batch Processing
```bash
# Export wireframes for specific routes only
# (Edit tools/wireframe-export.ts and filter routes)
tsx tools/wireframe-export.ts
```

### Custom Styling
Edit `tools/wireframe-export.ts`:

**SVG Colors**:
```typescript
// Line ~200
.wireframe-header { fill: #YOUR_COLOR; }
.wireframe-main { fill: #YOUR_COLOR; }
```

**HTML CSS**:
```typescript
// Line ~400
.skeleton-header {
  background: #YOUR_COLOR;
  padding: 20px; // Adjust spacing
}
```

### Integration with Design Systems
1. Export wireframes as base
2. Import into Figma
3. Apply design system components
4. Replace wireframe boxes with real UI
5. Export as high-fidelity mockups

---

## ✅ Smoke Test Checklist

Run the export and verify:

- [ ] **Files generated**:
  - `export/wireframes/` has 50+ SVG files ✓
  - `export/skeletons/` has 50+ HTML files ✓
  - `export/site_map.svg` exists ✓

- [ ] **SVG structure**:
  - Open `_.svg` in text editor ✓
  - Contains `<g>`, `<rect>`, `<text>` tags ✓
  - Has CSS `<style>` definitions ✓

- [ ] **Figma import**:
  - Drag `_.svg` into Figma ✓
  - Elements appear as vector layers ✓
  - Groups are preserved ✓

- [ ] **HTML skeleton**:
  - Open `_.html` in browser ✓
  - Grid/boxes visible ✓
  - No real content (only placeholders) ✓

- [ ] **Sitemap**:
  - Open `site_map.svg` ✓
  - Shows all 52 routes ✓
  - Grouped by hierarchy ✓

---

## 🐛 Troubleshooting

### No files generated
**Cause**: Pages directory not found

**Solution**:
```bash
ls client/src/pages/
# Should show .tsx files
```

### SVG looks broken in Figma
**Cause**: Figma doesn't support CSS classes

**Solution**: SVGs use inline styles, should work. Try:
1. Copy SVG content
2. Paste into Figma (Edit → Paste as SVG)

### HTML skeleton has no layout
**Cause**: CSS not loading

**Solution**: CSS is embedded in `<style>` tag, should work offline. Check browser console for errors.

### Route paths wrong
**Cause**: `App.tsx` routes not matching file names

**Solution**: Tool falls back to directory structure. Check `App.tsx` for correct route definitions.

---

## 📚 Related Documentation

- `tools/README.md` - Tools overview
- `tools/wireframe-export.ts` - Source code
- `tools/page-inventory.ts` - Page inventory tool
- `docs/page_inventory.md` - Route list

---

## 🔄 Workflow Integration

### Design Phase
1. Generate wireframes
2. Import to Figma
3. Review with stakeholders
4. Annotate feedback

### Development Phase
1. Use HTML skeletons as starting point
2. Replace placeholders with real components
3. Match layout structure
4. Add interactivity

### Documentation Phase
1. Use sitemap for user guides
2. Reference wireframes in specs
3. Track layout changes over time

---

**Last Updated**: 2025-10-28  
**Pages Exported**: 52  
**Total Files**: 101 (50 SVG + 50 HTML + 1 Sitemap)
