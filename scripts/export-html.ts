#!/usr/bin/env tsx
/**
 * HTML Export Script for Figma Design Reviews
 * 
 * Generates static HTML files of ALL pix.immo pages with inline CSS
 * for easy import into Figma for design reviews.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ALL pages from App.tsx routes
const PAGES_TO_EXPORT = [
  // Public Pages
  { route: '/', filename: 'index_v1.html', title: 'Homepage' },
  { route: '/gallery', filename: 'gallery_v1.html', title: 'Gallery' },
  { route: '/blog', filename: 'blog_v1.html', title: 'Blog' },
  { route: '/blog/example', filename: 'blog_post_v1.html', title: 'Blog Post' },
  { route: '/preise', filename: 'pricing_v1.html', title: 'Pricing' },
  { route: '/preisliste', filename: 'preisliste_v1.html', title: 'Preisliste' },
  { route: '/buchen', filename: 'booking_v1.html', title: 'Booking' },
  { route: '/booking-confirmation', filename: 'booking_confirmation_v1.html', title: 'Booking Confirmation' },
  { route: '/galerie', filename: 'galerie_v1.html', title: 'Galerie' },
  { route: '/downloads', filename: 'downloads_v1.html', title: 'Downloads' },
  { route: '/about', filename: 'about_v1.html', title: 'About' },
  { route: '/faq', filename: 'faq_v1.html', title: 'FAQ' },
  
  // Auth & User
  { route: '/login', filename: 'login_v1.html', title: 'Login' },
  { route: '/register', filename: 'register_v1.html', title: 'Register' },
  { route: '/dashboard', filename: 'dashboard_v1.html', title: 'Dashboard' },
  
  // Contact & Legal
  { route: '/kontakt', filename: 'contact_v1.html', title: 'Contact' },
  { route: '/kontakt-formular', filename: 'contact_form_v1.html', title: 'Contact Form' },
  { route: '/impressum', filename: 'imprint_v1.html', title: 'Imprint' },
  { route: '/agb', filename: 'agb_v1.html', title: 'AGB' },
  { route: '/datenschutz', filename: 'datenschutz_v1.html', title: 'Datenschutz' },
  
  // Order & Jobs Management
  { route: '/order', filename: 'order_v1.html', title: 'Order Form' },
  { route: '/intake', filename: 'intake_v1.html', title: 'Intake' },
  { route: '/jobs', filename: 'jobs_v1.html', title: 'Jobs' },
  { route: '/review/1/1', filename: 'review_v1.html', title: 'Review' },
  
  // Upload & Processing
  { route: '/upload-raw', filename: 'upload_raw_v1.html', title: 'Upload RAW' },
  { route: '/ai-lab', filename: 'ai_lab_v1.html', title: 'AI Lab' },
  { route: '/gallery/classify/1', filename: 'gallery_classify_v1.html', title: 'Gallery Classify' },
  
  // Demo Pages
  { route: '/demo-upload', filename: 'demo_upload_v1.html', title: 'Demo Upload' },
  { route: '/demo-jobs', filename: 'demo_jobs_v1.html', title: 'Demo Jobs' },
  { route: '/job/1', filename: 'demo_job_detail_v1.html', title: 'Demo Job Detail' },
  
  // Documentation
  { route: '/docs/rooms-spec', filename: 'docs_rooms_spec_v1.html', title: 'Rooms Specification' },
  
  // Admin Pages
  { route: '/admin/editorial', filename: 'admin_editorial_v1.html', title: 'Admin Editorial' },
  { route: '/admin/seo', filename: 'admin_seo_v1.html', title: 'Admin SEO' },
  
  // Portal Pages (Gallery Upload System V1.0)
  { route: '/portal/uploads', filename: 'portal_uploads_v1.html', title: 'Portal - Uploads Overview' },
  { route: '/portal/job/1', filename: 'portal_gallery_selection_v1.html', title: 'Portal - Gallery Selection' },
  { route: '/portal/payment/1', filename: 'portal_payment_v1.html', title: 'Portal - Payment' },
  { route: '/portal/status/1', filename: 'portal_status_v1.html', title: 'Portal - Status Timeline' },
  { route: '/portal/delivery/1', filename: 'portal_delivery_v1.html', title: 'Portal - Delivery' },
  { route: '/portal/gallery-upload', filename: 'portal_gallery_upload_v1.html', title: 'Portal - Customer Upload' },
  { route: '/portal/gallery-photographer', filename: 'portal_photographer_v1.html', title: 'Portal - Photographer RAW' },
  { route: '/portal/gallery-editing', filename: 'portal_editing_v1.html', title: 'Portal - Final Editing' },
  
  // Mobile App - Legacy Capture Routes (PWA v1)
  { route: '/capture', filename: 'capture_index_v1.html', title: 'Capture - Index' },
  { route: '/capture/camera', filename: 'capture_camera_v1.html', title: 'Capture - Camera' },
  { route: '/capture/review', filename: 'capture_review_v1.html', title: 'Capture - Review' },
  { route: '/capture/upload', filename: 'capture_upload_v1.html', title: 'Capture - Upload' },
  
  // Mobile App - New App Routes (PWA v2)
  { route: '/app', filename: 'app_splash_v1.html', title: 'App - Splash' },
  { route: '/app/camera', filename: 'app_camera_v1.html', title: 'App - Camera' },
  { route: '/app/gallery', filename: 'app_gallery_v1.html', title: 'App - Gallery' },
  { route: '/app/upload', filename: 'app_upload_v1.html', title: 'App - Upload' },
  
  // Debug
  { route: '/test', filename: 'test_debug_v1.html', title: 'Test Debug' },
];

const OUTPUT_DIR = path.join(__dirname, '../design/html');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const getStyles = (): string => {
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
    
    button:hover { opacity: 0.9; }
  `;
};

const generateHTML = (page: typeof PAGES_TO_EXPORT[0], content: string): string => {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title} - pix.immo</title>
  <style>
    ${getStyles()}
    
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
    
    .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
    
    @media (max-width: 768px) {
      .grid-cols-2, .grid-cols-3 {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">
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

    <main class="main-content">
      ${content}
    </main>
  </div>
  
  <!-- Generated: ${new Date().toISOString()} -->
  <!-- Route: ${page.route} -->
</body>
</html>`;
};

const generatePageContent = (route: string): string => {
  // Return simple placeholder for all pages
  return `
    <div class="container">
      <div class="card">
        <h1>${route}</h1>
        <p>Placeholder für Figma Design Review</p>
        <div style="background: #f5f5f5; padding: 2rem; border-radius: 0.5rem; margin-top: 1rem;">
          <p style="color: #666; text-align: center;">📄 Statischer HTML Export</p>
        </div>
      </div>
    </div>
  `;
};

const exportPages = () => {
  console.log('🎨 Starting HTML export for ALL pages...\n');
  
  let exportedCount = 0;
  
  for (const page of PAGES_TO_EXPORT) {
    const content = generatePageContent(page.route);
    const html = generateHTML(page, content);
    const outputPath = path.join(OUTPUT_DIR, page.filename);
    
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`✅ ${page.filename.padEnd(40)} (${page.title})`);
    exportedCount++;
  }
  
  // Generate index
  const categories = {
    public: PAGES_TO_EXPORT.filter(p => 
      !p.route.startsWith('/portal') && 
      !p.route.startsWith('/app') && 
      !p.route.startsWith('/capture') && 
      !p.route.startsWith('/admin') &&
      !p.route.startsWith('/demo') &&
      !p.route.startsWith('/docs') &&
      !p.route.includes('/job/') &&
      p.route !== '/test'
    ),
    portal: PAGES_TO_EXPORT.filter(p => p.route.startsWith('/portal')),
    app: PAGES_TO_EXPORT.filter(p => p.route.startsWith('/app')),
    capture: PAGES_TO_EXPORT.filter(p => p.route.startsWith('/capture')),
    admin: PAGES_TO_EXPORT.filter(p => p.route.startsWith('/admin')),
    demo: PAGES_TO_EXPORT.filter(p => p.route.startsWith('/demo') || p.route.includes('/job/')),
    other: PAGES_TO_EXPORT.filter(p => p.route === '/test' || p.route.startsWith('/docs'))
  };
  
  const indexHTML = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>pix.immo - HTML Exports Index</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 1400px; margin: 2rem auto; padding: 0 1rem; background: #fafafa; }
    h1 { color: #4A5849; }
    h2 { color: #6E7E6B; margin-top: 2rem; }
    .stats { background: white; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { background: white; border: 1px solid #e5e5e5; border-radius: 0.5rem; padding: 1rem; transition: all 0.2s; }
    .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .card h3 { margin: 0 0 0.5rem 0; font-size: 1rem; }
    .card p { margin: 0; font-size: 0.875rem; color: #666; }
    a { color: #A85B2E; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
    .badge { display: inline-block; background: #e5e7eb; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; margin-right: 0.5rem; }
    .count { background: #A85B2E; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>📱 pix.immo - Alle HTML Exports für Figma</h1>
  
  <div class="stats">
    <p><strong>Generiert:</strong> ${new Date().toLocaleString('de-DE')}</p>
    <p><strong>Gesamt:</strong> <span class="count">${exportedCount}</span> Seiten exportiert</p>
  </div>
  
  <h2>Public Pages <span class="count">${categories.public.length}</span></h2>
  <div class="grid">
    ${categories.public.map(p => `
      <div class="card">
        <h3><a href="./${p.filename}">${p.title}</a></h3>
        <p>${p.route}</p>
      </div>
    `).join('')}
  </div>
  
  <h2>Portal Pages (Gallery System V1.0) <span class="count">${categories.portal.length}</span></h2>
  <div class="grid">
    ${categories.portal.map(p => `
      <div class="card">
        <h3><a href="./${p.filename}">${p.title}</a></h3>
        <p>${p.route}</p>
      </div>
    `).join('')}
  </div>
  
  <h2>Mobile App - New (/app/*) <span class="count">${categories.app.length}</span></h2>
  <div class="grid">
    ${categories.app.map(p => `
      <div class="card">
        <h3><a href="./${p.filename}">${p.title}</a></h3>
        <p>${p.route}</p>
      </div>
    `).join('')}
  </div>
  
  <h2>Mobile App - Legacy (/capture/*) <span class="count">${categories.capture.length}</span></h2>
  <div class="grid">
    ${categories.capture.map(p => `
      <div class="card">
        <h3><a href="./${p.filename}">${p.title}</a></h3>
        <p>${p.route}</p>
      </div>
    `).join('')}
  </div>
  
  <h2>Admin Pages <span class="count">${categories.admin.length}</span></h2>
  <div class="grid">
    ${categories.admin.map(p => `
      <div class="card">
        <h3><a href="./${p.filename}">${p.title}</a></h3>
        <p>${p.route}</p>
      </div>
    `).join('')}
  </div>
  
  <h2>Demo & Testing <span class="count">${categories.demo.length + categories.other.length}</span></h2>
  <div class="grid">
    ${[...categories.demo, ...categories.other].map(p => `
      <div class="card">
        <h3><a href="./${p.filename}">${p.title}</a></h3>
        <p>${p.route}</p>
      </div>
    `).join('')}
  </div>
  
  <hr style="margin: 2rem 0;" />
  <p style="color: #666; font-size: 0.875rem;">
    <strong>GitHub Raw URLs:</strong><br>
    <code>https://raw.githubusercontent.com/Dafort001/EstateSandbox/main/design/html/[filename]</code>
  </p>
</body>
</html>`;
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHTML, 'utf-8');
  console.log(`\n✅ index.html (Navigation)\n`);
  
  console.log(`🎉 Export complete! ${exportedCount + 1} files created`);
};

exportPages();
