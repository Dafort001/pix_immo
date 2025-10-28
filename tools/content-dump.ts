/**
 * Content Dump Tool
 * 
 * Sammelt alle i18n-Strings, Copy und hardcoded Texte aus:
 * - /copy (falls vorhanden)
 * - /locales (falls vorhanden)
 * - Hardcoded strings in Pages/Components (Regex)
 * 
 * Output:
 * - /export/content_dump.json (key → value, route, file, line)
 * - /docs/content_index.md (gruppiert nach Route)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const CLIENT_SRC = path.join(ROOT_DIR, 'client/src');
const SHARED_DIR = path.join(ROOT_DIR, 'shared');
const EXPORT_DIR = path.join(ROOT_DIR, 'export');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

interface ContentEntry {
  key: string;
  value: string;
  route?: string;
  file: string;
  line: number;
  type: 'i18n' | 'copy' | 'hardcoded' | 'constant';
  context?: string;
}

interface ContentDump {
  generated: string;
  totalEntries: number;
  byType: {
    i18n: number;
    copy: number;
    hardcoded: number;
    constant: number;
  };
  entries: ContentEntry[];
}

/**
 * Extract hardcoded strings from a file
 */
function extractHardcodedStrings(filePath: string, relPath: string): ContentEntry[] {
  const entries: ContentEntry[] = [];
  
  if (!fs.existsSync(filePath)) return entries;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Patterns to match
  const patterns = [
    // String literals in JSX: <h1>Text here</h1>
    /<(\w+)[^>]*>([^<>{]*[a-zA-ZäöüÄÖÜß][^<>{}]{3,})<\/\1>/g,
    // String literals as props: title="Text here"
    /\b(\w+)=["']([^"']{4,})["']/g,
    // Const assignments: const text = "Text here"
    /const\s+(\w+)\s*=\s*["']([^"']{4,})["']/g,
    // Export const: export const TEXT = "Text here"
    /export\s+const\s+(\w+)\s*=\s*["']([^"']{4,})["']/g,
  ];
  
  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;
    
    patterns.forEach((pattern) => {
      const matches = [...line.matchAll(pattern)];
      
      matches.forEach(match => {
        const key = match[1] || 'inline';
        const value = match[2];
        
        // Filter out imports, technical strings, URLs, etc.
        if (shouldIncludeString(value, line)) {
          entries.push({
            key: `${relPath}:${lineNumber}:${key}`,
            value: value.trim(),
            file: relPath,
            line: lineNumber,
            type: line.includes('export const') ? 'constant' : 'hardcoded',
            context: line.trim().substring(0, 100),
          });
        }
      });
    });
  });
  
  return entries;
}

/**
 * Check if a string should be included in content dump
 */
function shouldIncludeString(value: string, context: string): boolean {
  // Skip if too short
  if (value.length < 4) return false;
  
  // Skip imports
  if (context.includes('import ') && context.includes('from')) return false;
  
  // Skip URLs
  if (value.startsWith('http://') || value.startsWith('https://')) return false;
  if (value.startsWith('/api/') || value.startsWith('@/')) return false;
  
  // Skip file paths
  if (value.includes('.tsx') || value.includes('.ts') || value.includes('.css')) return false;
  
  // Skip technical identifiers
  if (/^[a-z_-]+$/.test(value)) return false; // Only lowercase/dashes
  if (/^data-testid/.test(value)) return false;
  if (value.startsWith('button-') || value.startsWith('input-')) return false;
  
  // Skip CSS classes
  if (value.includes('flex') && value.includes('items-')) return false;
  
  // Skip version strings
  if (/^v?\d+\.\d+/.test(value)) return false;
  
  // Must contain at least one letter
  if (!/[a-zA-ZäöüÄÖÜß]/.test(value)) return false;
  
  return true;
}

/**
 * Map file path to route
 */
function fileToRoute(filePath: string): string | undefined {
  // Extract from pages directory
  const pagesMatch = filePath.match(/pages\/(.+)\.tsx?$/);
  if (!pagesMatch) return undefined;
  
  let route = pagesMatch[1];
  
  // Handle special cases
  if (route === 'home') return '/';
  if (route === 'not-found') return undefined;
  
  // Handle nested routes
  route = route.replace(/\//g, '/');
  
  // Add leading slash
  if (!route.startsWith('/')) {
    route = '/' + route;
  }
  
  return route;
}

/**
 * Scan directory for content
 */
function scanDirectory(dir: string, baseDir: string): ContentEntry[] {
  const entries: ContentEntry[] = [];
  
  if (!fs.existsSync(dir)) {
    return entries;
  }
  
  function scan(currentDir: string): void {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!['node_modules', '.git', 'dist', 'build'].includes(item.name)) {
          scan(fullPath);
        }
      } else if (item.isFile() && /\.(tsx?|jsx?)$/.test(item.name)) {
        const relPath = path.relative(baseDir, fullPath);
        const fileEntries = extractHardcodedStrings(fullPath, relPath);
        
        // Add route info
        const route = fileToRoute(relPath);
        fileEntries.forEach(entry => {
          entry.route = route;
        });
        
        entries.push(...fileEntries);
      }
    }
  }
  
  scan(dir);
  return entries;
}

/**
 * Generate content dump JSON
 */
