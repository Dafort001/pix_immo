import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { generatePresignedDownloadUrl, generatePresignedPutUrl } from "./r2-client";
import { randomBytes, createHash } from "crypto";

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
    const token = req.query.t as string;
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

  // GET /api/editor/jobs/:jobId - Get job details for editor
  app.get("/api/editor/jobs/:jobId", editorApiLimiter, validateEditorToken, async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const shoot = (req as any).shoot;
      const editorToken = (req as any).editorToken;

      // Get job details
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Extract city from address
      let city = "Unknown";
      if (job.addressFormatted) {
        // Try to extract city from formatted address
        const parts = job.addressFormatted.split(",");
        if (parts.length >= 2) {
          city = parts[parts.length - 2].trim();
        }
      } else if (job.propertyAddress) {
        // Fallback to property address
        const parts = job.propertyAddress.split(",");
        if (parts.length >= 2) {
          city = parts[parts.length - 2].trim();
        }
      }

      // Format deadline
      let deadlineDisplay = "No deadline set";
      if (job.deadlineAt) {
        const deadline = new Date(job.deadlineAt);
        deadlineDisplay = deadline.toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }

      // Determine status based on shoot status
      let status = "NOT_UPLOADED";
      if (shoot.status === "editor_returned") {
        status = "UPLOADED";
      } else if (shoot.status === "in_progress") {
        status = "UPLOADING";
      }

      // Check if upload is allowed
      const allowUpload = shoot.status !== "editor_returned" && shoot.status !== "completed";

      // Generate download URL for handoff package
      let downloadUrl: string | null = null;
      if (shoot.handoffGeneratedAt) {
        try {
          const objectKey = `pix-shoots/${shoot.id}/handoff.zip`;
          downloadUrl = await generatePresignedDownloadUrl(objectKey, 3600); // 1 hour
        } catch (error) {
          console.error("Error generating download URL:", error);
        }
      }

      // Placeholder notes (can be customized per job later)
      const placeholderNotes = job.customerCommentEn || "";

      res.json({
        jobId: job.id,
        shootCode: shoot.shootCode,
        objectName: job.propertyName,
        city,
        deadlineDisplay,
        status,
        downloadUrl,
        allowUpload,
        placeholderNotes,
      });
    } catch (error) {
      console.error("Get editor job error:", error);
      res.status(500).json({ error: "Failed to fetch job details" });
    }
  });

  // POST /api/editor/jobs/:jobId/upload-url - Request presigned upload URL
  app.post("/api/editor/jobs/:jobId/upload-url", editorApiLimiter, validateEditorToken, async (req: Request, res: Response) => {
    try {
      const shoot = (req as any).shoot;

      // Check if upload is allowed
      if (shoot.status === "editor_returned" || shoot.status === "completed") {
        return res.status(403).json({ error: "Uploads are no longer allowed for this job" });
      }

      // Generate presigned PUT URL for the edited ZIP file
      const objectKey = `pix-shoots/${shoot.id}/edited/final.zip`;
      const uploadUrl = await generatePresignedPutUrl(objectKey, 3600); // 1 hour

      res.json({ uploadUrl });
    } catch (error) {
      console.error("Generate upload URL error:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // POST /api/editor/jobs/:jobId/upload-complete - Notify upload completion
  app.post("/api/editor/jobs/:jobId/upload-complete", editorApiLimiter, validateEditorToken, async (req: Request, res: Response) => {
    try {
      const shoot = (req as any).shoot;
      const editorToken = (req as any).editorToken;

      // Update shoot status to editor_returned
      await storage.updateShoot(shoot.id, {
        status: "editor_returned",
        editorReturnedAt: Date.now(),
      });

      // Mark token as used
      await storage.updateEditorToken(editorToken.id, {
        usedAt: Date.now(),
      });

      // Get updated job data
      const job = await storage.getJob(shoot.jobId);

      res.json({
        status: "UPLOADED",
        allowUpload: false,
        message: "Upload completed successfully",
      });
    } catch (error) {
      console.error("Upload complete error:", error);
      res.status(500).json({ error: "Failed to process upload completion" });
    }
  });
}
