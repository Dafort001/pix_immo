#!/usr/bin/env tsx
/**
 * HTML Export Tool für Figma Import
 * Exportiert alle Seiten als separate HTML-Dateien
 */

import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const OUTPUT_DIR = path.join(process.cwd(), 'export', 'html');

// Alle Routen aus App.tsx
const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/gallery', name: 'gallery' },
  { path: '/blog', name: 'blog' },
  { path: '/impressum', name: 'imprint' },
  { path: '/agb', name: 'agb' },
  { path: '/kontakt', name: 'contact' },
  { path: '/datenschutz', name: 'datenschutz' },
  { path: '/kontakt-formular', name: 'kontakt-formular' },
  { path: '/about', name: 'about' },
  { path: '/faq', name: 'faq' },
  { path: '/preise', name: 'pricing' },
  { path: '/preisliste', name: 'preisliste' },
  { path: '/buchen', name: 'booking' },
  { path: '/booking-confirmation', name: 'booking-confirmation' },
  { path: '/galerie', name: 'galerie' },
  { path: '/downloads', name: 'downloads' },
  { path: '/intake', name: 'intake' },
  { path: '/jobs', name: 'jobs' },
  { path: '/admin/editorial', name: 'admin-editorial' },
  { path: '/admin/seo', name: 'admin-seo' },
  { path: '/upload-raw', name: 'upload-raw' },
  { path: '/ai-lab', name: 'ai-lab' },
  { path: '/demo-upload', name: 'demo-upload' },
  { path: '/demo-jobs', name: 'demo-jobs' },
  { path: '/docs/rooms-spec', name: 'docs-rooms-spec' },
  { path: '/capture', name: 'capture-index' },
  { path: '/capture/camera', name: 'capture-camera' },
  { path: '/capture/review', name: 'capture-review' },
  { path: '/capture/upload', name: 'capture-upload' },
  { path: '/app', name: 'app-splash' },
  { path: '/app/camera', name: 'app-camera' },
  { path: '/app/gallery', name: 'app-gallery' },
  { path: '/app/upload', name: 'app-upload' },
  { path: '/app/settings', name: 'app-settings' },
  { path: '/portal/uploads', name: 'portal-uploads-overview' },
  { path: '/portal/gallery-upload', name: 'portal-gallery-upload' },
  { path: '/portal/gallery-photographer', name: 'portal-gallery-photographer' },
  { path: '/portal/gallery-editing', name: 'portal-gallery-editing' },
  { path: '/test', name: 'test-debug' },
];

/**
 * Ensure output directory exists
 */
function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

/**
 * Clean HTML (entferne Scripts, aber behalte CSS)
 */
