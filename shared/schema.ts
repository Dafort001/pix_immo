import { z } from "zod";
import { pgTable, varchar, text, bigint, boolean, jsonb, unique, index, integer, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Enums
export const selectionStateEnum = pgEnum("selection_state", [
  "none",
  "included",
  "extra_pending",
  "extra_paid",
  "extra_free",
  "blocked",
]);

export const uploadSessionStateEnum = pgEnum("upload_session_state", [
  "pending",
  "in_progress",
  "complete",
  "error",
  "stale",
]);

export const uploadItemStatusEnum = pgEnum("upload_item_status", [
  "pending",
  "uploading",
  "uploaded",
  "verified",
  "failed",
]);

export const auditActionTypeEnum = pgEnum("audit_action_type", [
  // Mandated kulanz/package events
  "update_included_images",
  "set_all_images_included",
  "change_selection_state_extra_free",
  // Future capacity
  "update_max_selectable",
  "update_extra_price_per_image",
  "update_free_extra_quota",
  "bulk_selection_change",
  "update_allow_free_extras",
]);

export const auditEntityScopeEnum = pgEnum("audit_entity_scope", [
  "job",
  "uploaded_file",
  "legacy_image",
]);

// Drizzle Tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("client"), // 'client' or 'admin'
  credits: bigint("credits", { mode: "number" }).notNull().default(0), // AI processing credits
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyName: varchar("property_name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 50 }),
  propertyAddress: text("property_address").notNull(),
  // Google Maps verified address data
  addressLat: varchar("address_lat", { length: 50 }), // Latitude from Google Geocoding
  addressLng: varchar("address_lng", { length: 50 }), // Longitude from Google Geocoding
  addressPlaceId: varchar("address_place_id", { length: 255 }), // Google Place ID for verified address
  addressFormatted: text("address_formatted"), // Formatted address from Google
  addressLocationType: varchar("address_location_type", { length: 50 }), // 'ROOFTOP', 'RANGE_INTERPOLATED', etc.
  preferredDate: varchar("preferred_date", { length: 50 }),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'confirmed', 'completed', 'cancelled'
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey(),
  localId: varchar("local_id", { length: 50 }).unique(), // Client-generated ULID for offline deduplication
  jobNumber: varchar("job_number", { length: 50 }).notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  customerName: varchar("customer_name", { length: 255 }), // Name of the ordering customer/agency
  propertyName: varchar("property_name", { length: 255 }).notNull(), // Property/listing name
  propertyAddress: text("property_address"), // Property address
  // Google Maps verified address data
  addressLat: varchar("address_lat", { length: 50 }), // Latitude from Google Geocoding
  addressLng: varchar("address_lng", { length: 50 }), // Longitude from Google Geocoding
  addressPlaceId: varchar("address_place_id", { length: 255 }), // Google Place ID for verified address
  addressFormatted: text("address_formatted"), // Formatted address from Google
  status: varchar("status", { length: 50 }).notNull().default("created"), // 'created', 'in_aufnahme', 'abgeschlossen', 'abgebrochen', 'uploaded', 'processing', 'captioned', 'expose_ready', 'delivered'
  deadlineAt: bigint("deadline_at", { mode: "number" }), // Optional deadline
  deliverGallery: varchar("deliver_gallery", { length: 10 }).notNull().default("true"),
  deliverAlttext: varchar("deliver_alttext", { length: 10 }).notNull().default("true"),
  deliverExpose: varchar("deliver_expose", { length: 10 }).notNull().default("false"),
  // Local App User (Photographer) Assignment
  selectedUserId: varchar("selected_user_id", { length: 50 }), // App-User UUID (localStorage, not DB foreign key)
  selectedUserInitials: varchar("selected_user_initials", { length: 10 }), // e.g. "DF"
  selectedUserCode: varchar("selected_user_code", { length: 20 }), // e.g. "K9M2P"
  // Package & Selection Logic (Image Limits & Kulanz)
  includedImages: integer("included_images").notNull().default(20), // Number of images included in package
  maxSelectable: integer("max_selectable"), // Hard limit for selectable images (null = same as includedImages)
  extraPricePerImage: integer("extra_price_per_image"), // Price per additional image in cents (e.g., 800 = €8.00)
  allowFreeExtras: boolean("allow_free_extras").notNull().default(true), // Whether kulanz extras can be given
  freeExtraQuota: integer("free_extra_quota"), // How many free extras can be granted (null = unlimited for admins)
  allImagesIncluded: boolean("all_images_included").notNull().default(false), // Kulanz: all images are free (no package limit)
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const shoots = pgTable("shoots", {
  id: varchar("id").primaryKey(),
  shootCode: varchar("shoot_code", { length: 5 }).notNull().unique(),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull().default("initialized"), // 'initialized', 'uploading', 'intake_complete', 'handoff_generated', 'editor_returned', 'processing'
  // Editor Assignment
  assignedEditorId: varchar("assigned_editor_id", { length: 50 }), // Editor ID from editor-assignment.ts
  editorAssignedAt: bigint("editor_assigned_at", { mode: "number" }), // When editor was assigned
  editorAssignedBy: varchar("editor_assigned_by").references(() => users.id, { onDelete: "set null" }), // Admin who assigned
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  intakeCompletedAt: bigint("intake_completed_at", { mode: "number" }),
  handoffGeneratedAt: bigint("handoff_generated_at", { mode: "number" }),
  editorReturnedAt: bigint("editor_returned_at", { mode: "number" }),
});

export const stacks = pgTable("stacks", {
  id: varchar("id").primaryKey(),
  shootId: varchar("shoot_id").notNull().references(() => shoots.id, { onDelete: "cascade" }),
  stackNumber: varchar("stack_number", { length: 10 }).notNull(), // 'g001', 'g002', etc.
  roomType: varchar("room_type", { length: 50 }).notNull().default("undefined_space"),
  frameCount: bigint("frame_count", { mode: "number" }).notNull().default(5), // 3 or 5
  sequenceIndex: bigint("sequence_index", { mode: "number" }).notNull(), // ordering within room_type
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

// PixCapture Uploaded Files (Intent-based Upload System)
// Extended for Order Files Management (Phase 0)
export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: varchar("order_id").references(() => orders.id, { onDelete: "cascade" }), // Optional: link to order
  objectKey: text("object_key").notNull().unique(), // R2 path (server-generated)
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  checksum: varchar("checksum", { length: 64 }), // SHA256 hash
  status: varchar("status", { length: 50 }).notNull().default("uploaded"), // 'uploaded', 'processing', 'completed', 'failed', 'queued', 'in_progress', 'done'
  locked: boolean("locked").notNull().default(false), // File locked during edit job processing
  roomType: varchar("room_type", { length: 50 }).notNull().default("undefined_space"), // Room classification (e.g., 'wohnzimmer', 'kueche')
  stackId: varchar("stack_id", { length: 20 }), // Stack group ID (e.g., 'g003')
  // Filename Schema v3.1 fields
  index: bigint("index", { mode: "number" }).notNull().default(1), // Position index within room_type (e.g., 001, 002)
  ver: bigint("ver", { mode: "number" }).notNull().default(1), // Version number (for re-uploads)
  // Order Files Management fields
  marked: boolean("marked").notNull().default(false), // Marked for editing/processing
  warnings: jsonb("warnings").$type<string[]>().default([]), // Array of warning codes (e.g., ['MISSING_FIELD', 'STACK_INCOMPLETE'])
  deletedAt: bigint("deleted_at", { mode: "number" }), // Soft-delete timestamp (null = not deleted)
  exifMeta: text("exif_meta"), // JSON string: { make, model, focal, iso, shutter }
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  finalizedAt: bigint("finalized_at", { mode: "number" }), // When finalize was called
  updatedAt: bigint("updated_at", { mode: "number" }), // Last modification timestamp
  // Edit Workflow fields (Phase 2)
  approved: boolean("approved").notNull().default(false), // Client approved for final delivery
  approvedAt: bigint("approved_at", { mode: "number" }), // When client approved
  completedAt: bigint("completed_at", { mode: "number" }), // When file processing fully completed
  // Gallery Selection & Package Logic
  isCandidate: boolean("is_candidate").notNull().default(true), // Whether image appears in customer gallery selection pool
  selectionState: selectionStateEnum("selection_state").notNull().default("none"), // Selection state for package logic
}, (table) => ({
  // UNIQUE constraint: prevent duplicate file slots in same stack/version
  uniqueFilePosition: unique("unique_file_position").on(table.orderId, table.roomType, table.index, table.ver),
}));

// File Notes - User comments/annotations on uploaded files
export const fileNotes = pgTable("file_notes", {
  id: varchar("id").primaryKey(),
  fileId: varchar("file_id").notNull().references(() => uploadedFiles.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(), // Note content
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }),
});

// Edit Jobs - Tracks editing tasks for uploaded files (Phase 2)
export const editJobs = pgTable("edit_jobs", {
  id: varchar("id").primaryKey(),
  fileId: varchar("file_id").notNull().references(() => uploadedFiles.id, { onDelete: "cascade" }),
  orderId: varchar("order_id").references(() => orders.id, { onDelete: "cascade" }), // Nullable for legacy/ad-hoc files
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Job owner
  status: varchar("status", { length: 50 }).notNull().default("queued"), // 'queued', 'in_progress', 'done', 'failed'
  express: boolean("express").notNull().default(false), // Express service requested
  retryCount: bigint("retry_count", { mode: "number" }).notNull().default(0), // Number of retry attempts (max 3)
  processingNotes: text("processing_notes"), // Internal processing notes
  resultPath: text("result_path"), // R2 path to processed file (processed/)
  previewPath: text("preview_path"), // R2 path to preview image (preview/)
  resultFileSize: bigint("result_file_size", { mode: "number" }), // Size of processed file
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  startedAt: bigint("started_at", { mode: "number" }), // When processing started
  finishedAt: bigint("finished_at", { mode: "number" }), // When processing completed
  error: text("error"), // Error message if failed
}, (table) => ({
  // Index for queue processing
  statusCreatedIdx: index("edit_jobs_status_created_idx").on(table.status, table.createdAt),
  // Index for order lookup
  orderIdIdx: index("edit_jobs_order_id_idx").on(table.orderId),
  // Index for file-centric queries
  fileIdIdx: index("edit_jobs_file_id_idx").on(table.fileId),
}));

// Manifest Upload Sessions - Client-manifest-based upload tracking for immediate error feedback
export const uploadManifestSessions = pgTable("upload_manifest_sessions", {
  id: varchar("id").primaryKey(),
  jobId: varchar("job_id").references(() => jobs.id, { onDelete: "cascade" }), // Optional: link to job
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientType: varchar("client_type", { length: 50 }).notNull(), // 'pixcapture_ios', 'pixcapture_android', 'web_uploader'
  expectedFiles: integer("expected_files").notNull(), // Number of files in manifest
  totalBytesExpected: bigint("total_bytes_expected", { mode: "number" }).notNull(), // Total size from manifest
  state: uploadSessionStateEnum("state").notNull().default("pending"), // Session state
  errorCount: integer("error_count").notNull().default(0), // Number of failed items
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  lastActivityAt: bigint("last_activity_at", { mode: "number" }).notNull(), // Last upload activity
  completedAt: bigint("completed_at", { mode: "number" }), // When session was marked complete
}, (table) => ({
  // Index for job lookup
  jobIdIdx: index("upload_manifest_sessions_job_id_idx").on(table.jobId),
  // Index for user lookup
  userIdIdx: index("upload_manifest_sessions_user_id_idx").on(table.userId),
  // Index for stale session cleanup
  stateActivityIdx: index("upload_manifest_sessions_state_activity_idx").on(table.state, table.lastActivityAt),
}));

// Manifest Upload Items - Individual files within a manifest upload session
export const uploadManifestItems = pgTable("upload_manifest_items", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").notNull().references(() => uploadManifestSessions.id, { onDelete: "cascade" }),
  objectKey: text("object_key").notNull(), // Expected R2 key (e.g., {shoot_id}/{filename})
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(), // Expected file size
  checksum: varchar("checksum", { length: 64 }), // MD5/SHA256 from client (for verification)
  status: uploadItemStatusEnum("status").notNull().default("pending"), // Item upload status
  errorMessage: text("error_message"), // Error details if failed
  retryCount: integer("retry_count").notNull().default(0), // Number of retry attempts
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  uploadedAt: bigint("uploaded_at", { mode: "number" }), // When file upload completed
  verifiedAt: bigint("verified_at", { mode: "number" }), // When file was verified on R2
}, (table) => ({
  // Index for session lookup
  sessionIdIdx: index("upload_manifest_items_session_id_idx").on(table.sessionId),
  // Index for status queries
  sessionIdStatusIdx: index("upload_manifest_items_session_id_status_idx").on(table.sessionId, table.status),
  // Unique constraint: prevent duplicate object keys
  uniqueObjectKey: unique("upload_manifest_items_object_key_unique").on(table.objectKey),
}));

