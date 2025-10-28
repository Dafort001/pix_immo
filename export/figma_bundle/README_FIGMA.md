# Figma Import Bundle

This bundle contains all design assets from pix.immo for Figma import.

Generated: 10/28/2025, 12:51:51 PM

## Bundle Contents

- **50** wireframes (SVG)
- **9** screenshots (PNG)
- **1** site map (SVG)
- **Design tokens**: Not available

## Import Instructions

### Wireframes (SVG)

1. Open Figma
2. File → Import → Select SVG files from `wireframes/`
3. **Important**: Import as **vector** (not flattened)
4. Each wireframe will be imported as a separate frame

### Screenshots (PNG)

1. Drag PNG files from `screenshots/` into Figma
2. Use as reference images or mockups
3. **Naming convention**: `{route}-{breakpoint}.png`
   - `mobile`: 390×844px (iPhone 12 Pro)
   - `tablet`: 768×1024px (iPad)
   - `desktop`: 1280×800px

### Site Map

1. Import `maps/site_map.svg` as vector
2. Shows complete site architecture
3. Useful for navigation design

## Recommended Figma Organization

```
📁 pix.immo Design
  ├── 📄 Wireframes (Page 1)
  │   ├── Web Layout
  │   ├── App Layout
  │   └── Portal Layout
  ├── 📄 Screenshots (Page 2)
  │   ├── Mobile
  │   ├── Tablet
  │   └── Desktop
  ├── 📄 Site Architecture (Page 3)
  │   └── Site Map
  └── 📄 Design System (Page 4)
      └── Tokens & Styles
```

## Tips

- **SVG Import**: Always import as vector for editability
- **PNG Resolution**: Screenshots are 1× density
- **Naming**: Files follow route structure (`/app/camera` → `app_camera-mobile.png`)
- **Updates**: Re-run export tools to regenerate this bundle

## Troubleshooting

**SVG import issues:**
- Make sure "Import as vector" is selected
- Check SVG is valid (open in browser first)

**PNG scaling:**
- Screenshots are at native resolution
- Scale in Figma as needed for mockups
