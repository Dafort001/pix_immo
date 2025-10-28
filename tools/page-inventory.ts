#!/usr/bin/env node
/**
 * Page Inventory Tool
 * Scans all pages in client/src/pages and generates inventory reports
 */

import * as fs from 'fs';
import * as path from 'path';

interface PageInfo {
  path: string;
  filePath: string;
  title: string;
  layout: string;
  components: string[];
  lastModified: string;
}

const PAGES_DIR = path.join(process.cwd(), 'client', 'src', 'pages');
const APP_TSX = path.join(process.cwd(), 'client', 'src', 'App.tsx');
const DOCS_DIR = path.join(process.cwd(), 'docs');

// Ensure docs directory exists
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

/**
 * Parse route from App.tsx
 */
function parseRoutes(): Map<string, string> {
  const routes = new Map<string, string>();
  
  if (!fs.existsSync(APP_TSX)) {
    console.warn(`⚠️  App.tsx not found at ${APP_TSX}`);
    return routes;
  }

  const content = fs.readFileSync(APP_TSX, 'utf-8');
  
  // Match: <Route path="/xyz" component={ComponentName} />
  const routeRegex = /<Route\s+path="([^"]+)"\s+component=\{(\w+)\}\s*\/>/g;
  let match;
  
  while ((match = routeRegex.exec(content)) !== null) {
    const [, routePath, componentName] = match;
    routes.set(componentName, routePath);
  }
  
  return routes;
}

/**
 * Extract title from page content
 */
function extractTitle(content: string): string {
  // Try to find <h1>, <title>, or SEOHead title
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  if (h1Match) return h1Match[1].trim();
  
  const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
  if (titleMatch) return titleMatch[1].trim();
  
  const seoMatch = content.match(/title=["']([^"']+)["']/);
  if (seoMatch) return seoMatch[1].trim();
  
  return 'Untitled';
}

/**
 * Detect layout type
 */
function detectLayout(content: string): string {
  if (content.includes('WebHeader') || content.includes('<header')) {
    return 'Web (Header + Footer)';
  }
  if (content.includes('StatusBar') || content.includes('BottomNav')) {
    return 'Mobile PWA';
  }
  if (content.includes('SidebarProvider')) {
    return 'Portal (Sidebar)';
  }
  if (content.includes('Card') && content.includes('Form')) {
    return 'Form Layout';
  }
  return 'Simple';
}

/**
 * Extract component names
 */
function extractComponents(content: string): string[] {
  const components = new Set<string>();
  
  // Match JSX component tags: <ComponentName
  const componentRegex = /<([A-Z][a-zA-Z0-9]*)/g;
  let match;
  
  while ((match = componentRegex.exec(content)) !== null) {
    const componentName = match[1];
    // Filter out common HTML-like elements
    if (!['SEOHead', 'Route', 'Switch'].includes(componentName)) {
      components.add(componentName);
    }
  }
  
  return Array.from(components).slice(0, 10); // Limit to 10
}

/**
 * Get file modification time
 */
function getLastModified(filePath: string): string {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch {
    return 'Unknown';
  }
}

/**
 * Scan all page files
 */
function scanPages(): PageInfo[] {
  const routes = parseRoutes();
  const pages: PageInfo[] = [];
  
  function scanDir(dir: string, prefix = ''): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDir(fullPath, `${prefix}${entry.name}/`);
      } else if (entry.name.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const componentName = entry.name.replace('.tsx', '');
        
        // Convert filename to component name (kebab-case to PascalCase)
        const pascalName = componentName
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('');
        
        // Try to find route path
        let routePath = routes.get(pascalName) || 
                        routes.get(componentName) ||
                        routes.get(componentName.charAt(0).toUpperCase() + componentName.slice(1));
        
        // Fallback: construct from directory structure
        if (!routePath) {
          const relPath = prefix + entry.name.replace('.tsx', '');
          routePath = `/${relPath}`;
        }
        
        pages.push({
          path: routePath,
          filePath: `client/src/pages/${prefix}${entry.name}`,
          title: extractTitle(content),
          layout: detectLayout(content),
          components: extractComponents(content),
          lastModified: getLastModified(fullPath),
        });
      }
    }
  }
  
  scanDir(PAGES_DIR);
  
  // Sort by path
  pages.sort((a, b) => a.path.localeCompare(b.path));
  
  return pages;
}

