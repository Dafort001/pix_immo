import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { logger, generateRequestId, type LogContext } from "./logger";
import { createJobSchema, initUploadSchema, presignedUploadSchema, assignRoomTypeSchema, insertPublicImageSchema, insertInvoiceSchema, insertBlogPostSchema, insertServiceSchema, insertBookingSchema, uploadIntentSchema, uploadFinalizeSchema, type InitUploadResponse, type PresignedUrlResponse, type UploadIntentResponse } from "@shared/schema";
import { generateBearerToken } from "./bearer-auth";
import { validateRawFilename, extractRoomTypeFromFilename, extractStackNumberFromFilename, calculatePartCount, MULTIPART_CHUNK_SIZE } from "./raw-upload-helpers";
import { initMultipartUpload, generatePresignedUploadUrl, completeMultipartUpload, generateR2ObjectKey, generateSignedPutUrl, getObject, generatePresignedDownloadUrl } from "./r2-client";
import { runAITool, getToolById, getAllTools } from "./replicate-adapter";
import { z } from "zod";
import { randomBytes } from "crypto";
import { upload, processUploadedFiles } from "./uploadHandler";
import { generateHandoffPackage, generateHandoffToken } from "./handoffPackage";
import archiver from "archiver";
import Stripe from "stripe";

// Initialize Stripe from Replit's Stripe integration
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-09-30.clover" })
  : null;
import { scheduleEditorReturnProcessing, scheduleAICaptioning } from "./backgroundQueue";
import { notifyHandoffReady, notifyEditorUploadComplete } from "./notifications";
import { generatePresignedPutUrl, generateObjectPath } from "./objectStorage";
import { isValidFilenameV31 } from "./fileNaming";
import { processJobDemo } from "./demo-processing";
import { registerGalleryRoutes } from "./gallery-routes";
import { registerEditorRoutes } from "./editor-routes";
import { registerOrderFilesRoutes } from "./order-files-routes";
import { registerEditWorkflowRoutes } from "./edit-workflow-routes";
import { hashPassword, verifyPassword, SESSION_CONFIG } from "./auth";
import { assertJobAccessOrThrow, assertFileDownloadableOrThrow, filterDownloadableFiles, filterDownloadableImages } from "./download-auth";

// Middleware to validate request body with Zod
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(400).json({ error: "Invalid request body" });
      }
    }
  };
}

// Middleware to validate UUID path parameters
export function validateUuidParam(...paramNames: string[]) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  return (req: Request, res: Response, next: any) => {
    for (const paramName of paramNames) {
      const value = req.params[paramName];
      if (value && !uuidRegex.test(value)) {
        return res.status(400).json({ error: `Invalid ${paramName} format` });
      }
    }
    next();
  };
}

// Middleware to validate and sanitize string path parameters
export function validateStringParam(...paramNames: string[]) {
  // Allow alphanumeric, hyphens, and underscores only
  const safeStringRegex = /^[a-zA-Z0-9_-]+$/;
  
  return (req: Request, res: Response, next: any) => {
    for (const paramName of paramNames) {
      const value = req.params[paramName];
      if (value && !safeStringRegex.test(value)) {
        return res.status(400).json({ error: `Invalid ${paramName} format` });
      }
    }
    next();
  };
}

// Middleware to require authentication
export function requireAuth(req: Request, res: Response, next: any) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Middleware to require specific role(s)
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: any) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// Rate limiters for sensitive endpoints
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 uploads per minute per IP
  message: { error: "Too many upload requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const presignLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 presign requests per minute per IP
  message: { error: "Too many presign requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const handoffLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 handoff generation requests per minute per IP
  message: { error: "Too many handoff requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes per IP
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global rate limiter: 60 requests/min per IP with burst of 10
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "production" ? 60 : 500, // Higher limit in dev for Vite HMR
  skipSuccessfulRequests: false,
  skip: (req: Request) => {
    // Skip rate limiting for Vite dev assets
    const path = req.path;
    return path.startsWith('/src/') || 
           path.startsWith('/@vite/') || 
           path.startsWith('/@fs/') || 
           path.startsWith('/@react-refresh') ||
           path.startsWith('/@replit/') ||
           path.startsWith('/node_modules/');
  },
  handler: (req: Request, res: Response) => {
    // Log abuse after 5 rate limit hits in 10 minutes
    logAbuse(req.ip || 'unknown', req.path);
    res.status(429).json({ error: "Too Many Requests" });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Abuse logging tracker (in-memory for now, will save to R2)
const abuseTracker = new Map<string, { count: number; firstHit: number }>();

async function logAbuse(ip: string, path: string) {
  const key = ip;
  const now = Date.now();
  const entry = abuseTracker.get(key);
  
  if (!entry || now - entry.firstHit > 10 * 60 * 1000) {
    // New window or expired - reset
    abuseTracker.set(key, { count: 1, firstHit: now });
    return;
  }
  
  entry.count++;
  
  if (entry.count >= 5) {
    // Log to R2 after 5 rate limit hits in 10 minutes
    const logEntry = {
      ip,
      path,
      timestamp: new Date().toISOString(),
      count: entry.count,
    };
    
    console.warn('[ABUSE] Rate limit abuse detected:', logEntry);
    
    // TODO: Save to R2 LogWorker
    // await saveAbuseLogToR2(logEntry);
    
    // Reset counter
    abuseTracker.delete(key);
  }
}

// Content-Type validation middleware for upload routes
function validateUploadContentType(req: Request, res: Response, next: any) {
  // Skip GET/DELETE requests
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
    return next();
  }
  
  // Skip auth routes that don't require a body (e.g., logout)
  if (req.path === '/api/auth/logout' || req.path === '/api/auth/demo') {
    return next();
  }
  
  const contentType = req.headers['content-type'];
  
  // Allow requests without Content-Type if they have no body
  if (!contentType) {
    // Check if request has a body by checking Content-Length
    const contentLength = req.headers['content-length'];
    if (!contentLength || contentLength === '0') {
      return next();
    }
    return res.status(403).json({ error: 'Content-Type header required' });
  }
  
  // Allow image/* and application/json
  const allowedTypes = [
    /^image\//,
    /^application\/json/,
    /^multipart\/form-data/, // For file uploads
  ];
  
  const isAllowed = allowedTypes.some(pattern => pattern.test(contentType));
  
  if (!isAllowed) {
    console.warn(`[SECURITY] Blocked content-type: ${contentType} from ${req.ip}`);
    return res.status(403).json({ error: 'Content-Type not allowed' });
  }
  
  next();
}

// Register Media Library Routes
function registerMediaLibraryRoutes(app: Express) {
  // GET /api/media-library - Get all public images (no auth required)
  app.get("/api/media-library", async (req: Request, res: Response) => {
    try {
      const images = await storage.getAllPublicImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching public images:", error);
      res.status(500).json({ error: "Failed to fetch public images" });
    }
  });

  // GET /api/media-library/page/:page - Get images by page (no auth required)
  app.get("/api/media-library/page/:page", validateStringParam("page"), async (req: Request, res: Response) => {
    try {
      const { page } = req.params;
      const images = await storage.getPublicImagesByPage(page);
      res.json(images);
    } catch (error) {
      console.error("Error fetching images by page:", error);
      res.status(500).json({ error: "Failed to fetch images by page" });
    }
  });

  // GET /api/media-library/:id - Get single image by ID (no auth required)
  app.get("/api/media-library/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const images = await storage.getAllPublicImages();
      const image = images.find(img => img.id === id);
      
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      res.json(image);
    } catch (error) {
      console.error("Error fetching public image:", error);
      res.status(500).json({ error: "Failed to fetch public image" });
    }
  });

  // POST /api/media-library - Create new image (admin auth required)
  app.post("/api/media-library", async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const validatedData = insertPublicImageSchema.parse(req.body);
      
      // Filter out null values
      const cleanedData = Object.fromEntries(
        Object.entries(validatedData).filter(([_, v]) => v !== null)
      );
      
      const newImage = await storage.createPublicImage({
        ...cleanedData,
        updatedBy: req.user.id,
      } as any);
      
      res.status(201).json(newImage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating public image:", error);
      res.status(500).json({ error: "Failed to create public image" });
    }
  });

  // PATCH /api/media-library/:id - Update image (admin auth required)
  app.patch("/api/media-library/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      
      const updatedImage = await storage.updatePublicImage(id, {
        ...req.body,
        updatedBy: req.user.id,
      });
      
      if (!updatedImage) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      res.json(updatedImage);
    } catch (error) {
      console.error("Error updating public image:", error);
      res.status(500).json({ error: "Failed to update public image" });
    }
  });

  // DELETE /api/media-library/:id - Delete image (admin auth required)
  app.delete("/api/media-library/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      await storage.deletePublicImage(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting public image:", error);
      res.status(500).json({ error: "Failed to delete public image" });
    }
  });

  // POST /api/media-library/upload - Upload images to Object Storage (admin auth required)
  app.post("/api/media-library/upload", uploadLimiter, upload.array("files", 20), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const files = req.files as Express.Multer.File[];
      const page = req.body.page;

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      if (!page || !['home', 'pixcapture', 'gallery', 'blog'].includes(page)) {
        return res.status(400).json({ error: "Invalid page parameter" });
      }

      // Import uploadFile from objectStorage
      const { uploadFile } = await import("./objectStorage");
      const createdImages = [];

      for (const file of files) {
        // Validate file type (images only)
        if (!file.mimetype.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.originalname}`);
          continue;
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = randomBytes(8).toString('hex');
        const ext = file.originalname.split('.').pop() || 'jpg';
        const filename = `${page}_${timestamp}_${randomStr}.${ext}`;
        const objectPath = `media-library/${page}/${filename}`;

        // Upload to Object Storage
        const uploadResult = await uploadFile(objectPath, file.buffer, file.mimetype);

        if (!uploadResult.ok) {
          console.error(`Failed to upload ${file.originalname}:`, uploadResult.error);
          continue;
        }

        // Generate public URL (using Replit Object Storage URL pattern)
        const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || '';
        const publicUrl = `https://storage.googleapis.com/${bucketId}/${objectPath}`;

        // Create database entry with default alt text
        const newImage = await storage.createPublicImage({
          page,
          url: publicUrl,
          alt: file.originalname.replace(/\.[^/.]+$/, ''), // filename without extension
          description: null,
          updatedBy: req.user.id,
        } as any);

        createdImages.push(newImage);
      }

      // Fail if no files were successfully uploaded
      if (createdImages.length === 0) {
        return res.status(400).json({ 
          error: "Keine Bilder konnten hochgeladen werden. Überprüfe die Dateiformate (nur Bilder erlaubt)." 
        });
      }

      res.status(201).json({
        success: true,
        uploadedCount: createdImages.length,
        totalFiles: files.length,
        images: createdImages,
      });
    } catch (error) {
      console.error("Error uploading media library images:", error);
      res.status(500).json({ error: "Failed to upload images" });
    }
  });
}

