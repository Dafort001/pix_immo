import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { generatePresignedDownloadUrl, generateSignedPutUrl } from "./r2-client";
import { randomBytes, createHash, randomUUID } from "crypto";

// Rate limiter for public editor routes (more restrictive)
const editorApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Utility: Hash token with SHA-256
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Middleware to validate editor token from query parameter
async function validateEditorToken(req: Request, res: Response, next: any) {
  try {
    const token = req.query.token as string;
    const { jobId } = req.params;

    if (!token) {
      return res.status(401).json({ error: "Token required" });
    }

    if (!jobId) {
      return res.status(400).json({ error: "Job ID required" });
    }

    const tokenHash = hashToken(token);
    const editorToken = await storage.getEditorTokenByHash(tokenHash);

    if (!editorToken) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Check if token has expired
    if (editorToken.expiresAt < Date.now()) {
      return res.status(401).json({ error: "Token has expired" });
    }

    // Get the shoot and verify it belongs to the job
    const shoot = await storage.getShoot(editorToken.shootId);
    if (!shoot || shoot.jobId !== jobId) {
      return res.status(403).json({ error: "Token not valid for this job" });
    }

    // Attach validated data to request
    (req as any).editorToken = editorToken;
    (req as any).shoot = shoot;
    next();
  } catch (error) {
    console.error("Editor token validation error:", error);
    res.status(500).json({ error: "Token validation failed" });
  }
}

export function registerEditorJobRoutes(app: Express): void {
  // ============================================================
  // Public Editor Job Page Routes (Token-authenticated)
  // ============================================================

  // GET /api/editor/job/:jobId - Get job details for editor
  app.get("/api/editor/job/:jobId", editorApiLimiter, validateEditorToken, async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const shoot = (req as any).shoot;
      const editorToken = (req as any).editorToken;

      // Get job details
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Get all shoots for this job
      const allShoots = await storage.getShootsByJob(jobId);

      // Count total stacks and images across all shoots
      let totalStacks = 0;
      let totalRawImages = 0;
      const shootsData = [];

      for (const s of allShoots) {
        const stacks = await storage.getStacksByShoot(s.id);
        const images = await storage.getShootImages(s.id);
        
        totalStacks += stacks.length;
        totalRawImages += images.length;

        shootsData.push({
          id: s.id,
          name: s.shootCode || `Shoot ${s.id}`,
          stackCount: stacks.length,
          imageCount: images.length,
        });
      }

      res.json({
        jobNumber: job.jobNumber,
        propertyName: job.propertyName || "Unknown Property",
        propertyAddress: job.addressFormatted || job.propertyAddress || "No address",
        scheduledAt: job.scheduledAt || null,
        totalStacks,
        totalRawImages,
        shoots: shootsData,
        briefing: job.customerCommentEn || undefined,
      });
    } catch (error) {
      console.error("Get editor job error:", error);
      res.status(500).json({ error: "Failed to fetch job details" });
    }
  });

  // POST /api/editor/job/:jobId/download - Generate download URL for RAW files
  app.post("/api/editor/job/:jobId/download", editorApiLimiter, validateEditorToken, async (req: Request, res: Response) => {
    try {
      const shoot = (req as any).shoot;

      // Check if handoff package exists
      if (!shoot.handoffGeneratedAt) {
        return res.status(404).json({ error: "RAW files package not yet available" });
      }

      // Generate presigned download URL for the handoff ZIP
      const objectKey = `pix-shoots/${shoot.id}/handoff.zip`;
      const downloadUrl = await generatePresignedDownloadUrl(objectKey, 3600); // 1 hour

      res.json({ downloadUrl });
    } catch (error) {
      console.error("Generate download URL error:", error);
      res.status(500).json({ error: "Failed to generate download URL" });
    }
  });

  // POST /api/editor/job/:jobId/upload-url - Request presigned upload URL
  app.post("/api/editor/job/:jobId/upload-url", editorApiLimiter, validateEditorToken, async (req: Request, res: Response) => {
    try {
      const shoot = (req as any).shoot;
      const { filename, fileSize, mimeType } = req.body;

      // Validate request body
      if (!filename || !fileSize || !mimeType) {
        return res.status(400).json({ error: "Missing required fields: filename, fileSize, mimeType" });
      }

      // Check if upload is allowed
      if (shoot.status === "editor_returned" || shoot.status === "completed") {
        return res.status(403).json({ error: "Uploads are no longer allowed for this job" });
      }

      // Generate R2 object key for the edited image
      const timestamp = Date.now();
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const r2Key = `pix-shoots/${shoot.id}/edited/${timestamp}_${sanitizedFilename}`;

      // Generate presigned PUT URL
      const uploadUrl = await generateSignedPutUrl(r2Key, 3600); // 1 hour

      res.json({ uploadUrl, r2Key });
    } catch (error) {
      console.error("Generate upload URL error:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // POST /api/editor/job/:jobId/upload-complete - Notify upload completion
  app.post("/api/editor/job/:jobId/upload-complete", editorApiLimiter, validateEditorToken, async (req: Request, res: Response) => {
    try {
      const shoot = (req as any).shoot;
      const editorToken = (req as any).editorToken;
      const { filename, r2Key } = req.body;

      // Validate request body
      if (!filename || !r2Key) {
        return res.status(400).json({ error: "Missing required fields: filename, r2Key" });
      }

      // Create edited image record in database
      const editedImage = await storage.createEditedImage({
        id: crypto.randomUUID(),
        shootId: shoot.id,
        filename,
        filePath: r2Key,
        version: 1,
        createdAt: Date.now(),
      });

      res.json({
        success: true,
        imageId: editedImage.id,
        message: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Upload complete error:", error);
      res.status(500).json({ error: "Failed to process upload completion" });
    }
  });
}
