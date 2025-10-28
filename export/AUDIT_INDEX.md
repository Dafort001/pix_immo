# Site Audit Index

Generated: 10/28/2025, 12:52:44 PM

This index provides links to all audit reports and exports generated for pix.immo.

## 📊 Reports

### [Page Inventory](../docs/page_inventory.md)

Complete list of all routes

### [Content Index](../docs/content_index.md)

All i18n strings and copy

### [Routes Manifest](../docs/routes_manifest.md)

Route guards, params, orphans

### [Component Map](../docs/component_map.md)

Component usage across routes

### [Wireframe Export Guide](../docs/WIREFRAME_EXPORT_GUIDE.md)

How to use wireframes

### [Screenshots Guide](../docs/SCREENSHOTS_GUIDE.md)

Screenshot tool usage

### [Component Map Guide](../docs/COMPONENT_MAP_GUIDE.md)

Component analysis guide

## 📁 Exports

### [Content Dump (JSON)](content_dump.json)

All text content with metadata

### [Routes Manifest (JSON)](routes_manifest.json)

Complete route configuration

### [Wireframes (SVG)](wireframes/)

50 page wireframes

### [HTML Skeletons](skeletons/)

50 HTML structure files

### [Screenshots (PNG)](screens/)

Page screenshots at 3 breakpoints

### [Site Map (SVG)](site_map.svg)

Visual site architecture

### [Figma Bundle](figma_bundle/)

All assets for Figma import

## 🛠️ Tools

All audit tools are located in `/tools`:

- `page-inventory.ts` - Route scanner
- `wireframe-export.ts` - Wireframe generator
- `page-screenshots.ts` - Screenshot capturer
- `component-map.ts` - Component analyzer
- `content-dump.ts` - Content extractor
- `routes-manifest.ts` - Route manifest generator
- `figma-bundle.ts` - Figma bundle packager
- `audit-zip.ts` - Audit package creator

## 📦 Package Contents

This ZIP package (`site_audit_package.zip`) contains:

```
site_audit_package/
├── docs/              # All markdown reports
├── export/            # All JSON/SVG/PNG exports
│   ├── wireframes/
│   ├── skeletons/
│   ├── screens/
│   ├── figma_bundle/
│   ├── content_dump.json
│   ├── routes_manifest.json
│   ├── component_map.json
│   └── site_map.svg
└── AUDIT_INDEX.md     # This file
```

## 🔄 Regenerating Reports

To regenerate any report:

```bash
# Individual tools
tsx tools/page-inventory.ts
tsx tools/wireframe-export.ts
tsx tools/content-dump.ts
tsx tools/routes-manifest.ts
tsx tools/component-map.ts
tsx tools/figma-bundle.ts

# Complete audit package
tsx tools/audit-zip.ts
```
