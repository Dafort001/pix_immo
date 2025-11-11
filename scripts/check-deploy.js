#!/usr/bin/env node

/**
 * Check if build output is ready for deployment
 * Used in CI/CD to verify build success
 */

import fs from 'fs';
import path from 'path';

const distPath = path.resolve(process.cwd(), 'dist/public');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(distPath)) {
  console.error('❌ Build failed: dist/public directory missing');
  console.error('   Run: npm run build');
  process.exit(1);
}

if (!fs.existsSync(indexPath)) {
  console.error('❌ Build failed: dist/public/index.html missing');
  console.error('   Run: npm run build');
  process.exit(1);
}

// Check for _redirects and _headers
const redirectsPath = path.join(distPath, '_redirects');
const headersPath = path.join(distPath, '_headers');

if (!fs.existsSync(redirectsPath)) {
  console.warn('⚠️  Warning: _redirects file missing (SPA routing may fail)');
}

if (!fs.existsSync(headersPath)) {
  console.warn('⚠️  Warning: _headers file missing (cache headers missing)');
}

console.log('✅ Build OK:');
console.log(`   - index.html: ${fs.statSync(indexPath).size} bytes`);
console.log(`   - _redirects: ${fs.existsSync(redirectsPath) ? '✓' : '✗'}`);
console.log(`   - _headers: ${fs.existsSync(headersPath) ? '✓' : '✗'}`);
console.log('\nReady for deployment to Cloudflare Pages!');
