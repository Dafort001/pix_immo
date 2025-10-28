/**
 * Figma Bundle Generator
 * 
 * Packt alle Design-Assets für Figma Import:
 * - /export/wireframes/*.svg
 * - /export/site_map.svg
 * - /export/screens/*.png
 * - /docs/design_tokens.json (falls vorhanden)
 * 
 * Output:
 * - /export/figma_bundle/ (strukturiertes Bundle)
 * - README_FIGMA.md (Import-Hinweise)
 * - .figmap.json (Metadaten für Figma Plugins)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const EXPORT_DIR = path.join(ROOT_DIR, 'export');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const BUNDLE_DIR = path.join(EXPORT_DIR, 'figma_bundle');

interface FigmaMap {
  version: string;
  generated: string;
  project: string;
  pages: {
    name: string;
    files: string[];
  }[];
  assets: {
    wireframes: number;
    screenshots: number;
    siteMaps: number;
    tokens: boolean;
  };
}

/**
 * Ensure bundle directory exists
 */
function ensureBundleDir(): void {
  if (!fs.existsSync(BUNDLE_DIR)) {
    fs.mkdirSync(BUNDLE_DIR, { recursive: true });
  }
  
  // Create subdirectories
  ['wireframes', 'screenshots', 'maps', 'tokens'].forEach(subdir => {
    const dir = path.join(BUNDLE_DIR, subdir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Copy files to bundle
 */
function copyWireframes(): number {
  const wireframesDir = path.join(EXPORT_DIR, 'wireframes');
  const targetDir = path.join(BUNDLE_DIR, 'wireframes');
  
  if (!fs.existsSync(wireframesDir)) {
    console.log('   ⚠️  Wireframes directory not found');
    return 0;
  }
  
  const svgFiles = fs.readdirSync(wireframesDir).filter(f => f.endsWith('.svg'));
  
  svgFiles.forEach(file => {
    const src = path.join(wireframesDir, file);
    const dest = path.join(targetDir, file);
    fs.copyFileSync(src, dest);
  });
  
  console.log(`   ✓ Copied ${svgFiles.length} wireframes`);
  return svgFiles.length;
}

/**
 * Copy screenshots
 */
function copyScreenshots(): number {
  const screensDir = path.join(EXPORT_DIR, 'screens');
  const targetDir = path.join(BUNDLE_DIR, 'screenshots');
  
  if (!fs.existsSync(screensDir)) {
    console.log('   ⚠️  Screenshots directory not found');
    return 0;
  }
  
  const pngFiles = fs.readdirSync(screensDir).filter(f => f.endsWith('.png'));
  
  pngFiles.forEach(file => {
    const src = path.join(screensDir, file);
    const dest = path.join(targetDir, file);
    fs.copyFileSync(src, dest);
  });
  
  console.log(`   ✓ Copied ${pngFiles.length} screenshots`);
  return pngFiles.length;
}

/**
 * Copy site map
 */
function copySiteMap(): number {
  const siteMapPath = path.join(EXPORT_DIR, 'site_map.svg');
  
  if (!fs.existsSync(siteMapPath)) {
    console.log('   ⚠️  Site map not found');
    return 0;
  }
  
  const dest = path.join(BUNDLE_DIR, 'maps', 'site_map.svg');
  fs.copyFileSync(siteMapPath, dest);
  
  console.log('   ✓ Copied site map');
  return 1;
}

/**
 * Copy design tokens if available
 */
function copyDesignTokens(): boolean {
  const tokensPath = path.join(DOCS_DIR, 'design_tokens.json');
  
  if (!fs.existsSync(tokensPath)) {
    console.log('   ⚠️  Design tokens not found (optional)');
    return false;
  }
  
  const dest = path.join(BUNDLE_DIR, 'tokens', 'design_tokens.json');
  fs.copyFileSync(tokensPath, dest);
  
  console.log('   ✓ Copied design tokens');
  return true;
}

/**
 * Generate Figma README
 */
function generateFigmaReadme(stats: { wireframes: number; screenshots: number; siteMaps: number; tokens: boolean }): void {
  const lines: string[] = [];
  
  lines.push('# Figma Import Bundle');
  lines.push('');
  lines.push('This bundle contains all design assets from pix.immo for Figma import.');
  lines.push('');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  
  lines.push('## Bundle Contents');
  lines.push('');
  lines.push(`- **${stats.wireframes}** wireframes (SVG)`);
  lines.push(`- **${stats.screenshots}** screenshots (PNG)`);
  lines.push(`- **${stats.siteMaps}** site map (SVG)`);
  lines.push(`- **Design tokens**: ${stats.tokens ? 'Yes' : 'Not available'}`);
  lines.push('');
  
  lines.push('## Import Instructions');
  lines.push('');
  
  lines.push('### Wireframes (SVG)');
  lines.push('');
  lines.push('1. Open Figma');
  lines.push('2. File → Import → Select SVG files from `wireframes/`');
  lines.push('3. **Important**: Import as **vector** (not flattened)');
  lines.push('4. Each wireframe will be imported as a separate frame');
  lines.push('');
  
  lines.push('### Screenshots (PNG)');
  lines.push('');
  lines.push('1. Drag PNG files from `screenshots/` into Figma');
  lines.push('2. Use as reference images or mockups');
  lines.push('3. **Naming convention**: `{route}-{breakpoint}.png`');
  lines.push('   - `mobile`: 390×844px (iPhone 12 Pro)');
  lines.push('   - `tablet`: 768×1024px (iPad)');
  lines.push('   - `desktop`: 1280×800px');
  lines.push('');
  
  lines.push('### Site Map');
  lines.push('');
  lines.push('1. Import `maps/site_map.svg` as vector');
  lines.push('2. Shows complete site architecture');
  lines.push('3. Useful for navigation design');
  lines.push('');
  
  if (stats.tokens) {
    lines.push('### Design Tokens');
    lines.push('');
    lines.push('1. Use `tokens/design_tokens.json` with Figma Tokens plugin');
    lines.push('2. Or manually apply colors/spacing from JSON');
    lines.push('');
  }
  
  lines.push('## Recommended Figma Organization');
  lines.push('');
  lines.push('```');
  lines.push('📁 pix.immo Design');
  lines.push('  ├── 📄 Wireframes (Page 1)');
  lines.push('  │   ├── Web Layout');
  lines.push('  │   ├── App Layout');
  lines.push('  │   └── Portal Layout');
  lines.push('  ├── 📄 Screenshots (Page 2)');
  lines.push('  │   ├── Mobile');
  lines.push('  │   ├── Tablet');
  lines.push('  │   └── Desktop');
  lines.push('  ├── 📄 Site Architecture (Page 3)');
  lines.push('  │   └── Site Map');
  lines.push('  └── 📄 Design System (Page 4)');
  lines.push('      └── Tokens & Styles');
  lines.push('```');
  lines.push('');
  
  lines.push('## Tips');
  lines.push('');
  lines.push('- **SVG Import**: Always import as vector for editability');
  lines.push('- **PNG Resolution**: Screenshots are 1× density');
  lines.push('- **Naming**: Files follow route structure (`/app/camera` → `app_camera-mobile.png`)');
  lines.push('- **Updates**: Re-run export tools to regenerate this bundle');
  lines.push('');
  
  lines.push('## Troubleshooting');
  lines.push('');
  lines.push('**SVG import issues:**');
  lines.push('- Make sure "Import as vector" is selected');
  lines.push('- Check SVG is valid (open in browser first)');
  lines.push('');
  lines.push('**PNG scaling:**');
  lines.push('- Screenshots are at native resolution');
  lines.push('- Scale in Figma as needed for mockups');
  lines.push('');
  
  const readmePath = path.join(BUNDLE_DIR, 'README_FIGMA.md');
  fs.writeFileSync(readmePath, lines.join('\n'), 'utf-8');
  
  console.log('   ✓ Generated README_FIGMA.md');
}

/**
 * Generate .figmap.json for Figma plugins
 */
function generateFigmaMap(stats: { wireframes: number; screenshots: number; siteMaps: number; tokens: boolean }): void {
  const wireframesDir = path.join(BUNDLE_DIR, 'wireframes');
  const screenshotsDir = path.join(BUNDLE_DIR, 'screenshots');
  
  const wireframeFiles = fs.existsSync(wireframesDir) 
    ? fs.readdirSync(wireframesDir).filter(f => f.endsWith('.svg'))
    : [];
  
  const screenshotFiles = fs.existsSync(screenshotsDir)
    ? fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'))
    : [];
  
  const figmaMap: FigmaMap = {
    version: '1.0',
    generated: new Date().toISOString(),
    project: 'pix.immo',
    pages: [
      {
        name: 'Wireframes',
        files: wireframeFiles.map(f => `wireframes/${f}`),
      },
      {
        name: 'Screenshots',
        files: screenshotFiles.map(f => `screenshots/${f}`),
      },
      {
        name: 'Site Architecture',
        files: stats.siteMaps > 0 ? ['maps/site_map.svg'] : [],
      },
    ],
    assets: {
      wireframes: stats.wireframes,
      screenshots: stats.screenshots,
      siteMaps: stats.siteMaps,
      tokens: stats.tokens,
    },
  };
  
  const mapPath = path.join(BUNDLE_DIR, '.figmap.json');
  fs.writeFileSync(mapPath, JSON.stringify(figmaMap, null, 2), 'utf-8');
  
  console.log('   ✓ Generated .figmap.json');
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 Figma Bundle Generator\n');
  
  console.log('📂 Creating bundle structure...');
  ensureBundleDir();
  
  console.log('\n📦 Copying assets...');
  const wireframes = copyWireframes();
  const screenshots = copyScreenshots();
  const siteMaps = copySiteMap();
  const tokens = copyDesignTokens();
  
  const stats = {
    wireframes,
    screenshots,
    siteMaps,
    tokens,
  };
  
  console.log('\n📝 Generating documentation...');
  generateFigmaReadme(stats);
  generateFigmaMap(stats);
  
  console.log('\n✅ Bundle complete\n');
  console.log('📊 Summary:');
  console.log(`   - Wireframes: ${stats.wireframes}`);
  console.log(`   - Screenshots: ${stats.screenshots}`);
  console.log(`   - Site maps: ${stats.siteMaps}`);
  console.log(`   - Design tokens: ${stats.tokens ? 'Yes' : 'No'}`);
  console.log('');
  console.log(`📁 Bundle location: ${BUNDLE_DIR}`);
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Open the bundle directory');
  console.log('   2. Read README_FIGMA.md for import instructions');
  console.log('   3. Import files into Figma following the guide');
  console.log('');
  console.log('✨ Done!');
}

// Execute
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
