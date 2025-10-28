#!/usr/bin/env node
/**
 * Wireframe & Skeleton Export Tool
 * Generates HTML skeletons and SVG wireframes for all routes
 */

import * as fs from 'fs';
import * as path from 'path';

interface LayoutStructure {
  route: string;
  title: string;
  hasHeader: boolean;
  hasNav: boolean;
  hasAside: boolean;
  hasMain: boolean;
  hasFooter: boolean;
  cards: number;
  forms: number;
  buttons: number;
  layout: 'web' | 'mobile-pwa' | 'portal' | 'form' | 'simple';
}

const PAGES_DIR = path.join(process.cwd(), 'client', 'src', 'pages');
const APP_TSX = path.join(process.cwd(), 'client', 'src', 'App.tsx');
const EXPORT_DIR = path.join(process.cwd(), 'export');
const WIREFRAMES_DIR = path.join(EXPORT_DIR, 'wireframes');
const SKELETONS_DIR = path.join(EXPORT_DIR, 'skeletons');

// Ensure export directories exist
[EXPORT_DIR, WIREFRAMES_DIR, SKELETONS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Parse routes from App.tsx
 */
function parseRoutes(): Map<string, string> {
  const routes = new Map<string, string>();
  
  if (!fs.existsSync(APP_TSX)) {
    console.warn(`⚠️  App.tsx not found at ${APP_TSX}`);
    return routes;
  }

  const content = fs.readFileSync(APP_TSX, 'utf-8');
  const routeRegex = /<Route\s+path="([^"]+)"\s+component=\{(\w+)\}\s*\/>/g;
  let match;
  
  while ((match = routeRegex.exec(content)) !== null) {
    routes.set(match[2], match[1]);
  }
  
  return routes;
}

/**
 * Analyze page structure
 */
function analyzePageStructure(filePath: string, routePath: string): LayoutStructure {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract title
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
  const seoMatch = content.match(/title=["']([^"']+)["']/);
  const title = (h1Match?.[1] || titleMatch?.[1] || seoMatch?.[1] || 'Untitled').trim();
  
  // Detect layout type
  let layout: 'web' | 'mobile-pwa' | 'portal' | 'form' | 'simple' = 'simple';
  if (content.includes('WebHeader') || content.includes('<header')) layout = 'web';
  if (content.includes('StatusBar') || content.includes('BottomNav')) layout = 'mobile-pwa';
  if (content.includes('SidebarProvider')) layout = 'portal';
  if (content.includes('Card') && content.includes('Form')) layout = 'form';
  
  // Count components
  const hasHeader = /<header/i.test(content) || /WebHeader/.test(content) || /StatusBar/.test(content);
  const hasNav = /<nav/i.test(content) || /navigation/i.test(content) || /BottomNav/.test(content);
  const hasAside = /<aside/i.test(content) || /Sidebar/.test(content);
  const hasMain = /<main/i.test(content) || /main-content/i.test(content);
  const hasFooter = /<footer/i.test(content) || /WebFooter/.test(content);
  
  const cards = (content.match(/<Card/g) || []).length;
  const forms = (content.match(/<Form/g) || []).length + (content.match(/<form/g) || []).length;
  const buttons = (content.match(/<Button/g) || []).length + (content.match(/<button/g) || []).length;
  
  return {
    route: routePath,
    title,
    hasHeader,
    hasNav,
    hasAside,
    hasMain,
    hasFooter,
    cards,
    forms,
    buttons,
    layout,
  };
}

/**
 * Generate SVG Wireframe
 */
