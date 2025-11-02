#!/usr/bin/env tsx
/**
 * Einfacher HTML Export - Alle Seiten als Download
 */

import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const OUTPUT_DIR = path.join(process.cwd(), 'export', 'pages-html');

// Alle Routen mit ihren finalen Dateinamen
const PAGES = [
  { url: '/', filename: 'home.html' },
  { url: '/login', filename: 'login.html' },
  { url: '/register', filename: 'register.html' },
  { url: '/dashboard', filename: 'dashboard.html' },
  { url: '/gallery', filename: 'gallery.html' },
  { url: '/blog', filename: 'blog.html' },
  { url: '/impressum', filename: 'imprint.html' },
  { url: '/agb', filename: 'agb.html' },
  { url: '/kontakt', filename: 'contact.html' },
  { url: '/datenschutz', filename: 'datenschutz.html' },
  { url: '/kontakt-formular', filename: 'kontakt-formular.html' },
  { url: '/about', filename: 'about.html' },
  { url: '/faq', filename: 'faq.html' },
  { url: '/preise', filename: 'pricing.html' },
  { url: '/preisliste', filename: 'preisliste.html' },
  { url: '/buchen', filename: 'booking.html' },
  { url: '/booking-confirmation', filename: 'booking-confirmation.html' },
  { url: '/galerie', filename: 'galerie.html' },
  { url: '/downloads', filename: 'downloads.html' },
  { url: '/intake', filename: 'intake.html' },
  { url: '/jobs', filename: 'jobs.html' },
  { url: '/admin/editorial', filename: 'admin-editorial.html' },
  { url: '/admin/seo', filename: 'admin-seo.html' },
  { url: '/upload-raw', filename: 'upload-raw.html' },
  { url: '/ai-lab', filename: 'ai-lab.html' },
  { url: '/demo-upload', filename: 'demo-upload.html' },
  { url: '/demo-jobs', filename: 'demo-jobs.html' },
  { url: '/docs/rooms-spec', filename: 'docs-rooms-spec.html' },
  { url: '/capture', filename: 'capture-index.html' },
  { url: '/capture/camera', filename: 'capture-camera.html' },
  { url: '/capture/review', filename: 'capture-review.html' },
  { url: '/capture/upload', filename: 'capture-upload.html' },
  { url: '/app', filename: 'app-splash.html' },
  { url: '/app/camera', filename: 'app-camera.html' },
  { url: '/app/gallery', filename: 'app-gallery.html' },
  { url: '/app/upload', filename: 'app-upload.html' },
  { url: '/app/settings', filename: 'app-settings.html' },
  { url: '/portal/uploads', filename: 'portal-uploads.html' },
  { url: '/portal/gallery-upload', filename: 'portal-gallery-upload.html' },
  { url: '/portal/gallery-photographer', filename: 'portal-gallery-photographer.html' },
  { url: '/portal/gallery-editing', filename: 'portal-gallery-editing.html' },
  { url: '/test', filename: 'test-debug.html' },
];

async function exportAllPages() {
  console.log('🚀 HTML Export gestartet\n');
  
  // Erstelle Output-Verzeichnis
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  // Starte Browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log(`📊 Exportiere ${PAGES.length} Seiten...\n`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < PAGES.length; i++) {
    const { url, filename } = PAGES[i];
    const fullUrl = `${BASE_URL}${url}`;
    
    console.log(`[${i + 1}/${PAGES.length}] ${filename}`);
    
    try {
      await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const html = await page.content();
      const filepath = path.join(OUTPUT_DIR, filename);
      
      fs.writeFileSync(filepath, html, 'utf-8');
      console.log(`   ✅ ${filename}`);
      success++;
    } catch (error) {
      console.error(`   ❌ Fehler: ${error}`);
      failed++;
    }
  }
  
  await browser.close();
  
  console.log(`\n✅ Export abgeschlossen:`);
  console.log(`   Erfolgreich: ${success}`);
  console.log(`   Fehlgeschlagen: ${failed}`);
  
  return OUTPUT_DIR;
}

async function createZip(sourceDir: string) {
  const zipPath = path.join(process.cwd(), 'export', 'piximmo-pages.zip');
  
  console.log('\n📦 Erstelle ZIP-Archiv...');
  
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  return new Promise<string>((resolve, reject) => {
    output.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`✅ ZIP erstellt: ${zipPath}`);
      console.log(`   Größe: ${sizeMB} MB`);
      resolve(zipPath);
    });
    
    archive.on('error', (err) => reject(err));
    
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function main() {
  try {
    const exportDir = await exportAllPages();
    const zipPath = await createZip(exportDir);
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ FERTIG!');
    console.log('='.repeat(60));
    console.log(`\n📁 HTML-Dateien: ${exportDir}`);
    console.log(`📦 ZIP-Download: ${zipPath}`);
    console.log(`\n💡 Nächste Schritte:`);
    console.log(`   1. Download: ${zipPath}`);
    console.log(`   2. Bearbeite die HTML-Dateien in Figma`);
    console.log(`   3. Gib mir die überarbeiteten Dateien zurück`);
    console.log(`      (Behalte die gleichen Dateinamen!)`);
    console.log('');
  } catch (error) {
    console.error('❌ Fehler:', error);
    process.exit(1);
  }
}

main();
