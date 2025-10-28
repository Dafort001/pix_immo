/**
 * Audit ZIP & Index Generator
 * 
 * Erstellt vollständiges Audit-Paket:
 * - /export/AUDIT_INDEX.md (Links zu allen Reports)
 * - /export/site_audit_package.zip (docs + export ohne node_modules)
 * 
 * Prüft:
 * - ZIP-Größe <80 MB (ok, falls größer wegen Screenshots)
 * - Top-5 größte Dateien
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const EXPORT_DIR = path.join(ROOT_DIR, 'export');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

interface FileSize {
  file: string;
  size: number;
  sizeFormatted: string;
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file size recursively
 */
function getDirectorySize(dirPath: string): number {
  let totalSize = 0;
  
  if (!fs.existsSync(dirPath)) return 0;
  
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    
    if (item.isDirectory()) {
      totalSize += getDirectorySize(fullPath);
    } else if (item.isFile()) {
      const stats = fs.statSync(fullPath);
      totalSize += stats.size;
    }
  }
  
  return totalSize;
}

/**
 * Get all files with sizes
 */
function getAllFiles(dirPath: string, baseDir: string): FileSize[] {
  const files: FileSize[] = [];
  
  if (!fs.existsSync(dirPath)) return files;
  
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    
    if (item.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else if (item.isFile()) {
      const stats = fs.statSync(fullPath);
      const relPath = path.relative(baseDir, fullPath);
      
      files.push({
        file: relPath,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
      });
    }
  }
  
  return files;
}

/**
 * Generate audit index markdown
 */
function generateAuditIndex(): void {
  const lines: string[] = [];
  
  lines.push('# Site Audit Index');
  lines.push('');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  lines.push('This index provides links to all audit reports and exports generated for pix.immo.');
  lines.push('');
  
  lines.push('## 📊 Reports');
  lines.push('');
  
  // List all markdown reports in docs/
  const reports = [
    { file: 'page_inventory.md', title: 'Page Inventory', desc: 'Complete list of all routes' },
    { file: 'content_index.md', title: 'Content Index', desc: 'All i18n strings and copy' },
    { file: 'routes_manifest.md', title: 'Routes Manifest', desc: 'Route guards, params, orphans' },
    { file: 'component_map.md', title: 'Component Map', desc: 'Component usage across routes' },
    { file: 'WIREFRAME_EXPORT_GUIDE.md', title: 'Wireframe Export Guide', desc: 'How to use wireframes' },
    { file: 'SCREENSHOTS_GUIDE.md', title: 'Screenshots Guide', desc: 'Screenshot tool usage' },
    { file: 'COMPONENT_MAP_GUIDE.md', title: 'Component Map Guide', desc: 'Component analysis guide' },
  ];
  
  reports.forEach(report => {
    const reportPath = path.join(DOCS_DIR, report.file);
    if (fs.existsSync(reportPath)) {
      lines.push(`### [${report.title}](../docs/${report.file})`);
      lines.push('');
      lines.push(report.desc);
      lines.push('');
    }
  });
  
  lines.push('## 📁 Exports');
  lines.push('');
  
  const exports = [
    { file: 'content_dump.json', title: 'Content Dump (JSON)', desc: 'All text content with metadata' },
    { file: 'routes_manifest.json', title: 'Routes Manifest (JSON)', desc: 'Complete route configuration' },
    { file: 'component_map.json', title: 'Component Map (JSON)', desc: 'Component-route relationships' },
    { file: 'wireframes/', title: 'Wireframes (SVG)', desc: '50 page wireframes' },
    { file: 'skeletons/', title: 'HTML Skeletons', desc: '50 HTML structure files' },
    { file: 'screens/', title: 'Screenshots (PNG)', desc: 'Page screenshots at 3 breakpoints' },
    { file: 'site_map.svg', title: 'Site Map (SVG)', desc: 'Visual site architecture' },
    { file: 'figma_bundle/', title: 'Figma Bundle', desc: 'All assets for Figma import' },
  ];
  
  exports.forEach(exp => {
    const expPath = path.join(EXPORT_DIR, exp.file);
    if (fs.existsSync(expPath)) {
      const isDir = fs.statSync(expPath).isDirectory();
      const link = isDir ? `${exp.file}` : exp.file;
      lines.push(`### [${exp.title}](${link})`);
      lines.push('');
      lines.push(exp.desc);
      lines.push('');
    }
  });
  
  lines.push('## 🛠️ Tools');
  lines.push('');
  lines.push('All audit tools are located in `/tools`:');
  lines.push('');
  lines.push('- `page-inventory.ts` - Route scanner');
  lines.push('- `wireframe-export.ts` - Wireframe generator');
  lines.push('- `page-screenshots.ts` - Screenshot capturer');
  lines.push('- `component-map.ts` - Component analyzer');
  lines.push('- `content-dump.ts` - Content extractor');
  lines.push('- `routes-manifest.ts` - Route manifest generator');
  lines.push('- `figma-bundle.ts` - Figma bundle packager');
  lines.push('- `audit-zip.ts` - Audit package creator');
  lines.push('');
  
  lines.push('## 📦 Package Contents');
  lines.push('');
  lines.push('This ZIP package (`site_audit_package.zip`) contains:');
  lines.push('');
  lines.push('```');
  lines.push('site_audit_package/');
  lines.push('├── docs/              # All markdown reports');
  lines.push('├── export/            # All JSON/SVG/PNG exports');
  lines.push('│   ├── wireframes/');
  lines.push('│   ├── skeletons/');
  lines.push('│   ├── screens/');
  lines.push('│   ├── figma_bundle/');
  lines.push('│   ├── content_dump.json');
  lines.push('│   ├── routes_manifest.json');
  lines.push('│   ├── component_map.json');
  lines.push('│   └── site_map.svg');
  lines.push('└── AUDIT_INDEX.md     # This file');
  lines.push('```');
  lines.push('');
  
  lines.push('## 🔄 Regenerating Reports');
  lines.push('');
  lines.push('To regenerate any report:');
  lines.push('');
  lines.push('```bash');
  lines.push('# Individual tools');
  lines.push('tsx tools/page-inventory.ts');
  lines.push('tsx tools/wireframe-export.ts');
  lines.push('tsx tools/content-dump.ts');
  lines.push('tsx tools/routes-manifest.ts');
  lines.push('tsx tools/component-map.ts');
  lines.push('tsx tools/figma-bundle.ts');
  lines.push('');
  lines.push('# Complete audit package');
  lines.push('tsx tools/audit-zip.ts');
  lines.push('```');
  lines.push('');
  
  const indexPath = path.join(EXPORT_DIR, 'AUDIT_INDEX.md');
  fs.writeFileSync(indexPath, lines.join('\n'), 'utf-8');
  
  console.log('   ✓ Generated AUDIT_INDEX.md');
}