/**
 * Generate Markdown report
 */
function generateMarkdown(pages: PageInfo[]): string {
  let md = `# Page Inventory Report\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += `Total Pages: ${pages.length}\n\n`;
  md += `## Pages Overview\n\n`;
  md += `| Route | Title | Layout | Components | Last Modified | File Path |\n`;
  md += `|-------|-------|--------|------------|---------------|----------|\n`;
  
  for (const page of pages) {
    const components = page.components.slice(0, 5).join(', ') + 
                      (page.components.length > 5 ? '...' : '');
    md += `| ${page.path} | ${page.title} | ${page.layout} | ${components || '-'} | ${page.lastModified} | \`${page.filePath}\` |\n`;
  }
  
  md += `\n## Layout Distribution\n\n`;
  const layoutCounts = new Map<string, number>();
  for (const page of pages) {
    layoutCounts.set(page.layout, (layoutCounts.get(page.layout) || 0) + 1);
  }
  
  for (const [layout, count] of Array.from(layoutCounts.entries()).sort((a, b) => b[1] - a[1])) {
    md += `- **${layout}**: ${count} pages\n`;
  }
  
  return md;
}

/**
 * Generate CSV report
 */
function generateCSV(pages: PageInfo[]): string {
  let csv = `Route;Title;Layout;Components;Last Modified;File Path\n`;
  
  for (const page of pages) {
    const components = page.components.join(', ');
    // Escape semicolons in fields
    const escapedTitle = page.title.replace(/;/g, ',');
    const escapedComponents = components.replace(/;/g, ',');
    
    csv += `${page.path};${escapedTitle};${page.layout};${escapedComponents};${page.lastModified};${page.filePath}\n`;
  }
  
  return csv;
}

/**
 * Main execution
 */
function main() {
  console.log('📊 Page Inventory Tool\n');
  
  console.log(`📂 Scanning: ${PAGES_DIR}`);
  const pages = scanPages();
  
  console.log(`✅ Found ${pages.length} pages\n`);
  
  // Generate Markdown
  const mdPath = path.join(DOCS_DIR, 'page_inventory.md');
  const mdContent = generateMarkdown(pages);
  fs.writeFileSync(mdPath, mdContent, 'utf-8');
  console.log(`📝 Markdown report: ${mdPath}`);
  
  // Generate CSV
  const csvPath = path.join(DOCS_DIR, 'page_inventory.csv');
  const csvContent = generateCSV(pages);
  fs.writeFileSync(csvPath, csvContent, 'utf-8');
  console.log(`📊 CSV report: ${csvPath}`);
  
  console.log('\n✨ Done!\n');
  
  // Validate output
  if (!fs.existsSync(mdPath) || fs.statSync(mdPath).size === 0) {
    console.error('❌ ERROR: Markdown file is empty or missing');
    process.exit(1);
  }
  
  if (!fs.existsSync(csvPath) || fs.statSync(csvPath).size === 0) {
    console.error('❌ ERROR: CSV file is empty or missing');
    process.exit(1);
  }
  
  if (pages.length < 5) {
    console.warn('⚠️  WARNING: Less than 5 pages found. Expected at least 5.');
  }
  
  console.log(`📈 Summary:`);
  console.log(`   - Routes: ${pages.length}`);
  console.log(`   - Markdown: ${(fs.statSync(mdPath).size / 1024).toFixed(2)} KB`);
  console.log(`   - CSV: ${(fs.statSync(csvPath).size / 1024).toFixed(2)} KB`);
}

// Execute
try {
  main();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
