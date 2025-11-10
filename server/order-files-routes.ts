import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import {
  orderFilesFilterSchema,
  orderStacksFilterSchema,
  bulkMarkFilesSchema,
  bulkDeleteFilesSchema,
  fileNoteSchema,
  fileNotesFilterSchema,
} from "@shared/schema";

/**
 * Order Files Management Routes (Phase 1)
 * Provides REST API for managing uploaded files within orders
 */
export function registerOrderFilesRoutes(app: Express): void {
  // =================================================================
  // GET /api/orders/:id/files - List files for an order
  // =================================================================
  app.get("/api/orders/:orderId/files", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { orderId } = req.params;

      // Validate and parse query parameters
      const filters = orderFilesFilterSchema.parse(req.query);

      // Convert string booleans to actual booleans
      const options = {
        roomType: filters.roomType,
        marked: filters.marked === 'true' ? true : filters.marked === 'false' ? false : undefined,
        status: filters.status,
        includeDeleted: filters.includeDeleted === 'true',
        limit: filters.limit,
        offset: filters.offset,
        sortBy: filters.sortBy,
      };

      // Storage layer enforces authorization
      const result = await storage.getOrderFiles(orderId, req.user.id, options);

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if ((error as Error).message?.includes('Unauthorized')) {
        return res.status(403).json({ error: (error as Error).message });
      }
      if ((error as Error).message?.includes('not found')) {
        return res.status(404).json({ error: (error as Error).message });
      }
      console.error("Get order files error:", error);
      res.status(500).json({ error: "Failed to retrieve files" });
    }
  });

  // =================================================================
  // GET /api/orders/:id/stacks - Get aggregated stack view
  // =================================================================
  app.get("/api/orders/:orderId/stacks", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { orderId } = req.params;

      // Validate and parse query parameters
      const filters = orderStacksFilterSchema.parse(req.query);

      // Storage layer enforces authorization
      const stacks = await storage.getOrderStacks(orderId, req.user.id, {
        includeDeleted: filters.includeDeleted === 'true',
        previewLimit: filters.previewLimit,
      });

      res.json({ stacks });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if ((error as Error).message?.includes('Unauthorized')) {
        return res.status(403).json({ error: (error as Error).message });
      }
      if ((error as Error).message?.includes('not found')) {
        return res.status(404).json({ error: (error as Error).message });
      }
      console.error("Get order stacks error:", error);
      res.status(500).json({ error: "Failed to retrieve stacks" });
    }
  });

  // =================================================================
  // POST /api/files/bulk-mark - Bulk mark/unmark files
  // =================================================================
  app.post("/api/files/bulk-mark", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const validatedData = bulkMarkFilesSchema.parse(req.body);

      // Storage layer enforces authorization and validates same-order
      const result = await storage.bulkMarkFiles(
        validatedData.fileIds,
        validatedData.marked,
        req.user.id
      );

      res.json({
        success: true,
        affectedCount: result.affectedCount,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if ((error as Error).message?.includes('Unauthorized')) {
        return res.status(403).json({ error: (error as Error).message });
      }
      if ((error as Error).message?.includes('same order')) {
        return res.status(400).json({ error: (error as Error).message });
      }
      console.error("Bulk mark files error:", error);
      res.status(500).json({ error: "Failed to mark files" });
    }
  });

  // =================================================================
  // DELETE /api/files/bulk - Bulk soft-delete files
  // =================================================================
  app.delete("/api/files/bulk", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const validatedData = bulkDeleteFilesSchema.parse(req.body);

      // Storage layer enforces authorization and validates same-order
      const result = await storage.bulkDeleteFiles(
        validatedData.fileIds,
        req.user.id,
        {
          allowMarked: validatedData.allowMarked,
        }
      );

      res.json({
        success: true,
        affectedCount: result.affectedCount,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if ((error as Error).message?.includes('Unauthorized')) {
        return res.status(403).json({ error: (error as Error).message });
      }
      if ((error as Error).message?.includes('same order')) {
        return res.status(400).json({ error: (error as Error).message });
      }
      console.error("Bulk delete files error:", error);
      res.status(500).json({ error: "Failed to delete files" });
    }
  });

  // =================================================================
  // POST /api/files/:fileId/notes - Add note to file
  // =================================================================
  app.post("/api/files/:fileId/notes", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { fileId } = req.params;
      const validatedData = fileNoteSchema.parse(req.body);

      // Storage layer enforces authorization
      const note = await storage.addFileNote(
        fileId,
        req.user.id,
        validatedData.text
      );

      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if ((error as Error).message?.includes('Unauthorized')) {
        return res.status(403).json({ error: (error as Error).message });
      }
      if ((error as Error).message?.includes('not found')) {
        return res.status(404).json({ error: (error as Error).message });
      }
      if ((error as Error).message?.includes('exceed')) {
        return res.status(400).json({ error: (error as Error).message });
      }
      console.error("Add file note error:", error);
      res.status(500).json({ error: "Failed to add note" });
    }
  });

  // =================================================================
  // GET /api/files/:fileId/notes - Get notes for file
  // =================================================================
  app.get("/api/files/:fileId/notes", async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { fileId } = req.params;

      // Validate and parse query parameters
      const filters = fileNotesFilterSchema.parse(req.query);

      // Storage layer enforces authorization
      const result = await storage.getFileNotes(fileId, req.user.id, {
        limit: filters.limit,
        offset: filters.offset,
      });

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if ((error as Error).message?.includes('Unauthorized')) {
        return res.status(403).json({ error: (error as Error).message });
      }
      if ((error as Error).message?.includes('not found')) {
        return res.status(404).json({ error: (error as Error).message });
      }
      console.error("Get file notes error:", error);
      res.status(500).json({ error: "Failed to retrieve notes" });
    }
  });
}
