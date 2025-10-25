import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import { generateThumbnail } from "./services/thumbnail";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import { z } from "zod";

// Extend Express Request type to include user (set by session middleware)
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// Initialize R2 client
const R2_ENDPOINT = process.env.CF_R2_ENDPOINT!;
const R2_ACCESS_KEY = process.env.CF_R2_ACCESS_KEY!;
const R2_SECRET_KEY = process.env.CF_R2_SECRET_KEY!;
const R2_BUCKET = process.env.CF_R2_BUCKET!;

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ENDPOINT}`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

// Multer setup for file uploads (memory storage)
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
});

// Validation schemas
const createGallerySchema = z.object({
  galleryType: z.enum(["customer_upload", "photographer_upload", "editing"]),
  title: z.string().min(1),
  description: z.string().optional(),
  shootId: z.string().optional(),
  jobId: z.string().optional(),
});

const updateGallerySettingsSchema = z.object({
  globalStylePreset: z.enum(["PURE", "EDITORIAL", "CLASSIC"]).optional(),
  globalWindowPreset: z.enum(["CLEAR", "SCANDINAVIAN", "BRIGHT"]).optional(),
  globalSkyPreset: z.enum(["CLEAR BLUE", "PASTEL CLOUDS", "DAYLIGHT SOFT", "EVENING HAZE"]).optional(),
  globalFireplace: z.enum(["true", "false"]).optional(),
  globalRetouch: z.enum(["true", "false"]).optional(),
  globalEnhancements: z.enum(["true", "false"]).optional(),
});

const updateFileSettingsSchema = z.object({
  stylePreset: z.enum(["PURE", "EDITORIAL", "CLASSIC"]).optional(),
  windowPreset: z.enum(["CLEAR", "SCANDINAVIAN", "BRIGHT"]).optional(),
  skyPreset: z.enum(["CLEAR BLUE", "PASTEL CLOUDS", "DAYLIGHT SOFT", "EVENING HAZE"]).optional(),
  fireplaceEnabled: z.enum(["true", "false"]).optional(),
  retouchEnabled: z.enum(["true", "false"]).optional(),
  enhancementsEnabled: z.enum(["true", "false"]).optional(),
});

const addAnnotationSchema = z.object({
  annotationType: z.enum(["comment", "mask"]),
  comment: z.string().max(500).optional(),
});

/**
 * Generate unique filename following naming convention
 */
function generateStoredFilename(originalFilename: string, roomType: string, sequenceIndex: number): string {
  const date = new Date().toISOString().split('T')[0];
  const shootCode = `sg${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  const ext = originalFilename.split('.').pop()?.toLowerCase() || "jpg";
  
  return `${date}-${shootCode}_${roomType}_${String(sequenceIndex).padStart(2, '0')}_v1.${ext}`;
}