// Register Invoice Routes
function registerInvoiceRoutes(app: Express) {
  // GET /api/invoices - Get all invoices for current user (auth required, admin sees all)
  app.get("/api/invoices", async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const invoices = req.user.role === "admin" 
        ? await storage.getAllInvoices()
        : await storage.getUserInvoices(req.user.id);
      
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // GET /api/invoices/next-number - Get next invoice number (admin auth required)
  app.get("/api/invoices/next-number", async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const nextNumber = await storage.getNextInvoiceNumber();
      res.json({ invoiceNumber: nextNumber });
    } catch (error) {
      console.error("Error fetching next invoice number:", error);
      res.status(500).json({ error: "Failed to fetch next invoice number" });
    }
  });

  // GET /api/invoices/:id - Get single invoice (auth required, check ownership or admin)
  app.get("/api/invoices/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      // Check ownership or admin
      if (req.user.role !== "admin" && invoice.createdBy !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  // POST /api/invoices - Create new invoice (admin auth required)
  app.post("/api/invoices", async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      // Generate invoice number if not provided
      const invoiceNumber = req.body.invoiceNumber || await storage.getNextInvoiceNumber();

      const validatedData = insertInvoiceSchema.parse({
        ...req.body,
        invoiceNumber,
        createdBy: req.user.id,
      });
      
      // Filter out null values
      const cleanedData = Object.fromEntries(
        Object.entries(validatedData).filter(([_, v]) => v !== null)
      );
      
      const newInvoice = await storage.createInvoice(cleanedData as any);
      
      res.status(201).json(newInvoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // PATCH /api/invoices/:id/status - Update invoice status (admin auth required)
  app.patch("/api/invoices/:id/status", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      const { status, paidAt } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      await storage.updateInvoiceStatus(id, status, paidAt);
      
      const updatedInvoice = await storage.getInvoice(id);
      res.json(updatedInvoice);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      res.status(500).json({ error: "Failed to update invoice status" });
    }
  });

  // PATCH /api/invoices/:id - Update invoice (admin auth required)
  app.patch("/api/invoices/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      
      const updatedInvoice = await storage.updateInvoice(id, req.body);
      
      if (!updatedInvoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      res.json(updatedInvoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  // DELETE /api/invoices/:id - Delete invoice (admin auth required)
  app.delete("/api/invoices/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      await storage.deleteInvoice(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });

  // GET /api/invoices/:id/pdf - Download invoice as PDF (auth required)
  app.get("/api/invoices/:id/pdf", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      // Check ownership or admin
      if (req.user.role !== "admin" && invoice.createdBy !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Import PDF generator
      const { generateInvoicePDF } = await import('./utils/invoice-pdf');
      
      const pdfBuffer = await generateInvoicePDF(invoice);
      
      // Send PDF as download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // POST /api/invoices/:id/send - Send invoice via email (admin auth required)
  app.post("/api/invoices/:id/send", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      // Import email service and PDF generator
      const { sendInvoiceEmail } = await import('./email');
      const { generateInvoicePDF } = await import('./utils/invoice-pdf');
      
      // Generate PDF attachment
      const pdfBuffer = await generateInvoicePDF(invoice);
      
      // Send email with PDF attachment
      const emailResult = await sendInvoiceEmail({
        to: invoice.customerEmail,
        customerName: invoice.customerName,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(Number(invoice.invoiceDate)),
        grossAmount: Number(invoice.grossAmount),
        pdfAttachment: {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: Buffer.from(pdfBuffer),
        },
      });
      
      if (!emailResult.success) {
        return res.status(500).json({ 
          error: "Failed to send email",
          details: emailResult.error 
        });
      }
      
      // Update invoice status to 'sent' if it was 'draft'
      if (invoice.status === 'draft') {
        await storage.updateInvoice(id, { 
          status: 'sent',
          updatedAt: Date.now(),
        });
      }
      
      res.json({ 
        success: true,
        messageId: emailResult.messageId,
        message: `Invoice sent to ${invoice.customerEmail}`,
      });
      
    } catch (error) {
      console.error("Error sending invoice email:", error);
      res.status(500).json({ error: "Failed to send invoice email" });
    }
  });
}

// Register Blog Routes
function registerBlogRoutes(app: Express) {
  // GET /api/blog - Get published blog posts (no auth required)
  app.get("/api/blog", async (req: Request, res: Response) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  // GET /api/blog/all - Get all blog posts including drafts (admin auth required)
  app.get("/api/blog/all", async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const allPosts = await storage.getAllBlogPosts();
      res.json(allPosts);
    } catch (error) {
      console.error("Error fetching all blog posts:", error);
      res.status(500).json({ error: "Failed to fetch all blog posts" });
    }
  });

  // GET /api/blog/slug/:slug - Get blog post by slug (no auth required if published, admin for drafts)
  app.get("/api/blog/slug/:slug", validateStringParam("slug"), async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      // If post is not published, only admin can view it
      if (post.status !== "published") {
        if (!req.user || req.user.role !== "admin") {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post by slug:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // GET /api/blog/:id - Get blog post by ID (admin auth required)
  app.get("/api/blog/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      const post = await storage.getBlogPost(id);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // POST /api/blog - Create new blog post (admin auth required)
  app.post("/api/blog", async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const validatedData = insertBlogPostSchema.parse({
        ...req.body,
        createdBy: req.user.id,
      });
      
      // Filter out null values
      const cleanedData = Object.fromEntries(
        Object.entries(validatedData).filter(([_, v]) => v !== null)
      );
      
      const newPost = await storage.createBlogPost(cleanedData as any);
      
      res.status(201).json(newPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating blog post:", error);
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  // PATCH /api/blog/:id - Update blog post (admin auth required)
  app.patch("/api/blog/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      
      const updatedPost = await storage.updateBlogPost(id, req.body);
      
      if (!updatedPost) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  // PATCH /api/blog/:id/publish - Publish blog post (admin auth required)
  app.patch("/api/blog/:id/publish", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      await storage.publishBlogPost(id);
      
      const updatedPost = await storage.getBlogPost(id);
      res.json(updatedPost);
    } catch (error) {
      console.error("Error publishing blog post:", error);
      res.status(500).json({ error: "Failed to publish blog post" });
    }
  });

  // PATCH /api/blog/:id/unpublish - Unpublish blog post (admin auth required)
  app.patch("/api/blog/:id/unpublish", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      await storage.unpublishBlogPost(id);
      
      const updatedPost = await storage.getBlogPost(id);
      res.json(updatedPost);
    } catch (error) {
      console.error("Error unpublishing blog post:", error);
      res.status(500).json({ error: "Failed to unpublish blog post" });
    }
  });

  // DELETE /api/blog/:id - Delete blog post (admin auth required)
  app.delete("/api/blog/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      await storage.deleteBlogPost(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });
}

// Register Booking Routes
function registerBookingRoutes(app: Express) {
  // POST /api/bookings - Create booking (auth required)
  app.post("/api/bookings", validateBody(insertBookingSchema), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const userId = req.user.id;
      const { serviceSelections, agbAccepted, ...bookingData } = req.body;

      const result = await storage.createBooking(userId, {
        ...bookingData,
        agbAccepted: agbAccepted ? "true" : "false", // Convert boolean to string for DB
        serviceSelections,
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: error.message || "Failed to create booking" });
    }
  });

  // GET /api/bookings - Get user's bookings (auth required)
  app.get("/api/bookings", async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const bookings = await storage.getUserBookings(req.user.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // GET /api/bookings/all - Get all bookings (admin auth required)
  app.get("/api/bookings/all", async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      res.status(500).json({ error: "Failed to fetch all bookings" });
    }
  });

  // GET /api/bookings/:id - Get booking by ID with items (auth required)
  app.get("/api/bookings/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const { id } = req.params;
      const result = await storage.getBookingWithItems(id);

      if (!result) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Check if user owns booking or is admin
      if (result.booking.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  // PATCH /api/bookings/:id/status - Update booking status (admin auth required)
  app.patch("/api/bookings/:id/status", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      const { status } = req.body;

      if (!status || typeof status !== 'string') {
        return res.status(400).json({ error: "Status is required" });
      }

      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await storage.updateBookingStatus(id, status);
      const updatedBooking = await storage.getBooking(id);
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });
}

// Helper: Convert Service to DTO for booking wizard
function serviceToDTO(service: any): any {
  // Convert price from cents to euros
  const priceEuro = service.netPrice !== null ? service.netPrice / 100 : null;
  
  // Derive unit from priceNote or category
  let unit: "flat" | "per_item" | "per_km" | "range" | "from" = "flat";
  let priceRange: string | undefined;
  let priceFrom: string | undefined;
  
  if (service.priceNote) {
    const note = service.priceNote.toLowerCase();
    if (note.includes('/km') || note.includes('pro km')) {
      unit = "per_km";
    } else if (note.includes('/stück') || note.includes('pro stück') || note.includes('je ')) {
      unit = "per_item";
    } else if (note.includes('ab ')) {
      unit = "from";
      priceFrom = service.priceNote;
    } else if (note.includes('-') && service.netPrice === null) {
      unit = "range";
      priceRange = service.priceNote;
    }
  }
  
  return {
    id: service.id, // Include ID for backend service selection mapping
    code: service.serviceCode,
    category: service.category,
    title: service.name,
    description: service.description || "",
    price_net: priceEuro,
    unit,
    price_range: priceRange,
    price_from: priceFrom,
    notes: service.notes || "",
  };
}

// Register Service Routes
function registerServiceRoutes(app: Express) {
  // GET /api/services - Get all services (public, returns raw Service[])
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // GET /api/services/catalog - Get services as DTO for booking wizard (public)
  app.get("/api/services/catalog", async (req: Request, res: Response) => {
    try {
      const services = await storage.getActiveServices();
      const serviceDTOs = services.map(serviceToDTO);
      
      const catalog = {
        services: serviceDTOs,
        meta: {
          currency: "EUR",
          vat_rate: 0.19,
          last_updated: new Date().toISOString(),
        },
      };
      
      res.json(catalog);
    } catch (error) {
      console.error("Error fetching service catalog:", error);
      res.status(500).json({ error: "Failed to fetch service catalog" });
    }
  });

  // GET /api/services/active - Get active services only (public)
  app.get("/api/services/active", async (req: Request, res: Response) => {
    try {
      const services = await storage.getActiveServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching active services:", error);
      res.status(500).json({ error: "Failed to fetch active services" });
    }
  });

  // GET /api/services/category/:category - Get services by category (public)
  app.get("/api/services/category/:category", validateStringParam("category"), async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const services = await storage.getServicesByCategory(category);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services by category:", error);
      res.status(500).json({ error: "Failed to fetch services by category" });
    }
  });

  // POST /api/services - Create service (admin auth required)
  app.post("/api/services", validateBody(insertServiceSchema), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const service = await storage.createService(req.body);
      res.status(201).json(service);
    } catch (error: any) {
      console.error("Error creating service:", error);
      res.status(500).json({ error: error.message || "Failed to create service" });
    }
  });

  // PATCH /api/services/:id - Update service (admin auth required)
  app.patch("/api/services/:id", validateUuidParam("id"), validateBody(insertServiceSchema.partial()), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      await storage.updateService(id, req.body);
      
      const updatedService = await storage.getService(id);
      res.json(updatedService);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  // DELETE /api/services/:id - Delete service (admin auth required)
  app.delete("/api/services/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const { id } = req.params;
      await storage.deleteService(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ error: "Failed to delete service" });
    }
  });
}

// Gallery Package & Selection Routes
function registerGalleryPackageRoutes(app: Express) {
  // GET /api/jobs/:id/gallery - Get job gallery with package info
  // Alias: GET /api/jobs/:id/images (for backward compatibility)
  const galleryHandler = async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Check ownership
      if (job.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // P1: Security - getJobCandidateFiles now enforces ownership + queries uploadedFiles table
      const files = await storage.getJobCandidateFiles(id, req.user.id, req.user.role);
      const stats = await storage.getJobSelectionStats(id);
      
      res.json({
        job: {
          id: job.id,
          jobNumber: job.jobNumber,
          propertyName: job.propertyName,
          includedImages: job.includedImages,
          maxSelectable: job.maxSelectable,
          extraPricePerImage: job.extraPricePerImage,
          allImagesIncluded: job.allImagesIncluded,
        },
        files,
        stats,
      });
    } catch (error) {
      console.error("Error fetching job gallery:", error);
      res.status(500).json({ error: "Failed to fetch job gallery" });
    }
  };
  
  app.get("/api/jobs/:id/gallery", validateUuidParam("id"), galleryHandler);
  app.get("/api/jobs/:id/images", validateUuidParam("id"), galleryHandler);
  
  // POST /api/jobs/:id/select-image - Toggle image selection
  app.post("/api/jobs/:id/select-image", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const { fileId, action } = req.body; // action: 'select' | 'deselect'
      
      if (!fileId || !action) {
        return res.status(400).json({ error: "fileId and action required" });
      }
      
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      if (job.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // SECURITY: Verify file belongs to this job and is a candidate
      const file = await storage.getUploadedFile(fileId);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      if (file.orderId !== id) {
        return res.status(403).json({ error: "File does not belong to this job" });
      }
      
      if (!file.isCandidate) {
        return res.status(400).json({ error: "File is not a selectable candidate" });
      }
      
      // Get current stats
      const stats = await storage.getJobSelectionStats(id);
      
      // Check package limit (unless allImagesIncluded)
      if (!job.allImagesIncluded && action === 'select') {
        const limit = job.maxSelectable || job.includedImages;
        if (stats.includedCount >= limit) {
          return res.status(400).json({ 
            error: "Package limit reached",
            limit,
            current: stats.includedCount,
          });
        }
      }
      
      // Update selection state
      const newState = action === 'select' ? 'included' : 'none';
      await storage.updateFileSelectionState(fileId, newState);
      
      // Return updated stats
      const updatedStats = await storage.getJobSelectionStats(id);
      res.json({ success: true, stats: updatedStats });
    } catch (error) {
      console.error("Error selecting image:", error);
      res.status(500).json({ error: "Failed to select image" });
    }
  });
  
  // GET /api/jobs/:id/download-zip - Download only selected images as ZIP
  app.get("/api/jobs/:id/download-zip", validateUuidParam("id"), async (req: Request, res: Response, next: any) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      const job = await storage.getJob(id);
      
      // P0 Security: Use centralized auth guard (throws DownloadUnauthorizedError)
      assertJobAccessOrThrow(job || null, { userId: req.user.id, role: req.user.role }, id);
      
      // Get ONLY downloadable files (P0: ownership + selection_state validated, admins bypass)
      // This filters by selection_state ∈ {included, extra_paid, extra_free} + verifies userId
      const downloadableFiles = await storage.getJobDownloadableFiles(id, req.user.id, req.user.role);
      
      if (downloadableFiles.length === 0) {
        return res.status(400).json({ error: "No images selected for download" });
      }
      
      // Generate ZIP with downloadableFiles
      const archive = archiver("zip", {
        zlib: { level: 6 }, // Moderate compression
      });
      
      // Set response headers for ZIP download
      const jobNumber = job!.jobNumber || job!.id.substring(0, 8);
      const filename = `job_${jobNumber}_images.zip`;
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      
      // Pipe archive to response
      archive.pipe(res);
      
      // Handle archiver errors
      archive.on("error", (err) => {
        console.error("[ZIP ERROR]", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to generate ZIP" });
        }
      });
      
      // Add each downloadable file to ZIP
      for (const file of downloadableFiles) {
        try {
          if (!file.objectKey) {
            console.warn(`[ZIP SKIP] File ${file.id} has no objectKey`);
            continue;
          }
          
          // Download file from R2
          const buffer = await getObject(file.objectKey);
          
          // Add to ZIP with original filename
          const zipFilename = file.originalFilename || `file_${file.id}.jpg`;
          archive.append(buffer, { name: zipFilename });
          
          console.log(`[ZIP ADD] ${zipFilename} (${buffer.length} bytes)`);
        } catch (error) {
          console.error(`[ZIP SKIP] Failed to download file ${file.id}:`, error);
          // Continue with other files
        }
      }
      
      // Finalize ZIP (triggers streaming to client)
      await archive.finalize();
      console.log(`[ZIP COMPLETE] Job ${id}, ${downloadableFiles.length} files`);
    } catch (error) {
      // Let error middleware handle DownloadUnauthorizedError
      next(error);
    }
  });
  
  // GET /api/uploaded-files/:id/download - Download single file with presigned URL (P0 Security)
  app.get("/api/uploaded-files/:id/download", validateUuidParam("id"), async (req: Request, res: Response, next: any) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const { id } = req.params;
      
      // P0 Security Step 1: Get uploadedFile to check ownership + selection_state
      const file = await storage.getUploadedFile(id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      // P0 Security Step 2: Validate file has orderId (orphaned files cannot be accessed)
      if (!file.orderId) {
        return res.status(400).json({ error: "File is not linked to a job" });
      }
      
      // P0 Security Step 3: Get job for ownership check
      const job = await storage.getJob(file.orderId);
      
      // P0 Security Step 4: Assert job access (throws DownloadUnauthorizedError)
      assertJobAccessOrThrow(job || null, { userId: req.user.id, role: req.user.role }, file.orderId);
      
      // P0 Security Step 5: Assert file downloadable (checks selection_state or allImagesIncluded)
      assertFileDownloadableOrThrow(file, job!, id);
      
      // P0 Security Step 6: Verify file has objectKey
      if (!file.objectKey) {
        return res.status(400).json({ error: "File has no download URL" });
      }
      
      // AUTHORIZATION PASSED - generate presigned download URL
      // P0 Security: 5-minute expiry for temporary access
      const signedUrl = await generatePresignedDownloadUrl(file.objectKey, 300);
      
      res.json({
        url: signedUrl,
        filename: file.originalFilename || `file_${file.id}.jpg`,
        expiresAt: Date.now() + 300000, // 5 minutes (P0 requirement)
      });
    } catch (error) {
      // Let error middleware handle DownloadUnauthorizedError
      next(error);
    }
  });
  
  // ADMIN: PATCH /api/admin/jobs/:id/package - Update package settings
  app.patch("/api/admin/jobs/:id/package", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
      
      const { id } = req.params;
      const { reason, reasonCode, ...settings } = req.body; // P1: Extract audit fields
      
      // P1: Pass adminUserId + optional reason/reasonCode for audit logging
      await storage.updateJobPackageSettings(id, settings, req.user.id, reason, reasonCode);
      
      const job = await storage.getJob(id);
      res.json({ success: true, job });
    } catch (error) {
      console.error("Error updating package settings:", error);
      res.status(500).json({ error: "Failed to update package settings" });
    }
  });
  
  // ADMIN: PATCH /api/admin/files/:id/kulanz - Set file as kulanz free
  app.patch("/api/admin/files/:id/kulanz", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
      
      const { id } = req.params;
      const { reason, reasonCode } = req.body; // P1: Extract audit fields
      
      // SECURITY: Verify file exists and is a candidate
      const file = await storage.getUploadedFile(id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      if (!file.isCandidate) {
        return res.status(400).json({ error: "File is not a candidate" });
      }
      
      // P1: Pass adminUserId + optional reason/reasonCode for audit logging
      await storage.setFileKulanzFree(id, req.user.id, reason, reasonCode);
      
      const updatedFile = await storage.getUploadedFile(id);
      res.json({ success: true, file: updatedFile });
    } catch (error) {
      console.error("Error setting kulanz:", error);
      res.status(500).json({ error: "Failed to set kulanz" });
    }
  });
  
  // ADMIN: PATCH /api/admin/jobs/:id/kulanz-all - Enable/disable all images kulanz
  app.patch("/api/admin/jobs/:id/kulanz-all", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
      
      const { id } = req.params;
      const { enabled, reason, reasonCode } = req.body; // P1: Extract audit fields
      
      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: "enabled must be boolean" });
      }
      
      // SECURITY: Verify job exists
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // P1: Pass adminUserId + optional reason/reasonCode for audit logging
      await storage.enableAllImagesKulanz(id, enabled, req.user.id, reason, reasonCode);
      
      const updatedJob = await storage.getJob(id);
      res.json({ success: true, job: updatedJob });
    } catch (error) {
      console.error("Error setting all-images kulanz:", error);
      res.status(500).json({ error: "Failed to set all-images kulanz" });
    }
  });
}