function generateContentDump(): ContentDump {
  console.log('🔍 Scanning for content...\n');
  
  const allEntries: ContentEntry[] = [];
  
  // Scan pages
  console.log('📂 Scanning pages...');
  const pagesDir = path.join(CLIENT_SRC, 'pages');
  const pageEntries = scanDirectory(pagesDir, CLIENT_SRC);
  allEntries.push(...pageEntries);
  console.log(`   Found ${pageEntries.length} entries in pages`);
  
  // Scan components
  console.log('📂 Scanning components...');
  const componentsDir = path.join(CLIENT_SRC, 'components');
  const componentEntries = scanDirectory(componentsDir, CLIENT_SRC);
  allEntries.push(...componentEntries);
  console.log(`   Found ${componentEntries.length} entries in components`);
  
  // Scan shared
  console.log('📂 Scanning shared...');
  const sharedEntries = scanDirectory(SHARED_DIR, ROOT_DIR);
  allEntries.push(...sharedEntries);
  console.log(`   Found ${sharedEntries.length} entries in shared`);
  
  // Count by type
  const byType = {
    i18n: allEntries.filter(e => e.type === 'i18n').length,
    copy: allEntries.filter(e => e.type === 'copy').length,
    hardcoded: allEntries.filter(e => e.type === 'hardcoded').length,
    constant: allEntries.filter(e => e.type === 'constant').length,
  };
  
  return {
    generated: new Date().toISOString(),
    totalEntries: allEntries.length,
    byType,
    entries: allEntries,
  };
}

/**
 * Generate content index markdown
 */
function generateContentIndex(dump: ContentDump): string {
  const lines: string[] = [];
  
  lines.push('# Content Index');
  lines.push('');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  lines.push('## Statistics');
  lines.push('');
  lines.push(`- **Total entries**: ${dump.totalEntries}`);
  lines.push(`- **Hardcoded strings**: ${dump.byType.hardcoded}`);
  lines.push(`- **Constants**: ${dump.byType.constant}`);
  lines.push(`- **i18n**: ${dump.byType.i18n}`);
  lines.push(`- **Copy files**: ${dump.byType.copy}`);
  lines.push('');
  
  // Group by route
  const byRoute = new Map<string, ContentEntry[]>();
  
  dump.entries.forEach(entry => {
    const route = entry.route || '(no route)';
    if (!byRoute.has(route)) {
      byRoute.set(route, []);
    }
    byRoute.get(route)!.push(entry);
  });
  
  // Sort routes
  const sortedRoutes = Array.from(byRoute.keys()).sort();
  
  lines.push('## Content by Route');
  lines.push('');
  
  sortedRoutes.forEach(route => {
    const entries = byRoute.get(route)!;
    lines.push(`### ${route}`);
    lines.push('');
    lines.push(`**${entries.length} entries**`);
    lines.push('');
    
    // Show top 10 entries
    const topEntries = entries.slice(0, 10);
    lines.push('| Value | File | Line | Type |');
    lines.push('|-------|------|------|------|');
    
    topEntries.forEach(entry => {
      const value = entry.value.substring(0, 50).replace(/\|/g, '\\|');
      lines.push(`| ${value}${entry.value.length > 50 ? '...' : ''} | ${entry.file} | ${entry.line} | ${entry.type} |`);
    });
    
    if (entries.length > 10) {
      lines.push(`| ... | *${entries.length - 10} more entries* | | |`);
    }
    
    lines.push('');
  });
  
  // File index
  lines.push('## Content by File');
  lines.push('');
  
  const byFile = new Map<string, ContentEntry[]>();
  dump.entries.forEach(entry => {
    if (!byFile.has(entry.file)) {
      byFile.set(entry.file, []);
    }
    byFile.get(entry.file)!.push(entry);
  });
  
  const sortedFiles = Array.from(byFile.keys())
    .sort((a, b) => byFile.get(b)!.length - byFile.get(a)!.length)
    .slice(0, 20);
  
  lines.push('**Top 20 files with most content:**');
  lines.push('');
  lines.push('| File | Entries |');
  lines.push('|------|---------|');
  
  sortedFiles.forEach(file => {
    const count = byFile.get(file)!.length;
    lines.push(`| ${file} | ${count} |`);
  });
  
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('📝 Content Dump Tool\n');
  
  // Ensure export directory exists
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
  
  // Generate content dump
  const dump = generateContentDump();
  
  console.log('\n✅ Content scan complete\n');
  console.log('📊 Statistics:');
  console.log(`   - Total entries: ${dump.totalEntries}`);
  console.log(`   - Hardcoded strings: ${dump.byType.hardcoded}`);
  console.log(`   - Constants: ${dump.byType.constant}`);
  console.log('');
  
  // Write JSON
  const jsonPath = path.join(EXPORT_DIR, 'content_dump.json');
  fs.writeFileSync(jsonPath, JSON.stringify(dump, null, 2), 'utf-8');
  console.log(`📄 Wrote: ${jsonPath}`);
  
  // Write markdown index
  const mdContent = generateContentIndex(dump);
  const mdPath = path.join(DOCS_DIR, 'content_index.md');
  fs.writeFileSync(mdPath, mdContent, 'utf-8');
  console.log(`📄 Wrote: ${mdPath}`);
  
  console.log('\n✨ Done!');
}

// Execute
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
