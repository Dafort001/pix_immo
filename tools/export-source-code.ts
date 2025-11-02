#!/usr/bin/env tsx
/**
 * Source Code Export - Alle React-Komponenten (.tsx) als ZIP
 */

import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

const PAGES_DIR = path.join(process.cwd(), 'client/src/pages');
const OUTPUT_DIR = path.join(process.cwd(), 'export', 'source-code');
const ZIP_PATH = path.join(process.cwd(), 'export', 'piximmo-source-code.zip');

// Alle Seiten-Dateien
const PAGE_FILES = [
  // Root pages
  'home.tsx',
  'login.tsx',
  'register.tsx',
  'dashboard.tsx',
  'gallery.tsx',
  'blog.tsx',
  'blog-post.tsx',
  'order-form.tsx',
  'imprint.tsx',
  'agb.tsx',
  'contact.tsx',
  'pricing.tsx',
  'intake.tsx',
  'jobs.tsx',
  'review.tsx',
  'preisliste.tsx',
  'booking.tsx',
  'booking-confirmation.tsx',
  'galerie.tsx',
  'datenschutz.tsx',
  'kontakt-formular.tsx',
  'about.tsx',
  'faq.tsx',
  'downloads.tsx',
  'admin-editorial.tsx',
  'admin-seo.tsx',
  'upload-raw.tsx',
  'ai-lab.tsx',
  'demo-upload.tsx',
  'demo-jobs.tsx',
  'demo-job-detail.tsx',
  'docs-rooms-spec.tsx',
  'gallery-classify.tsx',
  'test-debug.tsx',
  'not-found.tsx',
  
  // Capture folder
  'capture/index.tsx',
  'capture/camera.tsx',
  'capture/review.tsx',
  'capture/upload.tsx',
  
  // App folder
  'app/splash.tsx',
  'app/camera.tsx',
  'app/gallery.tsx',
  'app/upload.tsx',
  'app/settings.tsx',
  
  // Portal folder
  'portal/uploads-overview.tsx',
  'portal/gallery-selection.tsx',
  'portal/payment.tsx',
  'portal/status-timeline.tsx',
  'portal/delivery.tsx',
  'portal/gallery-upload.tsx',
  'portal/gallery-photographer.tsx',
  'portal/gallery-editing.tsx',
];

async function copySourceFiles() {
  console.log('📂 Source Code Export gestartet\n');
  
  // Erstelle Output-Verzeichnis
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  console.log(`📋 Kopiere ${PAGE_FILES.length} Dateien...\n`);
  
  let success = 0;
  let failed = 0;
  let totalSize = 0;
  
  for (const file of PAGE_FILES) {
    const sourcePath = path.join(PAGES_DIR, file);
    const destPath = path.join(OUTPUT_DIR, file);
    
    try {
      // Erstelle Unterordner falls nötig
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Kopiere Datei
      fs.copyFileSync(sourcePath, destPath);
      
      const stats = fs.statSync(destPath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      totalSize += stats.size;
      
      console.log(`✅ ${file.padEnd(40)} ${sizeKB} KB`);
      success++;
    } catch (error) {
      console.error(`❌ ${file} - ${error instanceof Error ? error.message : 'Fehler'}`);
      failed++;
    }
  }
  
  console.log(`\n📈 Export abgeschlossen:`);
  console.log(`   ✅ Erfolgreich: ${success}`);
  if (failed > 0) {
    console.log(`   ❌ Fehlgeschlagen: ${failed}`);
  }
  console.log(`   📦 Gesamtgröße: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  return OUTPUT_DIR;
}

async function createZip(sourceDir: string): Promise<string> {
  console.log('\n📦 Erstelle ZIP-Archiv...');
  
  // Lösche alte ZIP falls vorhanden
  if (fs.existsSync(ZIP_PATH)) {
    fs.unlinkSync(ZIP_PATH);
  }
  
  const output = fs.createWriteStream(ZIP_PATH);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  return new Promise<string>((resolve, reject) => {
    output.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`✅ ZIP erstellt`);
      console.log(`   Größe: ${sizeMB} MB`);
      resolve(ZIP_PATH);
    });
    
    archive.on('error', (err) => reject(err));
    
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function createReadme() {
  const readme = `# pix.immo Source Code Export

## 📁 Inhalt

Alle ${PAGE_FILES.length} React-Komponenten (.tsx) der pix.immo Plattform.

### Struktur

\`\`\`
Root Pages (${PAGE_FILES.filter(f => !f.includes('/')).length} Dateien)
├── home.tsx                  ← Homepage
├── login.tsx                 ← Login
├── register.tsx              ← Registrierung
├── dashboard.tsx             ← Dashboard
└── ...

capture/ (4 Dateien)
├── index.tsx                 ← Capture Index
├── camera.tsx                ← Capture Camera
├── review.tsx                ← Capture Review
└── upload.tsx                ← Capture Upload

app/ (5 Dateien)
├── splash.tsx                ← App Splash Screen
├── camera.tsx                ← Mobile Kamera
├── gallery.tsx               ← Mobile Galerie
├── upload.tsx                ← Mobile Upload
└── settings.tsx              ← App Einstellungen

portal/ (8 Dateien)
├── gallery-upload.tsx        ← Customer Upload Gallery
├── gallery-photographer.tsx  ← Photographer Upload Gallery
├── gallery-editing.tsx       ← Editing Gallery
└── ...
\`\`\`

## 🔧 Technologie

- **Framework**: React 18 + TypeScript
- **Routing**: Wouter
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS
- **Forms**: react-hook-form + zod
- **Data Fetching**: TanStack Query v5

## 💡 Verwendung

Diese .tsx Dateien können Sie:
1. In Figma importieren (mit Figma Plugins für React)
2. Direkt bearbeiten und zurückgeben
3. Als Referenz für Design-Updates verwenden

## 📝 Hinweise

- Jede .tsx Datei ist eine vollständige React-Komponente
- Imports zeigen die verwendeten UI-Komponenten
- Props und State zeigen die Funktionalität
- Formulare zeigen Validierung und Datenfluss

---

**Erstellt am**: ${new Date().toLocaleDateString('de-DE', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readme, 'utf-8');
  console.log('✅ README.md erstellt');
}

async function main() {
  try {
    const exportDir = await copySourceFiles();
    await createReadme();
    const zipPath = await createZip(exportDir);
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ FERTIG!');
    console.log('='.repeat(60));
    console.log(`\n📁 Source Code: ${exportDir}`);
    console.log(`📦 ZIP-Download: ${zipPath}`);
    console.log(`\n💡 ${PAGE_FILES.length} React-Komponenten (.tsx) exportiert`);
    console.log(`   Inkl. README mit Struktur-Übersicht`);
    console.log('');
  } catch (error) {
    console.error('\n❌ Fehler:', error);
    process.exit(1);
  }
}

main();
