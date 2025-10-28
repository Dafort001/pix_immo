#!/usr/bin/env node
/**
 * Auto-Screenshots Tool (Puppeteer)
 * Generates screenshots of all pages at 3 breakpoints
 */

import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

interface RouteConfig {
  path: string;
  component: string;
  requiresAuth?: boolean;
}

const APP_TSX = path.join(process.cwd(), 'client', 'src', 'App.tsx');
const EXPORT_DIR = path.join(process.cwd(), 'export', 'screens');
const BASE_URL = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : 'http://localhost:5000';

// Breakpoints for responsive screenshots
const BREAKPOINTS = [
  { name: 'mobile', width: 390, height: 844 },   // iPhone 12 Pro
  { name: 'tablet', width: 768, height: 1024 },  // iPad
  { name: 'desktop', width: 1280, height: 800 }, // Desktop
];

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

/**
 * Parse routes from App.tsx
 */
function parseRoutes(): RouteConfig[] {
  const routes: RouteConfig[] = [];
  
  if (!fs.existsSync(APP_TSX)) {
    console.warn(`⚠️  App.tsx not found at ${APP_TSX}`);
    return routes;
  }

  const content = fs.readFileSync(APP_TSX, 'utf-8');
  
  // Match: <Route path="/foo" component={Bar} />
  const routeRegex = /<Route\s+path="([^"]+)"\s+component=\{(\w+)\}\s*\/>/g;
  let match;
  
  while ((match = routeRegex.exec(content)) !== null) {
    const routePath = match[1];
    const component = match[2];
    
    // Skip dynamic routes for automated screenshots
    if (routePath.includes(':')) {
      console.log(`⏭️  Skipping dynamic route: ${routePath}`);
      continue;
    }
    
    // Detect auth-required routes
    const requiresAuth = component.toLowerCase().includes('portal') ||
                        component.toLowerCase().includes('admin') ||
                        component.toLowerCase().includes('dashboard');
    
    routes.push({
      path: routePath,
      component,
      requiresAuth,
    });
  }
  
  return routes;
}

/**
 * Generate safe filename from route path
 */
function sanitizeRoutePath(routePath: string): string {
  return routePath
    .replace(/\//g, '_')
    .replace(/:/g, '_')
    .replace(/\?/g, '_')
    .replace(/\*/g, '_all')
    || 'root';
}

interface BreakpointResult {
  breakpoint: string;
  success: boolean;
  error?: string;
}

/**
 * Take screenshots for a single route
 * CRITICAL: Viewport must be set BEFORE navigation for correct responsive rendering
 * Returns structured results per breakpoint
 */
async function captureRoute(
  page: any,
  route: RouteConfig,
  auditMode: boolean = false
): Promise<BreakpointResult[]> {
  const safeName = sanitizeRoutePath(route.path);
  
  // Build URL with optional audit flag
  let url = `${BASE_URL}${route.path}`;
  if (auditMode) {
    url += (url.includes('?') ? '&' : '?') + '__audit=1';
  }
  
  console.log(`📸 Capturing: ${route.path}`);
  
  const results: BreakpointResult[] = [];
  
  // Take screenshots at each breakpoint
  // IMPORTANT: Load page separately for each breakpoint to ensure correct responsive rendering
  for (const bp of BREAKPOINTS) {
    try {
      // Set viewport BEFORE navigation
      await page.setViewport({
        width: bp.width,
        height: bp.height,
      });
      
      // Navigate to page with viewport already set
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 10000,
      });
      
      // Wait for content to fully render
      await page.waitForTimeout(1000);
      
      const filename = `${safeName}-${bp.name}.png`;
      const filepath = path.join(EXPORT_DIR, filename);
      
      await page.screenshot({
        path: filepath,
        fullPage: false, // Viewport only
      });
      
      console.log(`  ✓ ${bp.name} (${bp.width}×${bp.height})`);
      results.push({ breakpoint: bp.name, success: true });
    } catch (error) {
      const errorMsg = `${error.message}`;
      console.error(`  ❌ ${bp.name}: ${errorMsg}`);
      results.push({ breakpoint: bp.name, success: false, error: errorMsg });
    }
  }
  
  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('📸 Auto-Screenshots Tool (Puppeteer)\n');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📊 Breakpoints: ${BREAKPOINTS.map(b => b.name).join(', ')}\n`);
  
  // Parse routes
  const routes = parseRoutes();
  console.log(`✅ Found ${routes.length} routes (excluding dynamic routes)\n`);
  
  if (routes.length === 0) {
    console.log('⚠️  No routes to capture');
    return;
  }
  
  // Launch browser
  console.log('🚀 Launching headless browser (Puppeteer)...\n');
  const browser = await puppeteer.launch({
    headless: 'shell', // Use new headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  
  const page = await browser.newPage();
  
  // Set user agent
  await page.setUserAgent('Mozilla/5.0 (compatible; PageScreenshotBot/1.0; Puppeteer)');
  
  let totalScreenshots = 0;
  let totalFailures = 0;
  let routesWithPartialFailures = 0;
  let routesFullySuccessful = 0;
  let routesFullyFailed = 0;
  
  // Process each route
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    
    // Skip auth-required routes (documented limitation)
    if (route.requiresAuth) {
      console.log(`⏭️  Skipping auth-required route: ${route.path} (login wall)`);
      continue;
    }
    
    // Capture with structured results
    const results = await captureRoute(page, route, true);
    
    // Count successes and failures per breakpoint
    const successfulBreakpoints = results.filter(r => r.success).length;
    const failedBreakpoints = results.filter(r => !r.success).length;
    
    totalScreenshots += successfulBreakpoints;
    totalFailures += failedBreakpoints;
    
    if (successfulBreakpoints === BREAKPOINTS.length) {
      routesFullySuccessful++;
    } else if (successfulBreakpoints === 0) {
      routesFullyFailed++;
      console.error(`❌ Route completely failed: ${route.path}`);
    } else {
      routesWithPartialFailures++;
      console.warn(`⚠️  Route partially failed: ${route.path} (${successfulBreakpoints}/${BREAKPOINTS.length} breakpoints)`);
    }
    
    // Progress indicator
    if ((i + 1) % 5 === 0) {
      console.log(`\n📈 Progress: ${i + 1}/${routes.length} routes...\n`);
    }
  }
  
  // Cleanup
  await browser.close();
  
  // Summary
  console.log(`\n✨ Done!\n`);
  console.log(`📈 Summary:`);
  console.log(`   - Screenshots captured: ${totalScreenshots}/${routes.length * BREAKPOINTS.length}`);
  console.log(`   - Routes fully successful: ${routesFullySuccessful}/${routes.length}`);
  console.log(`   - Routes with partial failures: ${routesWithPartialFailures} (some breakpoints failed)`);
  console.log(`   - Routes completely failed: ${routesFullyFailed}`);
  console.log(`   - Total breakpoint failures: ${totalFailures}`);
  console.log(`   - Output: ${EXPORT_DIR}`);
  console.log(`\n⚠️  Auth-required routes skipped: Use local testing with session cookies`);
  console.log(`\n💡 View screenshots:`);
  console.log(`   ls -lh ${EXPORT_DIR}/*.png | head -10`);
}

// Execute
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