// Notifications - System notifications for users (Phase 2)
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'job_submitted', 'job_completed', 'file_approved', 'file_revision', 'order_completed', 'invoice_ready'
  title: varchar("title", { length: 255 }).notNull(), // Notification title
  message: text("message").notNull(), // Notification body
  link: varchar("link", { length: 500 }), // Optional link to relevant page
  metadata: jsonb("metadata").$type<Record<string, any>>(), // Additional context (orderId, fileId, etc.)
  read: boolean("read").notNull().default(false), // Read status
  readAt: bigint("read_at", { mode: "number" }), // When notification was read
  deletedAt: bigint("deleted_at", { mode: "number" }), // Soft-delete for retention policy
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
}, (table) => ({
  // Index for user notifications lookup
  userIdCreatedIdx: index("notifications_user_id_created_idx").on(table.userId, table.createdAt),
  // Index for unread notifications
  userIdReadIdx: index("notifications_user_id_read_idx").on(table.userId, table.read),
}));

// Audit Logs for Package & Kulanz Changes (Security Requirement)
// Compliance-critical append-only log for all admin actions affecting package limits, kulanz, and selection state
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  // Who performed the action (admin only)
  adminUserId: varchar("admin_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Affected entities (job is always set, files are optional)
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  affectedUploadedFileId: varchar("affected_uploaded_file_id").references(() => uploadedFiles.id, { onDelete: "set null" }), // Null if job-level change
  affectedLegacyImageId: varchar("affected_legacy_image_id").references(() => images.id, { onDelete: "set null" }), // Null if job-level change or Orders system
  // Action classification
  entityScope: auditEntityScopeEnum("entity_scope").notNull(), // 'job', 'uploaded_file', 'legacy_image'
  actionType: auditActionTypeEnum("action_type").notNull(),
  // Change tracking (JSON for structured diffing)
  oldValue: jsonb("old_value").$type<Record<string, any>>(), // Before state
  newValue: jsonb("new_value").$type<Record<string, any>>(), // After state
  // Admin notes
  reason: text("reason"), // Optional explanation for kulanz decisions
  reasonCode: varchar("reason_code", { length: 50 }), // Optional category (e.g., 'customer_complaint', 'technical_issue')
  // Soft-delete for retention policy (24 months online)
  deletedAt: bigint("deleted_at", { mode: "number" }),
}, (table) => ({
  // Clustered index for job-scoped queries
  jobIdTimestampIdx: index("audit_logs_job_id_timestamp_idx").on(table.jobId, table.timestamp),
  // Admin activity tracking
  adminUserIdTimestampIdx: index("audit_logs_admin_user_id_timestamp_idx").on(table.adminUserId, table.timestamp),
  // File-level drill-down (uploaded_files system)
  entityScopeFileIdIdx: index("audit_logs_entity_scope_file_id_idx").on(table.entityScope, table.affectedUploadedFileId),
  // Abuse investigation (kulanz extras)
  kulanzActionIdx: index("audit_logs_kulanz_action_idx").on(table.actionType).where(sql`action_type = 'change_selection_state_extra_free'`),
}));

