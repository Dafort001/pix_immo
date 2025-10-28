#!/usr/bin/env node
/**
 * Auto-Screenshots MOCK Tool (Smoke Test)
 * Generates dummy PNGs to demonstrate file structure
 * 
 * NOTE: Real screenshots require Puppeteer/Playwright with system dependencies
 * that are not available on Replit by default. This mock tool generates
 * placeholder files to verify the export structure works correctly.
 */

import * as fs from 'fs';
import * as path from 'path';

const EXPORT_DIR = path.join(process.cwd(), 'export', 'screens');
const BREAKPOINTS = ['mobile', 'tablet', 'desktop'];
const TEST_ROUTES = ['/', '/about', '/galerie'];

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

function sanitizeRoutePath(routePath: string): string {
  return routePath.replace(/\//g, '_').replace(/:/g, '_') || 'root';
}

// Minimal 1x1 PNG (Base64 encoded)
const MINIMAL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

function createMockScreenshot(route: string, breakpoint: string): void {
  const safeName = sanitizeRoutePath(route);
  const filename = `${safeName}-${breakpoint}.png`;
  const filepath = path.join(EXPORT_DIR, filename);
  
  fs.writeFileSync(filepath, MINIMAL_PNG);
  console.log(`  ✓ ${breakpoint} (mock)`);
}

function main() {
  console.log('📸 Auto-Screenshots MOCK Tool (Smoke Test)\n');
  console.log('⚠️  Note: This is a MOCK tool that generates dummy PNGs');
  console.log('   Real screenshots require Puppeteer/Playwright with system dependencies\n');
  
  console.log(`📊 Routes: ${TEST_ROUTES.join(', ')}\n`);
  
  TEST_ROUTES.forEach(route => {
    console.log(`📸 Creating mock screenshots: ${route}`);
    BREAKPOINTS.forEach(bp => {
      createMockScreenshot(route, bp);
    });
  });
  
  const totalFiles = TEST_ROUTES.length * BREAKPOINTS.length;
  
  console.log(`\n✨ Mock Test Complete!`);
  console.log(`📸 Generated: ${totalFiles} mock screenshots`);
  console.log(`📁 Location: ${EXPORT_DIR}`);
  console.log(`\n💡 To use real screenshots on a local machine:`);
  console.log(`   1. Install system dependencies`);
  console.log(`   2. Run: tsx tools/page-screenshots.ts`);
}

main();
