#!/usr/bin/env tsx
/**
 * HTML Export Script for Figma Design Reviews
 * 
 * Generates static HTML files of all pix.immo pages with inline CSS
 * for easy import into Figma for design reviews.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Target pages to export
const PAGES_TO_EXPORT = [
  // Public Pages
  { route: '/', filename: 'index_v1.html', title: 'pix.immo - Homepage' },
  { route: '/gallery', filename: 'gallery_v1.html', title: 'Gallery' },
  { route: '/preise', filename: 'pricing_v1.html', title: 'Pricing' },
  { route: '/buchen', filename: 'booking_v1.html', title: 'Booking' },
  { route: '/login', filename: 'login_v1.html', title: 'Login' },
  { route: '/kontakt-formular', filename: 'contact_v1.html', title: 'Contact' },
  
  // Portal Pages (Gallery Upload System)
  { route: '/portal/uploads', filename: 'portal_uploads_v1.html', title: 'Uploads Overview' },
  { route: '/portal/gallery-upload', filename: 'portal_gallery_upload_v1.html', title: 'Customer Upload' },
  { route: '/portal/gallery-photographer', filename: 'portal_photographer_v1.html', title: 'Photographer RAW Upload' },
  { route: '/portal/gallery-editing', filename: 'portal_editing_v1.html', title: 'Final Editing' },
  { route: '/portal/payment/1', filename: 'portal_payment_v1.html', title: 'Payment' },
  { route: '/portal/status/1', filename: 'portal_status_v1.html', title: 'Status Timeline' },
  { route: '/portal/delivery/1', filename: 'portal_delivery_v1.html', title: 'Delivery' },
  
  // Mobile App
  { route: '/app', filename: 'app_splash_v1.html', title: 'Mobile App - Splash' },
  { route: '/app/camera', filename: 'app_camera_v1.html', title: 'Mobile App - Camera' },
  { route: '/app/gallery', filename: 'app_gallery_v1.html', title: 'Mobile App - Gallery' },
  { route: '/app/upload', filename: 'app_upload_v1.html', title: 'Mobile App - Upload' },
  
  // Additional Pages
  { route: '/dashboard', filename: 'dashboard_v1.html', title: 'Dashboard' },
  { route: '/order', filename: 'order_v1.html', title: 'Order Form' },
];

const OUTPUT_DIR = path.join(__dirname, '../design/html');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read Tailwind CSS from build output
const getStyles = (): string => {
  // In production build, CSS is in dist/assets/
  // For dev export, we'll inline critical Tailwind base
  return `
    /* Tailwind CSS Base */
    *, ::before, ::after {
      box-sizing: border-box;
      border-width: 0;
      border-style: solid;
      border-color: #e5e7eb;
    }
    
    html { line-height: 1.5; -webkit-text-size-adjust: 100%; tab-size: 4; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    body { margin: 0; line-height: inherit; }
    
    /* Brand Colors - Sage & Clay v3 */
    :root {
      --sage-dark: #4A5849;
      --ui-sage: #6E7E6B;
      --copper: #A85B2E;
      --copper-dark: #8F4C28;
      --neutral-white: #FAFAFA;
      --pure-white: #FFFFFF;
      --border-gray: #E5E5E5;
    }
    
    /* Utility Classes */
    .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-4 { gap: 1rem; }
    .p-4 { padding: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .bg-sage-dark { background-color: var(--sage-dark); }
    .bg-copper { background-color: var(--copper); }
    .text-white { color: white; }
    .text-sage-dark { color: var(--sage-dark); }
    .rounded { border-radius: 0.375rem; }
    .shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
    
    button {
      cursor: pointer;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    button:hover {
      opacity: 0.9;
    }
  `;
};

// Generate HTML template
const generateHTML = (page: typeof PAGES_TO_EXPORT[0], content: string): string => {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title} - pix.immo</title>
  <style>
    ${getStyles()}
    
    /* Page-specific placeholder styles */
    .page-container {
      min-height: 100vh;
      background-color: var(--neutral-white);
    }
    
    .header {
      background-color: var(--sage-dark);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .main-content {
      padding: 2rem 0;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .button-primary {
      background-color: var(--copper);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
    
    .button-secondary {
      background-color: var(--ui-sage);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      border: none;
      cursor: pointer;
    }
    
    input, textarea, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-gray);
      border-radius: 0.375rem;
      margin-bottom: 1rem;
    }
    
    .grid {
      display: grid;
      gap: 1rem;
    }
    
    .grid-cols-2 {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .grid-cols-3 {
      grid-template-columns: repeat(3, 1fr);
    }
    
    @media (max-width: 768px) {
      .grid-cols-2, .grid-cols-3 {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="flex items-center justify-between">
          <h1 style="margin: 0; font-size: 1.5rem;">pix.immo</h1>
          <nav class="flex gap-4">
            <a href="/" style="color: white; text-decoration: none;">Home</a>
            <a href="/gallery" style="color: white; text-decoration: none;">Gallery</a>
            <a href="/preise" style="color: white; text-decoration: none;">Pricing</a>
            <a href="/buchen" style="color: white; text-decoration: none;">Booking</a>
            <a href="/login" style="color: white; text-decoration: none;">Login</a>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      ${content}
    </main>
  </div>
  
  <!-- Static HTML Export for Figma Review -->
  <!-- Generated: ${new Date().toISOString()} -->
  <!-- Route: ${page.route} -->
  <!-- Version: v1 -->
</body>
</html>`;
};

// Generate page-specific content placeholders
const generatePageContent = (route: string): string => {
  // Homepage
  if (route === '/') {
    return `
      <div class="container">
        <div class="card">
          <h1>Willkommen bei pix.immo</h1>
          <p>Professional Real Estate Photography</p>
          <div class="flex gap-4" style="margin-top: 1.5rem;">
            <button class="button-primary">Jetzt buchen</button>
            <button class="button-secondary">Mehr erfahren</button>
          </div>
        </div>
        
        <div class="grid grid-cols-3" style="margin-top: 2rem;">
          <div class="card">
            <h3>📷 Fotografie</h3>
            <p>Professionelle Immobilienfotografie</p>
          </div>
          <div class="card">
            <h3>🚁 Drohne</h3>
            <p>Luftaufnahmen und Videos</p>
          </div>
          <div class="card">
            <h3>🎥 Video</h3>
            <p>Immobilienvideos und 360° Tours</p>
          </div>
        </div>
      </div>
    `;
  }
  
  // Gallery
  if (route === '/gallery') {
    return `
      <div class="container">
        <h1>Gallery</h1>
        <div class="grid grid-cols-3">
          ${Array.from({ length: 9 }, (_, i) => `
            <div class="card">
              <div style="background: #ddd; height: 200px; border-radius: 0.375rem; margin-bottom: 0.5rem;"></div>
              <p>Image ${i + 1}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Booking
  if (route === '/buchen') {
    return `
      <div class="container">
        <div class="card">
          <h1>Termin buchen</h1>
          <form>
            <label>Name</label>
            <input type="text" placeholder="Ihr Name" />
            
            <label>Email</label>
            <input type="email" placeholder="ihre@email.de" />
            
            <label>Objektadresse</label>
            <input type="text" placeholder="Straße, PLZ, Ort" />
            
            <label>Termin</label>
            <input type="date" />
            
            <label>Service</label>
            <select>
              <option>Fotografie</option>
              <option>Fotografie + Drohne</option>
              <option>Komplettpaket</option>
            </select>
            
            <button type="submit" class="button-primary" style="width: 100%; margin-top: 1rem;">
              Buchung absenden
            </button>
          </form>
        </div>
      </div>
    `;
  }
  
  // Login
  if (route === '/login') {
    return `
      <div class="container" style="max-width: 400px;">
        <div class="card">
          <h1>Login</h1>
          <form>
            <label>Email</label>
            <input type="email" placeholder="ihre@email.de" />
            
            <label>Passwort</label>
            <input type="password" placeholder="••••••••" />
            
            <button type="submit" class="button-primary" style="width: 100%; margin-top: 1rem;">
              Anmelden
            </button>
          </form>
          <p style="margin-top: 1rem; text-align: center;">
            <a href="/register" style="color: var(--copper);">Noch kein Konto? Registrieren</a>
          </p>
        </div>
      </div>
    `;
  }
  
  // Portal - Gallery Upload
  if (route === '/portal/gallery-upload') {
    return `
      <div class="container">
        <h1>Customer Upload - Bilder hochladen</h1>
        <div class="card">
          <div style="border: 2px dashed var(--border-gray); padding: 3rem; text-align: center; border-radius: 0.5rem;">
            <p style="font-size: 3rem;">📤</p>
            <h3>Dateien hier ablegen</h3>
            <p>oder</p>
            <button class="button-primary">Dateien auswählen</button>
            <p style="margin-top: 1rem; color: #666; font-size: 0.875rem;">
              JPEG, PNG, HEIC bis 50 MB
            </p>
          </div>
        </div>
        
        <div class="card" style="margin-top: 1.5rem;">
          <h3>Hochgeladene Dateien (3)</h3>
          <div class="grid grid-cols-3">
            ${Array.from({ length: 3 }, (_, i) => `
              <div style="position: relative;">
                <div style="background: #ddd; height: 150px; border-radius: 0.375rem;"></div>
                <p>image_${i + 1}.jpg</p>
              </div>
            `).join('')}
          </div>
          <button class="button-primary" style="margin-top: 1rem; width: 100%;">
            Upload abschließen
          </button>
        </div>
      </div>
    `;
  }
  
  // Portal - Payment
  if (route.includes('/portal/payment')) {
    return `
      <div class="container">
        <h1>Zahlung</h1>
        <div class="grid grid-cols-2">
          <div class="card">
            <h2>Bestellübersicht</h2>
            <div style="margin: 1rem 0;">
              <div class="flex justify-between" style="margin-bottom: 0.5rem;">
                <span>Fotografie Paket</span>
                <span>€ 299,00</span>
              </div>
              <div class="flex justify-between" style="margin-bottom: 0.5rem;">
                <span>Drohnenaufnahmen</span>
                <span>€ 149,00</span>
              </div>
              <div class="flex justify-between" style="margin-bottom: 0.5rem;">
                <span>Bildbearbeitung (15 Bilder)</span>
                <span>€ 90,00</span>
              </div>
              <hr style="margin: 1rem 0;" />
              <div class="flex justify-between" style="font-weight: bold; font-size: 1.25rem;">
                <span>Gesamt</span>
                <span>€ 538,00</span>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h2>Zahlungsmethode</h2>
            <div style="background: #f9f9f9; padding: 2rem; border-radius: 0.5rem; text-align: center;">
              <p style="font-size: 2rem;">💳</p>
              <p>Stripe Checkout</p>
            </div>
            <button class="button-primary" style="width: 100%; margin-top: 1.5rem;">
              Zur Zahlung
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  // Mobile App - Camera
  if (route === '/app/camera') {
    return `
      <div style="max-width: 375px; margin: 0 auto; background: black; min-height: 100vh; position: relative;">
        <!-- StatusBar -->
        <div style="background: rgba(0,0,0,0.8); color: white; padding: 0.5rem 1rem; display: flex; justify-content: space-between;">
          <span>9:41</span>
          <span>📶 📡 🔋</span>
        </div>
        
        <!-- Camera Preview -->
        <div style="background: #333; height: 500px; position: relative;">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center;">
            <p style="font-size: 3rem;">📷</p>
            <p>Camera Preview</p>
          </div>
        </div>
        
        <!-- Controls -->
        <div style="background: rgba(0,0,0,0.9); padding: 2rem; text-align: center;">
          <div style="display: flex; justify-content: space-around; align-items: center;">
            <button style="background: white; color: black; border-radius: 50%; width: 50px; height: 50px;">
              🔄
            </button>
            <button style="background: white; border-radius: 50%; width: 70px; height: 70px; border: 3px solid #ccc;">
              ⚫
            </button>
            <button style="background: white; color: black; border-radius: 50%; width: 50px; height: 50px;">
              ⚡
            </button>
          </div>
        </div>
        
        <!-- Bottom Nav -->
        <div style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); padding: 0.5rem; display: flex; justify-content: space-around;">
          <div style="text-align: center;">
            <span style="font-size: 1.5rem;">📷</span>
            <p style="margin: 0; font-size: 0.75rem;">Camera</p>
          </div>
          <div style="text-align: center;">
            <span style="font-size: 1.5rem;">🖼️</span>
            <p style="margin: 0; font-size: 0.75rem;">Gallery</p>
          </div>
          <div style="text-align: center;">
            <span style="font-size: 1.5rem;">📤</span>
            <p style="margin: 0; font-size: 0.75rem;">Upload</p>
          </div>
        </div>
      </div>
    `;
  }
  
  // Default placeholder
  return `
    <div class="container">
      <div class="card">
        <h1>Page: ${route}</h1>
        <p>Placeholder content for design review</p>
        <p style="color: #666; font-size: 0.875rem;">
          This is a static HTML export for Figma import. Actual implementation uses React components.
        </p>
      </div>
    </div>
  `;
};

// Main export function
const exportPages = () => {
  console.log('🎨 Starting HTML export for Figma review...\n');
  
  let exportedCount = 0;
  
  for (const page of PAGES_TO_EXPORT) {
    const content = generatePageContent(page.route);
    const html = generateHTML(page, content);
    const outputPath = path.join(OUTPUT_DIR, page.filename);
    
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`✅ Exported: ${page.filename} (${page.title})`);
    exportedCount++;
  }
  
  // Generate index file
  const indexHTML = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>pix.immo - HTML Exports Index</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
    h1 { color: #4A5849; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    .card { background: white; border: 1px solid #e5e5e5; border-radius: 0.5rem; padding: 1.5rem; }
    .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    a { color: #A85B2E; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
    .badge { display: inline-block; background: #e5e7eb; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; margin-right: 0.5rem; }
  </style>
</head>
<body>
  <h1>📱 pix.immo - HTML Exports for Figma</h1>
  <p>Generated: ${new Date().toLocaleString('de-DE')}</p>
  <p>Total exports: <strong>${exportedCount}</strong></p>
  
  <h2>Public Pages</h2>
  <div class="grid">
    <div class="card">
      <h3><a href="./index_v1.html">Homepage</a></h3>
      <span class="badge">v1</span>
      <p>Main landing page</p>
    </div>
    <div class="card">
      <h3><a href="./gallery_v1.html">Gallery</a></h3>
      <span class="badge">v1</span>
      <p>Public gallery view</p>
    </div>
    <div class="card">
      <h3><a href="./pricing_v1.html">Pricing</a></h3>
      <span class="badge">v1</span>
      <p>Service pricing page</p>
    </div>
    <div class="card">
      <h3><a href="./booking_v1.html">Booking</a></h3>
      <span class="badge">v1</span>
      <p>Booking form</p>
    </div>
    <div class="card">
      <h3><a href="./login_v1.html">Login</a></h3>
      <span class="badge">v1</span>
      <p>User login page</p>
    </div>
    <div class="card">
      <h3><a href="./contact_v1.html">Contact</a></h3>
      <span class="badge">v1</span>
      <p>Contact form</p>
    </div>
  </div>
  
  <h2>Portal Pages (Gallery Upload System V1.0)</h2>
  <div class="grid">
    <div class="card">
      <h3><a href="./portal_uploads_v1.html">Uploads Overview</a></h3>
      <span class="badge">v1</span>
      <p>Job list and status tracking</p>
    </div>
    <div class="card">
      <h3><a href="./portal_gallery_upload_v1.html">Customer Upload</a></h3>
      <span class="badge">v1</span>
      <p>Client image upload interface</p>
    </div>
    <div class="card">
      <h3><a href="./portal_photographer_v1.html">Photographer RAW</a></h3>
      <span class="badge">v1</span>
      <p>RAW file upload (13 formats)</p>
    </div>
    <div class="card">
      <h3><a href="./portal_editing_v1.html">Final Editing</a></h3>
      <span class="badge">v1</span>
      <p>Edited images with presets</p>
    </div>
    <div class="card">
      <h3><a href="./portal_payment_v1.html">Payment</a></h3>
      <span class="badge">v1</span>
      <p>Stripe checkout integration</p>
    </div>
    <div class="card">
      <h3><a href="./portal_status_v1.html">Status Timeline</a></h3>
      <span class="badge">v1</span>
      <p>5-step progress tracker</p>
    </div>
    <div class="card">
      <h3><a href="./portal_delivery_v1.html">Delivery</a></h3>
      <span class="badge">v1</span>
      <p>Download packages</p>
    </div>
  </div>
  
  <h2>Mobile App (PWA)</h2>
  <div class="grid">
    <div class="card">
      <h3><a href="./app_splash_v1.html">Splash Screen</a></h3>
      <span class="badge">v1</span>
      <p>App landing page</p>
    </div>
    <div class="card">
      <h3><a href="./app_camera_v1.html">Camera</a></h3>
      <span class="badge">v1</span>
      <p>iOS-style camera interface</p>
    </div>
    <div class="card">
      <h3><a href="./app_gallery_v1.html">Gallery</a></h3>
      <span class="badge">v1</span>
      <p>Photo review grid</p>
    </div>
    <div class="card">
      <h3><a href="./app_upload_v1.html">Upload</a></h3>
      <span class="badge">v1</span>
      <p>Upload progress tracking</p>
    </div>
  </div>
  
  <h2>Additional Pages</h2>
  <div class="grid">
    <div class="card">
      <h3><a href="./dashboard_v1.html">Dashboard</a></h3>
      <span class="badge">v1</span>
      <p>User dashboard</p>
    </div>
    <div class="card">
      <h3><a href="./order_v1.html">Order Form</a></h3>
      <span class="badge">v1</span>
      <p>Order creation form</p>
    </div>
  </div>
  
  <hr style="margin: 2rem 0;" />
  <p style="color: #666; font-size: 0.875rem;">
    <strong>Usage:</strong> Open these HTML files in Figma via "File → Import" or paste GitHub raw URLs.
    <br>
    <strong>GitHub URL Pattern:</strong> <code>https://raw.githubusercontent.com/Dafort001/EstateSandbox/main/design/html/[filename]</code>
  </p>
</body>
</html>`;
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHTML, 'utf-8');
  console.log(`✅ Exported: index.html (Navigation)\n`);
  
  console.log(`🎉 Export complete! ${exportedCount + 1} files created in design/html/`);
  console.log(`\n📂 Open: design/html/index.html to browse all exports`);
};

// Run export
exportPages();
