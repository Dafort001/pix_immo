# Tools Directory

## Page Inventory Tool

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
