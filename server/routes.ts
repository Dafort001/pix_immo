import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { logger, generateRequestId, type LogContext } from "./logger";
import { createJobSchema, initUploadSchema, presignedUploadSchema, assignRoomTypeSchema, type InitUploadResponse, type PresignedUrlResponse } from "@shared/schema";
import { generateBearerToken } from "./bearer-auth";
import { validateRawFilename, extractRoomTypeFromFilename, extractStackNumberFromFilename, calculatePartCount, MULTIPART_CHUNK_SIZE } from "./raw-upload-helpers";
import { initMultipartUpload, generatePresignedUploadUrl, completeMultipartUpload, generateR2ObjectKey } from "./r2-client";
import { runAITool, getToolById, getAllTools } from "./replicate-adapter";
import { z } from "zod";
import { randomBytes } from "crypto";
import { upload, processUploadedFiles } from "./uploadHandler";
import { generateHandoffPackage, generateHandoffToken } from "./handoffPackage";
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
import { hashPassword, verifyPassword, SESSION_CONFIG } from "./auth";

// Middleware to validate request body with Zod
function validateBody(schema: z.ZodSchema) {
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
function validateUuidParam(...paramNames: string[]) {
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
function validateStringParam(...paramNames: string[]) {
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

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS configuration for web + future iOS app
  const allowedOrigins = [
    process.env.BASE_URL || "https://pix.immo",
    "http://localhost:5000",
    "http://localhost:5173",
    "capacitor://localhost", // For future iOS app
    "ionic://localhost", // For future Ionic app
  ];

  app.use((req: Request, res: Response, next: any) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "86400");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

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

  // Security headers middleware
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");
    
    // Prevent MIME-type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    // Enable XSS filter in older browsers
    res.setHeader("X-XSS-Protection", "1; mode=block");
    
    // Referrer policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Content Security Policy - relaxed for development only
    // In development, Vite HMR requires 'unsafe-inline' and 'unsafe-eval'
    // This middleware only runs in development, so these directives are acceptable
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://storage.googleapis.com; " +
      "frame-ancestors 'none';"
    );
    
    // HSTS (only in production with HTTPS)
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }
    
    next();
  });
  
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
  function requireAuth(req: Request, res: Response, next: any) {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  }

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
  app.post("/api/uploads/init", validateBody(initUploadSchema), async (req: Request, res: Response) => {
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
  app.post("/api/editor/:token/upload", upload.single("package"), async (req: Request, res: Response) => {
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

  app.post("/api/raw-uploads/init", validateBody(initRawUploadSchema), async (req: Request, res: Response) => {
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

  app.post("/api/raw-uploads/:uploadId/parts", validateBody(getPresignedUrlsSchema), async (req: Request, res: Response) => {
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

  app.post("/api/raw-uploads/:uploadId/complete", validateBody(completeUploadSchema), async (req: Request, res: Response) => {
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
  app.post("/api/mobile-uploads", upload.fields([
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

  // Register Gallery System V1.0 routes
  registerGalleryRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
