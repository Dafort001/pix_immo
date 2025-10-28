# Page Inventory Audit Guide

## ✅ Quick Start

### Option 1: Direct Command (Recommended)
```bash
tsx tools/page-inventory.ts
```

### Option 2: Shell Script
```bash
./audit-pages.sh
```

### Option 3: NPM Script (Manual Setup Required)

**Step 1**: Open `package.json` manually

**Step 2**: Add to `"scripts"` section:
```json
"audit:pages": "tsx tools/page-inventory.ts"
```

**Step 3**: Run:
```bash
npm run audit:pages
```

> ⚠️ **Note**: Replit Agent cannot edit `package.json` automatically to prevent environment breakage. You must add the NPM script manually.

---

## 📊 Generated Reports

### 1. Markdown Report
**File**: `docs/page_inventory.md`

**Contents**:
- Header with generation timestamp and total page count
- Overview table with all routes
- Layout distribution statistics

**Example**:
```markdown
# Page Inventory Report

Generated: 2025-10-28T12:20:42.361Z
Total Pages: 52

## Pages Overview

| Route | Title | Layout | Components | Last Modified | File Path |
|-------|-------|--------|------------|---------------|----------|
| / | Professionelle Immobilienfotografie | Web (Header + Footer) | ... | 2025-10-21 | ... |
| /app/camera | Camera | Mobile PWA | ... | 2025-10-28 | ... |
...

## Layout Distribution

- **Web (Header + Footer)**: 28 pages
- **Mobile PWA**: 5 pages
- **Portal (Sidebar)**: 8 pages
- **Form Layout**: 6 pages
- **Simple**: 5 pages
```

### 2. CSV Export
**File**: `docs/page_inventory.csv`

**Format**: Semicolon-separated (`;`) for Excel/Google Sheets compatibility

**Columns**:
1. Route
2. Title
3. Layout
4. Components
5. Last Modified
6. File Path

**Example**:
```csv
Route;Title;Layout;Components;Last Modified;File Path
/;Professionelle Immobilienfotografie Hamburg & Berlin;Web (Header + Footer);HTMLDivElement, Menu, Link, X;2025-10-21;client/src/pages/home.tsx
/app/camera;Untitled;Mobile PWA;RoomType, Orientation, MotionReading;2025-10-28;client/src/pages/app/camera.tsx
```

**Opening in Excel**:
1. Excel → Data → From Text/CSV
2. Select `docs/page_inventory.csv`
3. Delimiter: Semicolon (`;`)
4. Click "Load"

**Opening in Google Sheets**:
1. File → Import
2. Upload `page_inventory.csv`
3. Separator: Semicolon
4. Import

---

## 🔍 What Gets Scanned

### Directories
- `client/src/pages/*.tsx` (all direct pages)
- `client/src/pages/app/*.tsx` (Mobile PWA)
- `client/src/pages/portal/*.tsx` (Web Portal)
- `client/src/pages/capture/*.tsx` (Old capture flow)

### Extracted Data

**1. Route Path**
- Extracted from `client/src/App.tsx` router definitions
- Matches `<Route path="/xyz" component={ComponentName} />`
- Fallback: Constructed from directory structure

**2. Page Title**
- Priority: `<h1>` content
- Fallback: `title:` prop in SEOHead
- Fallback: `title=` attribute
- Default: "Untitled"

**3. Layout Type**
Detected by component usage:
- **Web (Header + Footer)**: Contains `WebHeader` or `<header>`
- **Mobile PWA**: Contains `StatusBar` or `BottomNav`
- **Portal (Sidebar)**: Contains `SidebarProvider`
- **Form Layout**: Contains `Card` and `Form`
- **Simple**: None of the above

**4. Components**
- All JSX component tags: `<ComponentName />`
- Filters out: `SEOHead`, `Route`, `Switch`
- Limits to first 10 components per page

**5. Last Modified**
- File modification timestamp (YYYY-MM-DD)
- From `fs.statSync(filePath).mtime`

---

## 📈 Current Stats (2025-10-28)

```
Total Pages: 52

Layout Distribution:
- Web (Header + Footer): 28 pages (53.8%)
- Mobile PWA: 5 pages (9.6%)
- Portal: 8 pages (15.4%)
- Form Layout: 6 pages (11.5%)
- Simple: 5 pages (9.6%)

Output Files:
- page_inventory.md: 8.12 KB
- page_inventory.csv: 8.68 KB
```

---

## ✅ Smoke Test Checklist

Run the audit and verify:

- [ ] **Files exist**:
  - `docs/page_inventory.md` ✓
  - `docs/page_inventory.csv` ✓

- [ ] **Files not empty**:
  - MD: >50 lines ✓ (69 lines)
  - CSV: >50 lines ✓ (53 lines)

- [ ] **MD has table**:
  - Header row: `| Route | Title | Layout | ... |` ✓
  - At least 5 data rows ✓ (52 rows)

- [ ] **CSV opens in Excel**:
  - Semicolon separator works ✓
  - All columns visible ✓

- [ ] **No errors in console** ✓

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'tsx'"
```bash
npm install tsx
```
(Already installed in this project)

### Empty output files
**Cause**: Pages directory not found or empty

**Solution**:
1. Check `client/src/pages/` exists
2. Verify `*.tsx` files present
3. Run: `ls -la client/src/pages/`

### "Less than 5 pages" warning
**Cause**: Script expects at least 5 pages for meaningful audit

**Current**: 52 pages found (no warning expected)

### CSV doesn't open in Excel
**Cause**: Wrong delimiter

**Solution**: 
1. Excel → Data → From Text
2. Choose "Delimited"
3. Select "Semicolon" (`;`)

### Route paths missing
**Cause**: Route not defined in `App.tsx`

**Solution**:
- Script falls back to directory-based paths
- Example: `client/src/pages/app/camera.tsx` → `/app/camera`

---

## 🔄 Integration Ideas

### CI/CD Pipeline
Add to `.github/workflows/audit.yml`:
```yaml
- name: Generate Page Inventory
  run: tsx tools/page-inventory.ts

- name: Upload Reports
  uses: actions/upload-artifact@v3
  with:
    name: page-inventory
    path: docs/page_inventory.*
```

### Pre-commit Hook
Add to `.husky/pre-commit`:
```bash
tsx tools/page-inventory.ts
git add docs/page_inventory.*
```

### Automated PR Comments
Use GitHub Actions to comment on PRs with page count changes.

---

## 📚 Related Documentation

- `tools/README.md` - Tools directory overview
- `tools/page-inventory.ts` - Source code
- `docs/page_inventory.md` - Generated report
- `docs/page_inventory.csv` - Spreadsheet export

---

**Last Updated**: 2025-10-28  
**Pages Tracked**: 52  
**Next Review**: After major page additions/removals
