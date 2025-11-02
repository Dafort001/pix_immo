/**
 * Route Manifest Generator
 * 
 * Erstellt vollständiges routes_manifest.json mit:
 * - path, params, guards/flags, layout
 * - Orphan routes (nicht verlinkt)
 * - Guarded routes (nur mit Flag/Auth)
 * 
 * Output:
 * - /export/routes_manifest.json
 * - /docs/routes_manifest.md (Kurzreport)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const CLIENT_SRC = path.join(ROOT_DIR, 'client/src');
const EXPORT_DIR = path.join(ROOT_DIR, 'export');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

interface RouteManifest {
  path: string;
  params?: string[];
  requiresAuth?: boolean;
  requiresRole?: string;
  requiresFlag?: string;
  layout?: 'web' | 'app' | 'portal';
  file: string;
  component?: string;
  isOrphan?: boolean;
  linkedFrom?: string[];
}

interface ManifestOutput {
  generated: string;
  totalRoutes: number;
  stats: {
    publicRoutes: number;
    authRoutes: number;
    guardedRoutes: number;
    orphanRoutes: number;
    dynamicRoutes: number;
  };
  routes: RouteManifest[];
}

/**
 * Parse App.tsx to extract routes with actual import paths
 */
function parseAppRoutes(): RouteManifest[] {
  const appPath = path.join(CLIENT_SRC, 'App.tsx');
  
  if (!fs.existsSync(appPath)) {
    console.warn('⚠️  App.tsx not found');
    return [];
  }
  
  const content = fs.readFileSync(appPath, 'utf-8');
  const routes: RouteManifest[] = [];
  
  // First, extract imports to map component names to file paths
  // Match: import Component from '@/pages/filename' or './pages/filename'
  const importMap = new Map<string, string>();
  const importPattern = /import\s+(\w+)\s+from\s+["'](?:@\/|\.\/)?pages\/([^"']+)["']/g;
  const importMatches = [...content.matchAll(importPattern)];
  
  importMatches.forEach(match => {
    const componentName = match[1];
    const filePath = match[2]; // e.g., 'home' or 'portal/gallery-upload'
    importMap.set(componentName, `pages/${filePath}.tsx`);
  });
  
  // Match: <Route path="/path" component={Component} />
  const routePattern = /<Route\s+path=["']([^"']+)["'][^/>]*component=\{(\w+)\}/g;
  const matches = [...content.matchAll(routePattern)];
  
  matches.forEach(match => {
    const routePath = match[1];
    const component = match[2];
    
    // Determine layout from path
    let layout: 'web' | 'app' | 'portal' = 'web';
    if (routePath.startsWith('/app')) layout = 'app';
    else if (routePath.startsWith('/portal')) layout = 'portal';
    
    // Extract params
    const params: string[] = [];
    const paramMatches = routePath.matchAll(/:(\w+)/g);
    for (const pm of paramMatches) {
      params.push(pm[1]);
    }
    
    // Get actual file path from import map (fallback to lowercase conversion)
    const filePath = importMap.get(component) || `pages/${component.toLowerCase()}.tsx`;
    
    routes.push({
      path: routePath,
      params: params.length > 0 ? params : undefined,
      layout,
      file: filePath,
      component,
    });
  });
  
  return routes;
}

/**
 * Scan page files to find additional metadata
 */
