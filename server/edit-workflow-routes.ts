import type { Express, Request, Response } from "express";
import { z } from "zod";
import { storage } from "./storage";

/**
 * Edit Workflow Routes (Phase 2 → F4a Real Implementation)
 * Real EditJob queue processing with R2 integration
 */

// ===================================================================
// Request Schemas
// ===================================================================

const submitEditsSchema = z.object({
  files: z.array(z.string().uuid()).min(1).max(100),
  express: z.boolean().optional().default(false),
  orderNotes: z.string().max(2000).optional(),
});

const revisionSchema = z.object({
  note: z.string().min(1).max(1000),
});

// ===================================================================
// Mock Data Helpers
// ===================================================================

function generateMockEditJob(fileId: string, orderId: string, express: boolean = false) {
  return {
    id: `job_${Math.random().toString(36).substr(2, 9)}`,
    fileId,
    orderId,
    status: 'queued',
    express,
    createdAt: Date.now(),
    startedAt: null,
    finishedAt: null,
  };
}

function generateMockNotification(userId: string, type: string) {
  return {
    id: `notif_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    title: `Mock ${type}`,
    message: `This is a mock notification for ${type}`,
    link: `/orders/mock-order-id`,
    metadata: { orderId: 'mock-order-id' },
    read: false,
    createdAt: Date.now(),
  };
}

// ===================================================================
// Route Handlers
// ===================================================================

export function registerEditWorkflowRoutes(app: Express): void {
  
  // =================================================================
  // POST /api/orders/:id/submit-edits
  // Submit marked files for editing (REAL IMPLEMENTATION)
  // =================================================================
  app.post("/api/orders/:orderId/submit-edits", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { orderId } = req.params;
      const validatedData = submitEditsSchema.parse(req.body);
      const userId = req.user.id;

      // Validate files exist and belong to the order
      const fileIds = validatedData.files;
      const jobs = [];
      const errors = [];
      
      for (const fileId of fileIds) {
        // SECURITY: Validate file ownership & order association
        const file = await storage.findFileById(fileId);
        
        if (!file) {
          console.error(`[SECURITY] User ${userId} attempted to submit non-existent file ${fileId}`);
          errors.push({ fileId, reason: 'File not found' });
          continue;
        }

        if (file.orderId !== orderId) {
          console.error(`[SECURITY] User ${userId} attempted to submit file ${fileId} belonging to different order (actual: ${file.orderId}, claimed: ${orderId})`);
          errors.push({ fileId, reason: 'File does not belong to this order' });
          continue;
        }

        if (file.userId !== userId) {
          console.error(`[SECURITY] User ${userId} attempted to submit file ${fileId} owned by different user (${file.userId})`);
          errors.push({ fileId, reason: 'Unauthorized access to file' });
          continue;
        }

        // Check if file is locked
        const isLocked = await storage.isFileLocked(fileId);
        if (isLocked) {
          console.warn(`File ${fileId} is locked, skipping EditJob creation`);
          errors.push({ fileId, reason: 'File is currently locked' });
          continue;
        }

        // Create EditJob
        const job = await storage.createEditJob({
          fileId,
          orderId,
          userId,
          express: validatedData.express || false,
        });

        // Update file status to 'queued'
        await storage.updateFileStatus(fileId, 'queued');
        
        jobs.push(job);
      }

      // If all files failed validation, return error
      if (jobs.length === 0 && errors.length > 0) {
        return res.status(400).json({
          error: 'No valid files could be processed',
          details: errors,
        });
      }

      // Log submission
      console.log(`[SUBMIT-EDITS] Created ${jobs.length} EditJobs for order ${orderId} (express: ${validatedData.express}, errors: ${errors.length})`);

      res.status(201).json({
        success: true,
        jobsCreated: jobs.length,
        jobs: jobs.map(j => ({ id: j.id, status: j.status })),
        express: validatedData.express || false,
        ...(errors.length > 0 && { errors }), // Include errors if any files failed validation
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("[SUBMIT-EDITS ERROR]", error);
      res.status(500).json({ error: "Failed to submit edits" });
    }
  });

  // =================================================================
  // GET /api/orders/:id/status
  // Get order processing status summary (REAL IMPLEMENTATION)
  // =================================================================
  app.get("/api/orders/:orderId/status", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { orderId } = req.params;
      
      // Get all EditJobs for this order
      const allJobs = await storage.getEditJobsByOrder(orderId);
      
      // Count by status
      const statusCounts = {
        queued: allJobs.filter(j => j.status === 'queued').length,
        in_progress: allJobs.filter(j => j.status === 'in_progress').length,
        done: allJobs.filter(j => j.status === 'done').length,
        failed: allJobs.filter(j => j.status === 'failed').length,
        total: allJobs.length,
      };

      res.json(statusCounts);
    } catch (error) {
      console.error("[ORDER-STATUS ERROR]", error);
      res.status(500).json({ error: "Failed to retrieve status" });
    }
  });

  // =================================================================
  // GET /api/files/:id/preview
  // Get signed URL for processed preview (REAL IMPLEMENTATION)
  // =================================================================
  app.get("/api/files/:fileId/preview", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { fileId } = req.params;
      
      // Get latest EditJob for this file (done status)
      const jobs = await storage.getEditJobsByFile(fileId);
      const doneJob = jobs.find(j => j.status === 'done' && j.previewPath);

      if (!doneJob || !doneJob.previewPath) {
        // No preview yet, return 404
        return res.status(404).json({ error: "Preview not available yet" });
      }

      // TODO: Generate R2 signed URL for preview
      // For now, return the path - will be replaced with signed URL in R2 integration
      res.json({
        url: `/r2-preview/${doneJob.previewPath}`, // Placeholder URL
        expiresAt: Date.now() + 3600000, // 1 hour
      });
    } catch (error) {
      console.error("Get preview error:", error);
      res.status(500).json({ error: "Failed to generate preview URL" });
    }
  });

  // =================================================================
  // POST /api/files/:id/approve
  // Approve file for final delivery
  // =================================================================
  app.post("/api/files/:fileId/approve", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { fileId } = req.params;

      // Mock: Set approved = true, approvedAt = now
      // TODO: Real implementation will update uploaded_files.approved

      res.json({
        success: true,
        fileId,
        approved: true,
        approvedAt: Date.now(),
      });
    } catch (error) {
      console.error("Approve file error:", error);
      res.status(500).json({ error: "Failed to approve file" });
    }
  });

  // =================================================================
  // POST /api/files/:id/revision
  // Request revision for file
  // =================================================================
  app.post("/api/files/:fileId/revision", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { fileId } = req.params;
      const validatedData = revisionSchema.parse(req.body);

      // Mock: Create new edit job with status 'queued', increment version
      // TODO: Real implementation will create edit_job, update file.ver

      res.json({
        success: true,
        fileId,
        revisionNote: validatedData.note,
        newVersion: 2, // Mock: incremented version
        status: 'queued',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Request revision error:", error);
      res.status(500).json({ error: "Failed to request revision" });
    }
  });

  // =================================================================
  // GET /api/orders/:id/download.zip
  // Download approved files as ZIP
  // =================================================================
  app.get("/api/orders/:orderId/download.zip", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Mock: Return signed URL to pre-generated ZIP
      res.json({
        url: `https://mock-cdn.example.com/downloads/${req.params.orderId}.zip`,
        expiresAt: Date.now() + 3600000, // 1 hour
        fileCount: 15,
        totalSize: 125000000, // bytes
      });
    } catch (error) {
      console.error("Download ZIP error:", error);
      res.status(500).json({ error: "Failed to generate download" });
    }
  });

  // =================================================================
  // GET /api/orders/:id/alt-texts.txt
  // Download alt-texts as tab-separated TXT
  // =================================================================
  app.get("/api/orders/:orderId/alt-texts.txt", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const lang = (req.query.lang as string) || 'de';

      // Mock TXT content
      const mockTxt = `2025-10-28-AB3KQ_wohnzimmer_001_v1.jpg\tModernes Wohnzimmer mit großen Fenstern (Querformat)\n2025-10-28-AB3KQ_kueche_001_v1.jpg\tOffene Küche mit Kochinsel (Querformat)`;

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="alt-texts-${lang}.txt"`);
      res.send(mockTxt);
    } catch (error) {
      console.error("Download alt-texts TXT error:", error);
      res.status(500).json({ error: "Failed to generate alt-texts" });
    }
  });

  // =================================================================
  // GET /api/orders/:id/alt-texts.json
  // Download alt-texts as JSON
  // =================================================================
  app.get("/api/orders/:orderId/alt-texts.json", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const lang = (req.query.lang as string) || 'de';

      // Mock JSON content
      const mockJson = {
        orderId: req.params.orderId,
        language: lang,
        generatedAt: new Date().toISOString(),
        files: [
          {
            filename: "2025-10-28-AB3KQ_wohnzimmer_001_v1.jpg",
            altText: "Modernes Wohnzimmer mit großen Fenstern",
            orientation: "Querformat",
          },
          {
            filename: "2025-10-28-AB3KQ_kueche_001_v1.jpg",
            altText: "Offene Küche mit Kochinsel",
            orientation: "Querformat",
          },
        ],
      };

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="alt-texts-${lang}.json"`);
      res.json(mockJson);
    } catch (error) {
      console.error("Download alt-texts JSON error:", error);
      res.status(500).json({ error: "Failed to generate alt-texts" });
    }
  });

  // =================================================================
  // POST /api/orders/:id/complete
  // Mark order as completed (locks further changes)
  // =================================================================
  app.post("/api/orders/:orderId/complete", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { orderId } = req.params;

      // Mock: Set order.completedAt, order.locked = true
      // TODO: Real implementation will update orders table

      res.json({
        success: true,
        orderId,
        completedAt: Date.now(),
        locked: true,
      });
    } catch (error) {
      console.error("Complete order error:", error);
      res.status(500).json({ error: "Failed to complete order" });
    }
  });

  // =================================================================
  // GET /api/invoices
  // List invoices for current user
  // =================================================================
  app.get("/api/invoices", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Mock invoices
      const mockInvoices = [
        {
          id: 'inv_001',
          invoiceNumber: 'INV-2025-001',
          orderId: 'order_123',
          customerName: req.user.email || 'Mock Customer',
          invoiceDate: Date.now() - 86400000 * 7, // 7 days ago
          grossAmount: 25000, // cents
          status: 'paid',
        },
        {
          id: 'inv_002',
          invoiceNumber: 'INV-2025-002',
          orderId: 'order_456',
          customerName: req.user.email || 'Mock Customer',
          invoiceDate: Date.now() - 86400000 * 2, // 2 days ago
          grossAmount: 18500, // cents
          status: 'sent',
        },
      ];

      res.json({
        invoices: mockInvoices,
        total: mockInvoices.length,
      });
    } catch (error) {
      console.error("Get invoices error:", error);
      res.status(500).json({ error: "Failed to retrieve invoices" });
    }
  });

  // =================================================================
  // GET /api/invoices/:id.pdf
  // Download invoice as PDF
  // =================================================================
  app.get("/api/invoices/:invoiceId.pdf", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Mock: Return signed URL to PDF
      res.json({
        url: `https://mock-cdn.example.com/invoices/${req.params.invoiceId}.pdf`,
        expiresAt: Date.now() + 3600000, // 1 hour
      });
    } catch (error) {
      console.error("Download invoice PDF error:", error);
      res.status(500).json({ error: "Failed to generate PDF download" });
    }
  });

  // =================================================================
  // GET /api/notifications
  // Get notifications for current user
  // =================================================================
  app.get("/api/notifications", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';

      // Mock notifications
      const mockNotifications = [
        generateMockNotification(req.user.id, 'job_submitted'),
        generateMockNotification(req.user.id, 'job_completed'),
        generateMockNotification(req.user.id, 'file_approved'),
      ];

      res.json({
        notifications: mockNotifications.slice(0, limit),
        total: mockNotifications.length,
        unread: mockNotifications.filter(n => !n.read).length,
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Failed to retrieve notifications" });
    }
  });
}
