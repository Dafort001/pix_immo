#!/usr/bin/env node
/**
 * Auto-Screenshots Tool (SMOKE TEST - First 3 Routes Only) - Puppeteer
 */

import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

const EXPORT_DIR = path.join(process.cwd(), 'export', 'screens');
const BASE_URL = 'http://localhost:5000';

const BREAKPOINTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

const TEST_ROUTES = ['/', '/about', '/galerie'];

if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

function sanitizeRoutePath(routePath: string): string {
  return routePath.replace(/\//g, '_').replace(/:/g, '_') || 'root';
}

async function captureRoute(page: any, route: string): Promise<void> {
  const safeName = sanitizeRoutePath(route);
  const url = `${BASE_URL}${route}`;
  
  console.log(`📸 Capturing: ${route}`);
  
  // Capture each breakpoint with viewport set BEFORE navigation
  for (const bp of BREAKPOINTS) {
    try {
      // Set viewport BEFORE navigation
      await page.setViewport({ width: bp.width, height: bp.height });
      
      // Navigate with viewport already set
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 10000,
      });
      
      await page.waitForTimeout(1000);
      
      const filename = `${safeName}-${bp.name}.png`;
      const filepath = path.join(EXPORT_DIR, filename);
      
      await page.screenshot({
        path: filepath,
        fullPage: false,
      });
      
      console.log(`  ✓ ${bp.name} (${bp.width}×${bp.height})`);
    } catch (error) {
      console.error(`  ❌ ${bp.name}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('📸 Auto-Screenshots SMOKE TEST (Puppeteer)\n');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📊 Routes: ${TEST_ROUTES.join(', ')}\n`);
  
  const browser = await puppeteer.launch({
    headless: 'shell',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  
  const page = await browser.newPage();
  
  for (const route of TEST_ROUTES) {
    await captureRoute(page, route);
  }
  
  await browser.close();
  
  console.log(`\n✨ Smoke Test Complete!`);
  console.log(`📸 Generated: ${TEST_ROUTES.length * BREAKPOINTS.length} screenshots`);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