function generateSVGWireframe(structure: LayoutStructure): string {
  const width = structure.layout === 'mobile-pwa' ? 375 : 1200;
  const height = 800;
  const padding = 20;
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .wireframe-box { fill: #ffffff; stroke: #333333; stroke-width: 2; }
      .wireframe-text { font-family: Arial, sans-serif; font-size: 14px; fill: #333333; }
      .wireframe-label { font-family: Arial, sans-serif; font-size: 12px; fill: #666666; }
      .wireframe-header { fill: #f0f0f0; }
      .wireframe-nav { fill: #e8e8e8; }
      .wireframe-aside { fill: #f5f5f5; }
      .wireframe-main { fill: #fafafa; }
      .wireframe-footer { fill: #eeeeee; }
      .wireframe-card { fill: #ffffff; stroke: #cccccc; stroke-width: 1; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  
  <!-- Title -->
  <text x="${width / 2}" y="30" class="wireframe-text" text-anchor="middle" font-weight="bold">
    ${escapeXML(structure.title)}
  </text>
  <text x="${width / 2}" y="50" class="wireframe-label" text-anchor="middle">
    ${structure.route}
  </text>
`;

  let yOffset = 70;
  
  // Header
  if (structure.hasHeader) {
    const headerHeight = 80;
    svg += `
  <g id="header">
    <rect x="${padding}" y="${yOffset}" width="${width - padding * 2}" height="${headerHeight}" class="wireframe-box wireframe-header" rx="4"/>
    <text x="${padding + 10}" y="${yOffset + 30}" class="wireframe-label">Header</text>
    <rect x="${width - padding - 100}" y="${yOffset + 20}" width="80" height="40" class="wireframe-box" rx="4"/>
    <text x="${width - padding - 60}" y="${yOffset + 45}" class="wireframe-label" text-anchor="middle">Menu</text>
  </g>`;
    yOffset += headerHeight + 10;
  }
  
  // Nav
  if (structure.hasNav && !structure.hasHeader) {
    const navHeight = 60;
    svg += `
  <g id="nav">
    <rect x="${padding}" y="${yOffset}" width="${width - padding * 2}" height="${navHeight}" class="wireframe-box wireframe-nav" rx="4"/>
    <text x="${padding + 10}" y="${yOffset + 30}" class="wireframe-label">Navigation</text>
  </g>`;
    yOffset += navHeight + 10;
  }
  
  // Main content area
  const mainStart = yOffset;
  const mainHeight = height - yOffset - (structure.hasFooter ? 80 : 40);
  
  if (structure.hasAside) {
    // Sidebar layout (Portal)
    const asideWidth = 250;
    svg += `
  <g id="aside">
    <rect x="${padding}" y="${mainStart}" width="${asideWidth}" height="${mainHeight}" class="wireframe-box wireframe-aside" rx="4"/>
    <text x="${padding + 10}" y="${mainStart + 30}" class="wireframe-label">Sidebar</text>
  </g>`;
    
    const mainX = padding + asideWidth + 10;
    const mainWidth = width - mainX - padding;
    svg += `
  <g id="main">
    <rect x="${mainX}" y="${mainStart}" width="${mainWidth}" height="${mainHeight}" class="wireframe-box wireframe-main" rx="4"/>
    <text x="${mainX + 10}" y="${mainStart + 30}" class="wireframe-label">Main Content</text>
  </g>`;
  } else {
    // Full-width main
    svg += `
  <g id="main">
    <rect x="${padding}" y="${mainStart}" width="${width - padding * 2}" height="${mainHeight}" class="wireframe-box wireframe-main" rx="4"/>
    <text x="${padding + 10}" y="${mainStart + 30}" class="wireframe-label">Main Content</text>
  </g>`;
  }
  
  // Cards
  if (structure.cards > 0) {
    const cardWidth = structure.layout === 'mobile-pwa' ? width - padding * 4 : 300;
    const cardHeight = 150;
    const cardsPerRow = Math.floor((width - padding * 2) / (cardWidth + 10));
    const cardsToShow = Math.min(structure.cards, 6);
    
    svg += `\n  <g id="cards">`;
    for (let i = 0; i < cardsToShow; i++) {
      const row = Math.floor(i / cardsPerRow);
      const col = i % cardsPerRow;
      const cardX = padding + 20 + col * (cardWidth + 10);
      const cardY = mainStart + 60 + row * (cardHeight + 10);
      
      if (cardY + cardHeight < mainStart + mainHeight - 20) {
        svg += `
    <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" class="wireframe-card" rx="8"/>
    <text x="${cardX + 10}" y="${cardY + 25}" class="wireframe-label">Card ${i + 1}</text>`;
      }
    }
    svg += `\n  </g>`;
  }
  
  // Forms
  if (structure.forms > 0) {
    const formY = mainStart + (structure.cards > 0 ? 220 : 60);
    const formWidth = Math.min(400, width - padding * 4);
    const formX = padding + (width - padding * 2 - formWidth) / 2;
    
    svg += `
  <g id="form">
    <rect x="${formX}" y="${formY}" width="${formWidth}" height="200" class="wireframe-box" rx="8"/>
    <text x="${formX + 10}" y="${formY + 25}" class="wireframe-label">Form</text>
    <rect x="${formX + 10}" y="${formY + 40}" width="${formWidth - 20}" height="30" class="wireframe-box" rx="4"/>
    <rect x="${formX + 10}" y="${formY + 80}" width="${formWidth - 20}" height="30" class="wireframe-box" rx="4"/>
    <rect x="${formX + 10}" y="${formY + 120}" width="${formWidth - 20}" height="30" class="wireframe-box" rx="4"/>
    <rect x="${formX + formWidth - 90}" y="${formY + 165}" width="80" height="30" class="wireframe-box" rx="4"/>
  </g>`;
  }
  
  // Footer
  if (structure.hasFooter || structure.layout === 'mobile-pwa') {
    const footerY = height - 70;
    const footerHeight = 60;
    svg += `
  <g id="footer">
    <rect x="${padding}" y="${footerY}" width="${width - padding * 2}" height="${footerHeight}" class="wireframe-box wireframe-footer" rx="4"/>
    <text x="${padding + 10}" y="${footerY + 30}" class="wireframe-label">${structure.layout === 'mobile-pwa' ? 'Bottom Nav' : 'Footer'}</text>
  </g>`;
  }
  
  svg += '\n</svg>';
  return svg;
}

/**
 * Generate HTML Skeleton
 */
function generateHTMLSkeleton(structure: LayoutStructure): string {
  const isMobile = structure.layout === 'mobile-pwa';
  const maxWidth = isMobile ? '375px' : '1200px';
  
  let html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wireframe: ${escapeHTML(structure.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      min-height: 100vh;
    }
    .wireframe-container {
      max-width: ${maxWidth};
      margin: 0 auto;
      background: white;
      border: 2px solid #333;
      min-height: calc(100vh - 40px);
      display: flex;
      flex-direction: column;
    }
    .wireframe-label {
      background: #f0f0f0;
      padding: 4px 8px;
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .wireframe-box {
      border: 1px dashed #ccc;
      padding: 12px;
      margin: 8px;
      background: #fafafa;
    }
    .skeleton-header {
      background: #e8e8e8;
      padding: 20px;
      border-bottom: 2px solid #ddd;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .skeleton-nav {
      background: #f0f0f0;
      padding: 12px 20px;
      border-bottom: 1px solid #ddd;
      display: flex;
      gap: 16px;
    }
    .skeleton-main-wrapper {
      display: flex;
      flex: 1;
    }
    .skeleton-aside {
      width: 250px;
      background: #f5f5f5;
      border-right: 1px solid #ddd;
      padding: 20px;
    }
    .skeleton-main {
      flex: 1;
      padding: 20px;
    }
    .skeleton-footer {
      background: #e8e8e8;
      padding: 20px;
      border-top: 2px solid #ddd;
      margin-top: auto;
    }
    .skeleton-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(${isMobile ? '100%' : '280px'}, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .skeleton-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      background: white;
      min-height: 150px;
    }
    .skeleton-form {
      max-width: 400px;
      margin: 0 auto;
      padding: 24px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
    }
    .skeleton-input {
      width: 100%;
      height: 40px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 12px;
      background: #fafafa;
    }
    .skeleton-button {
      height: 40px;
      padding: 0 24px;
      border: 1px solid #333;
      border-radius: 4px;
      background: #f0f0f0;
      cursor: pointer;
    }
    .skeleton-link {
      color: #0066cc;
      text-decoration: none;
      padding: 8px 12px;
      display: inline-block;
      border: 1px dashed #ccc;
    }
    .page-title {
      padding: 16px 20px;
      background: #fafafa;
      border-bottom: 1px solid #ddd;
      font-size: 18px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wireframe-container">
    <div class="page-title">
      <span class="wireframe-label">Route: ${structure.route}</span>
      <div style="margin-top: 8px;">${escapeHTML(structure.title)}</div>
    </div>
`;

  // Header
  if (structure.hasHeader) {
    html += `
    <header class="skeleton-header">
      <div class="wireframe-label">Header</div>
      <div class="skeleton-button">Menu</div>
    </header>`;
  }
  
  // Nav
  if (structure.hasNav && !structure.hasHeader) {
    html += `
    <nav class="skeleton-nav">
      <div class="wireframe-label">Navigation</div>
      <a href="#" class="skeleton-link">Link 1</a>
      <a href="#" class="skeleton-link">Link 2</a>
      <a href="#" class="skeleton-link">Link 3</a>
    </nav>`;
  }
  
  // Main content wrapper
  html += `
    <div class="skeleton-main-wrapper">`;
  
  // Aside/Sidebar
  if (structure.hasAside) {
    html += `
      <aside class="skeleton-aside">
        <div class="wireframe-label">Sidebar</div>
        <div class="wireframe-box">Nav Item 1</div>
        <div class="wireframe-box">Nav Item 2</div>
        <div class="wireframe-box">Nav Item 3</div>
      </aside>`;
  }
  
  // Main content
  html += `
      <main class="skeleton-main">
        <div class="wireframe-label">Main Content</div>`;
  
  // Cards
  if (structure.cards > 0) {
    html += `
        <div class="skeleton-cards">`;
    for (let i = 0; i < Math.min(structure.cards, 6); i++) {
      html += `
          <div class="skeleton-card">
            <div class="wireframe-label">Card ${i + 1}</div>
            <div class="wireframe-box" style="height: 80px;"></div>
          </div>`;
    }
    html += `
        </div>`;
  }
  
  // Forms
  if (structure.forms > 0) {
    html += `
        <div class="skeleton-form">
          <div class="wireframe-label">Form</div>
          <div class="skeleton-input"></div>
          <div class="skeleton-input"></div>
          <div class="skeleton-input"></div>
          <button class="skeleton-button">Submit</button>
        </div>`;
  }
  
  // Buttons
  if (structure.buttons > 2 && structure.forms === 0) {
    html += `
        <div style="margin-top: 24px; display: flex; gap: 12px;">
          <button class="skeleton-button">Action 1</button>
          <button class="skeleton-button">Action 2</button>
        </div>`;
  }
  
  html += `
      </main>
    </div>`;
  
  // Footer
  if (structure.hasFooter || structure.layout === 'mobile-pwa') {
    html += `
    <footer class="skeleton-footer">
      <div class="wireframe-label">${structure.layout === 'mobile-pwa' ? 'Bottom Navigation' : 'Footer'}</div>
    </footer>`;
  }
  
  html += `
  </div>
</body>
</html>`;
  
  return html;
}

/**
 * Generate Sitemap SVG
 */
function generateSitemapSVG(structures: LayoutStructure[]): string {
  const boxWidth = 200;
  const boxHeight = 60;
  const horizontalGap = 40;
  const verticalGap = 80;
  const padding = 40;
  
  // Group routes by hierarchy
  const grouped: { [key: string]: LayoutStructure[] } = {
    'root': [],
    'app': [],
    'portal': [],
    'capture': [],
    'admin': [],
    'other': []
  };
  
  structures.forEach(s => {
    if (s.route === '/') grouped['root'].push(s);
    else if (s.route.startsWith('/app/')) grouped['app'].push(s);
    else if (s.route.startsWith('/portal/')) grouped['portal'].push(s);
    else if (s.route.startsWith('/capture/')) grouped['capture'].push(s);
    else if (s.route.startsWith('/admin/')) grouped['admin'].push(s);
    else grouped['other'].push(s);
  });
  
  // Calculate dimensions
  const maxPerRow = 5;
  const totalRows = Math.ceil(structures.length / maxPerRow);
  const width = Math.max(1200, maxPerRow * (boxWidth + horizontalGap) + padding * 2);
  const height = totalRows * (boxHeight + verticalGap) + padding * 2 + 100;
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .sitemap-box { fill: #ffffff; stroke: #333333; stroke-width: 2; cursor: pointer; }
      .sitemap-box:hover { fill: #f0f0f0; }
      .sitemap-text { font-family: Arial, sans-serif; font-size: 12px; fill: #333333; }
      .sitemap-route { font-family: monospace; font-size: 10px; fill: #666666; }
      .sitemap-connector { stroke: #999999; stroke-width: 2; fill: none; }
      .sitemap-title { font-family: Arial, sans-serif; font-size: 24px; fill: #333333; font-weight: bold; }
      .sitemap-group { font-family: Arial, sans-serif; font-size: 14px; fill: #666666; font-weight: bold; }
    </style>
  </defs>
  
  <rect width="${width}" height="${height}" fill="#fafafa"/>
  
  <text x="${width / 2}" y="50" class="sitemap-title" text-anchor="middle">
    PIX.IMMO Site Map
  </text>
  <text x="${width / 2}" y="75" class="sitemap-route" text-anchor="middle">
    ${structures.length} Routes
  </text>
`;

  let yOffset = 120;
  let boxIndex = 0;
  
  // Render each group
  Object.entries(grouped).forEach(([groupName, items]) => {
    if (items.length === 0) return;
    
    svg += `\n  <text x="${padding}" y="${yOffset}" class="sitemap-group">${groupName.toUpperCase()}</text>\n`;
    yOffset += 30;
    
    const startX = padding;
    items.forEach((item, i) => {
      const col = i % maxPerRow;
      const row = Math.floor(i / maxPerRow);
      const x = startX + col * (boxWidth + horizontalGap);
      const y = yOffset + row * (boxHeight + verticalGap);
      
      svg += `
  <g class="sitemap-box-group" data-route="${escapeXML(item.route)}">
    <rect x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" class="sitemap-box" rx="8"/>
    <text x="${x + boxWidth / 2}" y="${y + 25}" class="sitemap-text" text-anchor="middle">
      ${escapeXML(truncate(item.title, 20))}
    </text>
    <text x="${x + boxWidth / 2}" y="${y + 45}" class="sitemap-route" text-anchor="middle">
      ${escapeXML(item.route)}
    </text>
  </g>`;
      
      boxIndex++;
    });
    
    yOffset += Math.ceil(items.length / maxPerRow) * (boxHeight + verticalGap) + 40;
  });
  
  svg += '\n</svg>';
  return svg;
}

/**
 * Helper: Escape XML
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Helper: Escape HTML
 */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Helper: Truncate
 */
function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.substring(0, maxLen - 3) + '...' : str;
}

/**
 * Scan all pages and generate wireframes
 */
function generateWireframes() {
  const routes = parseRoutes();
  const structures: LayoutStructure[] = [];
  
  function scanDir(dir: string, prefix = ''): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDir(fullPath, `${prefix}${entry.name}/`);
      } else if (entry.name.endsWith('.tsx')) {
        const componentName = entry.name.replace('.tsx', '');
        const pascalName = componentName
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('');
        
        let routePath = routes.get(pascalName) || 
                       routes.get(componentName) ||
                       routes.get(componentName.charAt(0).toUpperCase() + componentName.slice(1));
        
        if (!routePath) {
          const relPath = prefix + entry.name.replace('.tsx', '');
          routePath = `/${relPath}`;
        }
        
        const structure = analyzePageStructure(fullPath, routePath);
        structures.push(structure);
      }
    }
  }
  
  scanDir(PAGES_DIR);
  structures.sort((a, b) => a.route.localeCompare(b.route));
  
  return structures;
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 Wireframe & Skeleton Export Tool\n');
  
  console.log(`📂 Scanning: ${PAGES_DIR}`);
  const structures = generateWireframes();
  
  console.log(`✅ Found ${structures.length} pages\n`);
  
  let svgCount = 0;
  let htmlCount = 0;
  
  // Generate individual wireframes and skeletons
  structures.forEach((structure, index) => {
    const safeName = structure.route.replace(/\//g, '_').replace(/:/g, '_') || 'root';
    
    // SVG Wireframe
    const svg = generateSVGWireframe(structure);
    const svgPath = path.join(WIREFRAMES_DIR, `${safeName}.svg`);
    fs.writeFileSync(svgPath, svg, 'utf-8');
    svgCount++;
    
    // HTML Skeleton
    const html = generateHTMLSkeleton(structure);
    const htmlPath = path.join(SKELETONS_DIR, `${safeName}.html`);
    fs.writeFileSync(htmlPath, html, 'utf-8');
    htmlCount++;
    
    if ((index + 1) % 10 === 0) {
      console.log(`  Processed ${index + 1}/${structures.length} pages...`);
    }
  });
  
  // Generate sitemap
  console.log('\n📊 Generating sitemap...');
  const sitemap = generateSitemapSVG(structures);
  const sitemapPath = path.join(EXPORT_DIR, 'site_map.svg');
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
  
  console.log(`\n✨ Done!\n`);
  console.log(`📈 Summary:`);
  console.log(`   - SVG Wireframes: ${svgCount} (${WIREFRAMES_DIR})`);
  console.log(`   - HTML Skeletons: ${htmlCount} (${SKELETONS_DIR})`);
  console.log(`   - Sitemap: ${sitemapPath}`);
  console.log(`\n💡 Test:`);
  console.log(`   - Open any SVG in Figma (drag & drop)`);
  console.log(`   - Open any HTML in browser (double-click)`);
}

// Execute
try {
  main();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