function cleanHTML(html: string, routeName: string): string {
  // Entferne alle <script> Tags (außer type="application/ld+json" für SEO)
  let cleaned = html.replace(/<script(?![^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Entferne Event-Handler
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Füge Kommentar hinzu
  const comment = `<!--
  Exported from pix.immo
  Route: ${routeName}
  Generated: ${new Date().toISOString()}
  
  Hinweis: Diese HTML-Datei wurde für den Import in Figma optimiert.
  Alle interaktiven Elemente wurden entfernt, CSS-Styles sind erhalten.
-->
`;
  
  return comment + cleaned;
}

/**
 * Export single page as HTML
 */
async function exportPage(
  page: any,
  route: { path: string; name: string },
  index: number,
  total: number
): Promise<void> {
  const url = `${BASE_URL}${route.path}`;
  const filename = `${route.name}.html`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  console.log(`[${index + 1}/${total}] ${route.name}`);
  
  try {
    // Navigate to page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    
    // Warte kurz damit React fertig rendert
    await page.waitForTimeout(500);
    
    // Get full HTML
    const html = await page.content();
    
    // Clean HTML für Figma
    const cleanedHTML = cleanHTML(html, route.path);
    
    // Save to file
    fs.writeFileSync(filepath, cleanedHTML, 'utf-8');
    
    console.log(`   ✅ Saved: ${filename} (${(cleanedHTML.length / 1024).toFixed(2)} KB)`);
  } catch (error) {
    console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('📄 HTML Export Tool für Figma\n');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);
  
  ensureOutputDir();
  
  console.log('🚀 Starting browser...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });
  
  const page = await browser.newPage();
  
  // Set viewport (Desktop)
  await page.setViewport({
    width: 1920,
    height: 1080,
  });
  
  console.log(`📊 Exporting ${ROUTES.length} pages...\n`);
  
  // Export all pages
  for (let i = 0; i < ROUTES.length; i++) {
    await exportPage(page, ROUTES[i], i, ROUTES.length);
  }
  
  await browser.close();
  
  console.log('\n✨ Export complete!\n');
  console.log(`📂 HTML files: ${OUTPUT_DIR}`);
  console.log(`📈 Total pages: ${ROUTES.length}`);
  
  // Generate index file
  generateIndexFile();
}

/**
 * Generate index.html with links to all pages
 */
function generateIndexFile() {
  const indexPath = path.join(OUTPUT_DIR, '00_index.html');
  
  let html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>pix.immo - Page Export Index</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 40px;
      background: #f5f5f5;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 {
      font-size: 32px;
      margin-bottom: 8px;
      color: #1a1a1a;
    }
    .subtitle {
      color: #666;
      margin-bottom: 32px;
      font-size: 16px;
    }
    .stats {
      display: flex;
      gap: 24px;
      margin-bottom: 32px;
    }
    .stat {
      background: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #4A5849;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    .page-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }
    .page-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }
    .page-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #1a1a1a;
    }
    .page-route {
      font-size: 14px;
      color: #666;
      font-family: 'Monaco', monospace;
      margin-bottom: 12px;
    }
    .page-link {
      display: inline-block;
      padding: 8px 16px;
      background: #4A5849;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
      transition: background 0.2s;
    }
    .page-link:hover {
      background: #3a4739;
    }
    .section {
      margin-top: 48px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #1a1a1a;
      padding-bottom: 8px;
      border-bottom: 2px solid #4A5849;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📄 pix.immo HTML Export</h1>
    <p class="subtitle">Alle Seiten als HTML für Figma Import</p>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${ROUTES.length}</div>
        <div class="stat-label">Exportierte Seiten</div>
      </div>
      <div class="stat">
        <div class="stat-value">${new Date().toLocaleDateString('de-DE')}</div>
        <div class="stat-label">Export-Datum</div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">Alle Seiten</h2>
      <div class="grid">
`;
  
  // Group routes by category
  const categories: Record<string, typeof ROUTES> = {
    'Marketing': ROUTES.filter(r => ['home', 'about', 'pricing', 'preisliste', 'blog', 'galerie', 'downloads'].includes(r.name)),
    'Booking': ROUTES.filter(r => ['booking', 'booking-confirmation', 'intake'].includes(r.name)),
    'Authentication': ROUTES.filter(r => ['login', 'register'].includes(r.name)),
    'Portal': ROUTES.filter(r => r.name.startsWith('portal-')),
    'Mobile PWA': ROUTES.filter(r => r.name.startsWith('app-')),
    'Capture': ROUTES.filter(r => r.name.startsWith('capture-')),
    'Admin': ROUTES.filter(r => r.name.startsWith('admin-') || r.name === 'ai-lab'),
    'Legal': ROUTES.filter(r => ['imprint', 'agb', 'datenschutz', 'contact', 'kontakt-formular', 'faq'].includes(r.name)),
    'Demo & Test': ROUTES.filter(r => r.name.startsWith('demo-') || r.name.startsWith('test-') || r.name.startsWith('docs-')),
    'Other': ROUTES.filter(r => 
      !['home', 'about', 'pricing', 'preisliste', 'blog', 'galerie', 'downloads',
        'booking', 'booking-confirmation', 'intake', 'login', 'register'].includes(r.name) &&
      !r.name.startsWith('portal-') && !r.name.startsWith('app-') && !r.name.startsWith('capture-') &&
      !r.name.startsWith('admin-') && r.name !== 'ai-lab' &&
      !['imprint', 'agb', 'datenschutz', 'contact', 'kontakt-formular', 'faq'].includes(r.name) &&
      !r.name.startsWith('demo-') && !r.name.startsWith('test-') && !r.name.startsWith('docs-')
    ),
  };
  
  // Render all routes
  for (const route of ROUTES) {
    html += `
        <div class="page-card">
          <div class="page-name">${route.name}</div>
          <div class="page-route">${route.path}</div>
          <a href="./${route.name}.html" class="page-link" target="_blank">HTML öffnen →</a>
        </div>
`;
  }
  
  html += `
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">📋 Nutzungshinweise</h2>
      <div class="page-card">
        <h3 style="margin-bottom: 12px;">Figma Import</h3>
        <ol style="line-height: 1.8; color: #444; padding-left: 20px;">
          <li>Öffne Figma und erstelle ein neues File</li>
          <li>Gehe zu: File → Import → wähle eine HTML-Datei</li>
          <li>Figma konvertiert das HTML automatisch zu Frames</li>
          <li>Bearbeite die einzelnen Seiten in Figma</li>
          <li>Exportiere die Designs als PNG/SVG für die Entwicklung</li>
        </ol>
        
        <h3 style="margin: 24px 0 12px;">Hinweise</h3>
        <ul style="line-height: 1.8; color: #444; padding-left: 20px;">
          <li>Alle interaktiven Elemente (JavaScript) wurden entfernt</li>
          <li>CSS-Styles sind vollständig erhalten</li>
          <li>Jede Seite ist eine separate HTML-Datei</li>
          <li>Desktop-Viewport: 1920×1080px</li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>
`;
  
  fs.writeFileSync(indexPath, html, 'utf-8');
  console.log(`📋 Index created: ${indexPath}`);
}

// Execute
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