// Upload Manifest Routes (Client-manifest-based upload tracking)
function registerUploadManifestRoutes(app: Express) {
  // POST /api/upload/sessions - Create manifest upload session
  app.post("/api/upload/sessions", uploadLimiter, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const { jobId, clientType, files } = req.body;
      
      if (!clientType || !files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: "clientType and files array required" });
      }
      
      // Validate clientType
      if (!['pixcapture_ios', 'pixcapture_android', 'web_uploader'].includes(clientType)) {
        return res.status(400).json({ error: "Invalid clientType" });
      }
      
      // Calculate totals
      const expectedFiles = files.length;
      const totalBytesExpected = files.reduce((sum, f) => sum + (f.sizeBytes || 0), 0);
      
      // Create session
      const session = await storage.createManifestSession({
        userId: req.user.id,
        jobId,
        clientType,
        expectedFiles,
        totalBytesExpected,
      });
      
      // Create items
      const items = await storage.createManifestItems(session.id, files);
      
      res.status(201).json({
        session,
        items,
      });
    } catch (error) {
      console.error("Error creating manifest session:", error);
      res.status(500).json({ error: "Failed to create manifest session" });
    }
  });
  
  // POST /api/upload/sessions/:id/files/:itemId - Mark file upload status
  app.post("/api/upload/sessions/:sessionId/files/:itemId", uploadLimiter, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const { sessionId, itemId } = req.params;
      const { status, errorMessage } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "status required" });
      }
      
      // Validate status
      if (!['pending', 'uploading', 'uploaded', 'verified', 'failed'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      // SECURITY: Verify session belongs to user
      const session = await storage.getManifestSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      if (session.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Update item status
      await storage.updateManifestItemStatus(itemId, status, errorMessage);
      
      // If failed, increment session error count
      if (status === 'failed') {
        await storage.incrementManifestSessionErrors(sessionId);
      }
      
      // Update session state to in_progress
      if (session.state === 'pending') {
        await storage.updateManifestSessionState(sessionId, 'in_progress');
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating file status:", error);
      res.status(500).json({ error: "Failed to update file status" });
    }
  });
  
  // POST /api/upload/sessions/:id/complete - Complete session
  app.post("/api/upload/sessions/:sessionId/complete", uploadLimiter, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const { sessionId } = req.params;
      
      // SECURITY: Verify session belongs to user
      const session = await storage.getManifestSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      if (session.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Check if all items are uploaded/verified
      const items = await storage.getManifestItems(sessionId);
      const pendingItems = items.filter(item => 
        item.status === 'pending' || item.status === 'uploading'
      );
      
      if (pendingItems.length > 0) {
        return res.status(400).json({ 
          error: "Cannot complete session with pending uploads",
          pendingCount: pendingItems.length,
        });
      }
      
      // Complete session
      await storage.completeManifestSession(sessionId);
      
      const updatedSession = await storage.getManifestSession(sessionId);
      res.json({ success: true, session: updatedSession });
    } catch (error) {
      console.error("Error completing session:", error);
      res.status(500).json({ error: "Failed to complete session" });
    }
  });
  
  // GET /api/upload/sessions/:id - Get session status
  app.get("/api/upload/sessions/:sessionId", async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const { sessionId } = req.params;
      
      const session = await storage.getManifestSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      if (session.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const items = await storage.getManifestItems(sessionId);
      
      res.json({
        session,
        items,
        stats: {
          total: items.length,
          pending: items.filter(i => i.status === 'pending').length,
          uploading: items.filter(i => i.status === 'uploading').length,
          uploaded: items.filter(i => i.status === 'uploaded').length,
          verified: items.filter(i => i.status === 'verified').length,
          failed: items.filter(i => i.status === 'failed').length,
        },
      });
    } catch (error) {
      console.error("Error getting session:", error);
      res.status(500).json({ error: "Failed to get session" });
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable trust proxy for correct IP detection with Replit's reverse proxy
  // Set to 1 to trust only the first proxy (Replit's reverse proxy)
  app.set('trust proxy', 1);
  
  // Production domains for CORS (P0 HARDENED - NO wildcards)
  const productionOrigins = [
    "https://pix.immo",
    "https://www.pix.immo",
    "https://pixcapture.app",
    // Staging deployments (explicit domains, NO wildcards)
    "https://staging.pixcapture.pages.dev",
    "https://preview.pixcapture.pages.dev",
  ];
  
  // Development origins
  const devOrigins = [
    "http://localhost:5000",
    "http://localhost:5173",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5173",
    "capacitor://localhost",
    "ionic://localhost",
  ];
  
  // Add Replit domain if available
  if (process.env.REPLIT_DOMAINS) {
    const replitDomain = `https://${process.env.REPLIT_DOMAINS}`;
    devOrigins.push(replitDomain);
  }
  
  const allowedOrigins = process.env.NODE_ENV === "production" 
    ? productionOrigins 
    : [...productionOrigins, ...devOrigins];

  // CORS middleware with strict origin validation (P0 HARDENED)
  app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // P0 SECURITY: Only allow Replit preview domains in DEVELOPMENT
      if (process.env.NODE_ENV === "development" && origin.endsWith('.replit.dev')) {
        return callback(null, true);
      }
      
      // P0 SECURITY: NO wildcards in production (removed .pixcapture.pages.dev)
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 204,
  }));

  // Request ID middleware - Attach unique request_id to every request
  app.use((req: Request, res: Response, next: any) => {
    const requestId = generateRequestId();
    (req as any).requestId = requestId;
    const requestStart = Date.now();
    
    // Attach request ID to response header for tracing
    res.setHeader("X-Request-ID", requestId);
    
    // Log request completion
    res.on("finish", () => {
      const duration = Date.now() - requestStart;
      const logContext: LogContext = {
        requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
      };
      
      logger.info(`Request completed`, logContext);
    });
    
    next();
  });

  // Security headers with Helmet
  app.use(helmet({
    strictTransportSecurity: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Vite dev needs unsafe-inline/eval
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://pixcapture.app", "https://pix.immo", "https:", "blob:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https://storage.googleapis.com"],
        frameAncestors: ["'none'"],
      },
    },
    frameguard: { action: 'sameorigin' }, // Changed from DENY to SAMEORIGIN for compatibility
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));
  
  // Global rate limiting (60 requests/min per IP)
  app.use(globalLimiter);
  
  // Content-Type validation for POST/PUT/PATCH requests
  app.use(validateUploadContentType);
  
  // Cookie parser middleware - Must come before authMiddleware
  app.use(cookieParser());
  
  // Ensure demo user exists for development
  async function ensureDemoUser() {
    const demoEmail = "demo@pix.immo";
    let demoUser = await storage.getUserByEmail(demoEmail);
    
    if (!demoUser) {
      // Create demo user for development
      demoUser = await storage.createUser(demoEmail, "demo-password-hash", "admin");
      console.log("✓ Demo user created:", demoEmail);
    }
    
    return demoUser;
  }

  // Auth middleware - Attach user to request if authenticated
  async function authMiddleware(req: Request, res: Response, next: any) {
    try {
      const sessionId = req.cookies?.[SESSION_CONFIG.cookieName];
      
      if (!sessionId) {
        return next();
      }
      
      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie(SESSION_CONFIG.cookieName);
        return next();
      }
      
      const user = await storage.getUser(session.userId);
      if (!user) {
        await storage.deleteSession(sessionId);
        res.clearCookie(SESSION_CONFIG.cookieName);
        return next();
      }
      
      (req as any).user = user;
      (req as any).sessionId = sessionId;
    } catch (error) {
      console.error("Auth middleware error:", error);
    }
    next();
  }

  // Require authentication middleware
  // Apply auth middleware to all routes
  app.use(authMiddleware);

  // Authentication Routes
  
  // POST /api/auth/login - Email/password login
  app.post("/api/auth/login", authLimiter, async (req: Request, res: Response) => {
    try {
      const { email, password, staySignedIn } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isValidPassword = await verifyPassword(password, user.hashedPassword);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Create session with appropriate expiry
      const expiryDuration = staySignedIn 
        ? SESSION_CONFIG.expiresIn // 30 days
        : 1000 * 60 * 60 * 24; // 24 hours
      
      const expiresAt = Date.now() + expiryDuration;
      const session = await storage.createSession(user.id, expiresAt);
      
      // Set cookie with appropriate maxAge (in milliseconds)
      const cookieMaxAge = staySignedIn
        ? SESSION_CONFIG.cookieOptions.maxAge * 1000 // Convert to ms
        : 60 * 60 * 24 * 1000; // 24 hours in milliseconds
      
      res.cookie(SESSION_CONFIG.cookieName, session.id, {
        ...SESSION_CONFIG.cookieOptions,
        maxAge: cookieMaxAge,
      });
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // POST /api/auth/signup - Create new user account
  const signupSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

  app.post("/api/auth/signup", authLimiter, validateBody(signupSchema), async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }
      
      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser(email, hashedPassword, "client");
      
      // Create session (default 24h for signup)
      const expiresAt = Date.now() + (1000 * 60 * 60 * 24); // 24 hours
      const session = await storage.createSession(user.id, expiresAt);
      
      // Set session cookie
      res.cookie(SESSION_CONFIG.cookieName, session.id, {
        ...SESSION_CONFIG.cookieOptions,
        maxAge: 60 * 60 * 24 * 1000, // 24 hours in milliseconds
      });
      
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // POST /api/auth/demo - Demo mode login (24h expiry)
  app.post("/api/auth/demo", authLimiter, async (req: Request, res: Response) => {
    try {
      const demoUser = await ensureDemoUser();
      
      // Create session with 24h expiry for demo mode
      const expiresAt = Date.now() + (1000 * 60 * 60 * 24); // 24 hours
      const session = await storage.createSession(demoUser.id, expiresAt);
      
      res.cookie(SESSION_CONFIG.cookieName, session.id, {
        ...SESSION_CONFIG.cookieOptions,
        maxAge: 60 * 60 * 24 * 1000, // 24 hours in milliseconds
      });
      
      res.json({
        user: {
          id: demoUser.id,
          email: demoUser.email,
          role: demoUser.role,
        },
      });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ error: "Demo login failed" });
    }
  });

  // POST /api/auth/logout - Logout
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const sessionId = (req as any).sessionId;
      
      if (sessionId) {
        await storage.deleteSession(sessionId);
      }
      
      res.clearCookie(SESSION_CONFIG.cookieName);
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // GET /api/auth/me - Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  });

  // POST /api/auth/change-password - Change user password
  app.post("/api/auth/change-password", authLimiter, requireAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Aktuelles und neues Passwort erforderlich" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "Neues Passwort muss mindestens 8 Zeichen lang sein" });
      }
      
      // Verify current password
      const currentUser = await storage.getUser(user.id);
      if (!currentUser) {
        return res.status(404).json({ error: "Benutzer nicht gefunden" });
      }
      
      const isValidPassword = await verifyPassword(currentPassword, currentUser.hashedPassword);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Aktuelles Passwort ist falsch" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      await storage.updateUserPassword(user.id, hashedPassword);
      
      res.json({ 
        success: true,
        message: "Passwort erfolgreich geändert"
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ error: "Passwortänderung fehlgeschlagen" });
    }
  });

  // PATCH /api/device-profile - Update device profile (Office-Pro registration)
  app.patch("/api/device-profile", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { office_pro, cap_proraw, timestamp } = req.body;
      
      // Log device registration for analytics/audit trail
      console.log(`[Device Profile] User ${user.id} registered device:`, {
        office_pro,
        cap_proraw,
        timestamp,
      });
      
      // In production, this would save to database
      // For now, just acknowledge the registration
      res.json({ 
        success: true,
        id: `device-${user.id}`,
        message: "Device profile updated successfully"
      });
    } catch (error) {
      console.error("Device profile update error:", error);
      res.status(500).json({ error: "Failed to update device profile" });
    }
  });

  // Workflow API Routes
  
  // POST /api/jobs - Create a new job with job_number generation and offline deduplication
  app.post("/api/jobs", validateBody(createJobSchema), async (req: Request, res: Response) => {
    try {
      // TODO: Get userId from session/auth middleware when auth is implemented
      // For now, use demo user
      const demoUser = await ensureDemoUser();
      
      const { localId, customerName, propertyName, propertyAddress, deadlineAt, deliverGallery, deliverAlttext, deliverExpose, selectedUserId, selectedUserInitials, selectedUserCode } = req.body;
      
      // Deduplication: Check if job with this localId already exists
      if (localId) {
        const existingJob = await storage.findJobByLocalId(localId);
        if (existingJob) {
          // Job already exists - return 409 Conflict with existing job data
          return res.status(409).json({ 
            message: "Job with this localId already exists",
            job: existingJob 
          });
        }
      }
      
      // No duplicate found - create new job
      const job = await storage.createJob(demoUser.id, {
        localId,
        customerName,
        propertyName,
        propertyAddress,
        deadlineAt,
        deliverGallery,
        deliverAlttext,
        deliverExpose,
        selectedUserId,
        selectedUserInitials,
        selectedUserCode,
      });
      
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ error: "Failed to create job" });
    }
  });
  
  // GET /api/jobs - Get all jobs (admin) or user's jobs
  app.get("/api/jobs", async (req: Request, res: Response) => {
    try {
      // TODO: Get userId and role from session/auth middleware when auth is implemented
      // For now, show all jobs (demo user is admin)
      const jobs = await storage.getAllJobs();
      
      res.json(jobs);
    } catch (error) {
      console.error("Error getting jobs:", error);
      res.status(500).json({ error: "Failed to get jobs" });
    }
  });
  
  // GET /api/jobs/:id - Get job by ID
  app.get("/api/jobs/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error getting job:", error);
      res.status(500).json({ error: "Failed to get job" });
    }
  });
  
  // PATCH /api/jobs/:id/status - Update job status (for Büro-Modus)
  app.patch("/api/jobs/:id/status", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      await storage.updateJobStatus(req.params.id, status);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating job status:", error);
      res.status(500).json({ error: "Failed to update job status" });
    }
  });

  // Demo: POST /api/jobs/:id/process - Trigger demo processing (preview → caption → exposé)
  app.post("/api/jobs/:id/process", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Start processing in background (fire-and-forget for demo)
      processJobDemo(req.params.id, storage).catch((error) => {
        console.error(`[Demo Processing] Background error for job ${req.params.id}:`, error);
      });

      res.json({ message: "Processing started", jobId: req.params.id });
    } catch (error) {
      console.error("Error processing job:", error);
      res.status(500).json({ error: "Failed to process job" });
    }
  });

  // Demo: GET /api/jobs/:id/captions - Get all captions for a job
  app.get("/api/jobs/:id/captions", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      const captions = await storage.getJobCaptions(req.params.id);
      res.json(captions);
    } catch (error) {
      console.error("Error getting captions:", error);
      res.status(500).json({ error: "Failed to get captions" });
    }
  });

  // Demo: GET /api/jobs/:id/expose - Get exposé for a job
  app.get("/api/jobs/:id/expose", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      const expose = await storage.getJobExpose(req.params.id);
      if (!expose) {
        return res.status(404).json({ error: "Exposé not found" });
      }
      res.json(expose);
    } catch (error) {
      console.error("Error getting exposé:", error);
      res.status(500).json({ error: "Failed to get exposé" });
    }
  });
  
  // POST /api/uploads/init - Initialize a shoot for uploading
  app.post("/api/uploads/init", uploadLimiter, validateBody(initUploadSchema), async (req: Request, res: Response) => {
    try {
      const { jobNumber } = req.body;
      
      // Get job by job number
      const job = await storage.getJobByNumber(jobNumber);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Check if there's an active shoot for this job
      let shoot = await storage.getActiveShootForJob(job.id);
      
      // If no active shoot, create a new one
      if (!shoot) {
        shoot = await storage.createShoot(job.id);
        await storage.updateJobStatus(job.id, "in_progress");
      }
      
      const response: InitUploadResponse = {
        shootId: shoot.id,
        shootCode: shoot.shootCode,
        jobId: job.id,
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error initializing upload:", error);
      res.status(500).json({ error: "Failed to initialize upload" });
    }
  });
  
  // GET /api/shoots/:id - Get shoot details
  app.get("/api/shoots/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      const shoot = await storage.getShoot(req.params.id);
      if (!shoot) {
        return res.status(404).json({ error: "Shoot not found" });
      }
      res.json(shoot);
    } catch (error) {
      console.error("Error getting shoot:", error);
      res.status(500).json({ error: "Failed to get shoot" });
    }
  });
  
  // GET /api/shoots/:id/stacks - Get all stacks for a shoot
  app.get("/api/shoots/:id/stacks", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      const stacks = await storage.getShootStacks(req.params.id);
      res.json(stacks);
    } catch (error) {
      console.error("Error getting stacks:", error);
      res.status(500).json({ error: "Failed to get stacks" });
    }
  });
  
  // PUT /api/stacks/:id/room-type - Assign room type to a stack
  app.put("/api/stacks/:id/room-type", validateUuidParam("id"), validateBody(assignRoomTypeSchema), async (req: Request, res: Response) => {
    try {
      const { roomType } = req.body;
      await storage.updateStackRoomType(req.params.id, roomType);
      
      const stack = await storage.getStack(req.params.id);
      res.json(stack);
    } catch (error) {
      console.error("Error updating stack room type:", error);
      res.status(500).json({ error: "Failed to update stack room type" });
    }
  });
  
  // GET /api/shoots/:id/images - Get all images for a shoot
  app.get("/api/shoots/:id/images", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      const images = await storage.getShootImages(req.params.id);
      res.json(images);
    } catch (error) {
      console.error("Error getting images:", error);
      res.status(500).json({ error: "Failed to get images" });
    }
  });
  
  // POST /api/projects/:jobId/handoff/:shootId - Generate handoff package
  app.post("/api/projects/:jobId/handoff/:shootId", handoffLimiter, validateUuidParam("jobId", "shootId"), async (req: Request, res: Response) => {
    try {
      const { jobId, shootId } = req.params;
      
      // Verify job and shoot exist
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      const shoot = await storage.getShoot(shootId);
      if (!shoot) {
        return res.status(404).json({ error: "Shoot not found" });
      }
      
      // Generate handoff package (ZIP with renamed files and manifest)
      const packageResult = await generateHandoffPackage(jobId, shootId);
      if (!packageResult.ok) {
        return res.status(500).json({ error: packageResult.error || "Failed to generate handoff package" });
      }
      
      // Generate download token (36 hours validity)
      const downloadTokenResult = await generateHandoffToken(shootId);
      if (!downloadTokenResult.ok) {
        return res.status(500).json({ error: downloadTokenResult.error || "Failed to generate download token" });
      }
      
      // Generate upload token (36 hours validity)
      const uploadToken = randomBytes(32).toString('hex');
      const expiresAt = Date.now() + (36 * 60 * 60 * 1000); // 36 hours
      await storage.createEditorToken(shootId, 'upload', uploadToken, expiresAt);
      
      // Send notification to producer
      const downloadUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/handoff/download/${downloadTokenResult.token}`;
      await notifyHandoffReady({
        email: "demo@pix.immo", // TODO: Get from user/job settings
        jobNumber: job.jobNumber,
        shootCode: shoot.shootCode,
        downloadUrl,
      });
      
      // Only expose signed download URL, not internal storage path
      res.json({
        downloadUrl: `/api/handoff/download/${downloadTokenResult.token}`,
        uploadToken: uploadToken,
        expiresAt: downloadTokenResult.expiresAt,
      });
    } catch (error) {
      console.error("Error generating handoff package:", error);
      res.status(500).json({ error: "Failed to generate handoff package" });
    }
  });
  
  // POST /api/shoots/:id/presign - Generate presigned URLs for uploading RAW images
  app.post("/api/shoots/:id/presign", presignLimiter, validateUuidParam("id"), validateBody(presignedUploadSchema), async (req: Request, res: Response) => {
    try {
      const shootId = req.params.id;
      const { filenames } = req.body as { filenames: string[] };
      
      // TODO: Get userId from session/auth middleware when auth is implemented
      // For now, use demo user for ownership check
      const demoUser = await ensureDemoUser();
      
      // Get shoot to verify it exists and check ownership
      const shoot = await storage.getShoot(shootId);
      if (!shoot) {
        return res.status(404).json({ error: "Shoot not found" });
      }
      
      // Get job to verify ownership
      const job = await storage.getJob(shoot.jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // TODO: Check if user owns the job when auth is implemented
      // if (job.userId !== demoUser.id) {
      //   return res.status(403).json({ error: "Unauthorized" });
      // }
      
      // Validate file limits
      if (filenames.length > 50) {
        return res.status(400).json({ error: "Maximum 50 files per request" });
      }
      
      // Process each filename
      const results: PresignedUrlResponse[] = [];
      
      for (const filename of filenames) {
        // Validate filename against v3.1 schema
        if (!isValidFilenameV31(filename)) {
          results.push({
            filename,
            uploadUrl: "",
            error: "Invalid filename format. Must match v3.1 schema: {date}-{shootcode}_{room_type}_{index}_v{ver}.{ext}",
          });
          continue;
        }
        
        // Validate MIME type based on extension
        const ext = filename.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'heic', 'heif', 'png'];
        if (!ext || !allowedExtensions.includes(ext)) {
          results.push({
            filename,
            uploadUrl: "",
            error: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`,
          });
          continue;
        }
        
        // Generate object path
        const objectPath = generateObjectPath(job.id, shootId, filename, 'raw');
        
        // Generate presigned URL (120 second TTL)
        const presignResult = await generatePresignedPutUrl(objectPath, 120);
        
        if (!presignResult.ok || !presignResult.url) {
          results.push({
            filename,
            uploadUrl: "",
            error: presignResult.error || "Failed to generate presigned URL",
          });
          continue;
        }
        
        results.push({
          filename,
          uploadUrl: presignResult.url,
        });
      }
      
      res.json({ results });
    } catch (error) {
      console.error("Error generating presigned URLs:", error);
      res.status(500).json({ error: "Failed to generate presigned URLs" });
    }
  });
  
  // POST /api/shoots/:id/upload - Upload RAW images for a shoot
  app.post("/api/shoots/:id/upload", uploadLimiter, validateUuidParam("id"), upload.array("files"), async (req: Request, res: Response) => {
    try {
      const shootId = req.params.id;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      
      // Get shoot to verify it exists and get job ID
      const shoot = await storage.getShoot(shootId);
      if (!shoot) {
        return res.status(404).json({ error: "Shoot not found" });
      }
      
      // Get frame count from request (default to 5)
      const frameCount = req.body.frameCount === "3" ? 3 : 5;
      
      // Process uploaded files
      const result = await processUploadedFiles(shootId, shoot.jobId, files, frameCount);
      
      if (!result.success) {
        return res.status(500).json({ error: result.error || "Failed to process files" });
      }
      
      res.json({
        success: true,
        stackCount: result.stackCount,
        imageCount: result.imageCount,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });
  
  // POST /api/editor/:token/upload - Editor upload endpoint
  app.post("/api/editor/:token/upload", uploadLimiter, upload.single("package"), async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      // Verify token
      const editorToken = await storage.getEditorToken(token);
      if (!editorToken || editorToken.tokenType !== 'upload') {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      
      // Get shoot and job info for notifications
      const shoot = await storage.getShoot(editorToken.shootId);
      if (!shoot) {
        return res.status(404).json({ error: "Shoot not found" });
      }
      
      const job = await storage.getJob(shoot.jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      // Mark token as used
      await storage.markEditorTokenUsed(token);
      
      // TODO: Implement ZIP validation and unpacking
      // For now, just log the upload
      console.log(`📦 Editor uploaded ${file.size} bytes for shoot ${editorToken.shootId}`);
      
      // Update shoot status
      await storage.updateShootStatus(editorToken.shootId, 'editor_returned', 'editorReturnedAt');
      
      // Schedule background processing (60-minute quiet window)
      const queueJobId = scheduleEditorReturnProcessing(editorToken.shootId);
      
      // Send notification to producer
      await notifyEditorUploadComplete({
        email: "demo@pix.immo", // TODO: Get from user/job settings
        jobNumber: job.jobNumber,
        shootCode: shoot.shootCode,
        imageCount: 0, // TODO: Get actual count from unpacked ZIP
      });
      
      res.json({ 
        success: true, 
        message: "Upload received successfully",
        queueJobId,
      });
    } catch (error) {
      console.error("Error handling editor upload:", error);
      res.status(500).json({ error: "Failed to process upload" });
    }
  });

  // Bearer token management routes
  const createTokenSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    scopes: z.array(z.enum(["upload:raw", "view:gallery", "ai:run", "order:read", "order:write", "admin:all"])),
    expiresInDays: z.number().int().min(1).max(365).optional().default(90),
  });

  app.post("/api/tokens", validateBody(createTokenSchema), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { name, scopes, expiresInDays } = req.body;
      const { token, hashedToken } = generateBearerToken();
      
      const expiresAt = Date.now() + (expiresInDays * 24 * 60 * 60 * 1000);
      
      const pat = await storage.createPersonalAccessToken({
        userId: user.id,
        token: hashedToken,
        name,
        scopes: scopes.join(","),
        expiresAt,
      });

      res.json({
        id: pat.id,
        token,
        name: pat.name,
        scopes: pat.scopes.split(","),
        expiresAt: pat.expiresAt,
        createdAt: pat.createdAt,
      });
    } catch (error) {
      console.error("Error creating token:", error);
      res.status(500).json({ error: "Failed to create token" });
    }
  });

  app.get("/api/tokens", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const tokens = await storage.getUserPersonalAccessTokens(user.id);
      
      const sanitizedTokens = tokens.map((t) => ({
        id: t.id,
        name: t.name,
        scopes: t.scopes.split(","),
        expiresAt: t.expiresAt,
        lastUsedAt: t.lastUsedAt,
        lastUsedIp: t.lastUsedIp,
        revokedAt: t.revokedAt,
        createdAt: t.createdAt,
      }));

      res.json(sanitizedTokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      res.status(500).json({ error: "Failed to fetch tokens" });
    }
  });

  app.delete("/api/tokens/:id", validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      
      const tokens = await storage.getUserPersonalAccessTokens(user.id);
      const token = tokens.find((t) => t.id === id);

      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }

      await storage.revokePersonalAccessToken(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error revoking token:", error);
      res.status(500).json({ error: "Failed to revoke token" });
    }
  });

  // RAW file upload endpoints (multipart resumable)
  const initRawUploadSchema = z.object({
    shootId: z.string().uuid(),
    filename: z.string().min(1).max(255),
    fileSize: z.number().int().positive(),
    roomType: z.string().min(1),
    stackIndex: z.number().int().min(0),
    stackCount: z.number().int().min(3).max(5),
  });

  app.post("/api/raw-uploads/init", uploadLimiter, validateBody(initRawUploadSchema), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { shootId, filename, fileSize, roomType, stackIndex, stackCount } = req.body;

      const filenameValidation = validateRawFilename(filename);
      if (!filenameValidation.valid) {
        return res.status(400).json({ error: filenameValidation.error });
      }

      const shoot = await storage.getShoot(shootId);
      if (!shoot) {
        return res.status(404).json({ error: "Shoot not found" });
      }

      const r2Key = generateR2ObjectKey(shootId, filename, "raw");
      
      const upload = await initMultipartUpload(r2Key, "application/octet-stream");

      const session = await storage.createUploadSession({
        id: upload.uploadId,
        userId: user.id,
        shootId,
        filename,
        roomType,
        stackIndex,
        stackCount,
        r2Key,
        uploadId: upload.uploadId,
        fileSize,
      });

      const partCount = calculatePartCount(fileSize);

      res.json({
        uploadId: upload.uploadId,
        sessionId: session.id,
        r2Key: upload.key,
        partCount,
        chunkSize: MULTIPART_CHUNK_SIZE,
      });
    } catch (error) {
      console.error("Error initializing upload:", error);
      res.status(500).json({ error: "Failed to initialize upload" });
    }
  });

  const getPresignedUrlsSchema = z.object({
    partNumbers: z.array(z.number().int().positive()),
  });

  app.post("/api/raw-uploads/:uploadId/parts", presignLimiter, validateBody(getPresignedUrlsSchema), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { uploadId } = req.params;
      const { partNumbers } = req.body;

      const session = await storage.getUploadSession(uploadId);
      if (!session) {
        return res.status(404).json({ error: "Upload session not found" });
      }

      if (session.userId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (session.status === "completed") {
        return res.status(400).json({ error: "Upload already completed" });
      }

      const presignedUrls = await Promise.all(
        partNumbers.map(async (partNumber: number) => ({
          partNumber,
          url: await generatePresignedUploadUrl(session.r2Key, session.uploadId, partNumber),
        }))
      );

      res.json({ presignedUrls });
    } catch (error) {
      console.error("Error generating presigned URLs:", error);
      res.status(500).json({ error: "Failed to generate presigned URLs" });
    }
  });

  const completeUploadSchema = z.object({
    parts: z.array(z.object({
      PartNumber: z.number().int().positive(),
      ETag: z.string().min(1),
    })),
  });

  app.post("/api/raw-uploads/:uploadId/complete", uploadLimiter, validateBody(completeUploadSchema), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { uploadId } = req.params;
      const { parts } = req.body;

      const session = await storage.getUploadSession(uploadId);
      if (!session) {
        return res.status(404).json({ error: "Upload session not found" });
      }

      if (session.userId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (session.status === "completed") {
        return res.status(400).json({ error: "Upload already completed" });
      }

      await storage.updateUploadSessionParts(uploadId, JSON.stringify(parts));

      const result = await completeMultipartUpload(session.r2Key, session.uploadId, parts);

      await storage.completeUploadSession(uploadId);

      await storage.createImage({
        shootId: session.shootId,
        stackId: undefined,
        originalFilename: session.filename,
        renamedFilename: undefined,
        filePath: session.r2Key,
        fileSize: session.fileSize || undefined,
        mimeType: "application/octet-stream",
        exifDate: undefined,
        exposureValue: extractStackNumberFromFilename(session.filename) || undefined,
        positionInStack: session.stackIndex,
      });

      res.json({
        success: true,
        location: result.location,
        etag: result.etag,
      });
    } catch (error) {
      console.error("Error completing upload:", error);
      await storage.failUploadSession(req.params.uploadId);
      res.status(500).json({ error: "Failed to complete upload" });
    }
  });

  // Mobile photo upload endpoint with sidecar support (object_meta.json + alt_text.txt)
  app.post("/api/mobile-uploads", uploadLimiter, upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'metadata', maxCount: 1 },  // object_meta.json
    { name: 'alt_text', maxCount: 1 },  // alt_text.txt
  ]), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { jobId, roomType, orientation, capturedAt, stackId, stackIndex, evCompensation, isManualMode } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const file = files?.photo?.[0];
      const metadataFile = files?.metadata?.[0];
      const altTextFile = files?.alt_text?.[0];

      if (!file) {
        return res.status(400).json({ error: "No photo file uploaded" });
      }

      if (!jobId) {
        return res.status(400).json({ error: "jobId is required" });
      }

      if (!roomType) {
        return res.status(400).json({ error: "roomType is required" });
      }

      // Validate job exists and user has access
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Get or create active shoot for this job
      let shoot = await storage.getActiveShootForJob(jobId);
      if (!shoot) {
        shoot = await storage.createShoot(jobId);
        console.log(`[Mobile Upload] Created new shoot ${shoot.shootCode} for job ${jobId}`);
      }

      // Get next index for this room type within the shoot
      const nextIndex = await storage.getNextSequenceIndexForRoom(shoot.id, roomType);

      // Import v3.1 filename generator
      const { 
        generateFinalJpegFilename, 
        generateRawFrameFilename,
        formatDateForFilename,
      } = await import('../shared/filename-v31.js');

      // Determine capture date
      const captureDate = capturedAt ? new Date(capturedAt) : new Date();
      const dateStr = formatDateForFilename(captureDate);

      // Detect if this is a RAW/HDR frame or final JPEG
      const isRawFrame = stackId && evCompensation !== undefined;
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
      const isRawFile = ['dng', 'cr2', 'cr3', 'nef', 'arw', 'raf'].includes(fileExtension);

      let generatedFilename: string;

      if (isRawFrame || isRawFile) {
        // RAW/HDR frame: {date}-{shootcode}_{room_type}_{index}_g{stack}_e{ev}.{ext}
        generatedFilename = generateRawFrameFilename({
          date: dateStr,
          shootCode: shoot.shootCode.toUpperCase(),
          roomType: roomType,
          index: nextIndex,
          stackNumber: stackId ? parseInt(stackId) : 1,
          evValue: evCompensation ? parseFloat(evCompensation) : 0,
          extension: fileExtension,
          version: 1, // Not used for RAW frames
        });
      } else {
        // Final JPEG: {date}-{shootcode}_{room_type}_{index}_v{ver}.jpg
        generatedFilename = generateFinalJpegFilename({
          date: dateStr,
          shootCode: shoot.shootCode.toUpperCase(),
          roomType: roomType,
          index: nextIndex,
          version: 1, // First version
        });
      }

      // Build object_meta for R2 storage
      // IMPORTANT: Orientation ONLY in JSON metadata, NOT in filename
      const objectMeta = {
        roomType: roomType || null,
        orientation: orientation || null, // Stays in JSON only
        stackId: stackId ? parseInt(stackId) : null,
        stackIndex: stackIndex ? parseInt(stackIndex) : null,
        evCompensation: evCompensation ? parseFloat(evCompensation) : null,
        isManualMode: isManualMode === 'true',
        capturedAt: captureDate.toISOString(),
        sequenceIndex: nextIndex, // Track subject index
      };

      // Process sidecar files if present
      const { validateObjectMeta, parseObjectMeta } = await import('../shared/sidecar-export.js');
      const warnings: string[] = [];
      let parsedMetadata = null;
      let altTextContent = null;

      if (metadataFile) {
        try {
          const metadataJson = metadataFile.buffer.toString('utf-8');
          parsedMetadata = parseObjectMeta(metadataJson);
          
          // Validate metadata (warnings, nicht blockierend)
          const validation = validateObjectMeta(parsedMetadata);
          if (validation.warnings.length > 0) {
            warnings.push(...validation.warnings.map(w => `[Metadata] ${w}`));
          }
          if (!validation.isValid) {
            warnings.push(`[Metadata] Schwere Fehler: ${validation.errors.join(', ')}`);
          }
          
          console.log(`[Sidecar] object_meta.json received, Warnings: ${validation.warnings.length}`);
        } catch (err) {
          warnings.push(`[Metadata] JSON Parse-Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
        }
      } else {
        warnings.push('[Metadata] object_meta.json nicht hochgeladen (optional)');
      }

      if (altTextFile) {
        try {
          altTextContent = altTextFile.buffer.toString('utf-8');
          const lineCount = altTextContent.split('\n').filter(l => l.trim()).length;
          console.log(`[Sidecar] alt_text.txt received, ${lineCount} Zeilen`);
        } catch (err) {
          warnings.push(`[Alt-Text] Fehler beim Lesen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
        }
      } else {
        warnings.push('[Alt-Text] alt_text.txt nicht hochgeladen (optional)');
      }

      console.log(`[Mobile Upload v3.1] User ${user.id}, Shoot ${shoot.shootCode}, Room ${roomType}, Index ${nextIndex}`);
      console.log(`  Generated filename: ${generatedFilename}`);
      console.log(`  Original: ${file.originalname}, Size: ${file.size}, Manual: ${isManualMode === 'true' ? 'YES' : 'NO'}`);
      console.log(`  Object meta:`, objectMeta);
      console.log(`  Sidecars: JSON=${!!metadataFile}, TXT=${!!altTextFile}`);
      if (warnings.length > 0) {
        console.warn(`  Warnings (${warnings.length}):`, warnings);
      }
      
      // Create image record in database (R2 upload TBD later)
      const mockR2Path = `memory-uploads/${shoot.shootCode}/${generatedFilename}`;
      const imageRecord = await storage.createImage({
        shootId: shoot.id,
        stackId: stackId || undefined,
        originalFilename: file.originalname,
        renamedFilename: generatedFilename,
        filePath: mockR2Path,
        fileSize: file.size,
        mimeType: file.mimetype,
        exposureValue: evCompensation ? `e${evCompensation}` : undefined,
        positionInStack: stackIndex ? parseInt(stackIndex) : undefined,
        roomType: roomType,
        validatedAt: Date.now(),
        classifiedAt: Date.now(),
      });

      console.log(`[DB] Created image record: ${imageRecord.id}`);

      res.json({
        success: true,
        message: "Upload completed with v3.1 filename + sidecars",
        imageId: imageRecord.id,
        filename: generatedFilename,
        originalFilename: file.originalname,
        size: file.size,
        shootCode: shoot.shootCode,
        roomType,
        sequenceIndex: nextIndex,
        objectMeta,
        sidecars: {
          metadata: !!metadataFile,
          altText: !!altTextFile,
        },
        warnings: warnings.length > 0 ? warnings : undefined,
      });
    } catch (error) {
      console.error("Error in mobile upload:", error);
      res.status(500).json({ error: "Failed to process upload" });
    }
  });

  // PixCapture Upload Endpoints (Intent-based Upload System)
  
  // POST /api/pixcapture/upload/intent - Generate signed URL for direct R2 upload
  app.post("/api/pixcapture/upload/intent", uploadLimiter, validateBody(uploadIntentSchema), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { filename, mimeType, fileSize, checksum, orderId, roomType, stackId } = req.body;

      // Generate unique object key
      const timestamp = Date.now();
      const randomSuffix = randomBytes(8).toString('hex');
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const objectKey = `pixcapture/${user.id}/${timestamp}-${randomSuffix}-${sanitizedFilename}`;

      // Generate signed PUT URL (5 minutes expiry)
      const uploadUrl = await generateSignedPutUrl(objectKey, mimeType, 300);

      // Store intent in database (without finalizedAt)
      await storage.createUploadedFile({
        userId: user.id,
        objectKey,
        originalFilename: filename,
        mimeType,
        fileSize,
        checksum,
        orderId,
        roomType,
        stackId,
      });

      const response: UploadIntentResponse = {
        objectKey,
        uploadUrl,
        expiresIn: 300,
      };

      res.json(response);
    } catch (error) {
      console.error("Error creating upload intent:", error);
      res.status(500).json({ error: "Failed to create upload intent" });
    }
  });

  // POST /api/pixcapture/upload/finalize - Confirm successful R2 upload
  app.post("/api/pixcapture/upload/finalize", uploadLimiter, validateBody(uploadFinalizeSchema), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { objectKey, checksum, exifMeta } = req.body;

      // Verify upload exists and belongs to user
      const upload = await storage.getUploadedFileByObjectKey(objectKey);
      if (!upload) {
        return res.status(404).json({ error: "Upload not found" });
      }

      if (upload.userId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Mark as finalized
      await storage.finalizeUploadedFile(objectKey, Date.now());

      // Optionally update checksum & EXIF if provided
      if (checksum && upload.id) {
        await storage.updateUploadedFileStatus(upload.id, "uploaded");
      }

      res.json({
        success: true,
        fileId: upload.id,
        objectKey,
      });
    } catch (error) {
      console.error("Error finalizing upload:", error);
      res.status(500).json({ error: "Failed to finalize upload" });
    }
  });

  // AI processing endpoints
  app.get("/api/ai/tools", async (req: Request, res: Response) => {
    try {
      const tools = getAllTools();
      res.json(tools);
    } catch (error) {
      console.error("Error fetching AI tools:", error);
      res.status(500).json({ error: "Failed to fetch AI tools" });
    }
  });

  const runAIToolSchema = z.object({
    shootId: z.string().uuid(),
    toolId: z.string().min(1),
    sourceImageKey: z.string().min(1),
    params: z.record(z.any()).optional(),
  });

  app.post("/api/ai/run", validateBody(runAIToolSchema), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { shootId, toolId, sourceImageKey, params } = req.body;

      const shoot = await storage.getShoot(shootId);
      if (!shoot) {
        return res.status(404).json({ error: "Shoot not found" });
      }

      const job = await storage.getJob(shoot.jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      if (job.userId !== user.id && user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const tool = getToolById(toolId);
      if (!tool) {
        return res.status(400).json({ error: "Invalid tool ID" });
      }

      const userCredits = await storage.getUserCredits(user.id);
      if (userCredits < tool.creditsPerImage) {
        return res.status(402).json({ 
          error: "Insufficient credits",
          required: tool.creditsPerImage,
          current: userCredits,
        });
      }

      const webhookUrl = `${process.env.BASE_URL || "https://pix.immo"}/api/ai/webhook`;
      
      const sourceImageUrl = `https://${process.env.CF_R2_BUCKET}.r2.cloudflarestorage.com/${sourceImageKey}`;

      const result = await runAITool({
        toolId,
        sourceImageUrl,
        webhookUrl,
        params,
      });

      const aiJob = await storage.createAIJob({
        userId: user.id,
        shootId,
        tool: toolId,
        modelSlug: tool.modelVersion,
        sourceImageKey,
        params: params ? JSON.stringify(params) : undefined,
        externalJobId: result.id,
      });

      res.json({
        jobId: aiJob.id,
        externalJobId: result.id,
        status: result.status,
        estimatedTime: tool.estimatedTimeSeconds,
        cost: tool.costPerImage,
        credits: tool.creditsPerImage,
      });
    } catch (error) {
      console.error("Error running AI tool:", error);
      res.status(500).json({ error: "Failed to run AI tool" });
    }
  });

  app.post("/api/ai/webhook", async (req: Request, res: Response) => {
    try {
      const { id: externalJobId, status, output, error } = req.body;

      const aiJob = await storage.getAIJobByExternalId(externalJobId);
      if (!aiJob) {
        return res.status(404).json({ error: "AI job not found" });
      }

      if (status === "succeeded" && output) {
        const outputUrl = Array.isArray(output) ? output[0] : output;
        const outputFilename = `${aiJob.id}_${Date.now()}.jpg`;
        const outputKey = generateR2ObjectKey(aiJob.shootId, outputFilename, "ai");

        const tool = getToolById(aiJob.tool);
        const cost = tool?.costPerImage || 0;
        const credits = tool?.creditsPerImage || 0;

        const deducted = await storage.deductCredits(aiJob.userId, credits);
        if (!deducted) {
          console.error(`Failed to deduct ${credits} credits from user ${aiJob.userId} for job ${aiJob.id}`);
        }

        await storage.completeAIJob(aiJob.id, outputKey, cost, credits);

        res.json({ success: true });
      } else if (status === "failed") {
        await storage.updateAIJobStatus(aiJob.id, "failed", error);
        res.json({ success: true });
      } else {
        await storage.updateAIJobStatus(aiJob.id, status);
        res.json({ success: true });
      }
    } catch (error) {
      console.error("Error processing AI webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  app.get("/api/ai/jobs/:shootId", validateUuidParam("shootId"), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { shootId } = req.params;

      const shoot = await storage.getShoot(shootId);
      if (!shoot) {
        return res.status(404).json({ error: "Shoot not found" });
      }

      const job = await storage.getJob(shoot.jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      if (job.userId !== user.id && user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const jobs = await storage.getShootAIJobs(shootId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching AI jobs:", error);
      res.status(500).json({ error: "Failed to fetch AI jobs" });
    }
  });

  // NOTE: Credit billing endpoints moved to server/index.ts (Hono) for proper session auth
  // - GET /api/credits/balance
  // - POST /api/credits/purchase
  // - POST /api/credits/webhook

  // ========================================
  // Google Maps API Routes
  // ========================================

  /**
   * POST /api/google/geocode
   * Validate and geocode an address using Google Geocoding API
   * Returns verified coordinates and place ID
   */
  app.post("/api/google/geocode", async (req: Request, res: Response) => {
    try {
      const { address } = req.body;

      if (!address || typeof address !== 'string' || address.trim().length < 5) {
        return res.status(400).json({ error: "Valid address required" });
      }

      // Check if API key is configured
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        return res.status(503).json({ error: "Google Maps API not configured" });
      }

      const { validateAddress } = await import("./google-maps");
      const result = await validateAddress(address.trim());

      if (!result.isValid) {
        return res.status(404).json({ 
          error: result.error || "Address not found",
          isValid: false,
        });
      }

      res.json({
        isValid: true,
        isRooftop: result.isRooftop,
        lat: result.lat,
        lng: result.lng,
        placeId: result.placeId,
        formattedAddress: result.formattedAddress,
        locationType: result.locationType,
      });
    } catch (error) {
      console.error("Error geocoding address:", error);
      res.status(500).json({ error: "Failed to geocode address" });
    }
  });

  /**
   * GET /api/google/static-map
   * Generate a Google Static Maps URL for a thumbnail
   * Query params: lat, lng, width (optional), height (optional), zoom (optional)
   */
  app.get("/api/google/static-map", async (req: Request, res: Response) => {
    try {
      const { lat, lng, width, height, zoom } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({ error: "lat and lng required" });
      }

      // Check if API key is configured
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        return res.status(503).json({ error: "Google Maps API not configured" });
      }

      const { getStaticMapUrl } = await import("./google-maps");
      
      const mapUrl = getStaticMapUrl(
        parseFloat(lat as string),
        parseFloat(lng as string),
        {
          width: width ? parseInt(width as string) : 400,
          height: height ? parseInt(height as string) : 200,
          zoom: zoom ? parseInt(zoom as string) : 17,
          mapType: 'satellite',
        }
      );

      if (!mapUrl) {
        return res.status(503).json({ error: "Failed to generate map URL" });
      }

      res.json({ url: mapUrl });
    } catch (error) {
      console.error("Error generating static map:", error);
      res.status(500).json({ error: "Failed to generate static map" });
    }
  });

  // Healthz endpoint for monitoring and CI/CD
  app.get("/healthz", (req, res) => {
    res.json({
      status: "ok",
      env: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      service: "pix.immo",
      version: "1.0.0",
    });
  });

  // B2a - QA endpoint for production validation (Express dev mode)
  app.get("/api/qa", async (req, res) => {
    try {
      // Simplified QA response for dev mode (no KV config in Express)
      const response = {
        endpoint: "express /api/qa (dev mode)",
        timestamp: new Date().toISOString(),
        canary: {
          sampling_active: false,
          percent: 0,
          tag: "express-dev",
          cohort: "proxy",
          decision_reason: "express-no-kv",
          emergency_proxy: false,
        },
        health: {
          native: {
            status: "n/a",
            note: "Native handlers only available in Workers deployment",
          },
          proxy: {
            status: "healthy",
            note: "Express dev server running",
          },
        },
        note: "Full QA functionality available in Workers deployment at api.pix.immo/api/qa",
      };

      res.json(response);
    } catch (error) {
      console.error("[QA] Error:", error);
      res.status(500).json({ error: "QA endpoint error" });
    }
  });

  // Register Gallery System V1.0 routes
  registerGalleryRoutes(app);

  // Register Editor Management System routes (Admin-only)
  registerEditorRoutes(app);

  // Register Media Library routes
  registerMediaLibraryRoutes(app);

  // Register Invoice routes
  registerInvoiceRoutes(app);

  // Register Blog routes
  registerBlogRoutes(app);

  // Register Service routes
  registerServiceRoutes(app);

  // Register Booking routes
  registerBookingRoutes(app);
  
  // Register Gallery Package & Selection routes
  registerGalleryPackageRoutes(app);
  registerUploadManifestRoutes(app);

  // Register Order Files Management routes (PixCapture)
  registerOrderFilesRoutes(app);

  // Register Edit Workflow routes (Phase 2 - Stubs)
  registerEditWorkflowRoutes(app);

  // Global error handler - Response Sanitization (must be last!)
  app.use((err: any, req: Request, res: Response, next: any) => {
    // Security: Log download authorization failures for audit trail
    if (err.name === 'DownloadUnauthorizedError') {
      console.warn('[SECURITY] Download denied', {
        requestId: (req as any).requestId,
        userId: req.user?.id,
        userRole: req.user?.role,
        reason: err.reason,
        jobId: err.jobId,
        fileId: err.fileId,
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
    } else {
      // Log the full error internally for non-security errors
      console.error('[ERROR]', {
        requestId: (req as any).requestId,
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
    }
    
    // Never send stack traces to client
    const statusCode = err.statusCode || err.status || 500;
    const message = statusCode === 500 
      ? 'Internal Server Error' // Generic message for 500 errors
      : err.message || 'An error occurred';
    
    res.status(statusCode).json({ 
      error: message,
      requestId: (req as any).requestId, // Include for support
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