export function registerGalleryRoutes(app: Express): void {
  // ============================================================
  // Gallery Management
  // ============================================================

  // POST /api/gallery - Create a new gallery
  app.post("/api/gallery", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const validatedData = createGallerySchema.parse(req.body);
      
      const gallery = await storage.createGallery({
        galleryType: validatedData.galleryType,
        userId: req.user.id,
        shootId: validatedData.shootId,
        jobId: validatedData.jobId,
        title: validatedData.title,
        description: validatedData.description,
      });

      res.json(gallery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create gallery error:", error);
      res.status(500).json({ error: "Failed to create gallery" });
    }
  });

  // GET /api/gallery - Get user's galleries
  app.get("/api/gallery", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const galleryType = req.query.type as string | undefined;
      const galleries = await storage.getUserGalleries(req.user.id, galleryType);
      res.json(galleries);
    } catch (error) {
      console.error("Get galleries error:", error);
      res.status(500).json({ error: "Failed to fetch galleries" });
    }
  });

  // GET /api/gallery/:id - Get specific gallery with files
  app.get("/api/gallery/:id", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const gallery = await storage.getGallery(req.params.id);
      
      if (!gallery) {
        return res.status(404).json({ error: "Gallery not found" });
      }

      // Check ownership
      if (gallery.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const files = await storage.getGalleryFiles(gallery.id);

      res.json({
        ...gallery,
        files,
      });
    } catch (error) {
      console.error("Get gallery error:", error);
      res.status(500).json({ error: "Failed to fetch gallery" });
    }
  });

  // PATCH /api/gallery/:id/settings - Update gallery global settings
  app.patch("/api/gallery/:id/settings", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const gallery = await storage.getGallery(req.params.id);
      
      if (!gallery) {
        return res.status(404).json({ error: "Gallery not found" });
      }

      if (gallery.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const validatedSettings = updateGallerySettingsSchema.parse(req.body);
      await storage.updateGalleryGlobalSettings(gallery.id, validatedSettings);

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Update gallery settings error:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // POST /api/gallery/:id/finalize - Finalize gallery and export meta.json
  app.post("/api/gallery/:id/finalize", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const gallery = await storage.getGallery(req.params.id);
      
      if (!gallery) {
        return res.status(404).json({ error: "Gallery not found" });
      }

      if (gallery.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const files = await storage.getGalleryFiles(gallery.id);

      // Build gallery_meta.json
      const meta = {
        gallery_id: gallery.id,
        gallery_type: gallery.galleryType,
        uploaded_by: req.user.id,
        uploaded_at: gallery.createdAt,
        finalized_at: Date.now(),
        global_settings: {
          style: gallery.globalStylePreset,
          window: gallery.globalWindowPreset,
          sky: gallery.globalSkyPreset,
          fireplace: gallery.globalFireplace === "true",
          retouch: gallery.globalRetouch === "true",
          enhancements: gallery.globalEnhancements === "true",
        },
        files: await Promise.all(files.map(async (file) => {
          const annotations = await storage.getFileAnnotations(file.id);
          
          return {
            file_id: file.id,
            filename: file.storedFilename,
            original_filename: file.originalFilename,
            file_path: file.filePath,
            thumbnail_path: file.thumbnailPath,
            file_type: file.fileType,
            file_size_mb: file.fileSize ? (file.fileSize / (1024 * 1024)).toFixed(2) : null,
            room_type: file.roomType,
            settings: {
              style: file.stylePreset || gallery.globalStylePreset,
              window: file.windowPreset || gallery.globalWindowPreset,
              sky: file.skyPreset || gallery.globalSkyPreset,
              fireplace: (file.fireplaceEnabled || gallery.globalFireplace) === "true",
              retouch: (file.retouchEnabled || gallery.globalRetouch) === "true",
              enhancements: (file.enhancementsEnabled || gallery.globalEnhancements) === "true",
            },
            annotations: annotations.map(a => ({
              type: a.annotationType,
              comment: a.comment,
              mask_path: a.maskPath,
              created_at: a.createdAt,
            })),
          };
        })),
      };

      // Upload meta.json to R2
      const metaKey = `uploads/meta/${gallery.id}_meta.json`;
      const metaBuffer = Buffer.from(JSON.stringify(meta, null, 2));
      
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: metaKey,
        Body: metaBuffer,
        ContentType: "application/json",
      }));

      // Finalize gallery status
      await storage.finalizeGallery(gallery.id);

      res.json({
        success: true,
        meta_path: metaKey,
        meta,
      });
    } catch (error) {
      console.error("Finalize gallery error:", error);
      res.status(500).json({ error: "Failed to finalize gallery" });
    }
  });

  // ============================================================
  // File Upload
  // ============================================================

  // POST /api/gallery/:id/upload - Upload files to gallery
  app.post("/api/gallery/:id/upload", uploadMemory.array("files", 50), async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const gallery = await storage.getGallery(req.params.id);
      
      if (!gallery) {
        return res.status(404).json({ error: "Gallery not found" });
      }

      if (gallery.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const uploadedFiles = req.files as Express.Multer.File[];
      
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      const results = [];

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const roomType = (req.body.roomTypes && req.body.roomTypes[i]) || "undefined_space";
        const sequenceIndex = i + 1;

        // Generate stored filename
        const storedFilename = generateStoredFilename(file.originalname, roomType, sequenceIndex);
        const fileExt = file.originalname.split('.').pop()?.toLowerCase() || "";
        const r2Key = `uploads/raw/${gallery.id}/${storedFilename}`;

        // Upload to R2
        await s3.send(new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: r2Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }));

        // Create file record
        const galleryFile = await storage.createGalleryFile({
          galleryId: gallery.id,
          originalFilename: file.originalname,
          storedFilename,
          filePath: r2Key,
          fileType: fileExt,
          fileSize: file.size,
          roomType,
          sequenceIndex,
        });

        // Generate thumbnail asynchronously
        const thumbnailKey = `uploads/thumbs/${gallery.id}/${storedFilename.replace(/\.[^.]+$/, '.jpg')}`;
        generateThumbnail(r2Key, thumbnailKey, 800)
          .then(async () => {
            await storage.updateGalleryFileThumbnail(galleryFile.id, thumbnailKey);
          })
          .catch(err => {
            console.error(`Thumbnail generation failed for ${storedFilename}:`, err);
          });

        results.push({
          file_id: galleryFile.id,
          original_filename: file.originalname,
          stored_filename: storedFilename,
          file_path: r2Key,
          thumbnail_path: thumbnailKey,
        });
      }

      res.json({ success: true, files: results });
    } catch (error) {
      console.error("Upload files error:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  // ============================================================
  // File Management
  // ============================================================

  // PATCH /api/gallery/file/:id/settings - Update file-specific settings
  app.patch("/api/gallery/file/:id/settings", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const file = await storage.getGalleryFile(req.params.id);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      const gallery = await storage.getGallery(file.galleryId);
      
      if (!gallery || (gallery.userId !== req.user.id && req.user.role !== "admin")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const validatedSettings = updateFileSettingsSchema.parse(req.body);
      await storage.updateGalleryFileSettings(file.id, validatedSettings);

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Update file settings error:", error);
      res.status(500).json({ error: "Failed to update file settings" });
    }
  });

  // POST /api/gallery/file/:id/annotation - Add annotation (comment or mask)
  app.post("/api/gallery/file/:id/annotation", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const file = await storage.getGalleryFile(req.params.id);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      const gallery = await storage.getGallery(file.galleryId);
      
      if (!gallery || (gallery.userId !== req.user.id && req.user.role !== "admin")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const validatedData = addAnnotationSchema.parse(req.body);

      const annotation = await storage.createGalleryAnnotation({
        fileId: file.id,
        userId: req.user.id,
        annotationType: validatedData.annotationType,
        comment: validatedData.comment,
      });

      res.json(annotation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Add annotation error:", error);
      res.status(500).json({ error: "Failed to add annotation" });
    }
  });

  // GET /api/gallery/file/:id/annotations - Get file annotations
  app.get("/api/gallery/file/:id/annotations", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const file = await storage.getGalleryFile(req.params.id);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      const gallery = await storage.getGallery(file.galleryId);
      
      if (!gallery || (gallery.userId !== req.user.id && req.user.role !== "admin")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const annotations = await storage.getFileAnnotations(file.id);
      res.json(annotations);
    } catch (error) {
      console.error("Get annotations error:", error);
      res.status(500).json({ error: "Failed to fetch annotations" });
    }
  });

  // DELETE /api/gallery/annotation/:id - Delete annotation
  app.delete("/api/gallery/annotation/:id", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Note: In a production system, you'd want to verify ownership here
      await storage.deleteGalleryAnnotation(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete annotation error:", error);
      res.status(500).json({ error: "Failed to delete annotation" });
    }
  });

  // POST /api/gallery/file/:id/mask-upload - Upload mask PNG
  app.post("/api/gallery/file/:id/mask-upload", uploadMemory.single("mask"), async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const file = await storage.getGalleryFile(req.params.id);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      const gallery = await storage.getGallery(file.galleryId);
      
      if (!gallery || (gallery.userId !== req.user.id && req.user.role !== "admin")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const maskFile = req.file;
      
      if (!maskFile) {
        return res.status(400).json({ error: "No mask file provided" });
      }

      // Upload mask to R2
      const maskKey = `uploads/masks/${gallery.id}/${file.id}_mask_${Date.now()}.png`;
      
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: maskKey,
        Body: maskFile.buffer,
        ContentType: "image/png",
      }));

      // Create mask annotation
      const annotation = await storage.createGalleryAnnotation({
        fileId: file.id,
        userId: req.user.id,
        annotationType: "mask",
        maskPath: maskKey,
      });

      res.json({
        success: true,
        mask_path: maskKey,
        annotation,
      });
    } catch (error) {
      console.error("Upload mask error:", error);
      res.status(500).json({ error: "Failed to upload mask" });
    }
  });
}