export const images = pgTable("images", {
  id: varchar("id").primaryKey(),
  shootId: varchar("shoot_id").notNull().references(() => shoots.id, { onDelete: "cascade" }),
  stackId: varchar("stack_id").references(() => stacks.id, { onDelete: "set null" }),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  renamedFilename: varchar("renamed_filename", { length: 255 }),
  filePath: text("file_path").notNull(), // R2 storage path for RAW
  previewPath: text("preview_path"), // R2 path for 3000px sRGB preview
  fileSize: bigint("file_size", { mode: "number" }),
  mimeType: varchar("mime_type", { length: 100 }),
  exifDate: bigint("exif_date", { mode: "number" }),
  exposureValue: varchar("exposure_value", { length: 10 }), // 'e0', 'e-2', 'e+2', etc.
  positionInStack: bigint("position_in_stack", { mode: "number" }),
  // Naming Policy v3.1 fields
  roomType: varchar("room_type", { length: 50 }), // Classified room type (see shared/room-types.ts)
  filenamePatternVersion: varchar("filename_pattern_version", { length: 10 }).default("v3.1"), // Naming pattern version
  validatedAt: bigint("validated_at", { mode: "number" }), // Timestamp when filename was validated against v3.1
  classifiedAt: bigint("classified_at", { mode: "number" }), // Timestamp when room_type was classified
  // QC Quality Check fields
  qcStatus: varchar("qc_status", { length: 20 }).default("pending"), // 'pending', 'approved', 'rejected', 'needs-revision'
  qcComment: text("qc_comment"), // QC rejection/revision reason
  qcTechnicalIssues: text("qc_technical_issues").array(), // Array of technical issues
  qcBy: varchar("qc_by").references(() => users.id, { onDelete: "set null" }), // Admin who performed QC
  qcAt: bigint("qc_at", { mode: "number" }), // Timestamp when QC was performed
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

// Demo: AI-generated captions for images
export const captions = pgTable("captions", {
  id: varchar("id").primaryKey(),
  imageId: varchar("image_id").notNull().references(() => images.id, { onDelete: "cascade" }),
  captionText: text("caption_text").notNull(), // Alt-text in German
  roomType: varchar("room_type", { length: 50 }), // Detected room type
  confidence: bigint("confidence", { mode: "number" }), // 0-100
  language: varchar("language", { length: 10 }).notNull().default("de"),
  version: bigint("version", { mode: "number" }).notNull().default(1),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

// Demo: AI-generated property exposés
export const exposes = pgTable("exposes", {
  id: varchar("id").primaryKey(),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(), // Short description
  highlights: text("highlights"), // JSON array of highlight strings
  neighborhood: text("neighborhood"), // Optional neighborhood description
  techDetails: text("tech_details"), // Optional technical details
  wordCount: bigint("word_count", { mode: "number" }),
  version: bigint("version", { mode: "number" }).notNull().default(1),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const editorTokens = pgTable("editor_tokens", {
  id: varchar("id").primaryKey(),
  shootId: varchar("shoot_id").notNull().references(() => shoots.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  tokenType: varchar("token_type", { length: 20 }).notNull(), // 'download' or 'upload'
  filePath: text("file_path"), // Optional: specific file path for download tokens
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  usedAt: bigint("used_at", { mode: "number" }),
});

export const editedImages = pgTable("edited_images", {
  id: varchar("id").primaryKey(),
  shootId: varchar("shoot_id").notNull().references(() => shoots.id, { onDelete: "cascade" }),
  stackId: varchar("stack_id").references(() => stacks.id, { onDelete: "set null" }),
  filename: varchar("filename", { length: 255 }).notNull(),
  filePath: text("file_path").notNull(), // Object storage path
  fileSize: bigint("file_size", { mode: "number" }),
  version: bigint("version", { mode: "number" }).notNull().default(1), // 1, 2, 3 for revision tracking
  roomType: varchar("room_type", { length: 50 }),
  sequenceIndex: bigint("sequence_index", { mode: "number" }), // ordering within room_type
  clientApprovalStatus: varchar("client_approval_status", { length: 20 }).notNull().default("pending"), // 'pending', 'approved', 'rejected'
  revisionNotes: text("revision_notes"),
  aiCaption: text("ai_caption"), // Future: AI-generated caption
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  approvedAt: bigint("approved_at", { mode: "number" }),
  rejectedAt: bigint("rejected_at", { mode: "number" }),
});

export const seoMetadata = pgTable("seo_metadata", {
  id: varchar("id").primaryKey(),
  pagePath: varchar("page_path", { length: 255 }).notNull().unique(), // e.g., '/', '/preise', '/about'
  pageTitle: varchar("page_title", { length: 255 }).notNull(),
  metaDescription: text("meta_description").notNull(),
  ogImage: varchar("og_image", { length: 500 }),
  altText: text("alt_text"), // JSON string for page-specific image alt texts
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  updatedBy: varchar("updated_by").references(() => users.id, { onDelete: "set null" }),
});

// Media Library - Public Images Management
export const publicImages = pgTable("public_images", {
  id: varchar("id").primaryKey(),
  page: varchar("page", { length: 50 }).notNull(), // 'home', 'pixcapture', 'gallery', 'blog'
  imageKey: varchar("image_key", { length: 100 }).notNull(), // 'home-001', 'pixcap-001', etc.
  url: text("url").notNull(), // Image URL (Unsplash or R2 storage)
  alt: text("alt").notNull(), // Alt text for accessibility
  description: text("description"), // Optional SEO description
  displayOrder: bigint("display_order", { mode: "number" }).notNull().default(0), // Sort order on page
  isActive: varchar("is_active", { length: 10 }).notNull().default("true"), // 'true' or 'false'
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  updatedBy: varchar("updated_by").references(() => users.id, { onDelete: "set null" }),
});

// Invoices for completed jobs
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(), // e.g., 'INV-2025-001'
  jobId: varchar("job_id").references(() => jobs.id, { onDelete: "set null" }), // Optional job reference
  bookingId: varchar("booking_id").references(() => bookings.id, { onDelete: "set null" }), // Optional booking reference
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerAddress: text("customer_address"),
  invoiceDate: bigint("invoice_date", { mode: "number" }).notNull(),
  dueDate: bigint("due_date", { mode: "number" }),
  serviceDescription: text("service_description").notNull(), // Description of services
  lineItems: text("line_items").notNull(), // JSON array of line items
  netAmount: bigint("net_amount", { mode: "number" }).notNull(), // Amount in cents
  vatRate: bigint("vat_rate", { mode: "number" }).notNull().default(19), // VAT percentage (19 for Germany)
  vatAmount: bigint("vat_amount", { mode: "number" }).notNull(), // VAT in cents
  grossAmount: bigint("gross_amount", { mode: "number" }).notNull(), // Total in cents
  status: varchar("status", { length: 20 }).notNull().default("draft"), // 'draft', 'sent', 'paid', 'cancelled'
  notes: text("notes"), // Internal notes
  paidAt: bigint("paid_at", { mode: "number" }),
  createdBy: varchar("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

// Blog Posts Management
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL-friendly slug
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt").notNull(), // Short summary
  content: text("content").notNull(), // Full blog post content (Markdown or HTML)
  author: varchar("author", { length: 255 }).notNull(), // Author name
  category: varchar("category", { length: 100 }).notNull(), // e.g., 'Tipps', 'Trends', 'Guides'
  tags: text("tags").array(), // Array of tags
  featuredImage: text("featured_image"), // URL to featured image
  status: varchar("status", { length: 20 }).notNull().default("draft"), // 'draft', 'published', 'archived'
  publishedAt: bigint("published_at", { mode: "number" }),
  createdBy: varchar("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

// Personal Access Tokens (PAT) for app authentication
export const personalAccessTokens = pgTable("personal_access_tokens", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(), // SHA-256 hashed token
  name: varchar("name", { length: 100 }), // User-friendly name (e.g., "iPhone App", "iPad")
  scopes: text("scopes").notNull(), // Comma-separated: upload:raw,view:gallery,ai:run,order:read
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  lastUsedAt: bigint("last_used_at", { mode: "number" }),
  lastUsedIp: varchar("last_used_ip", { length: 45 }), // IPv6 compatible
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  revokedAt: bigint("revoked_at", { mode: "number" }),
});

// Upload sessions for resumable multipart uploads
export const uploadSessions = pgTable("upload_sessions", {
  id: varchar("id").primaryKey(), // uploadId
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  shootId: varchar("shoot_id").notNull().references(() => shoots.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 255 }).notNull(),
  roomType: varchar("room_type", { length: 50 }).notNull(),
  stackIndex: bigint("stack_index", { mode: "number" }).notNull(),
  stackCount: bigint("stack_count", { mode: "number" }).notNull(), // 3 or 5
  r2Key: text("r2_key").notNull(), // Full R2 object key
  uploadId: text("upload_id").notNull(), // R2 multipart upload ID
  fileSize: bigint("file_size", { mode: "number" }),
  parts: text("parts"), // JSON array of {partNumber, etag}
  status: varchar("status", { length: 20 }).notNull().default("initiated"), // 'initiated', 'uploading', 'completed', 'failed'
  completedAt: bigint("completed_at", { mode: "number" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

// AI processing jobs
export const aiJobs = pgTable("ai_jobs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  shootId: varchar("shoot_id").notNull().references(() => shoots.id, { onDelete: "cascade" }),
  tool: varchar("tool", { length: 50 }).notNull(), // upscale_x2, denoise, wb_normalize, etc.
  modelSlug: varchar("model_slug", { length: 100 }).notNull(), // replicate:upscale, modal:denoise, etc.
  sourceImageKey: text("source_image_key").notNull(), // deliveries/{shoot_id}/...
  outputImageKey: text("output_image_key"), // deliveries/{shoot_id}/ai/{basename}_v{ver}.jpg
  params: text("params"), // JSON object with tool parameters
  externalJobId: text("external_job_id"), // Replicate/Modal job ID
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  cost: bigint("cost", { mode: "number" }), // Cost in cents
  credits: bigint("credits", { mode: "number" }), // Credits consumed
  errorMessage: text("error_message"),
  webhookReceivedAt: bigint("webhook_received_at", { mode: "number" }),
  completedAt: bigint("completed_at", { mode: "number" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const imageFavorites = pgTable("image_favorites", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  imageId: varchar("image_id").notNull().references(() => editedImages.id, { onDelete: "cascade" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const imageComments = pgTable("image_comments", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  imageId: varchar("image_id").notNull().references(() => editedImages.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  altText: text("alt_text"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const services = pgTable("services", {
  id: varchar("id").primaryKey(),
  serviceCode: varchar("service_code", { length: 10 }).notNull().unique(), // F10, D04, V30, etc.
  category: varchar("category", { length: 50 }).notNull(), // 'photography', 'drone', 'video', '360tour', 'staging', 'optimization', 'travel'
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  netPrice: bigint("net_price", { mode: "number" }), // Price in cents (null for "auf Anfrage")
  priceNote: text("price_note"), // "€0.80/km", "je Raumgröße", etc.
  notes: text("notes"),
  isActive: varchar("is_active", { length: 5 }).notNull().default("true"), // 'true' or 'false'
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  region: varchar("region", { length: 3 }).notNull(), // 'HH', 'B', 'EXT'
  kilometers: bigint("kilometers", { mode: "number" }), // Only for region='EXT'
  contactName: varchar("contact_name", { length: 255 }), // Optional
  contactEmail: varchar("contact_email", { length: 255 }), // Optional
  contactMobile: varchar("contact_mobile", { length: 50 }).notNull(), // Required
  propertyName: varchar("property_name", { length: 255 }).notNull(),
  propertyAddress: text("property_address"), // Optional (for cases without Google listing)
  // Google Maps verified address data
  addressLat: varchar("address_lat", { length: 50 }), // Latitude from Google Geocoding
  addressLng: varchar("address_lng", { length: 50 }), // Longitude from Google Geocoding
  addressPlaceId: varchar("address_place_id", { length: 255 }), // Google Place ID for verified address
  addressFormatted: text("address_formatted"), // Formatted address from Google
  propertyType: varchar("property_type", { length: 100 }), // 'Wohnung', 'Haus', 'Gewerbe'
  preferredDate: varchar("preferred_date", { length: 50 }),
  preferredTime: varchar("preferred_time", { length: 50 }),
  specialRequirements: text("special_requirements"),
  totalNetPrice: bigint("total_net_price", { mode: "number" }).notNull(), // Net price in cents
  vatAmount: bigint("vat_amount", { mode: "number" }).notNull(), // VAT amount in cents (19%)
  grossAmount: bigint("gross_amount", { mode: "number" }).notNull(), // Gross total in cents
  agbAccepted: varchar("agb_accepted", { length: 5 }).notNull().default("false"), // 'true' or 'false'
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'confirmed', 'completed', 'cancelled'
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  confirmedAt: bigint("confirmed_at", { mode: "number" }),
});

export const bookingItems = pgTable("booking_items", {
  id: varchar("id").primaryKey(),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  serviceId: varchar("service_id").notNull().references(() => services.id, { onDelete: "restrict" }),
  quantity: bigint("quantity", { mode: "number" }).notNull().default(1),
  unitPrice: bigint("unit_price", { mode: "number" }).notNull(), // Price per unit in cents
  totalPrice: bigint("total_price", { mode: "number" }).notNull(), // quantity * unitPrice in cents
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

// Gallery System V1.0
export const galleries = pgTable("galleries", {
  id: varchar("id").primaryKey(),
  galleryType: varchar("gallery_type", { length: 50 }).notNull(), // 'customer_upload', 'photographer_upload', 'editing'
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  shootId: varchar("shoot_id").references(() => shoots.id, { onDelete: "set null" }), // Optional link to shoot
  jobId: varchar("job_id").references(() => jobs.id, { onDelete: "set null" }), // Optional link to job
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("uploaded"), // 'uploaded', 'annotated', 'reviewed', 'editing', 'delivered'
  // Global preset settings (can be overridden per file)
  globalStylePreset: varchar("global_style_preset", { length: 50 }), // 'PURE', 'EDITORIAL', 'CLASSIC'
  globalWindowPreset: varchar("global_window_preset", { length: 50 }), // 'CLEAR', 'SCANDINAVIAN', 'BRIGHT'
  globalSkyPreset: varchar("global_sky_preset", { length: 100 }), // 'CLEAR BLUE', 'PASTEL CLOUDS', 'DAYLIGHT SOFT', 'EVENING HAZE'
  globalFireplace: varchar("global_fireplace", { length: 5 }).notNull().default("false"), // 'true' or 'false'
  globalRetouch: varchar("global_retouch", { length: 5 }).notNull().default("true"), // 'true' or 'false'
  globalEnhancements: varchar("global_enhancements", { length: 5 }).notNull().default("true"), // 'true' or 'false'
  finalizedAt: bigint("finalized_at", { mode: "number" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const galleryFiles = pgTable("gallery_files", {
  id: varchar("id").primaryKey(),
  galleryId: varchar("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  storedFilename: varchar("stored_filename", { length: 255 }).notNull(), // {date}-{shootcode}_{roomtype}_{index}_v{ver}.jpg
  filePath: text("file_path").notNull(), // R2 path: /uploads/raw/...
  thumbnailPath: text("thumbnail_path"), // R2 path: /uploads/thumbs/...
  fileType: varchar("file_type", { length: 50 }).notNull(), // 'jpg', 'dng', 'cr2', 'nef', etc.
  fileSize: bigint("file_size", { mode: "number" }), // in bytes
  roomType: varchar("room_type", { length: 50 }), // 'livingroom', 'kitchen', etc.
  sequenceIndex: bigint("sequence_index", { mode: "number" }).notNull(), // Ordering within gallery
  // Per-file overrides (if set, override global settings)
  stylePreset: varchar("style_preset", { length: 50 }), // 'PURE', 'EDITORIAL', 'CLASSIC'
  windowPreset: varchar("window_preset", { length: 50 }), // 'CLEAR', 'SCANDINAVIAN', 'BRIGHT'
  skyPreset: varchar("sky_preset", { length: 100 }), // 'CLEAR BLUE', 'PASTEL CLOUDS', etc.
  fireplaceEnabled: varchar("fireplace_enabled", { length: 5 }), // 'true' or 'false'
  retouchEnabled: varchar("retouch_enabled", { length: 5 }), // 'true' or 'false'
  enhancementsEnabled: varchar("enhancements_enabled", { length: 5 }), // 'true' or 'false'
  status: varchar("status", { length: 50 }).notNull().default("uploaded"), // 'uploaded', 'annotated', 'processing', 'complete'
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const galleryAnnotations = pgTable("gallery_annotations", {
  id: varchar("id").primaryKey(),
  fileId: varchar("file_id").notNull().references(() => galleryFiles.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  annotationType: varchar("annotation_type", { length: 50 }).notNull(), // 'comment', 'mask'
  comment: text("comment"), // For comment type (max 500 chars enforced in frontend)
  maskPath: text("mask_path"), // R2 path for PNG mask: /uploads/masks/...
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  refreshTokens: many(refreshTokens),
  passwordResetTokens: many(passwordResetTokens),
  personalAccessTokens: many(personalAccessTokens),
  orders: many(orders),
  jobs: many(jobs),
  imageFavorites: many(imageFavorites),
  imageComments: many(imageComments),
  uploadSessions: many(uploadSessions),
  aiJobs: many(aiJobs),
  galleries: many(galleries),
  galleryAnnotations: many(galleryAnnotations),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  user: one(users, {
    fields: [jobs.userId],
    references: [users.id],
  }),
  shoots: many(shoots),
  exposes: many(exposes),
}));

export const shootsRelations = relations(shoots, ({ one, many }) => ({
  job: one(jobs, {
    fields: [shoots.jobId],
    references: [jobs.id],
  }),
  stacks: many(stacks),
  images: many(images),
  editorTokens: many(editorTokens),
  editedImages: many(editedImages),
  uploadSessions: many(uploadSessions),
  aiJobs: many(aiJobs),
}));

export const stacksRelations = relations(stacks, ({ one, many }) => ({
  shoot: one(shoots, {
    fields: [stacks.shootId],
    references: [shoots.id],
  }),
  images: many(images),
  editedImages: many(editedImages),
}));

export const imagesRelations = relations(images, ({ one, many }) => ({
  shoot: one(shoots, {
    fields: [images.shootId],
    references: [shoots.id],
  }),
  stack: one(stacks, {
    fields: [images.stackId],
    references: [stacks.id],
  }),
  captions: many(captions),
}));

export const captionsRelations = relations(captions, ({ one }) => ({
  image: one(images, {
    fields: [captions.imageId],
    references: [images.id],
  }),
}));

export const exposesRelations = relations(exposes, ({ one }) => ({
  job: one(jobs, {
    fields: [exposes.jobId],
    references: [jobs.id],
  }),
}));

export const editorTokensRelations = relations(editorTokens, ({ one }) => ({
  shoot: one(shoots, {
    fields: [editorTokens.shootId],
    references: [shoots.id],
  }),
}));

export const editedImagesRelations = relations(editedImages, ({ one, many }) => ({
  shoot: one(shoots, {
    fields: [editedImages.shootId],
    references: [shoots.id],
  }),
  stack: one(stacks, {
    fields: [editedImages.stackId],
    references: [stacks.id],
  }),
  favorites: many(imageFavorites),
  comments: many(imageComments),
}));

export const imageFavoritesRelations = relations(imageFavorites, ({ one }) => ({
  user: one(users, {
    fields: [imageFavorites.userId],
    references: [users.id],
  }),
  image: one(editedImages, {
    fields: [imageFavorites.imageId],
    references: [editedImages.id],
  }),
}));

export const imageCommentsRelations = relations(imageComments, ({ one }) => ({
  user: one(users, {
    fields: [imageComments.userId],
    references: [users.id],
  }),
  image: one(editedImages, {
    fields: [imageComments.imageId],
    references: [editedImages.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  bookingItems: many(bookingItems),
}));

export const bookingItemsRelations = relations(bookingItems, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingItems.bookingId],
    references: [bookings.id],
  }),
  service: one(services, {
    fields: [bookingItems.serviceId],
    references: [services.id],
  }),
}));

export const personalAccessTokensRelations = relations(personalAccessTokens, ({ one }) => ({
  user: one(users, {
    fields: [personalAccessTokens.userId],
    references: [users.id],
  }),
}));

export const uploadSessionsRelations = relations(uploadSessions, ({ one }) => ({
  user: one(users, {
    fields: [uploadSessions.userId],
    references: [users.id],
  }),
  shoot: one(shoots, {
    fields: [uploadSessions.shootId],
    references: [shoots.id],
  }),
}));

export const aiJobsRelations = relations(aiJobs, ({ one }) => ({
  user: one(users, {
    fields: [aiJobs.userId],
    references: [users.id],
  }),
  shoot: one(shoots, {
    fields: [aiJobs.shootId],
    references: [shoots.id],
  }),
}));

export const galleriesRelations = relations(galleries, ({ one, many }) => ({
  user: one(users, {
    fields: [galleries.userId],
    references: [users.id],
  }),
  shoot: one(shoots, {
    fields: [galleries.shootId],
    references: [shoots.id],
  }),
  job: one(jobs, {
    fields: [galleries.jobId],
    references: [jobs.id],
  }),
  files: many(galleryFiles),
}));

export const galleryFilesRelations = relations(galleryFiles, ({ one, many }) => ({
  gallery: one(galleries, {
    fields: [galleryFiles.galleryId],
    references: [galleries.id],
  }),
  annotations: many(galleryAnnotations),
}));

export const galleryAnnotationsRelations = relations(galleryAnnotations, ({ one }) => ({
  file: one(galleryFiles, {
    fields: [galleryAnnotations.fileId],
    references: [galleryFiles.id],
  }),
  user: one(users, {
    fields: [galleryAnnotations.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type InsertRefreshToken = typeof refreshTokens.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;
export type Shoot = typeof shoots.$inferSelect;
export type InsertShoot = typeof shoots.$inferInsert;
export type Stack = typeof stacks.$inferSelect;
export type InsertStack = typeof stacks.$inferInsert;
export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;
export type EditorToken = typeof editorTokens.$inferSelect;
export type InsertEditorToken = typeof editorTokens.$inferInsert;
export type EditedImage = typeof editedImages.$inferSelect;
export type InsertEditedImage = typeof editedImages.$inferInsert;
export type SeoMetadata = typeof seoMetadata.$inferSelect;
export type InsertSeoMetadata = typeof seoMetadata.$inferInsert;
export type ImageFavorite = typeof imageFavorites.$inferSelect;
export type InsertImageFavorite = typeof imageFavorites.$inferInsert;
export type ImageComment = typeof imageComments.$inferSelect;
export type InsertImageComment = typeof imageComments.$inferInsert;
export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type BookingItem = typeof bookingItems.$inferSelect;
export type InsertBookingItem = typeof bookingItems.$inferInsert;
export type PersonalAccessToken = typeof personalAccessTokens.$inferSelect;
export type InsertPersonalAccessToken = typeof personalAccessTokens.$inferInsert;
export type UploadSession = typeof uploadSessions.$inferSelect;
export type InsertUploadSession = typeof uploadSessions.$inferInsert;
export type AiJob = typeof aiJobs.$inferSelect;
export type InsertAiJob = typeof aiJobs.$inferInsert;
export type Caption = typeof captions.$inferSelect;
export type InsertCaption = typeof captions.$inferInsert;
export type Expose = typeof exposes.$inferSelect;
export type InsertExpose = typeof exposes.$inferInsert;
export type Gallery = typeof galleries.$inferSelect;
export type InsertGallery = typeof galleries.$inferInsert;
export type GalleryFile = typeof galleryFiles.$inferSelect;
export type InsertGalleryFile = typeof galleryFiles.$inferInsert;
export type GalleryAnnotation = typeof galleryAnnotations.$inferSelect;
export type InsertGalleryAnnotation = typeof galleryAnnotations.$inferInsert;

// Validation Schemas
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  staySignedIn: z.boolean().optional(),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// Validation Helpers
// Postal code check
const germanPostalCodeRegex = /\b\d{5}\b/;

// Phone validation: extract digits and check if valid German number
function isValidGermanPhone(phone: string): boolean {
  if (!phone) return false;
  // Extract only digits
  const digits = phone.replace(/\D/g, '');
  // Check if starts with German prefix and has enough digits
  if (digits.startsWith('49')) {
    return digits.length >= 11 && digits.length <= 15; // +49 + 9-13 digits
  }
  if (digits.startsWith('0')) {
    return digits.length >= 10 && digits.length <= 14; // 0 + 9-13 digits
  }
  return false;
}

export const createOrderSchema = z.object({
  propertyName: z.string().min(1, "Objektname erforderlich"),
  contactName: z.string().min(2, "Kontaktname muss mindestens 2 Zeichen lang sein"),
  contactEmail: z.string().email("Ungültige E-Mail-Adresse"),
  contactPhone: z.string()
    .min(1, "Telefonnummer erforderlich")
    .refine(isValidGermanPhone, "Ungültige Telefonnummer (z.B. +49 170 1234567 oder 0170 1234567)"),
  propertyAddress: z.string()
    .min(10, "Adresse muss mindestens 10 Zeichen lang sein")
    .refine(
      (addr) => germanPostalCodeRegex.test(addr),
      { message: "Adresse muss eine gültige deutsche Postleitzahl (5 Ziffern) enthalten" }
    ),
  preferredDate: z.string().optional(),
  notes: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Workflow Validation Schemas
export const createJobSchema = z.object({
  localId: z.string().optional(), // Client-generated ULID for offline deduplication
  customerName: z.string().optional(),
  propertyName: z.string().min(1, "Property name is required"),
  propertyAddress: z.string().optional(),
  deadlineAt: z.number().optional(), // Unix timestamp
  deliverGallery: z.boolean().optional().default(true),
  deliverAlttext: z.boolean().optional().default(true),
  deliverExpose: z.boolean().optional().default(false),
  // Local App User Assignment
  selectedUserId: z.string().optional(),
  selectedUserInitials: z.string().optional(),
  selectedUserCode: z.string().optional(),
});

export const initUploadSchema = z.object({
  jobNumber: z.string().min(1, "Job number is required"),
});

export const presignedUploadSchema = z.object({
  filenames: z.array(z.string().min(1)).min(1).max(50, "Maximum 50 files per request"),
});

export const roomTypeSchema = z.enum([
  "living_room",
  "kitchen",
  "bathroom",
  "bedroom",
  "dining_room",
  "hallway",
  "office",
  "exterior",
  "undefined_space",
]);

export const assignRoomTypeSchema = z.object({
  stackId: z.string().min(1),
  roomType: roomTypeSchema,
});

export const createStackSchema = z.object({
  shootId: z.string().min(1),
  frameCount: z.number().int().min(3).max(5),
});

// QA-Autofix: Image Classification Schemas
export const classifyImageSchema = z.object({
  roomType: z.string().min(1), // Any room type from taxonomy
});

export const bulkClassifyImagesSchema = z.object({
  imageIds: z.array(z.string().min(1)).min(1).max(100, "Maximum 100 images per request"),
  roomType: z.string().min(1), // Same room type for all images
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type InitUploadInput = z.infer<typeof initUploadSchema>;
export type PresignedUploadInput = z.infer<typeof presignedUploadSchema>;
export type RoomType = z.infer<typeof roomTypeSchema>;
export type AssignRoomTypeInput = z.infer<typeof assignRoomTypeSchema>;
export type CreateStackInput = z.infer<typeof createStackSchema>;
export type ClassifyImageInput = z.infer<typeof classifyImageSchema>;
export type BulkClassifyImagesInput = z.infer<typeof bulkClassifyImagesSchema>;

// Gallery System Validation Schemas
export const createGallerySchema = z.object({
  galleryType: z.enum(["customer_upload", "photographer_upload", "editing"]),
  title: z.string().min(1),
  description: z.string().optional(),
  shootId: z.string().optional(),
  jobId: z.string().optional(),
});

export const updateGallerySettingsSchema = z.object({
  globalStylePreset: z.enum(["PURE", "EDITORIAL", "CLASSIC"]).optional(),
  globalWindowPreset: z.enum(["CLEAR", "SCANDINAVIAN", "BRIGHT"]).optional(),
  globalSkyPreset: z.enum(["CLEAR BLUE", "PASTEL CLOUDS", "DAYLIGHT SOFT", "EVENING HAZE"]).optional(),
  globalFireplace: z.boolean().optional(),
  globalRetouch: z.boolean().optional(),
  globalEnhancements: z.boolean().optional(),
});

export const updateFileSettingsSchema = z.object({
  stylePreset: z.enum(["PURE", "EDITORIAL", "CLASSIC"]).optional(),
  windowPreset: z.enum(["CLEAR", "SCANDINAVIAN", "BRIGHT"]).optional(),
  skyPreset: z.enum(["CLEAR BLUE", "PASTEL CLOUDS", "DAYLIGHT SOFT", "EVENING HAZE"]).optional(),
  fireplaceEnabled: z.boolean().optional(),
  retouchEnabled: z.boolean().optional(),
  enhancementsEnabled: z.boolean().optional(),
  status: z.enum(["pending", "processing", "ready", "failed"]).optional(),
});

export const addAnnotationSchema = z.object({
  annotationType: z.enum(["comment", "mask"]),
  comment: z.string().max(500).optional(),
});

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type UpdateGallerySettingsInput = z.infer<typeof updateGallerySettingsSchema>;
export type UpdateFileSettingsInput = z.infer<typeof updateFileSettingsSchema>;
export type AddAnnotationInput = z.infer<typeof addAnnotationSchema>;

export interface PresignedUrlResponse {
  filename: string;
  uploadUrl: string;
  error?: string;
}

// Booking/Order Validation Schemas
export const createOrderApiSchema = z.object({
  region: z.enum(["HH", "B", "EXT"], { required_error: "Region is required" }),
  kilometers: z.number().int().min(0).optional(),
  contact: z.object({
    name: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    mobile: z.string()
      .min(1, "Mobile number is required")
      .refine(isValidGermanPhone, "Invalid mobile number (e.g. +49 170 1234567 or 0170 1234567)"),
  }),
  propertyName: z.string().min(1, "Property name is required"),
  propertyAddress: z.string()
    .optional()
    .refine(
      (addr) => !addr || addr.length === 0 || addr.length >= 10,
      { message: "Address must be at least 10 characters" }
    )
    .refine(
      (addr) => !addr || addr.length === 0 || germanPostalCodeRegex.test(addr),
      { message: "Address must contain a valid German postal code (5 digits)" }
    ),
  // Google Maps verified address data (optional)
  addressLat: z.string().optional(),
  addressLng: z.string().optional(),
  addressPlaceId: z.string().optional(),
  addressFormatted: z.string().optional(),
  propertyType: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  specialRequirements: z.string().optional(),
  agbAccepted: z.boolean().refine((val) => val === true, {
    message: "AGB must be accepted",
  }),
  items: z.array(
    z.object({
      code: z.string().min(1, "Service code is required"),
      unit: z.enum(["flat", "per_item", "per_km"]),
      qty: z.number().int().min(1),
    })
  ).min(1, "At least one service must be selected"),
}).refine((data) => {
  // If region is EXT, kilometers must be provided and > 0
  if (data.region === "EXT") {
    return data.kilometers !== undefined && data.kilometers > 0;
  }
  return true;
}, {
  message: "Kilometers required for EXT region",
  path: ["kilometers"],
});

export type CreateOrderApiInput = z.infer<typeof createOrderApiSchema>;

// Response types
export interface AuthResponse {
  user: Omit<User, "hashedPassword">;
  session: Session;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  createdAt: number;
}

export interface InitUploadResponse {
  shootId: string;
  shootCode: string;
  jobId: string;
}

export interface HandoffResponse {
  downloadUrl: string;
  uploadToken: string;
  expiresAt: number;
}

// Editorial Management - Internal backlog for blog posts and change requests
export const editorialItems = pgTable("editorial_items", {
  id: varchar("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'blog_post' or 'change_request'
  category: varchar("category", { length: 50 }).notNull(), // 'photo', 'ai', 'marketing', 'infra', 'legal', 'other'
  status: varchar("status", { length: 50 }).notNull().default("idea"), // 'idea', 'queued', 'drafting', 'in_review', 'scheduled', 'published', 'done'
  priority: varchar("priority", { length: 20 }).notNull().default("normal"), // 'low', 'normal', 'high', 'urgent'
  description: text("description"),
  dueDate: bigint("due_date", { mode: "number" }), // Optional scheduling timestamp
  publishWeek: varchar("publish_week", { length: 10 }), // Optional e.g. '2025-W44'
  assigneeId: varchar("assignee_id").references(() => users.id, { onDelete: "set null" }), // Optional user assignment
  tags: text("tags").array(), // Array of string tags
  createdBy: varchar("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  completedAt: bigint("completed_at", { mode: "number" }),
});

export const editorialComments = pgTable("editorial_comments", {
  id: varchar("id").primaryKey(),
  itemId: varchar("item_id").notNull().references(() => editorialItems.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

// Editor Management System
export const editors = pgTable("editors", {
  id: varchar("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  specialization: varchar("specialization", { length: 100 }), // 'residential', 'commercial', 'luxury', etc.
  availability: varchar("availability", { length: 50 }).notNull().default("available"), // 'available', 'busy', 'unavailable'
  maxConcurrentJobs: bigint("max_concurrent_jobs", { mode: "number" }).notNull().default(3),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
}, (table) => ({
  emailIdx: { unique: true, name: "editors_email_idx", columns: [table.email] },
}));

export const editorAssignments = pgTable("editor_assignments", {
  id: varchar("id").primaryKey(),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  editorId: varchar("editor_id").notNull().references(() => editors.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull().default("assigned"), // 'assigned', 'in_progress', 'completed', 'cancelled'
  priority: varchar("priority", { length: 20 }).notNull().default("normal"), // 'low', 'normal', 'high', 'urgent'
  assignedAt: bigint("assigned_at", { mode: "number" }).notNull(),
  startedAt: bigint("started_at", { mode: "number" }),
  completedAt: bigint("completed_at", { mode: "number" }),
  cancelledAt: bigint("cancelled_at", { mode: "number" }),
  notes: text("notes"),
  reassignedFrom: varchar("reassigned_from"), // Previous editor ID if reassigned
}, (table) => ({
  editorStatusIdx: { name: "editor_assignments_editor_status_idx", columns: [table.editorId, table.status] },
  jobIdx: { name: "editor_assignments_job_idx", columns: [table.jobId] },
}));

// Editorial Relations
export const editorialItemsRelations = relations(editorialItems, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [editorialItems.createdBy],
    references: [users.id],
    relationName: "editorialItemsCreatedBy",
  }),
  assignee: one(users, {
    fields: [editorialItems.assigneeId],
    references: [users.id],
    relationName: "editorialItemsAssignee",
  }),
  comments: many(editorialComments),
}));

export const editorialCommentsRelations = relations(editorialComments, ({ one }) => ({
  item: one(editorialItems, {
    fields: [editorialComments.itemId],
    references: [editorialItems.id],
  }),
  user: one(users, {
    fields: [editorialComments.userId],
    references: [users.id],
  }),
}));

// Editor Relations
export const editorsRelations = relations(editors, ({ many }) => ({
  assignments: many(editorAssignments),
}));

export const editorAssignmentsRelations = relations(editorAssignments, ({ one }) => ({
  job: one(jobs, {
    fields: [editorAssignments.jobId],
    references: [jobs.id],
  }),
  editor: one(editors, {
    fields: [editorAssignments.editorId],
    references: [editors.id],
  }),
}));

// Editorial Types
export type EditorialItem = typeof editorialItems.$inferSelect;
export type EditorialComment = typeof editorialComments.$inferSelect;

// Editor Types
export type Editor = typeof editors.$inferSelect;
export type EditorAssignment = typeof editorAssignments.$inferSelect;

// Insert Schemas
export const insertEditorialItemSchema = createInsertSchema(editorialItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertEditorialCommentSchema = createInsertSchema(editorialComments).omit({
  id: true,
  createdAt: true,
});

export type InsertEditorialItem = z.infer<typeof insertEditorialItemSchema>;
export type InsertEditorialComment = z.infer<typeof insertEditorialCommentSchema>;

// Editor Insert Schemas
export const insertEditorSchema = createInsertSchema(editors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEditorAssignmentSchema = createInsertSchema(editorAssignments).omit({
  id: true,
  assignedAt: true,
});

export type InsertEditor = z.infer<typeof insertEditorSchema>;
export type InsertEditorAssignment = z.infer<typeof insertEditorAssignmentSchema>;

// Demo Phase - Job/Caption/Expose Schemas
export const createDemoJobSchema = z.object({
  customer: z.string().min(1, "Customer name is required"),
  address: z.string().min(1, "Address is required"),
  shootCode: z.string().length(5, "Shoot code must be 5 characters").regex(/^[a-z0-9]{5}$/, "Shoot code must be lowercase alphanumeric"),
  deadlineAt: z.number().optional(),
  deliverGallery: z.boolean().optional().default(true),
  deliverAlttext: z.boolean().optional().default(true),
  deliverExpose: z.boolean().optional().default(false),
});

export const insertCaptionSchema = createInsertSchema(captions).omit({
  id: true,
  createdAt: true,
});

export const insertExposeSchema = createInsertSchema(exposes).omit({
  id: true,
  createdAt: true,
});

export type CreateDemoJobInput = z.infer<typeof createDemoJobSchema>;
export type InsertCaptionInput = z.infer<typeof insertCaptionSchema>;
export type InsertExposeInput = z.infer<typeof insertExposeSchema>;

// Gallery Insert Schemas
export const insertGallerySchema = createInsertSchema(galleries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  finalizedAt: true,
});

export const insertGalleryFileSchema = createInsertSchema(galleryFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGalleryAnnotationSchema = createInsertSchema(galleryAnnotations).omit({
  id: true,
  createdAt: true,
});

export type InsertGalleryInput = z.infer<typeof insertGallerySchema>;
export type InsertGalleryFileInput = z.infer<typeof insertGalleryFileSchema>;
export type InsertGalleryAnnotationInput = z.infer<typeof insertGalleryAnnotationSchema>;

// Media Library Types
export type PublicImage = typeof publicImages.$inferSelect;
export type InsertPublicImage = typeof publicImages.$inferInsert;

// Invoice Types
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// Blog Post Types
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// Insert Schemas for validation
export const insertPublicImageSchema = createInsertSchema(publicImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  userId: true, // userId comes from authenticated session, not request body
  createdAt: true,
  confirmedAt: true,
  status: true, // status is set by backend to 'pending' by default
}).extend({
  agbAccepted: z.boolean().refine((val) => val === true, {
    message: "AGB must be accepted",
  }), // Accept boolean from frontend, backend converts to string
  serviceSelections: z.record(z.string(), z.number()), // {serviceId: quantity}
});

export const insertBookingItemSchema = createInsertSchema(bookingItems).omit({
  id: true,
  createdAt: true,
});

// UploadedFiles Schemas
export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  createdAt: true,
  finalizedAt: true,
  updatedAt: true, // Auto-generated by backend
});

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = typeof uploadedFiles.$inferInsert;

// FileNotes Schemas
export const insertFileNoteSchema = createInsertSchema(fileNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FileNote = typeof fileNotes.$inferSelect;
export type InsertFileNote = z.infer<typeof insertFileNoteSchema>;

// Edit Jobs Schemas (Phase 2)
export const insertEditJobSchema = createInsertSchema(editJobs).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  finishedAt: true,
  error: true,
});

export type EditJob = typeof editJobs.$inferSelect;
export type InsertEditJob = z.infer<typeof insertEditJobSchema>;

// Notifications Schemas (Phase 2)
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  read: true,
  readAt: true,
  deletedAt: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Audit Log Schemas
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
  deletedAt: true,
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// PixCapture Upload API Schemas
export const uploadIntentSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  fileSize: z.number().int().min(1).max(100 * 1024 * 1024), // Max 100 MB
  checksum: z.string().length(64).optional(), // SHA256 checksum
  orderId: z.string().uuid().optional(), // Optional order link
  roomType: z.string().max(50).optional(),
  stackId: z.string().max(20).optional(),
});

export const uploadFinalizeSchema = z.object({
  objectKey: z.string().min(1),
  checksum: z.string().length(64).optional(),
  exifMeta: z.string().optional(), // JSON string
});

export type UploadIntentInput = z.infer<typeof uploadIntentSchema>;
export type UploadFinalizeInput = z.infer<typeof uploadFinalizeSchema>;

export interface UploadIntentResponse {
  objectKey: string;
  uploadUrl: string;
  expiresIn: number; // seconds
}

// Order Files Management Schemas (Phase 1)
export const orderFilesFilterSchema = z.object({
  roomType: z.string().max(50).optional(),
  marked: z.enum(['true', 'false']).optional(),
  status: z.string().max(50).optional(),
  includeDeleted: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  sortBy: z.enum(['latest', 'oldest', 'filename']).optional(),
});

export const bulkMarkFilesSchema = z.object({
  fileIds: z.array(z.string().uuid()).min(1).max(100),
  marked: z.boolean(),
});

export const bulkDeleteFilesSchema = z.object({
  fileIds: z.array(z.string().uuid()).min(1).max(100),
  allowMarked: z.boolean().optional(),
});

export const fileNoteSchema = z.object({
  text: z.string().trim().min(1).max(1000),
});

export const orderStacksFilterSchema = z.object({
  includeDeleted: z.enum(['true', 'false']).optional(),
  previewLimit: z.coerce.number().int().min(1).max(20).optional(),
});

export const fileNotesFilterSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export type OrderFilesFilter = z.infer<typeof orderFilesFilterSchema>;
export type OrderStacksFilter = z.infer<typeof orderStacksFilterSchema>;
export type BulkMarkFiles = z.infer<typeof bulkMarkFilesSchema>;
export type BulkDeleteFiles = z.infer<typeof bulkDeleteFilesSchema>;
export type FileNoteInput = z.infer<typeof fileNoteSchema>;
export type FileNotesFilter = z.infer<typeof fileNotesFilterSchema>;

// Upload Manifest Session Schemas
export const insertUploadManifestSessionSchema = createInsertSchema(uploadManifestSessions).omit({
  id: true,
  errorCount: true,
  createdAt: true,
  lastActivityAt: true,
  completedAt: true,
});

export type UploadManifestSession = typeof uploadManifestSessions.$inferSelect;
export type InsertUploadManifestSession = z.infer<typeof insertUploadManifestSessionSchema>;

// Upload Manifest Item Schemas
export const insertUploadManifestItemSchema = createInsertSchema(uploadManifestItems).omit({
  id: true,
  errorMessage: true,
  retryCount: true,
  createdAt: true,
  uploadedAt: true,
  verifiedAt: true,
});

export type UploadManifestItem = typeof uploadManifestItems.$inferSelect;
export type InsertUploadManifestItem = z.infer<typeof insertUploadManifestItemSchema>;

// Manifest Upload API Schemas
export const createManifestSessionSchema = z.object({
  jobId: z.string().optional(),
  clientType: z.enum(['pixcapture_ios', 'pixcapture_android', 'web_uploader']),
  files: z.array(z.object({
    objectKey: z.string().min(1),
    sizeBytes: z.number().int().min(1).max(500 * 1024 * 1024), // Max 500MB per file
    checksum: z.string().length(64).optional(), // SHA256
  })).min(1).max(100), // Max 100 files per session
});

export const uploadFileToSessionSchema = z.object({
  sessionId: z.string().uuid(),
  itemId: z.string().uuid(),
  checksum: z.string().length(64).optional(),
});

export const completeSessionSchema = z.object({
  sessionId: z.string().uuid(),
});

export type CreateManifestSession = z.infer<typeof createManifestSessionSchema>;
export type UploadFileToSession = z.infer<typeof uploadFileToSessionSchema>;
export type CompleteSession = z.infer<typeof completeSessionSchema>;