/**
 * Create ZIP archive
 */
async function createZipArchive(): Promise<{ path: string; size: number }> {
  return new Promise((resolve, reject) => {
    const zipPath = path.join(EXPORT_DIR, 'site_audit_package.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    output.on('close', () => {
      const stats = fs.statSync(zipPath);
      resolve({ path: zipPath, size: stats.size });
    });
    
    archive.on('error', (err) => {
      reject(err);
    });
    
    archive.pipe(output);
    
    // Add docs directory
    if (fs.existsSync(DOCS_DIR)) {
      archive.directory(DOCS_DIR, 'docs');
      console.log('   ✓ Added docs/');
    }
    
    // Add export directory (excluding the ZIP itself)
    if (fs.existsSync(EXPORT_DIR)) {
      const exportItems = fs.readdirSync(EXPORT_DIR, { withFileTypes: true });
      
      for (const item of exportItems) {
        const fullPath = path.join(EXPORT_DIR, item.name);
        
        // Skip the ZIP file itself
        if (item.name === 'site_audit_package.zip') continue;
        
        if (item.isDirectory()) {
          archive.directory(fullPath, `export/${item.name}`);
          console.log(`   ✓ Added export/${item.name}/`);
        } else if (item.isFile()) {
          archive.file(fullPath, { name: `export/${item.name}` });
          console.log(`   ✓ Added export/${item.name}`);
        }
      }
    }
    
    archive.finalize();
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('📦 Audit ZIP & Index Generator\n');
  
  // Ensure export directory exists
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }
  
  console.log('📝 Generating AUDIT_INDEX.md...');
  generateAuditIndex();
  
  console.log('\n📦 Creating ZIP archive...');
  const { path: zipPath, size } = await createZipArchive();
  
  console.log('\n✅ Archive complete\n');
  console.log('📊 Summary:');
  console.log(`   - ZIP path: ${zipPath}`);
  console.log(`   - ZIP size: ${formatBytes(size)}`);
  
  // Check size threshold
  const sizeMB = size / (1024 * 1024);
  if (sizeMB > 80) {
    console.log(`   ⚠️  Size exceeds 80 MB (${sizeMB.toFixed(2)} MB) - OK if screenshots are included`);
  } else {
    console.log(`   ✓ Size within 80 MB limit (${sizeMB.toFixed(2)} MB)`);
  }
  
  // Get top 5 largest files
  console.log('\n📈 Top 5 largest files:');
  
  const allFiles = [
    ...getAllFiles(DOCS_DIR, ROOT_DIR),
    ...getAllFiles(EXPORT_DIR, ROOT_DIR),
  ];
  
  const topFiles = allFiles
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);
  
  topFiles.forEach((file, idx) => {
    console.log(`   ${idx + 1}. ${file.file} (${file.sizeFormatted})`);
  });
  
  console.log('\n💡 Usage:');
  console.log(`   - Unzip: unzip ${path.basename(zipPath)}`);
  console.log(`   - View index: cat export/AUDIT_INDEX.md`);
  console.log('');
  console.log('✨ Done!');
}

// Execute
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