function enrichRoutesMetadata(routes: RouteManifest[]): void {
  routes.forEach(route => {
    const filePath = path.join(CLIENT_SRC, route.file);
    
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for auth requirements
    if (content.includes('useAuth()') || content.includes('requireAuth')) {
      route.requiresAuth = true;
    }
    
    // Check for role requirements
    const roleMatch = content.match(/role\s*===\s*["'](\w+)["']/);
    if (roleMatch) {
      route.requiresRole = roleMatch[1];
    }
    
    // Check for feature flags
    const flagMatch = content.match(/flag\s*===\s*["'](\w+)["']|featureFlag\(["'](\w+)["']\)/);
    if (flagMatch) {
      route.requiresFlag = flagMatch[1] || flagMatch[2];
    }
  });
}

/**
 * Find orphan routes (not linked from anywhere)
 */
function findOrphanRoutes(routes: RouteManifest[]): void {
  // Scan all TSX files for Link components
  const allLinks = new Set<string>();
  
  function scanForLinks(dir: string): void {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory() && !['node_modules', '.git'].includes(item.name)) {
        scanForLinks(fullPath);
      } else if (item.isFile() && /\.tsx?$/.test(item.name)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Match: <Link to="/path">
        const linkMatches = content.matchAll(/<Link[^>]+to=["']([^"']+)["']/g);
        for (const match of linkMatches) {
          allLinks.add(match[1]);
        }
        
        // Match: useLocation() or navigate("/path")
        const navMatches = content.matchAll(/navigate\(["']([^"']+)["']\)/g);
        for (const match of navMatches) {
          allLinks.add(match[1]);
        }
      }
    }
  }
  
  scanForLinks(CLIENT_SRC);
  
  // Mark orphan routes
  routes.forEach(route => {
    // Normalize path (remove params)
    const normalizedPath = route.path.replace(/:\w+/g, '*');
    
    // Check if linked
    let isLinked = false;
    for (const link of allLinks) {
      // Exact match or wildcard match
      if (link === route.path || link.replace(/:\w+/g, '*') === normalizedPath) {
        isLinked = true;
        break;
      }
    }
    
    // Special routes are never orphans
    const specialRoutes = ['/', '/login', '/register', '/not-found'];
    if (specialRoutes.includes(route.path)) {
      isLinked = true;
    }
    
    route.isOrphan = !isLinked;
    
    // Find what links to this route
    if (isLinked) {
      route.linkedFrom = Array.from(allLinks).filter(link => 
        link === route.path || link.replace(/:\w+/g, '*') === normalizedPath
      );
    }
  });
}

/**
 * Generate manifest output
 */
function generateManifest(): ManifestOutput {
  console.log('🗺️  Routes Manifest Tool\n');
  console.log('📂 Parsing App.tsx...');
  
  const routes = parseAppRoutes();
  console.log(`   Found ${routes.length} routes`);
  
  console.log('🔍 Enriching metadata...');
  enrichRoutesMetadata(routes);
  
  console.log('🔗 Detecting orphan routes...');
  findOrphanRoutes(routes);
  
  // Calculate stats
  const stats = {
    publicRoutes: routes.filter((r: RouteManifest) => !r.requiresAuth).length,
    authRoutes: routes.filter((r: RouteManifest) => r.requiresAuth).length,
    guardedRoutes: routes.filter((r: RouteManifest) => r.requiresRole || r.requiresFlag).length,
    orphanRoutes: routes.filter((r: RouteManifest) => r.isOrphan).length,
    dynamicRoutes: routes.filter((r: RouteManifest) => r.params && r.params.length > 0).length,
  };
  
  return {
    generated: new Date().toISOString(),
    totalRoutes: routes.length,
    stats,
    routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
  };
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(manifest: ManifestOutput): string {
  const lines: string[] = [];
  
  lines.push('# Routes Manifest');
  lines.push('');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  
  lines.push('## Statistics');
  lines.push('');
  lines.push(`- **Total routes**: ${manifest.totalRoutes}`);
  lines.push(`- **Public routes**: ${manifest.stats.publicRoutes}`);
  lines.push(`- **Auth-required routes**: ${manifest.stats.authRoutes}`);
  lines.push(`- **Guarded routes** (role/flag): ${manifest.stats.guardedRoutes}`);
  lines.push(`- **Orphan routes** (not linked): ${manifest.stats.orphanRoutes}`);
  lines.push(`- **Dynamic routes** (with params): ${manifest.stats.dynamicRoutes}`);
  lines.push('');
  
  // Orphan routes
  if (manifest.stats.orphanRoutes > 0) {
    lines.push('## ⚠️ Orphan Routes');
    lines.push('');
    lines.push('Routes that are not linked from anywhere:');
    lines.push('');
    
    const orphans = manifest.routes.filter(r => r.isOrphan);
    orphans.forEach(route => {
      lines.push(`- **${route.path}** (${route.file})`);
    });
    lines.push('');
  }
  
  // Guarded routes
  const guarded = manifest.routes.filter(r => r.requiresAuth || r.requiresRole || r.requiresFlag);
  if (guarded.length > 0) {
    lines.push('## 🔒 Guarded Routes');
    lines.push('');
    lines.push('| Path | Auth | Role | Flag |');
    lines.push('|------|------|------|------|');
    
    guarded.forEach(route => {
      const auth = route.requiresAuth ? '✓' : '';
      const role = route.requiresRole || '';
      const flag = route.requiresFlag || '';
      lines.push(`| ${route.path} | ${auth} | ${role} | ${flag} |`);
    });
    lines.push('');
  }
  
  // Routes by layout
  lines.push('## Routes by Layout');
  lines.push('');
  
  ['web', 'app', 'portal'].forEach(layout => {
    const layoutRoutes = manifest.routes.filter(r => r.layout === layout);
    if (layoutRoutes.length > 0) {
      lines.push(`### ${layout.toUpperCase()} Layout (${layoutRoutes.length} routes)`);
      lines.push('');
      
      layoutRoutes.forEach(route => {
        const guards: string[] = [];
        if (route.requiresAuth) guards.push('🔐 Auth');
        if (route.requiresRole) guards.push(`👤 ${route.requiresRole}`);
        if (route.requiresFlag) guards.push(`🚩 ${route.requiresFlag}`);
        if (route.isOrphan) guards.push('⚠️ Orphan');
        
        const guardsStr = guards.length > 0 ? ` ${guards.join(' ')}` : '';
        lines.push(`- **${route.path}**${guardsStr}`);
      });
      lines.push('');
    }
  });
  
  // Dynamic routes
  const dynamic = manifest.routes.filter(r => r.params && r.params.length > 0);
  if (dynamic.length > 0) {
    lines.push('## Dynamic Routes');
    lines.push('');
    lines.push('| Path | Parameters |');
    lines.push('|------|------------|');
    
    dynamic.forEach(route => {
      const params = route.params!.join(', ');
      lines.push(`| ${route.path} | ${params} |`);
    });
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Main execution
 */
async function main() {
  // Ensure directories exist
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
  
  // Generate manifest
  const manifest = generateManifest();
  
  console.log('\n✅ Manifest complete\n');
  console.log('📊 Statistics:');
  console.log(`   - Total routes: ${manifest.totalRoutes}`);
  console.log(`   - Auth-required: ${manifest.stats.authRoutes}`);
  console.log(`   - Orphan routes: ${manifest.stats.orphanRoutes}`);
  console.log('');
  
  // Write JSON
  const jsonPath = path.join(EXPORT_DIR, 'routes_manifest.json');
  fs.writeFileSync(jsonPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`📄 Wrote: ${jsonPath}`);
  
  // Write markdown
  const mdContent = generateMarkdownReport(manifest);
  const mdPath = path.join(DOCS_DIR, 'routes_manifest.md');
  fs.writeFileSync(mdPath, mdContent, 'utf-8');
  console.log(`📄 Wrote: ${mdPath}`);
  
  console.log('\n✨ Done!');
}

// Execute
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
