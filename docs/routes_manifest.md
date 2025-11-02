# Routes Manifest

Generated: 11/2/2025, 1:13:27 PM

## Statistics

- **Total routes**: 51
- **Public routes**: 51
- **Auth-required routes**: 0
- **Guarded routes** (role/flag): 1
- **Orphan routes** (not linked): 48
- **Dynamic routes** (with params): 8

## ⚠️ Orphan Routes

Routes that are not linked from anywhere:

- **/about** (pages/about.tsx)
- **/admin/editorial** (pages/admin-editorial.tsx)
- **/admin/seo** (pages/admin-seo.tsx)
- **/agb** (pages/agb.tsx)
- **/ai-lab** (pages/ai-lab.tsx)
- **/app** (pages/app/splash.tsx)
- **/app/camera** (pages/app/camera.tsx)
- **/app/gallery** (pages/app/gallery.tsx)
- **/app/settings** (pages/app/settings.tsx)
- **/app/upload** (pages/app/upload.tsx)
- **/blog** (pages/blog.tsx)
- **/blog/:slug** (pages/blog-post.tsx)
- **/booking-confirmation** (pages/booking-confirmation.tsx)
- **/buchen** (pages/booking.tsx)
- **/capture** (pages/capture/index.tsx)
- **/capture/camera** (pages/capture/camera.tsx)
- **/capture/review** (pages/capture/review.tsx)
- **/capture/upload** (pages/capture/upload.tsx)
- **/dashboard** (pages/dashboard.tsx)
- **/datenschutz** (pages/datenschutz.tsx)
- **/demo-jobs** (pages/demo-jobs.tsx)
- **/demo-upload** (pages/demo-upload.tsx)
- **/docs/rooms-spec** (pages/docs-rooms-spec.tsx)
- **/downloads** (pages/downloads.tsx)
- **/faq** (pages/faq.tsx)
- **/galerie** (pages/galerie.tsx)
- **/gallery** (pages/gallery.tsx)
- **/gallery/classify/:shootId** (pages/gallery-classify.tsx)
- **/impressum** (pages/imprint.tsx)
- **/intake** (pages/intake.tsx)
- **/job/:id** (pages/demo-job-detail.tsx)
- **/jobs** (pages/jobs.tsx)
- **/kontakt** (pages/contact.tsx)
- **/kontakt-formular** (pages/kontakt-formular.tsx)
- **/order** (pages/order-form.tsx)
- **/portal/delivery/:jobId** (pages/portal/delivery.tsx)
- **/portal/gallery-editing** (pages/portal/gallery-editing.tsx)
- **/portal/gallery-photographer** (pages/portal/gallery-photographer.tsx)
- **/portal/gallery-upload** (pages/portal/gallery-upload.tsx)
- **/portal/job/:jobId** (pages/portal/gallery-selection.tsx)
- **/portal/payment/:jobId** (pages/portal/payment.tsx)
- **/portal/status/:jobId** (pages/portal/status-timeline.tsx)
- **/portal/uploads** (pages/portal/uploads-overview.tsx)
- **/preise** (pages/pricing.tsx)
- **/preisliste** (pages/preisliste.tsx)
- **/review/:jobId/:shootId** (pages/review.tsx)
- **/test** (pages/test-debug.tsx)
- **/upload-raw** (pages/upload-raw.tsx)

## 🔒 Guarded Routes

| Path | Auth | Role | Flag |
|------|------|------|------|
| /dashboard |  | admin |  |

## Routes by Layout

### WEB Layout (38 routes)

- **/**
- **/about** ⚠️ Orphan
- **/admin/editorial** ⚠️ Orphan
- **/admin/seo** ⚠️ Orphan
- **/agb** ⚠️ Orphan
- **/ai-lab** ⚠️ Orphan
- **/blog** ⚠️ Orphan
- **/blog/:slug** ⚠️ Orphan
- **/booking-confirmation** ⚠️ Orphan
- **/buchen** ⚠️ Orphan
- **/capture** ⚠️ Orphan
- **/capture/camera** ⚠️ Orphan
- **/capture/review** ⚠️ Orphan
- **/capture/upload** ⚠️ Orphan
- **/dashboard** 👤 admin ⚠️ Orphan
- **/datenschutz** ⚠️ Orphan
- **/demo-jobs** ⚠️ Orphan
- **/demo-upload** ⚠️ Orphan
- **/docs/rooms-spec** ⚠️ Orphan
- **/downloads** ⚠️ Orphan
- **/faq** ⚠️ Orphan
- **/galerie** ⚠️ Orphan
- **/gallery** ⚠️ Orphan
- **/gallery/classify/:shootId** ⚠️ Orphan
- **/impressum** ⚠️ Orphan
- **/intake** ⚠️ Orphan
- **/job/:id** ⚠️ Orphan
- **/jobs** ⚠️ Orphan
- **/kontakt** ⚠️ Orphan
- **/kontakt-formular** ⚠️ Orphan
- **/login**
- **/order** ⚠️ Orphan
- **/preise** ⚠️ Orphan
- **/preisliste** ⚠️ Orphan
- **/register**
- **/review/:jobId/:shootId** ⚠️ Orphan
- **/test** ⚠️ Orphan
- **/upload-raw** ⚠️ Orphan

### APP Layout (5 routes)

- **/app** ⚠️ Orphan
- **/app/camera** ⚠️ Orphan
- **/app/gallery** ⚠️ Orphan
- **/app/settings** ⚠️ Orphan
- **/app/upload** ⚠️ Orphan

### PORTAL Layout (8 routes)

- **/portal/delivery/:jobId** ⚠️ Orphan
- **/portal/gallery-editing** ⚠️ Orphan
- **/portal/gallery-photographer** ⚠️ Orphan
- **/portal/gallery-upload** ⚠️ Orphan
- **/portal/job/:jobId** ⚠️ Orphan
- **/portal/payment/:jobId** ⚠️ Orphan
- **/portal/status/:jobId** ⚠️ Orphan
- **/portal/uploads** ⚠️ Orphan

## Dynamic Routes

| Path | Parameters |
|------|------------|
| /blog/:slug | slug |
| /gallery/classify/:shootId | shootId |
| /job/:id | id |
| /portal/delivery/:jobId | jobId |
| /portal/job/:jobId | jobId |
| /portal/payment/:jobId | jobId |
| /portal/status/:jobId | jobId |
| /review/:jobId/:shootId | jobId, shootId |
