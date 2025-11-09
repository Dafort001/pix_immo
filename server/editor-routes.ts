import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { requireAuth, requireRole, validateBody, validateUuidParam } from "./routes";
import { insertEditorSchema, insertEditorAssignmentSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";

// Rate limiter for admin write operations (30 req/min)
const adminWriteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: "Too many admin requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas for editor operations
const updateEditorSchema = z.object({
  name: z.string().min(1).optional(),
  specialization: z.string().optional(),
  maxConcurrentJobs: z.number().int().positive().optional(),
});

const updateEditorAvailabilitySchema = z.object({
  availability: z.enum(['available', 'busy', 'unavailable']),
});

const updateAssignmentStatusSchema = z.object({
  status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled']),
});

const updateAssignmentPrioritySchema = z.object({
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
});

const updateAssignmentNotesSchema = z.object({
  notes: z.string(),
});

const reassignJobSchema = z.object({
  newEditorId: z.string().uuid(),
  notes: z.string().optional(),
});

export function registerEditorRoutes(app: Express): void {
  // ============================================================
  // Editor Management (Admin-only)
  // ============================================================

  // GET /api/editors - List all editors
  app.get("/api/editors", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const editors = await storage.getAllEditors();
      res.json(editors);
    } catch (error) {
      console.error("Get editors error:", error);
      res.status(500).json({ error: "Failed to fetch editors" });
    }
  });

  // GET /api/editors/available - Get available editors (with optional filters)
  app.get("/api/editors/available", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const specialization = req.query.specialization as string | undefined;
      const maxWorkload = req.query.maxWorkload === 'true';

      const editors = await storage.getAvailableEditors({
        specialization,
        maxWorkload,
      });

      res.json(editors);
    } catch (error) {
      console.error("Get available editors error:", error);
      res.status(500).json({ error: "Failed to fetch available editors" });
    }
  });

  // GET /api/editors/:id - Get editor details
  app.get("/api/editors/:id", requireAuth, requireRole("admin"), validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      const editor = await storage.getEditor(req.params.id);
      if (!editor) {
        return res.status(404).json({ error: "Editor not found" });
      }
      res.json(editor);
    } catch (error) {
      console.error("Get editor error:", error);
      res.status(500).json({ error: "Failed to fetch editor" });
    }
  });

  // GET /api/editors/:id/workload - Get editor workload details
  app.get("/api/editors/:id/workload", requireAuth, requireRole("admin"), validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      const workload = await storage.getEditorWorkloadDetailed(req.params.id);
      res.json(workload);
    } catch (error) {
      console.error("Get editor workload error:", error);
      res.status(500).json({ error: "Failed to fetch editor workload" });
    }
  });

  // POST /api/editors - Create new editor
  app.post("/api/editors", requireAuth, requireRole("admin"), adminWriteLimiter, validateBody(insertEditorSchema), async (req: Request, res: Response) => {
    try {
      const editor = await storage.createEditor(req.body);
      res.status(201).json(editor);
    } catch (error: any) {
      console.error("Create editor error:", error);
      if (error.code === '23505') { // Unique constraint violation (duplicate email)
        return res.status(409).json({ error: "Editor with this email already exists" });
      }
      res.status(500).json({ error: "Failed to create editor" });
    }
  });

  // PATCH /api/editors/:id - Update editor
  app.patch("/api/editors/:id", requireAuth, requireRole("admin"), adminWriteLimiter, validateUuidParam("id"), validateBody(updateEditorSchema), async (req: Request, res: Response) => {
    try {
      await storage.updateEditor(req.params.id, req.body);
      const updated = await storage.getEditor(req.params.id);
      res.json(updated);
    } catch (error) {
      console.error("Update editor error:", error);
      res.status(500).json({ error: "Failed to update editor" });
    }
  });

  // PATCH /api/editors/:id/availability - Update editor availability
  app.patch("/api/editors/:id/availability", requireAuth, requireRole("admin"), adminWriteLimiter, validateUuidParam("id"), validateBody(updateEditorAvailabilitySchema), async (req: Request, res: Response) => {
    try {
      await storage.updateEditorAvailability(req.params.id, req.body.availability);
      const updated = await storage.getEditor(req.params.id);
      res.json(updated);
    } catch (error) {
      console.error("Update editor availability error:", error);
      res.status(500).json({ error: "Failed to update editor availability" });
    }
  });

  // DELETE /api/editors/:id - Delete editor
  app.delete("/api/editors/:id", requireAuth, requireRole("admin"), adminWriteLimiter, validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      await storage.deleteEditor(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete editor error:", error);
      res.status(500).json({ error: "Failed to delete editor" });
    }
  });

  // ============================================================
  // Editor Assignments (Admin-only)
  // ============================================================

  // GET /api/editor-assignments - List all assignments (with optional filters)
  app.get("/api/editor-assignments", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        priority: req.query.priority as string | undefined,
        editorId: req.query.editorId as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };

      const assignments = await storage.getAllAssignments(filters);
      res.json(assignments);
    } catch (error) {
      console.error("Get assignments error:", error);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  // GET /api/editor-assignments/:id - Get specific assignment
  app.get("/api/editor-assignments/:id", requireAuth, requireRole("admin"), validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      const assignment = await storage.getEditorAssignment(req.params.id);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      console.error("Get assignment error:", error);
      res.status(500).json({ error: "Failed to fetch assignment" });
    }
  });

  // GET /api/jobs/:jobId/assignments - Get all assignments for a job (including history)
  app.get("/api/jobs/:jobId/assignments", requireAuth, requireRole("admin"), validateUuidParam("jobId"), async (req: Request, res: Response) => {
    try {
      const assignments = await storage.getAllJobAssignments(req.params.jobId);
      res.json(assignments);
    } catch (error) {
      console.error("Get job assignments error:", error);
      res.status(500).json({ error: "Failed to fetch job assignments" });
    }
  });

  // POST /api/editor-assignments - Assign job to editor
  app.post("/api/editor-assignments", requireAuth, requireRole("admin"), adminWriteLimiter, validateBody(insertEditorAssignmentSchema), async (req: Request, res: Response) => {
    try {
      // Check if job already has an active assignment
      const existing = await storage.getJobAssignment(req.body.jobId);
      if (existing) {
        return res.status(409).json({ error: "Job already has an active assignment" });
      }

      const assignment = await storage.assignJobToEditor(req.body);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Create assignment error:", error);
      res.status(500).json({ error: "Failed to create assignment" });
    }
  });

  // PATCH /api/editor-assignments/:id/status - Update assignment status
  app.patch("/api/editor-assignments/:id/status", requireAuth, requireRole("admin"), adminWriteLimiter, validateUuidParam("id"), validateBody(updateAssignmentStatusSchema), async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      let timestampField: string | undefined;

      if (status === 'in_progress') {
        timestampField = 'startedAt';
      } else if (status === 'completed') {
        timestampField = 'completedAt';
      }

      await storage.updateAssignmentStatus(req.params.id, status, timestampField);
      const updated = await storage.getEditorAssignment(req.params.id);
      res.json(updated);
    } catch (error) {
      console.error("Update assignment status error:", error);
      res.status(500).json({ error: "Failed to update assignment status" });
    }
  });

  // PATCH /api/editor-assignments/:id/priority - Update assignment priority
  app.patch("/api/editor-assignments/:id/priority", requireAuth, requireRole("admin"), adminWriteLimiter, validateUuidParam("id"), validateBody(updateAssignmentPrioritySchema), async (req: Request, res: Response) => {
    try {
      await storage.updateAssignmentPriority(req.params.id, req.body.priority);
      const updated = await storage.getEditorAssignment(req.params.id);
      res.json(updated);
    } catch (error) {
      console.error("Update assignment priority error:", error);
      res.status(500).json({ error: "Failed to update assignment priority" });
    }
  });

  // PATCH /api/editor-assignments/:id/notes - Update assignment notes
  app.patch("/api/editor-assignments/:id/notes", requireAuth, requireRole("admin"), adminWriteLimiter, validateUuidParam("id"), validateBody(updateAssignmentNotesSchema), async (req: Request, res: Response) => {
    try {
      await storage.updateAssignmentNotes(req.params.id, req.body.notes);
      const updated = await storage.getEditorAssignment(req.params.id);
      res.json(updated);
    } catch (error) {
      console.error("Update assignment notes error:", error);
      res.status(500).json({ error: "Failed to update assignment notes" });
    }
  });

  // POST /api/editor-assignments/:id/reassign - Reassign job to different editor
  app.post("/api/editor-assignments/:id/reassign", requireAuth, requireRole("admin"), adminWriteLimiter, validateUuidParam("id"), validateBody(reassignJobSchema), async (req: Request, res: Response) => {
    try {
      const { newEditorId, notes } = req.body;
      const newAssignment = await storage.reassignJob(req.params.id, newEditorId, notes);
      res.json(newAssignment);
    } catch (error: any) {
      console.error("Reassign job error:", error);
      if (error.message.includes('cannot reassign')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to reassign job" });
    }
  });

  // DELETE /api/editor-assignments/:id - Cancel assignment
  app.delete("/api/editor-assignments/:id", requireAuth, requireRole("admin"), adminWriteLimiter, validateUuidParam("id"), async (req: Request, res: Response) => {
    try {
      await storage.cancelAssignment(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Cancel assignment error:", error);
      res.status(500).json({ error: "Failed to cancel assignment" });
    }
  });
}
