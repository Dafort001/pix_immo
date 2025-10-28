# pix.immo Audit Tooling Suite

## Overview

Complete audit and documentation tooling suite for pix.immo with 8 automated tools generating comprehensive reports and exports.

## Tools

| # | Tool | Output | Entries/Files | Status |
|---|------|--------|---------------|--------|
| 1 | Page Inventory | `docs/page_inventory.md` | 52 routes | ✅ |
| 2 | Wireframe Export | `export/wireframes/*.svg` | 50 wireframes + site map | ✅ |
| 3 | Auto-Screenshots | `export/screens/*.png` | Mock (Replit), Real (Local) | ✅ |
| 4 | Component Map | `docs/component_map.md` | 27 components → 50 routes | ✅ |
| 5 | Content Dump | `export/content_dump.json` | 3195 text entries | ✅ |
| 6 | Routes Manifest | `export/routes_manifest.json` | 51 routes with metadata | ✅ |
| 7 | Figma Bundle | `export/figma_bundle/` | Design asset package | ✅ |
| 8 | Audit ZIP | `export/site_audit_package.zip` | 296 KB complete package | ✅ |

## Quick Start

```bash
# Run all tools
./audit-pages.sh          # Page inventory
./export-wireframes.sh    # Wireframes + site map
./export-screens.sh       # Screenshots (mock on Replit)
./audit-components.sh     # Component map
./export-content.sh       # Content dump
./audit-routes.sh         # Routes manifest
./bundle-figma.sh         # Figma bundle
./create-audit-zip.sh     # Complete ZIP package
```

## Outputs

### Documentation (`/docs`)
- `page_inventory.md` - All routes with metadata
- `content_index.md` - Text content by route
- `routes_manifest.md` - Route guards and orphans
- `component_map.md` - Component usage analysis
- `WIREFRAME_EXPORT_GUIDE.md`, `SCREENSHOTS_GUIDE.md`, `COMPONENT_MAP_GUIDE.md`

### Exports (`/export`)
- `content_dump.json` (928 KB) - All text with line numbers
- `routes_manifest.json` (8.8 KB) - Complete route manifest
- `wireframes/` - 50 SVG wireframes
- `skeletons/` - 50 HTML structure files
- `screens/` - Screenshots (9 mock PNGs on Replit)
- `site_map.svg` - Visual site architecture
- `figma_bundle/` - Complete Figma import package
- `site_audit_package.zip` (296 KB) - Everything bundled
- `AUDIT_INDEX.md` - Master index with links

## Use Cases

**i18n Migration**: Content dump provides all strings with file/line locations
**Security Audit**: Routes manifest shows unguarded routes
**Refactoring**: Component map shows impact of changes
**Design Handoff**: Figma bundle packages all visual assets
**Stakeholder Reports**: Audit ZIP contains complete documentation
**Testing**: Component map prioritizes high-usage components

## Documentation

See `tools/README.md` for detailed usage, troubleshooting, and examples.

## Statistics

- **Total Routes**: 51 (Web: 31, App: 5, Portal: 7)
- **Components**: 27 unique, avg 1.3 per route
- **Content Entries**: 3195 (i18n candidates)
- **Wireframes**: 50 SVG + 50 HTML
- **Package Size**: 296 KB (compressed)
- **Top Component**: SEOHead (19 routes)

---

Generated: $(date)
