import { users, sessions, refreshTokens, passwordResetTokens, orders, jobs, shoots, stacks, images, editorTokens, editedImages, services, bookings, bookingItems, imageFavorites, imageComments, editorialItems, editorialComments, seoMetadata, personalAccessTokens, uploadSessions, aiJobs, captions, exposes, galleries, galleryFiles, galleryAnnotations, editors, editorAssignments, publicImages, invoices, blogPosts, uploadedFiles, fileNotes, editJobs, uploadManifestSessions, uploadManifestItems, auditLogs, type User, type Session, type RefreshToken, type PasswordResetToken, type Order, type Job, type Shoot, type Stack, type Image, type EditorToken, type EditedImage, type Service, type Booking, type BookingItem, type ImageFavorite, type ImageComment, type EditorialItem, type EditorialComment, type SeoMetadata, type PersonalAccessToken, type UploadSession, type AiJob, type Caption, type Expose, type Gallery, type GalleryFile, type GalleryAnnotation, type Editor, type EditorAssignment, type PublicImage, type Invoice, type BlogPost, type UploadManifestSession, type UploadManifestItem, type AuditLog } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, inArray, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Initialization
  ready(): Promise<void>;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(email: string, hashedPassword: string, role?: string): Promise<User>;
  
  // Session operations
  getSession(id: string): Promise<Session | undefined>;
  createSession(userId: string, expiresAt: number): Promise<Session>;
  deleteSession(id: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  
  // Refresh token operations
  getRefreshToken(token: string): Promise<RefreshToken | undefined>;
  createRefreshToken(id: string, userId: string, token: string, expiresAt: number): Promise<RefreshToken>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: string): Promise<void>;
  
  // Password reset token operations
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  createPasswordResetToken(id: string, userId: string, token: string, expiresAt: number): Promise<PasswordResetToken>;
  deletePasswordResetToken(token: string): Promise<void>;
  deleteUserPasswordResetTokens(userId: string): Promise<void>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  
  // Order operations
  createOrder(userId: string, orderData: {
    propertyName: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    propertyAddress: string;
    // Google Maps verified address data
    addressLat?: string;
    addressLng?: string;
    addressPlaceId?: string;
    addressFormatted?: string;
    addressLocationType?: string;
    preferredDate?: string;
    notes?: string;
  }): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<void>;
  
  // Workflow operations - Jobs
  createJob(userId: string, data: {
    customerName?: string;
    propertyName: string;
    propertyAddress?: string;
    // Google Maps verified address data
    addressLat?: string;
    addressLng?: string;
    addressPlaceId?: string;
    addressFormatted?: string;
    deadlineAt?: number;
    deliverGallery?: boolean;
    deliverAlttext?: boolean;
    deliverExpose?: boolean;
    // Local App User Assignment
    selectedUserId?: string;
    selectedUserInitials?: string;
    selectedUserCode?: string;
  }): Promise<Job>;
  getJob(id: string): Promise<Job | undefined>;
  getJobByNumber(jobNumber: string): Promise<Job | undefined>;
  getUserJobs(userId: string): Promise<Job[]>;
  getAllJobs(): Promise<Job[]>;
  updateJobStatus(id: string, status: string): Promise<void>;
  deleteJob(id: string): Promise<void>;
  
  // Workflow operations - Shoots
  createShoot(jobId: string): Promise<Shoot>;
  getShoot(id: string): Promise<Shoot | undefined>;
  getShootByCode(shootCode: string): Promise<Shoot | undefined>;
  getJobShoots(jobId: string): Promise<Shoot[]>;
  getJobShootsGallery(jobId: string): Promise<Array<Shoot & { images: Image[] }>>;
  getActiveShootForJob(jobId: string): Promise<Shoot | undefined>;
  updateShootStatus(id: string, status: string, timestampField?: string): Promise<void>;
  
  // Editor Assignment operations
  assignShootEditor(shootId: string, editorId: string, userId?: string): Promise<void>;
  clearShootEditor(shootId: string): Promise<void>;
  getShootsByEditor(editorId: string): Promise<Shoot[]>;
  
  // Workflow operations - Stacks
  createStack(shootId: string, stackNumber: string, frameCount: number, roomType: string): Promise<Stack>;
  getStack(id: string): Promise<Stack | undefined>;
  getShootStacks(shootId: string): Promise<Stack[]>;
  updateStackRoomType(id: string, roomType: string): Promise<void>;
  updateStackFrameCount(id: string, frameCount: number): Promise<void>;
  getNextSequenceIndexForRoom(shootId: string, roomType: string): Promise<number>;
  
  // Workflow operations - Images
  createImage(data: {
    shootId: string;
    stackId?: string;
    originalFilename: string;
    renamedFilename?: string;
    filePath: string;
    fileSize?: number;
    mimeType?: string;
    exifDate?: number;
    exposureValue?: string;
    positionInStack?: number;
  }): Promise<Image>;
  getImage(id: string): Promise<Image | undefined>;
  getShootImages(shootId: string): Promise<Image[]>;
  getStackImages(stackId: string): Promise<Image[]>;
  updateImageRenamedFilename(id: string, renamedFilename: string): Promise<void>;
  
  // QC Quality Check operations
  updateImageQCStatus(id: string, qcStatus: 'pending' | 'approved' | 'rejected' | 'needs-revision', qcComment?: string, qcTechnicalIssues?: string[], userId?: string): Promise<void>;
  getImagesByQCStatus(qcStatus: 'pending' | 'approved' | 'rejected' | 'needs-revision'): Promise<Image[]>;
  getShootImagesWithQC(shootId: string): Promise<Image[]>;
  
  // Workflow operations - Editor Tokens
  createEditorToken(shootId: string, tokenType: 'download' | 'upload', token: string, expiresAt: number, filePath?: string): Promise<EditorToken>;
  getEditorToken(token: string): Promise<EditorToken | undefined>;
  markEditorTokenUsed(token: string): Promise<void>;
  
  // Workflow operations - Edited Images
  createEditedImage(data: {
    id: string;
    shootId: string;
    stackId?: string | null;
    filename: string;
    filePath: string;
    fileSize?: number;
    version: number;
    roomType?: string;
    sequenceIndex?: number;
    clientApprovalStatus?: string;
    createdAt: number;
  }): Promise<any>;
  getEditedImage(id: string): Promise<any | undefined>;
  getEditedImagesByShoot(shootId: string): Promise<any[]>;
  getStacksByShoot(shootId: string): Promise<Stack[]>;
  updateEditedImageApprovalStatus(id: string, status: string, timestampField?: string): Promise<void>;
  
  // Service operations
  getAllServices(): Promise<Service[]>;
  
  // Booking operations
  createBooking(userId: string, bookingData: {
    region: string;
    kilometers?: number;
    contactName?: string;
    contactEmail?: string;
    contactMobile: string;
    propertyName: string;
    propertyAddress?: string;
    propertyType?: string;
    preferredDate?: string;
    preferredTime?: string;
    specialRequirements?: string;
    totalNetPrice: number;
    vatAmount: number;
    grossAmount: number;
    agbAccepted: boolean;
    serviceSelections: Record<string, number>;
  }): Promise<{ booking: Booking; items: BookingItem[] }>;
  getBooking(id: string): Promise<Booking | undefined>;
  getUserBookings(userId: string): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  getBookingItems(bookingId: string): Promise<BookingItem[]>;
  getBookingWithItems(bookingId: string): Promise<{ booking: Booking; items: BookingItem[] } | undefined>;
  updateBookingStatus(id: string, status: string): Promise<void>;
  
  // Client gallery operations
  getClientGallery(userId: string): Promise<any[]>;
  
  // Image favorites operations
  toggleFavorite(userId: string, imageId: string): Promise<{ favorited: boolean }>;
  getUserFavorites(userId: string): Promise<string[]>; // Returns array of favorited image IDs
  getImageFavoriteCount(imageId: string): Promise<number>;
  
  // Image comments operations
  addComment(userId: string, imageId: string, comment: string, altText?: string): Promise<any>;
  getImageComments(imageId: string): Promise<any[]>;
  
  // Editorial management operations
  getEditorialItems(): Promise<EditorialItem[]>;
  createEditorialItem(data: {
    title: string;
    type: string;
    category: string;
    status?: string;
    priority?: string;
    description?: string;
    dueDate?: number;
    publishWeek?: string;
    assigneeId?: string;
    tags?: string[];
    createdBy: string;
  }): Promise<EditorialItem>;
  updateEditorialItem(id: string, data: Partial<EditorialItem>): Promise<EditorialItem | undefined>;
  deleteEditorialItem(id: string): Promise<void>;
  createEditorialComment(data: { itemId: string; userId: string; comment: string }): Promise<EditorialComment>;
  getEditorialComments(itemId: string): Promise<EditorialComment[]>;
  
  // SEO metadata operations
  getAllSeoMetadata(): Promise<SeoMetadata[]>;
  getSeoMetadata(pagePath: string): Promise<SeoMetadata | undefined>;
  upsertSeoMetadata(data: {
    pagePath: string;
    pageTitle: string;
    metaDescription: string;
    ogImage?: string;
    altText?: string;
    updatedBy: string;
  }): Promise<SeoMetadata>;
  deleteSeoMetadata(pagePath: string): Promise<void>;

  // Personal Access Token operations
  createPersonalAccessToken(data: {
    userId: string;
    token: string;
    name?: string;
    scopes: string;
    expiresAt: number;
  }): Promise<import("@shared/schema").PersonalAccessToken>;
  getUserPersonalAccessTokens(userId: string): Promise<import("@shared/schema").PersonalAccessToken[]>;
  revokePersonalAccessToken(id: string): Promise<void>;
  deletePersonalAccessToken(id: string): Promise<void>;

  // Upload session operations
  createUploadSession(data: {
    id: string;
    userId: string;
    shootId: string;
    filename: string;
    roomType: string;
    stackIndex: number;
    stackCount: number;
    r2Key: string;
    uploadId: string;
    fileSize?: number;
  }): Promise<import("@shared/schema").UploadSession>;
  getUploadSession(id: string): Promise<import("@shared/schema").UploadSession | undefined>;
  updateUploadSessionParts(id: string, parts: string): Promise<void>;
  completeUploadSession(id: string): Promise<void>;
  failUploadSession(id: string): Promise<void>;
  getUserUploadSessions(userId: string): Promise<import("@shared/schema").UploadSession[]>;

  // AI job operations
  createAIJob(data: {
    userId: string;
    shootId: string;
    tool: string;
    modelSlug: string;
    sourceImageKey: string;
    params?: string;
    externalJobId?: string;
  }): Promise<import("@shared/schema").AiJob>;
  getAIJob(id: string): Promise<import("@shared/schema").AiJob | undefined>;
  getAIJobByExternalId(externalJobId: string): Promise<import("@shared/schema").AiJob | undefined>;
  updateAIJobStatus(id: string, status: string, errorMessage?: string): Promise<void>;
  completeAIJob(id: string, outputImageKey: string, cost: number, credits: number): Promise<void>;
  getUserAIJobs(userId: string): Promise<import("@shared/schema").AiJob[]>;
  getShootAIJobs(shootId: string): Promise<import("@shared/schema").AiJob[]>;

  // Demo: Caption operations
  createCaption(data: {
    imageId: string;
    captionText: string;
    roomType?: string;
    confidence?: number;
    language?: string;
    version?: number;
  }): Promise<Caption>;
  getImageCaptions(imageId: string): Promise<Caption[]>;
  getJobCaptions(jobId: string): Promise<Caption[]>;

  // Demo: Expose operations
  createExpose(data: {
    jobId: string;
    summary: string;
    highlights?: string;
    neighborhood?: string;
    techDetails?: string;
    wordCount?: number;
    version?: number;
  }): Promise<Expose>;
  getJobExpose(jobId: string): Promise<Expose | undefined>;

  // Demo: Update image preview path
  updateImagePreviewPath(id: string, previewPath: string): Promise<void>;

  // Demo: Extended job operations
  updateJobDeadline(id: string, deadlineAt: number): Promise<void>;
  updateJobDeliverables(id: string, deliverGallery: boolean, deliverAlttext: boolean, deliverExpose: boolean): Promise<void>;

  // Gallery System V1.0 operations
  createGallery(data: {
    galleryType: string;
    userId: string;
    shootId?: string;
    jobId?: string;
    title: string;
    description?: string;
  }): Promise<import("@shared/schema").Gallery>;
  getGallery(id: string): Promise<import("@shared/schema").Gallery | undefined>;
  getUserGalleries(userId: string, galleryType?: string): Promise<import("@shared/schema").Gallery[]>;
  updateGalleryGlobalSettings(id: string, settings: {
    globalStylePreset?: string;
    globalWindowPreset?: string;
    globalSkyPreset?: string;
    globalFireplace?: string;
    globalRetouch?: string;
    globalEnhancements?: string;
  }): Promise<void>;
  updateGalleryStatus(id: string, status: string): Promise<void>;
  finalizeGallery(id: string): Promise<void>;

  createGalleryFile(data: {
    galleryId: string;
    originalFilename: string;
    storedFilename: string;
    filePath: string;
    thumbnailPath?: string;
    fileType: string;
    fileSize?: number;
    roomType?: string;
    sequenceIndex: number;
  }): Promise<import("@shared/schema").GalleryFile>;
  getGalleryFile(id: string): Promise<import("@shared/schema").GalleryFile | undefined>;
  getGalleryFiles(galleryId: string): Promise<import("@shared/schema").GalleryFile[]>;
  updateGalleryFileSettings(id: string, settings: {
    stylePreset?: string;
    windowPreset?: string;
    skyPreset?: string;
    fireplaceEnabled?: string;
    retouchEnabled?: string;
    enhancementsEnabled?: string;
  }): Promise<void>;
  updateGalleryFileStatus(id: string, status: string): Promise<void>;
  updateGalleryFileThumbnail(id: string, thumbnailPath: string): Promise<void>;

  createGalleryAnnotation(data: {
    fileId: string;
    userId: string;
    annotationType: string;
    comment?: string;
    maskPath?: string;
  }): Promise<import("@shared/schema").GalleryAnnotation>;
  getFileAnnotations(fileId: string): Promise<import("@shared/schema").GalleryAnnotation[]>;
  deleteGalleryAnnotation(id: string): Promise<void>;

  // PixCapture Uploaded Files operations (Intent-based Upload System)
  createUploadedFile(data: {
    userId: string;
    objectKey: string;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    checksum?: string;
    orderId?: string;
    roomType?: string;
    stackId?: string;
    exifMeta?: string;
  }): Promise<import("@shared/schema").UploadedFile>;
  getUploadedFile(id: string): Promise<import("@shared/schema").UploadedFile | undefined>;
  getUploadedFileByObjectKey(objectKey: string): Promise<import("@shared/schema").UploadedFile | undefined>;
  getUserUploadedFiles(userId: string): Promise<import("@shared/schema").UploadedFile[]>;
  updateUploadedFileStatus(id: string, status: string): Promise<void>;
  finalizeUploadedFile(objectKey: string, finalizedAt: number): Promise<void>;
  
  // Order Files Management (Phase 1)
  getOrderFiles(orderId: string, actorUserId: string, options?: {
    roomType?: string;
    marked?: boolean;
    status?: string;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'latest' | 'oldest' | 'filename';
  }): Promise<{
    files: import("@shared/schema").UploadedFile[];
    total: number;
  }>;
  getOrderStacks(orderId: string, actorUserId: string, options?: {
    includeDeleted?: boolean;
    previewLimit?: number;
  }): Promise<{
    roomType: string;
    totalFiles: number;
    markedFiles: number;
    deletedFiles?: number;
    latestUpload: number;
    earliestUpload: number;
    previewFiles: import("@shared/schema").UploadedFile[];
  }[]>;
  bulkMarkFiles(fileIds: string[], marked: boolean, actorUserId: string): Promise<{ affectedCount: number }>;
  bulkDeleteFiles(fileIds: string[], actorUserId: string, options?: {
    allowMarked?: boolean;
  }): Promise<{ affectedCount: number }>;
  addFileNote(fileId: string, userId: string, text: string): Promise<import("@shared/schema").FileNote>;
  getFileNotes(fileId: string, actorUserId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<{
    notes: Array<import("@shared/schema").FileNote & { 
      author: { id: string; email: string } 
    }>;
    total: number;
  }>;

  // Editor Management Operations
  createEditor(data: {
    name: string;
    email: string;
    specialization?: string;
    availability?: string;
    maxConcurrentJobs?: number;
  }): Promise<import("@shared/schema").Editor>;
  getEditor(id: string): Promise<import("@shared/schema").Editor | undefined>;
  getEditorByEmail(email: string): Promise<import("@shared/schema").Editor | undefined>;
  getAllEditors(): Promise<import("@shared/schema").Editor[]>;
  updateEditorAvailability(id: string, availability: string): Promise<void>;
  updateEditor(id: string, data: {
    name?: string;
    specialization?: string;
    maxConcurrentJobs?: number;
  }): Promise<void>;
  deleteEditor(id: string): Promise<void>;

  // Editor Assignment Operations
  assignJobToEditor(data: {
    jobId: string;
    editorId: string;
    priority?: string;
    notes?: string;
  }): Promise<import("@shared/schema").EditorAssignment>;
  getEditorAssignment(id: string): Promise<import("@shared/schema").EditorAssignment | undefined>;
  getEditorAssignments(editorId: string): Promise<import("@shared/schema").EditorAssignment[]>;
  getJobAssignment(jobId: string): Promise<import("@shared/schema").EditorAssignment | undefined>;
  getAllJobAssignments(jobId: string): Promise<import("@shared/schema").EditorAssignment[]>; // Full assignment history including reassignments
  getAllAssignments(filters?: {
    status?: string;
    priority?: string;
    editorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<import("@shared/schema").EditorAssignment[]>;
  getAllAssignmentsWithDetails(filters?: {
    status?: string;
    priority?: string;
    editorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Array<import("@shared/schema").EditorAssignment & {
    job: import("@shared/schema").Job;
    editor: import("@shared/schema").Editor;
    imageCount: number;
  }>>;
  getAssignmentByJobNumber(jobNumber: string): Promise<(import("@shared/schema").EditorAssignment & {
    job: import("@shared/schema").Job;
    editor: import("@shared/schema").Editor;
    imageCount: number;
  }) | undefined>;
  updateAssignmentStatus(id: string, status: string, timestampField?: string): Promise<void>;
  updateAssignmentPriority(id: string, priority: string): Promise<void>;
  updateAssignmentNotes(id: string, notes: string): Promise<void>;
  reassignJob(prevAssignmentId: string, newEditorId: string, notes?: string): Promise<import("@shared/schema").EditorAssignment>; // Returns new assignment, cancels old one
  cancelAssignment(id: string): Promise<void>;
  getEditorWorkload(editorId: string): Promise<number>; // Count of active assignments
  getEditorWorkloadDetailed(editorId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
  }>;
  getAvailableEditors(filters?: {
    specialization?: string;
    maxWorkload?: boolean; // Only editors below maxConcurrentJobs
  }): Promise<import("@shared/schema").Editor[]>;

  // Media Library Operations (Public Images)
  createPublicImage(data: {
    page: string;
    imageKey: string;
    url: string;
    alt: string;
    description?: string;
    displayOrder?: number;
    updatedBy?: string;
  }): Promise<import("@shared/schema").PublicImage>;
  getPublicImage(id: string): Promise<import("@shared/schema").PublicImage | undefined>;
  getAllPublicImages(): Promise<import("@shared/schema").PublicImage[]>;
  getPublicImagesByPage(page: string): Promise<import("@shared/schema").PublicImage[]>;
  updatePublicImage(id: string, data: {
    url?: string;
    alt?: string;
    description?: string;
    displayOrder?: number;
    isActive?: string;
    updatedBy?: string;
  }): Promise<import("@shared/schema").PublicImage | undefined>;
  deletePublicImage(id: string): Promise<void>;

  // Invoice Operations
  createInvoice(data: {
    invoiceNumber: string;
    jobId?: string;
    bookingId?: string;
    customerName: string;
    customerEmail: string;
    customerAddress?: string;
    invoiceDate: number;
    dueDate?: number;
    serviceDescription: string;
    lineItems: string; // JSON string
    netAmount: number;
    vatRate?: number;
    vatAmount: number;
    grossAmount: number;
    status?: string;
    notes?: string;
    createdBy: string;
  }): Promise<import("@shared/schema").Invoice>;
  getInvoice(id: string): Promise<import("@shared/schema").Invoice | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<import("@shared/schema").Invoice | undefined>;
  getAllInvoices(): Promise<import("@shared/schema").Invoice[]>;
  getUserInvoices(userId: string): Promise<import("@shared/schema").Invoice[]>;
  updateInvoiceStatus(id: string, status: string, paidAt?: number): Promise<void>;
  updateInvoice(id: string, data: Partial<import("@shared/schema").Invoice>): Promise<import("@shared/schema").Invoice | undefined>;
  deleteInvoice(id: string): Promise<void>;
  getNextInvoiceNumber(): Promise<string>;

  // Blog Post Operations
  createBlogPost(data: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    category: string;
    tags?: string[]; // Array of tags
    featuredImage?: string;
    status?: string;
    publishedAt?: number;
    createdBy: string;
  }): Promise<import("@shared/schema").BlogPost>;
  getBlogPost(id: string): Promise<import("@shared/schema").BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<import("@shared/schema").BlogPost | undefined>;
  getAllBlogPosts(status?: string): Promise<import("@shared/schema").BlogPost[]>;
  getPublishedBlogPosts(): Promise<import("@shared/schema").BlogPost[]>;
  updateBlogPost(id: string, data: Partial<import("@shared/schema").BlogPost>): Promise<import("@shared/schema").BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<void>;
  publishBlogPost(id: string): Promise<void>;
  unpublishBlogPost(id: string): Promise<void>;

  // Service Operations
  createService(data: {
    serviceCode: string;
    category: string;
    name: string;
    description?: string;
    netPrice?: number;
    priceNote?: string;
    notes?: string;
    isActive?: string;
  }): Promise<Service>;
  getService(id: string): Promise<Service | undefined>;
  getServiceByCode(serviceCode: string): Promise<Service | undefined>;
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  getServicesByCategory(category: string): Promise<Service[]>;
  updateService(id: string, data: Partial<Service>): Promise<void>;
  deleteService(id: string): Promise<void>;
  
  // Edit Jobs operations (HALT F4a)
  createEditJob(data: {
    fileId: string;
    orderId: string | null;
    userId: string;
    express?: boolean;
  }): Promise<any>; // Returns EditJob
  getEditJob(id: string): Promise<any | undefined>;
  getEditJobsByStatus(status: string, limit?: number): Promise<any[]>;
  getEditJobsByOrder(orderId: string): Promise<any[]>;
  getEditJobsByFile(fileId: string): Promise<any[]>;
  updateEditJobStatus(id: string, status: string, data?: {
    startedAt?: number;
    finishedAt?: number;
    error?: string;
    resultPath?: string;
    previewPath?: string;
    resultFileSize?: number;
  }): Promise<void>;
  retryEditJob(id: string): Promise<void>; // Increment retry count, reset to queued
  
  // File Locking operations (HALT F4a)
  lockFile(fileId: string): Promise<void>;
  unlockFile(fileId: string): Promise<void>;
  isFileLocked(fileId: string): Promise<boolean>;
  getLockedFiles(): Promise<any[]>;
  
  // Uploaded Files extended operations
  getFilesByStatus(status: string): Promise<any[]>;
  updateFileStatus(fileId: string, status: string): Promise<void>;
  getUploadedFile(fileId: string): Promise<any | undefined>; // Get single uploaded file
  
  // Package & Selection Logic operations
  updateJobPackageSettings(jobId: string, settings: {
    includedImages?: number;
    maxSelectable?: number;
    extraPricePerImage?: number;
    allowFreeExtras?: boolean;
    freeExtraQuota?: number;
    allImagesIncluded?: boolean;
  }, adminUserId: string, reason?: string, reasonCode?: string): Promise<void>;
  getJobSelectionStats(jobId: string): Promise<{
    totalCandidates: number;
    includedCount: number;
    extraPendingCount: number;
    extraPaidCount: number;
    extraFreeCount: number;
    blockedCount: number;
    downloadableCount: number;
  }>;
  updateFileSelectionState(fileId: string, state: 'none' | 'included' | 'extra_pending' | 'extra_paid' | 'extra_free' | 'blocked'): Promise<void>;
  getJobCandidateFiles(jobId: string, userId: string, role?: string): Promise<any[]>; // P1: Fixed - now queries uploadedFiles + enforces ownership (was incorrectly querying images table)
  getJobDownloadableFiles(jobId: string, userId: string, role?: string): Promise<any[]>; // Files that can be downloaded (P0: ownership + selection_state validated, admins bypass)
  setFileKulanzFree(fileId: string, adminUserId: string, reason?: string, reasonCode?: string): Promise<void>; // Set file to extra_free (P1: audit log)
  enableAllImagesKulanz(jobId: string, enabled: boolean, adminUserId: string, reason?: string, reasonCode?: string): Promise<void>; // Toggle allImagesIncluded (P1: audit log)

  // Upload Manifest Session operations (client-manifest-based upload tracking)
  createManifestSession(data: {
    userId: string;
    jobId?: string;
    clientType: 'pixcapture_ios' | 'pixcapture_android' | 'web_uploader';
    expectedFiles: number;
    totalBytesExpected: number;
  }): Promise<import("@shared/schema").UploadManifestSession>;
  createManifestItems(sessionId: string, items: Array<{
    objectKey: string;
    sizeBytes: number;
    checksum?: string;
  }>): Promise<import("@shared/schema").UploadManifestItem[]>;
  getManifestSession(sessionId: string): Promise<import("@shared/schema").UploadManifestSession | undefined>;
  getManifestItems(sessionId: string): Promise<import("@shared/schema").UploadManifestItem[]>;
  updateManifestItemStatus(itemId: string, status: 'pending' | 'uploading' | 'uploaded' | 'verified' | 'failed', errorMessage?: string): Promise<void>;
  updateManifestSessionState(sessionId: string, state: 'pending' | 'in_progress' | 'complete' | 'error' | 'stale'): Promise<void>;
  incrementManifestSessionErrors(sessionId: string): Promise<void>;
  completeManifestSession(sessionId: string): Promise<void>;
  getManifestItemByObjectKey(objectKey: string): Promise<import("@shared/schema").UploadManifestItem | undefined>;

  // Audit Log operations (P1: Admin action tracking)
  createAuditLog(params: {
    adminUserId: string;
    jobId: string;
    actionType: 'update_included_images' | 'set_all_images_included' | 'change_selection_state_extra_free' | 'update_max_selectable' | 'update_extra_price_per_image' | 'update_free_extra_quota' | 'bulk_selection_change' | 'update_allow_free_extras';
    entityScope: 'job' | 'uploaded_file' | 'legacy_image';
    affectedUploadedFileId?: string;
    affectedLegacyImageId?: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    reason?: string;
    reasonCode?: string;
  }): Promise<AuditLog>;

  // Test Helper operations (NODE_ENV === 'test' only)
  createJobForTests(userId: string, data: {
    propertyName: string;
    includedImages?: number;
    allImagesIncluded?: boolean;
  }): Promise<Job>;
  createUploadedFileForTests(data: {
    userId: string;
    orderId: string;
    originalFilename: string;
    selectionState?: 'none' | 'included' | 'extra_free' | 'blocked';
    isCandidate?: boolean;
  }): Promise<import("@shared/schema").UploadedFile>;
}

export class DatabaseStorage implements IStorage {
  async ready(): Promise<void> {
    // Database connection is established in db.ts
    // No initialization needed
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Normalize email to lowercase for case-insensitive lookup
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user || undefined;
  }

  async createUser(email: string, hashedPassword: string, role: string = "client"): Promise<User> {
    const id = randomUUID();
    const [user] = await db
      .insert(users)
      .values({
        id,
        email: email.toLowerCase(), // Store email in lowercase
        hashedPassword,
        role,
        createdAt: Date.now(),
      })
      .returning();
    return user;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    
    // Remove expired sessions
    if (session && session.expiresAt < Date.now()) {
      await this.deleteSession(id);
      return undefined;
    }
    
    return session || undefined;
  }

  async createSession(userId: string, expiresAt: number): Promise<Session> {
    const id = randomUUID();
    const [session] = await db
      .insert(sessions)
      .values({
        id,
        userId,
        expiresAt,
      })
      .returning();
    return session;
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    const [refreshToken] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    
    // Remove expired tokens
    if (refreshToken && refreshToken.expiresAt < Date.now()) {
      await this.deleteRefreshToken(token);
      return undefined;
    }
    
    return refreshToken || undefined;
  }

  async createRefreshToken(id: string, userId: string, token: string, expiresAt: number): Promise<RefreshToken> {
    const [refreshToken] = await db
      .insert(refreshTokens)
      .values({
        id,
        userId,
        token,
        expiresAt,
        createdAt: Date.now(),
      })
      .returning();
    return refreshToken;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    
    // Remove expired tokens
    if (resetToken && resetToken.expiresAt < Date.now()) {
      await this.deletePasswordResetToken(token);
      return undefined;
    }
    
    return resetToken || undefined;
  }

  async createPasswordResetToken(id: string, userId: string, token: string, expiresAt: number): Promise<PasswordResetToken> {
    const [resetToken] = await db
      .insert(passwordResetTokens)
      .values({
        id,
        userId,
        token,
        expiresAt,
        createdAt: Date.now(),
      })
      .returning();
    return resetToken;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  async deleteUserPasswordResetTokens(userId: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db.update(users).set({ hashedPassword }).where(eq(users.id, userId));
  }

  async createOrder(userId: string, orderData: {
    propertyName: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    propertyAddress: string;
    // Google Maps verified address data
    addressLat?: string;
    addressLng?: string;
    addressPlaceId?: string;
    addressFormatted?: string;
    addressLocationType?: string;
    preferredDate?: string;
    notes?: string;
  }): Promise<Order> {
    const id = randomUUID();
    const [order] = await db
      .insert(orders)
      .values({
        id,
        userId,
        propertyName: orderData.propertyName,
        contactName: orderData.contactName,
        contactEmail: orderData.contactEmail,
        contactPhone: orderData.contactPhone,
        propertyAddress: orderData.propertyAddress,
        // Google Maps verified address data
        addressLat: orderData.addressLat,
        addressLng: orderData.addressLng,
        addressPlaceId: orderData.addressPlaceId,
        addressFormatted: orderData.addressFormatted,
        addressLocationType: orderData.addressLocationType,
        preferredDate: orderData.preferredDate,
        notes: orderData.notes,
        createdAt: Date.now(),
      })
      .returning();
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: string): Promise<void> {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
  }

  // Job operations
  async createJob(userId: string, data: {
    localId?: string; // Client-generated ULID for offline deduplication
    customerName?: string;
    propertyName: string;
    propertyAddress?: string;
    // Google Maps verified address data
    addressLat?: string;
    addressLng?: string;
    addressPlaceId?: string;
    addressFormatted?: string;
    deadlineAt?: number;
    deliverGallery?: boolean;
    deliverAlttext?: boolean;
    deliverExpose?: boolean;
    // Local App User Assignment
    selectedUserId?: string;
    selectedUserInitials?: string;
    selectedUserCode?: string;
  }): Promise<Job> {
    const id = randomUUID();
    const jobNumber = `PIX-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const [job] = await db
      .insert(jobs)
      .values({
        id,
        jobNumber,
        userId,
        localId: data.localId || null, // Store client-provided localId for deduplication
        customerName: data.customerName,
        propertyName: data.propertyName,
        propertyAddress: data.propertyAddress,
        // Google Maps verified address data
        addressLat: data.addressLat || null,
        addressLng: data.addressLng || null,
        addressPlaceId: data.addressPlaceId || null,
        addressFormatted: data.addressFormatted || null,
        deadlineAt: data.deadlineAt,
        deliverGallery: data.deliverGallery !== undefined ? (data.deliverGallery ? "true" : "false") : "true",
        deliverAlttext: data.deliverAlttext !== undefined ? (data.deliverAlttext ? "true" : "false") : "true",
        deliverExpose: data.deliverExpose !== undefined ? (data.deliverExpose ? "true" : "false") : "false",
        // Local App User Assignment
        selectedUserId: data.selectedUserId || null,
        selectedUserInitials: data.selectedUserInitials || null,
        selectedUserCode: data.selectedUserCode || null,
        createdAt: Date.now(),
      })
      .returning();
    return job;
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async getJobByNumber(jobNumber: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.jobNumber, jobNumber));
    return job || undefined;
  }

  async findJobByLocalId(localId: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.localId, localId));
    return job || undefined;
  }

  async getUserJobs(userId: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.userId, userId)).orderBy(desc(jobs.createdAt));
  }

  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async updateJobStatus(id: string, status: string): Promise<void> {
    await db.update(jobs).set({ status }).where(eq(jobs.id, id));
  }

  async deleteJob(id: string): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
    // CASCADE delete automatically handles: shoots, images, stacks, exposes, uploadManifestSessions
    // galleries.jobId is SET NULL (not deleted)
  }

  // Shoot operations
  async createShoot(jobId: string): Promise<Shoot> {
    const id = randomUUID();
    const shootCode = id.substring(0, 5).toLowerCase();
    const [shoot] = await db
      .insert(shoots)
      .values({
        id,
        shootCode,
        jobId,
        createdAt: Date.now(),
      })
      .returning();
    return shoot;
  }

  async getShoot(id: string): Promise<Shoot | undefined> {
    const [shoot] = await db.select().from(shoots).where(eq(shoots.id, id));
    return shoot || undefined;
  }

  async getShootByCode(shootCode: string): Promise<Shoot | undefined> {
    const [shoot] = await db.select().from(shoots).where(eq(shoots.shootCode, shootCode));
    return shoot || undefined;
  }

  async getJobShoots(jobId: string): Promise<Shoot[]> {
    return await db.select().from(shoots).where(eq(shoots.jobId, jobId)).orderBy(desc(shoots.createdAt));
  }

  async getJobShootsGallery(jobId: string): Promise<Array<Shoot & { images: Image[] }>> {
    const jobShoots = await this.getJobShoots(jobId);
    const shootsWithImages = await Promise.all(
      jobShoots.map(async (shoot) => {
        const shootImages = await this.getShootImages(shoot.id);
        return { ...shoot, images: shootImages };
      })
    );
    return shootsWithImages;
  }

  async getActiveShootForJob(jobId: string): Promise<Shoot | undefined> {
    const [shoot] = await db
      .select()
      .from(shoots)
      .where(
        and(
          eq(shoots.jobId, jobId),
          eq(shoots.status, 'initialized')
        )
      )
      .orderBy(desc(shoots.createdAt))
      .limit(1);
    return shoot || undefined;
  }

  async updateShootStatus(id: string, status: string, timestampField?: string): Promise<void> {
    const updateData: any = { status };
    if (timestampField) {
      updateData[timestampField] = Date.now();
    }
    await db.update(shoots).set(updateData).where(eq(shoots.id, id));
  }

  // Editor Assignment operations
  async assignShootEditor(shootId: string, editorId: string, userId?: string): Promise<void> {
    await db.update(shoots).set({
      assignedEditorId: editorId,
      editorAssignedAt: Date.now(),
      editorAssignedBy: userId || null
    }).where(eq(shoots.id, shootId));
  }

  async clearShootEditor(shootId: string): Promise<void> {
    await db.update(shoots).set({
      assignedEditorId: null,
      editorAssignedAt: null,
      editorAssignedBy: null
    }).where(eq(shoots.id, shootId));
  }

  async getShootsByEditor(editorId: string): Promise<Shoot[]> {
    return await db.select().from(shoots).where(eq(shoots.assignedEditorId, editorId));
  }

  // Stack operations
  async createStack(
    shootId: string, 
    stackNumber: string, 
    frameCount: number, 
    roomType: string,
    sequenceIndex?: number
  ): Promise<Stack> {
    const id = randomUUID();
    const finalSequenceIndex = sequenceIndex !== undefined 
      ? sequenceIndex 
      : await this.getNextSequenceIndexForRoom(shootId, roomType);
    const [stack] = await db
      .insert(stacks)
      .values({
        id,
        shootId,
        stackNumber,
        roomType,
        frameCount,
        sequenceIndex: finalSequenceIndex,
        createdAt: Date.now(),
      })
      .returning();
    return stack;
  }

  async getStack(id: string): Promise<Stack | undefined> {
    const [stack] = await db.select().from(stacks).where(eq(stacks.id, id));
    return stack || undefined;
  }

  async getShootStacks(shootId: string): Promise<Stack[]> {
    return await db.select().from(stacks).where(eq(stacks.shootId, shootId));
  }

  async updateStackRoomType(id: string, roomType: string): Promise<void> {
    // Get the stack to find its shootId
    const stack = await this.getStack(id);
    if (!stack) {
      throw new Error("Stack not found");
    }
    
    // Get the new sequence index for the new room type
    const newSequenceIndex = await this.getNextSequenceIndexForRoom(stack.shootId, roomType);
    
    // Update room type and sequence index together
    await db.update(stacks).set({ 
      roomType, 
      sequenceIndex: newSequenceIndex 
    }).where(eq(stacks.id, id));
  }

  async updateStackFrameCount(id: string, frameCount: number): Promise<void> {
    await db.update(stacks).set({ frameCount }).where(eq(stacks.id, id));
  }

  async getNextSequenceIndexForRoom(shootId: string, roomType: string): Promise<number> {
    // NOTE: Potential race condition if simultaneous uploads for same room type occur.
    // For MVP: unlikely scenario (single photographer uploads sequentially).
    // Future: Add database-level locking or unique constraints if needed.
    
    // Count existing images (not stacks!) for this room type in this shoot
    const existingImages = await db
      .select()
      .from(images)
      .where(and(eq(images.shootId, shootId), eq(images.roomType, roomType)));
    return existingImages.length + 1;
  }

  // Image operations
  async createImage(data: {
    shootId: string;
    stackId?: string;
    originalFilename: string;
    renamedFilename?: string;
    filePath: string;
    fileSize?: number;
    mimeType?: string;
    exifDate?: number;
    exposureValue?: string;
    positionInStack?: number;
    roomType?: string;
    filenamePatternVersion?: string;
    validatedAt?: number;
    classifiedAt?: number;
  }): Promise<Image> {
    const id = randomUUID();
    const [image] = await db
      .insert(images)
      .values({
        id,
        shootId: data.shootId,
        stackId: data.stackId,
        originalFilename: data.originalFilename,
        renamedFilename: data.renamedFilename,
        filePath: data.filePath,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        exifDate: data.exifDate,
        exposureValue: data.exposureValue,
        positionInStack: data.positionInStack,
        roomType: data.roomType,
        filenamePatternVersion: data.filenamePatternVersion || 'v3.1',
        validatedAt: data.validatedAt,
        classifiedAt: data.classifiedAt,
        createdAt: Date.now(),
      })
      .returning();
    return image;
  }

  async getImage(id: string): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image || undefined;
  }

  async getShootImages(shootId: string): Promise<Image[]> {
    return await db.select().from(images).where(eq(images.shootId, shootId));
  }

  async getStackImages(stackId: string): Promise<Image[]> {
    return await db.select().from(images).where(eq(images.stackId, stackId));
  }

  async updateImageRenamedFilename(id: string, renamedFilename: string): Promise<void> {
    await db.update(images).set({ renamedFilename }).where(eq(images.id, id));
  }

  // QC Quality Check operations
  async updateImageQCStatus(
    id: string, 
    qcStatus: 'pending' | 'approved' | 'rejected' | 'needs-revision', 
    qcComment?: string, 
    qcTechnicalIssues?: string[], 
    userId?: string
  ): Promise<void> {
    await db.update(images).set({ 
      qcStatus,
      qcComment: qcComment || null,
      qcTechnicalIssues: qcTechnicalIssues || null,
      qcBy: userId || null,
      qcAt: Date.now()
    }).where(eq(images.id, id));
  }

  async getImagesByQCStatus(qcStatus: 'pending' | 'approved' | 'rejected' | 'needs-revision'): Promise<Image[]> {
    return await db.select().from(images).where(eq(images.qcStatus, qcStatus));
  }

  async getShootImagesWithQC(shootId: string): Promise<Image[]> {
    return await db.select().from(images).where(eq(images.shootId, shootId));
  }

  // Editor Token operations
  async createEditorToken(shootId: string, tokenType: 'download' | 'upload', token: string, expiresAt: number, filePath?: string): Promise<EditorToken> {
    const id = randomUUID();
    const [editorToken] = await db
      .insert(editorTokens)
      .values({
        id,
        shootId,
        token,
        tokenType,
        filePath: filePath || null,
        expiresAt,
        createdAt: Date.now(),
      })
      .returning();
    return editorToken;
  }

  async getEditorToken(token: string): Promise<EditorToken | undefined> {
    const [editorToken] = await db.select().from(editorTokens).where(eq(editorTokens.token, token));
    
    // Remove expired tokens
    if (editorToken && editorToken.expiresAt < Date.now()) {
      return undefined;
    }
    
    return editorToken || undefined;
  }

  async markEditorTokenUsed(token: string): Promise<void> {
    await db.update(editorTokens).set({ usedAt: Date.now() }).where(eq(editorTokens.token, token));
  }

  // Edited Image operations
  async createEditedImage(data: {
    id: string;
    shootId: string;
    stackId?: string | null;
    filename: string;
    filePath: string;
    fileSize?: number;
    version: number;
    roomType?: string;
    sequenceIndex?: number;
    clientApprovalStatus?: string;
    createdAt: number;
  }): Promise<EditedImage> {
    const [editedImage] = await db
      .insert(editedImages)
      .values({
        id: data.id,
        shootId: data.shootId,
        stackId: data.stackId || null,
        filename: data.filename,
        filePath: data.filePath,
        fileSize: data.fileSize,
        version: data.version,
        roomType: data.roomType,
        sequenceIndex: data.sequenceIndex,
        clientApprovalStatus: data.clientApprovalStatus || 'pending',
        createdAt: data.createdAt,
      })
      .returning();
    return editedImage;
  }

  async getEditedImage(id: string): Promise<EditedImage | undefined> {
    const [editedImage] = await db.select().from(editedImages).where(eq(editedImages.id, id));
    return editedImage || undefined;
  }

  async getEditedImagesByShoot(shootId: string): Promise<EditedImage[]> {
    return await db.select().from(editedImages).where(eq(editedImages.shootId, shootId)).orderBy(desc(editedImages.createdAt));
  }

  async getStacksByShoot(shootId: string): Promise<Stack[]> {
    return await db.select().from(stacks).where(eq(stacks.shootId, shootId));
  }

  async updateEditedImageApprovalStatus(id: string, status: string, timestampField?: string): Promise<void> {
    const updates: Record<string, any> = { clientApprovalStatus: status };
    if (timestampField) {
      updates[timestampField] = Date.now();
    }
    await db.update(editedImages).set(updates).where(eq(editedImages.id, id));
  }

  async createBooking(userId: string, bookingData: {
    region: string;
    kilometers?: number;
    contactName?: string;
    contactEmail?: string;
    contactMobile: string;
    propertyName: string;
    propertyAddress?: string;
    // Google Maps verified address data
    addressLat?: string;
    addressLng?: string;
    addressPlaceId?: string;
    addressFormatted?: string;
    propertyType?: string;
    preferredDate?: string;
    preferredTime?: string;
    specialRequirements?: string;
    totalNetPrice: number;
    vatAmount: number;
    grossAmount: number;
    agbAccepted: boolean;
    serviceSelections: Record<string, number>;
  }): Promise<{ booking: Booking; items: BookingItem[] }> {
    const bookingId = randomUUID();
    const timestamp = Date.now();

    const [booking] = await db
      .insert(bookings)
      .values({
        id: bookingId,
        userId,
        region: bookingData.region,
        kilometers: bookingData.kilometers || null,
        contactName: bookingData.contactName || null,
        contactEmail: bookingData.contactEmail || null,
        contactMobile: bookingData.contactMobile,
        propertyName: bookingData.propertyName,
        propertyAddress: bookingData.propertyAddress || null,
        // Google Maps verified address data
        addressLat: bookingData.addressLat || null,
        addressLng: bookingData.addressLng || null,
        addressPlaceId: bookingData.addressPlaceId || null,
        addressFormatted: bookingData.addressFormatted || null,
        propertyType: bookingData.propertyType || null,
        preferredDate: bookingData.preferredDate || null,
        preferredTime: bookingData.preferredTime || null,
        specialRequirements: bookingData.specialRequirements || null,
        totalNetPrice: bookingData.totalNetPrice,
        vatAmount: bookingData.vatAmount,
        grossAmount: bookingData.grossAmount,
        agbAccepted: bookingData.agbAccepted ? "true" : "false",
        status: "pending",
        createdAt: timestamp,
      })
      .returning();

    const items: BookingItem[] = [];
    
    for (const [serviceId, quantity] of Object.entries(bookingData.serviceSelections)) {
      if (quantity > 0) {
        const service = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);
        if (service.length > 0 && service[0].netPrice) {
          const unitPrice = service[0].netPrice;
          const totalPrice = unitPrice * quantity;
          
          const [item] = await db
            .insert(bookingItems)
            .values({
              id: randomUUID(),
              bookingId,
              serviceId,
              quantity,
              unitPrice,
              totalPrice,
              createdAt: timestamp,
            })
            .returning();
          
          items.push(item);
        }
      }
    }

    return { booking, items };
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBookingItems(bookingId: string): Promise<BookingItem[]> {
    return await db.select().from(bookingItems).where(eq(bookingItems.bookingId, bookingId));
  }

  async getBookingWithItems(bookingId: string): Promise<{ booking: Booking; items: BookingItem[] } | undefined> {
    const booking = await this.getBooking(bookingId);
    if (!booking) return undefined;
    
    const items = await this.getBookingItems(bookingId);
    return { booking, items };
  }

  async updateBookingStatus(id: string, status: string): Promise<void> {
    const timestamp = Date.now();
    const updateData: any = { status };
    
    if (status === 'confirmed') {
      updateData.confirmedAt = timestamp;
    }
    
    await db.update(bookings).set(updateData).where(eq(bookings.id, id));
  }

  async getClientGallery(userId: string): Promise<any[]> {
    // Get all jobs for this user
    const userJobs = await db
      .select()
      .from(jobs)
      .where(eq(jobs.userId, userId))
      .orderBy(desc(jobs.createdAt));

    const galleryData = [];

    for (const job of userJobs) {
      // Get all shoots for this job
      const jobShoots = await db
        .select()
        .from(shoots)
        .where(eq(shoots.jobId, job.id))
        .orderBy(shoots.createdAt);

      const shootsWithImages = [];

      for (const shoot of jobShoots) {
        // Get all approved edited images for this shoot
        const approvedImages = await db
          .select()
          .from(editedImages)
          .where(
            and(
              eq(editedImages.shootId, shoot.id),
              eq(editedImages.clientApprovalStatus, "approved")
            )
          )
          .orderBy(editedImages.roomType, editedImages.sequenceIndex);

        if (approvedImages.length > 0) {
          shootsWithImages.push({
            ...shoot,
            images: approvedImages,
          });
        }
      }

      if (shootsWithImages.length > 0) {
        galleryData.push({
          ...job,
          shoots: shootsWithImages,
        });
      }
    }

    return galleryData;
  }

  async toggleFavorite(userId: string, imageId: string): Promise<{ favorited: boolean }> {
    // Check if favorite already exists
    const [existing] = await db
      .select()
      .from(imageFavorites)
      .where(
        and(
          eq(imageFavorites.userId, userId),
          eq(imageFavorites.imageId, imageId)
        )
      );

    if (existing) {
      // Remove favorite
      await db
        .delete(imageFavorites)
        .where(
          and(
            eq(imageFavorites.userId, userId),
            eq(imageFavorites.imageId, imageId)
          )
        );
      return { favorited: false };
    } else {
      // Add favorite
      await db.insert(imageFavorites).values({
        id: randomUUID(),
        userId,
        imageId,
        createdAt: Date.now(),
      });
      return { favorited: true };
    }
  }

  async getUserFavorites(userId: string): Promise<string[]> {
    const favorites = await db
      .select()
      .from(imageFavorites)
      .where(eq(imageFavorites.userId, userId));
    
    return favorites.map(f => f.imageId);
  }

  async getImageFavoriteCount(imageId: string): Promise<number> {
    const favorites = await db
      .select()
      .from(imageFavorites)
      .where(eq(imageFavorites.imageId, imageId));
    
    return favorites.length;
  }

  async addComment(userId: string, imageId: string, comment: string, altText?: string): Promise<ImageComment> {
    const [newComment] = await db
      .insert(imageComments)
      .values({
        id: randomUUID(),
        userId,
        imageId,
        comment,
        altText: altText || null,
        createdAt: Date.now(),
      })
      .returning();
    
    return newComment;
  }

  async getImageComments(imageId: string): Promise<any[]> {
    const comments = await db
      .select({
        id: imageComments.id,
        comment: imageComments.comment,
        altText: imageComments.altText,
        createdAt: imageComments.createdAt,
        userId: imageComments.userId,
        userEmail: users.email,
      })
      .from(imageComments)
      .leftJoin(users, eq(imageComments.userId, users.id))
      .where(eq(imageComments.imageId, imageId))
      .orderBy(imageComments.createdAt);
    
    return comments;
  }

  // Editorial management operations
  async getEditorialItems(): Promise<EditorialItem[]> {
    const items = await db
      .select()
      .from(editorialItems)
      .orderBy(desc(editorialItems.createdAt));
    
    return items;
  }

  async createEditorialItem(data: {
    title: string;
    type: string;
    category: string;
    status?: string;
    priority?: string;
    description?: string;
    dueDate?: number;
    publishWeek?: string;
    assigneeId?: string;
    tags?: string[];
    createdBy: string;
  }): Promise<EditorialItem> {
    const id = randomUUID();
    const now = Date.now();
    
    const [item] = await db
      .insert(editorialItems)
      .values({
        id,
        title: data.title,
        type: data.type,
        category: data.category,
        status: data.status || 'idea',
        priority: data.priority || 'normal',
        description: data.description || null,
        dueDate: data.dueDate || null,
        publishWeek: data.publishWeek || null,
        assigneeId: data.assigneeId || null,
        tags: data.tags || null,
        createdBy: data.createdBy,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
      })
      .returning();
    
    return item;
  }

  async updateEditorialItem(id: string, data: Partial<EditorialItem>): Promise<EditorialItem | undefined> {
    const [item] = await db
      .update(editorialItems)
      .set({
        ...data,
        updatedAt: Date.now(),
        // Set completedAt when status becomes 'done' or 'published'
        completedAt: (data.status === 'done' || data.status === 'published') && !data.completedAt 
          ? Date.now() 
          : data.completedAt,
      })
      .where(eq(editorialItems.id, id))
      .returning();
    
    return item || undefined;
  }

  async deleteEditorialItem(id: string): Promise<void> {
    await db.delete(editorialItems).where(eq(editorialItems.id, id));
  }

  async createEditorialComment(data: { itemId: string; userId: string; comment: string }): Promise<EditorialComment> {
    const [comment] = await db
      .insert(editorialComments)
      .values({
        id: randomUUID(),
        itemId: data.itemId,
        userId: data.userId,
        comment: data.comment,
        createdAt: Date.now(),
      })
      .returning();
    
    return comment;
  }

  async getEditorialComments(itemId: string): Promise<EditorialComment[]> {
    const comments = await db
      .select()
      .from(editorialComments)
      .where(eq(editorialComments.itemId, itemId))
      .orderBy(editorialComments.createdAt);
    
    return comments;
  }

  // SEO metadata operations
  async getAllSeoMetadata(): Promise<SeoMetadata[]> {
    const metadata = await db
      .select()
      .from(seoMetadata)
      .orderBy(seoMetadata.pagePath);
    
    return metadata;
  }

  async getSeoMetadata(pagePath: string): Promise<SeoMetadata | undefined> {
    const [metadata] = await db
      .select()
      .from(seoMetadata)
      .where(eq(seoMetadata.pagePath, pagePath));
    
    return metadata || undefined;
  }

  async upsertSeoMetadata(data: {
    pagePath: string;
    pageTitle: string;
    metaDescription: string;
    ogImage?: string;
    altText?: string;
    updatedBy: string;
  }): Promise<SeoMetadata> {
    const now = Date.now();
    const existing = await this.getSeoMetadata(data.pagePath);

    if (existing) {
      // Update existing record
      const [updated] = await db
        .update(seoMetadata)
        .set({
          pageTitle: data.pageTitle,
          metaDescription: data.metaDescription,
          ogImage: data.ogImage || null,
          altText: data.altText || null,
          updatedAt: now,
          updatedBy: data.updatedBy,
        })
        .where(eq(seoMetadata.pagePath, data.pagePath))
        .returning();
      
      return updated;
    } else {
      // Insert new record
      const [inserted] = await db
        .insert(seoMetadata)
        .values({
          id: randomUUID(),
          pagePath: data.pagePath,
          pageTitle: data.pageTitle,
          metaDescription: data.metaDescription,
          ogImage: data.ogImage || null,
          altText: data.altText || null,
          updatedAt: now,
          updatedBy: data.updatedBy,
        })
        .returning();
      
      return inserted;
    }
  }

  async deleteSeoMetadata(pagePath: string): Promise<void> {
    await db.delete(seoMetadata).where(eq(seoMetadata.pagePath, pagePath));
  }

  async createPersonalAccessToken(data: {
    userId: string;
    token: string;
    name?: string;
    scopes: string;
    expiresAt: number;
  }): Promise<PersonalAccessToken> {
    const [pat] = await db
      .insert(personalAccessTokens)
      .values({
        id: randomUUID(),
        userId: data.userId,
        token: data.token,
        name: data.name || null,
        scopes: data.scopes,
        expiresAt: data.expiresAt,
        createdAt: Date.now(),
        lastUsedAt: null,
        lastUsedIp: null,
        revokedAt: null,
      })
      .returning();
    return pat;
  }

  async getUserPersonalAccessTokens(userId: string): Promise<PersonalAccessToken[]> {
    const tokens = await db
      .select()
      .from(personalAccessTokens)
      .where(eq(personalAccessTokens.userId, userId))
      .orderBy(desc(personalAccessTokens.createdAt));
    return tokens;
  }

  async revokePersonalAccessToken(id: string): Promise<void> {
    await db
      .update(personalAccessTokens)
      .set({ revokedAt: Date.now() })
      .where(eq(personalAccessTokens.id, id));
  }

  async deletePersonalAccessToken(id: string): Promise<void> {
    await db
      .delete(personalAccessTokens)
      .where(eq(personalAccessTokens.id, id));
  }

  async createUploadSession(data: {
    id: string;
    userId: string;
    shootId: string;
    filename: string;
    roomType: string;
    stackIndex: number;
    stackCount: number;
    r2Key: string;
    uploadId: string;
    fileSize?: number;
  }): Promise<UploadSession> {
    const [session] = await db
      .insert(uploadSessions)
      .values({
        id: data.id,
        userId: data.userId,
        shootId: data.shootId,
        filename: data.filename,
        roomType: data.roomType,
        stackIndex: data.stackIndex,
        stackCount: data.stackCount,
        r2Key: data.r2Key,
        uploadId: data.uploadId,
        fileSize: data.fileSize || null,
        parts: null,
        status: "initiated",
        completedAt: null,
        createdAt: Date.now(),
      })
      .returning();
    return session;
  }

  async getUploadSession(id: string): Promise<UploadSession | undefined> {
    const [session] = await db
      .select()
      .from(uploadSessions)
      .where(eq(uploadSessions.id, id));
    return session || undefined;
  }

  async updateUploadSessionParts(id: string, parts: string): Promise<void> {
    await db
      .update(uploadSessions)
      .set({ parts, status: "uploading" })
      .where(eq(uploadSessions.id, id));
  }

  async completeUploadSession(id: string): Promise<void> {
    await db
      .update(uploadSessions)
      .set({ status: "completed", completedAt: Date.now() })
      .where(eq(uploadSessions.id, id));
  }

  async failUploadSession(id: string): Promise<void> {
    await db
      .update(uploadSessions)
      .set({ status: "failed" })
      .where(eq(uploadSessions.id, id));
  }

  async getUserUploadSessions(userId: string): Promise<UploadSession[]> {
    const sessions = await db
      .select()
      .from(uploadSessions)
      .where(eq(uploadSessions.userId, userId))
      .orderBy(desc(uploadSessions.createdAt));
    return sessions;
  }

  async createAIJob(data: {
    userId: string;
    shootId: string;
    tool: string;
    modelSlug: string;
    sourceImageKey: string;
    params?: string;
    externalJobId?: string;
  }): Promise<AiJob> {
    const [job] = await db
      .insert(aiJobs)
      .values({
        id: randomUUID(),
        userId: data.userId,
        shootId: data.shootId,
        tool: data.tool,
        modelSlug: data.modelSlug,
        sourceImageKey: data.sourceImageKey,
        outputImageKey: null,
        params: data.params || null,
        externalJobId: data.externalJobId || null,
        status: "pending",
        cost: null,
        credits: null,
        errorMessage: null,
        webhookReceivedAt: null,
        completedAt: null,
        createdAt: Date.now(),
      })
      .returning();
    return job;
  }

  async getAIJob(id: string): Promise<AiJob | undefined> {
    const [job] = await db.select().from(aiJobs).where(eq(aiJobs.id, id));
    return job || undefined;
  }

  async getAIJobByExternalId(externalJobId: string): Promise<AiJob | undefined> {
    const [job] = await db
      .select()
      .from(aiJobs)
      .where(eq(aiJobs.externalJobId, externalJobId));
    return job || undefined;
  }

  async updateAIJobStatus(id: string, status: string, errorMessage?: string): Promise<void> {
    await db
      .update(aiJobs)
      .set({
        status,
        errorMessage: errorMessage || null,
        webhookReceivedAt: Date.now(),
      })
      .where(eq(aiJobs.id, id));
  }

  async completeAIJob(id: string, outputImageKey: string, cost: number, credits: number): Promise<void> {
    await db
      .update(aiJobs)
      .set({
        status: "completed",
        outputImageKey,
        cost,
        credits,
        completedAt: Date.now(),
        webhookReceivedAt: Date.now(),
      })
      .where(eq(aiJobs.id, id));
  }

  async getUserAIJobs(userId: string): Promise<AiJob[]> {
    const jobs = await db
      .select()
      .from(aiJobs)
      .where(eq(aiJobs.userId, userId))
      .orderBy(desc(aiJobs.createdAt));
    return jobs;
  }

  async getShootAIJobs(shootId: string): Promise<AiJob[]> {
    const jobs = await db
      .select()
      .from(aiJobs)
      .where(eq(aiJobs.shootId, shootId))
      .orderBy(desc(aiJobs.createdAt));
    return jobs;
  }

  async getUserCredits(userId: string): Promise<number> {
    const [user] = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId));
    return user?.credits || 0;
  }

  async addCredits(userId: string, amount: number): Promise<void> {
    const currentCredits = await this.getUserCredits(userId);
    await db
      .update(users)
      .set({ credits: currentCredits + amount })
      .where(eq(users.id, userId));
  }

  async deductCredits(userId: string, amount: number): Promise<boolean> {
    const currentCredits = await this.getUserCredits(userId);
    if (currentCredits < amount) {
      return false;
    }
    await db
      .update(users)
      .set({ credits: currentCredits - amount })
      .where(eq(users.id, userId));
    return true;
  }

  async updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void> {
    await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId));
  }

  // Demo: Caption operations
  async createCaption(data: {
    imageId: string;
    captionText: string;
    roomType?: string;
    confidence?: number;
    language?: string;
    version?: number;
  }): Promise<Caption> {
    const id = randomUUID();
    const [caption] = await db
      .insert(captions)
      .values({
        id,
        imageId: data.imageId,
        captionText: data.captionText,
        roomType: data.roomType,
        confidence: data.confidence,
        language: data.language || "de",
        version: data.version || 1,
        createdAt: Date.now(),
      })
      .returning();
    return caption;
  }

  async getImageCaptions(imageId: string): Promise<Caption[]> {
    return await db
      .select()
      .from(captions)
      .where(eq(captions.imageId, imageId))
      .orderBy(desc(captions.version));
  }

  async getJobCaptions(jobId: string): Promise<Caption[]> {
    const result = await db
      .select({
        caption: captions,
      })
      .from(captions)
      .innerJoin(images, eq(captions.imageId, images.id))
      .innerJoin(shoots, eq(images.shootId, shoots.id))
      .where(eq(shoots.jobId, jobId))
      .orderBy(desc(captions.createdAt));
    
    return result.map(r => r.caption);
  }

  // Demo: Expose operations
  async createExpose(data: {
    jobId: string;
    summary: string;
    highlights?: string;
    neighborhood?: string;
    techDetails?: string;
    wordCount?: number;
    version?: number;
  }): Promise<Expose> {
    const id = randomUUID();
    const [expose] = await db
      .insert(exposes)
      .values({
        id,
        jobId: data.jobId,
        summary: data.summary,
        highlights: data.highlights,
        neighborhood: data.neighborhood,
        techDetails: data.techDetails,
        wordCount: data.wordCount,
        version: data.version || 1,
        createdAt: Date.now(),
      })
      .returning();
    return expose;
  }

  async getJobExpose(jobId: string): Promise<Expose | undefined> {
    const [expose] = await db
      .select()
      .from(exposes)
      .where(eq(exposes.jobId, jobId))
      .orderBy(desc(exposes.version))
      .limit(1);
    return expose || undefined;
  }

  // Demo: Update image preview path
  async updateImagePreviewPath(id: string, previewPath: string): Promise<void> {
    await db
      .update(images)
      .set({ previewPath })
      .where(eq(images.id, id));
  }

  // Demo: Extended job operations
  async updateJobDeadline(id: string, deadlineAt: number): Promise<void> {
    await db
      .update(jobs)
      .set({ deadlineAt })
      .where(eq(jobs.id, id));
  }

  async updateJobDeliverables(id: string, deliverGallery: boolean, deliverAlttext: boolean, deliverExpose: boolean): Promise<void> {
    await db
      .update(jobs)
      .set({ 
        deliverGallery: deliverGallery ? "true" : "false",
        deliverAlttext: deliverAlttext ? "true" : "false",
        deliverExpose: deliverExpose ? "true" : "false",
      })
      .where(eq(jobs.id, id));
  }

  // Gallery System V1.0 operations
  async createGallery(data: {
    galleryType: string;
    userId: string;
    shootId?: string;
    jobId?: string;
    title: string;
    description?: string;
  }): Promise<Gallery> {
    const id = randomUUID();
    const now = Date.now();
    const [gallery] = await db
      .insert(galleries)
      .values({
        id,
        galleryType: data.galleryType,
        userId: data.userId,
        shootId: data.shootId,
        jobId: data.jobId,
        title: data.title,
        description: data.description,
        status: "uploaded",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return gallery;
  }

  async getGallery(id: string): Promise<Gallery | undefined> {
    const [gallery] = await db
      .select()
      .from(galleries)
      .where(eq(galleries.id, id));
    return gallery || undefined;
  }

  async getUserGalleries(userId: string, galleryType?: string): Promise<Gallery[]> {
    if (galleryType) {
      return await db
        .select()
        .from(galleries)
        .where(and(eq(galleries.userId, userId), eq(galleries.galleryType, galleryType)))
        .orderBy(desc(galleries.createdAt));
    }
    return await db
      .select()
      .from(galleries)
      .where(eq(galleries.userId, userId))
      .orderBy(desc(galleries.createdAt));
  }

  async updateGalleryGlobalSettings(id: string, settings: {
    globalStylePreset?: string;
    globalWindowPreset?: string;
    globalSkyPreset?: string;
    globalFireplace?: string;
    globalRetouch?: string;
    globalEnhancements?: string;
  }): Promise<void> {
    await db
      .update(galleries)
      .set({ 
        ...settings,
        updatedAt: Date.now(),
      })
      .where(eq(galleries.id, id));
  }

  async updateGalleryStatus(id: string, status: string): Promise<void> {
    await db
      .update(galleries)
      .set({ 
        status,
        updatedAt: Date.now(),
      })
      .where(eq(galleries.id, id));
  }

  async finalizeGallery(id: string): Promise<void> {
    await db
      .update(galleries)
      .set({ 
        status: "editing",
        finalizedAt: Date.now(),
        updatedAt: Date.now(),
      })
      .where(eq(galleries.id, id));
  }

  async createGalleryFile(data: {
    galleryId: string;
    originalFilename: string;
    storedFilename: string;
    filePath: string;
    thumbnailPath?: string;
    fileType: string;
    fileSize?: number;
    roomType?: string;
    sequenceIndex: number;
  }): Promise<GalleryFile> {
    const id = randomUUID();
    const now = Date.now();
    const [file] = await db
      .insert(galleryFiles)
      .values({
        id,
        galleryId: data.galleryId,
        originalFilename: data.originalFilename,
        storedFilename: data.storedFilename,
        filePath: data.filePath,
        thumbnailPath: data.thumbnailPath,
        fileType: data.fileType,
        fileSize: data.fileSize,
        roomType: data.roomType,
        sequenceIndex: data.sequenceIndex,
        status: "uploaded",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return file;
  }

  async getGalleryFile(id: string): Promise<GalleryFile | undefined> {
    const [file] = await db
      .select()
      .from(galleryFiles)
      .where(eq(galleryFiles.id, id));
    return file || undefined;
  }

  async getGalleryFiles(galleryId: string): Promise<GalleryFile[]> {
    return await db
      .select()
      .from(galleryFiles)
      .where(eq(galleryFiles.galleryId, galleryId))
      .orderBy(galleryFiles.sequenceIndex);
  }

  async updateGalleryFileSettings(id: string, settings: {
    stylePreset?: string;
    windowPreset?: string;
    skyPreset?: string;
    fireplaceEnabled?: string;
    retouchEnabled?: string;
    enhancementsEnabled?: string;
  }): Promise<void> {
    await db
      .update(galleryFiles)
      .set({ 
        ...settings,
        updatedAt: Date.now(),
      })
      .where(eq(galleryFiles.id, id));
  }

  async updateGalleryFileStatus(id: string, status: string): Promise<void> {
    await db
      .update(galleryFiles)
      .set({ 
        status,
        updatedAt: Date.now(),
      })
      .where(eq(galleryFiles.id, id));
  }

  async updateGalleryFileThumbnail(id: string, thumbnailPath: string): Promise<void> {
    await db
      .update(galleryFiles)
      .set({ 
        thumbnailPath,
        updatedAt: Date.now(),
      })
      .where(eq(galleryFiles.id, id));
  }

  async createGalleryAnnotation(data: {
    fileId: string;
    userId: string;
    annotationType: string;
    comment?: string;
    maskPath?: string;
  }): Promise<GalleryAnnotation> {
    const id = randomUUID();
    const [annotation] = await db
      .insert(galleryAnnotations)
      .values({
        id,
        fileId: data.fileId,
        userId: data.userId,
        annotationType: data.annotationType,
        comment: data.comment,
        maskPath: data.maskPath,
        createdAt: Date.now(),
      })
      .returning();
    return annotation;
  }

  async getFileAnnotations(fileId: string): Promise<GalleryAnnotation[]> {
    return await db
      .select()
      .from(galleryAnnotations)
      .where(eq(galleryAnnotations.fileId, fileId))
      .orderBy(desc(galleryAnnotations.createdAt));
  }

  async deleteGalleryAnnotation(id: string): Promise<void> {
    await db
      .delete(galleryAnnotations)
      .where(eq(galleryAnnotations.id, id));
  }

  // ==================== Editor Management Operations ====================

  async createEditor(data: {
    name: string;
    email: string;
    specialization?: string;
    availability?: string;
    maxConcurrentJobs?: number;
  }): Promise<Editor> {
    const id = randomUUID();
    const [editor] = await db
      .insert(editors)
      .values({
        id,
        name: data.name,
        email: data.email.toLowerCase(),
        specialization: data.specialization,
        availability: data.availability || 'available',
        maxConcurrentJobs: data.maxConcurrentJobs || 3,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      .returning();
    return editor;
  }

  async getEditor(id: string): Promise<Editor | undefined> {
    const [editor] = await db
      .select()
      .from(editors)
      .where(eq(editors.id, id));
    return editor || undefined;
  }

  async getEditorByEmail(email: string): Promise<Editor | undefined> {
    const [editor] = await db
      .select()
      .from(editors)
      .where(eq(editors.email, email.toLowerCase()));
    return editor || undefined;
  }

  async getAllEditors(): Promise<Editor[]> {
    return await db
      .select()
      .from(editors)
      .orderBy(editors.name);
  }

  async updateEditorAvailability(id: string, availability: string): Promise<void> {
    await db
      .update(editors)
      .set({ 
        availability,
        updatedAt: Date.now(),
      })
      .where(eq(editors.id, id));
  }

  async updateEditor(id: string, data: {
    name?: string;
    specialization?: string;
    maxConcurrentJobs?: number;
  }): Promise<void> {
    // Only update fields that are explicitly provided (avoid NULL overwrites)
    const updates: any = { updatedAt: Date.now() };
    if (data.name !== undefined) updates.name = data.name;
    if (data.specialization !== undefined) updates.specialization = data.specialization;
    if (data.maxConcurrentJobs !== undefined) updates.maxConcurrentJobs = data.maxConcurrentJobs;

    await db
      .update(editors)
      .set(updates)
      .where(eq(editors.id, id));
  }

  async deleteEditor(id: string): Promise<void> {
    await db
      .delete(editors)
      .where(eq(editors.id, id));
  }

  // ==================== Editor Assignment Operations ====================

  async assignJobToEditor(data: {
    jobId: string;
    editorId: string;
    priority?: string;
    notes?: string;
  }): Promise<EditorAssignment> {
    const id = randomUUID();
    const [assignment] = await db
      .insert(editorAssignments)
      .values({
        id,
        jobId: data.jobId,
        editorId: data.editorId,
        status: 'assigned',
        priority: data.priority || 'normal',
        assignedAt: Date.now(),
        notes: data.notes,
      })
      .returning();
    return assignment;
  }

  async getEditorAssignment(id: string): Promise<EditorAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(editorAssignments)
      .where(eq(editorAssignments.id, id));
    return assignment || undefined;
  }

  async getEditorAssignments(editorId: string): Promise<EditorAssignment[]> {
    return await db
      .select()
      .from(editorAssignments)
      .where(eq(editorAssignments.editorId, editorId))
      .orderBy(desc(editorAssignments.assignedAt));
  }

  async getJobAssignment(jobId: string): Promise<EditorAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(editorAssignments)
      .where(and(
        eq(editorAssignments.jobId, jobId),
        eq(editorAssignments.status, 'assigned')
      ));
    return assignment || undefined;
  }

  async getAllJobAssignments(jobId: string): Promise<EditorAssignment[]> {
    return await db
      .select()
      .from(editorAssignments)
      .where(eq(editorAssignments.jobId, jobId))
      .orderBy(desc(editorAssignments.assignedAt));
  }

  async getAllAssignments(filters?: {
    status?: string;
    priority?: string;
    editorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<EditorAssignment[]> {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(editorAssignments.status, filters.status));
    }
    if (filters?.priority) {
      conditions.push(eq(editorAssignments.priority, filters.priority));
    }
    if (filters?.editorId) {
      conditions.push(eq(editorAssignments.editorId, filters.editorId));
    }

    let query = db
      .select()
      .from(editorAssignments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(editorAssignments.assignedAt));

    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    if (filters?.offset) {
      query = query.offset(filters.offset) as any;
    }

    return await query;
  }

  async getAllAssignmentsWithDetails(filters?: {
    status?: string;
    priority?: string;
    editorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Array<EditorAssignment & { job: Job; editor: Editor; imageCount: number }>> {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(editorAssignments.status, filters.status));
    }
    if (filters?.priority) {
      conditions.push(eq(editorAssignments.priority, filters.priority));
    }
    if (filters?.editorId) {
      conditions.push(eq(editorAssignments.editorId, filters.editorId));
    }

    // Build query with JOINs
    const limit = filters?.limit || 50; // Default pagination
    const offset = filters?.offset || 0;

    const results = await db
      .select({
        assignment: editorAssignments,
        job: jobs,
        editor: editors,
        imageCount: sql<number>`COALESCE(COUNT(DISTINCT ${images.id}), 0)`.as('image_count'),
      })
      .from(editorAssignments)
      .innerJoin(jobs, eq(editorAssignments.jobId, jobs.id))
      .innerJoin(editors, eq(editorAssignments.editorId, editors.id))
      .leftJoin(shoots, eq(jobs.id, shoots.jobId))
      .leftJoin(images, eq(shoots.id, images.shootId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(editorAssignments.id, jobs.id, editors.id)
      .orderBy(desc(editorAssignments.assignedAt))
      .limit(limit)
      .offset(offset);

    // Map to enriched assignment objects
    return results.map((row) => ({
      ...row.assignment,
      job: row.job,
      editor: row.editor,
      imageCount: Number(row.imageCount),
    }));
  }

  async getAssignmentByJobNumber(jobNumber: string): Promise<(EditorAssignment & { job: Job; editor: Editor; imageCount: number }) | undefined> {
    const results = await db
      .select({
        assignment: editorAssignments,
        job: jobs,
        editor: editors,
        imageCount: sql<number>`COALESCE(COUNT(DISTINCT ${images.id}), 0)`.as('image_count'),
      })
      .from(editorAssignments)
      .innerJoin(jobs, eq(editorAssignments.jobId, jobs.id))
      .innerJoin(editors, eq(editorAssignments.editorId, editors.id))
      .leftJoin(shoots, eq(jobs.id, shoots.jobId))
      .leftJoin(images, eq(shoots.id, images.shootId))
      .where(eq(jobs.jobNumber, jobNumber))
      .groupBy(editorAssignments.id, jobs.id, editors.id)
      .orderBy(desc(editorAssignments.assignedAt), desc(editorAssignments.id))
      .limit(1);

    if (results.length === 0) {
      return undefined;
    }

    const row = results[0];
    return {
      ...row.assignment,
      job: row.job,
      editor: row.editor,
      imageCount: Number(row.imageCount),
    };
  }

  async updateAssignmentStatus(id: string, status: string, timestampField?: string): Promise<void> {
    const updates: any = { status };
    
    if (timestampField === 'startedAt') {
      updates.startedAt = Date.now();
    } else if (timestampField === 'completedAt') {
      updates.completedAt = Date.now();
    }

    await db
      .update(editorAssignments)
      .set(updates)
      .where(eq(editorAssignments.id, id));
  }

  async updateAssignmentPriority(id: string, priority: string): Promise<void> {
    await db
      .update(editorAssignments)
      .set({ priority })
      .where(eq(editorAssignments.id, id));
  }

  async updateAssignmentNotes(id: string, notes: string): Promise<void> {
    await db
      .update(editorAssignments)
      .set({ notes })
      .where(eq(editorAssignments.id, id));
  }

  async reassignJob(prevAssignmentId: string, newEditorId: string, notes?: string): Promise<EditorAssignment> {
    // Wrap in transaction for data consistency
    return await db.transaction(async (tx) => {
      // 1. Get the previous assignment
      const [prevAssignment] = await tx
        .select()
        .from(editorAssignments)
        .where(eq(editorAssignments.id, prevAssignmentId));
      
      if (!prevAssignment) {
        throw new Error('Previous assignment not found');
      }

      // Guard: Prevent reassigning already cancelled/completed assignments
      if (prevAssignment.status === 'cancelled' || prevAssignment.status === 'completed') {
        throw new Error(`Cannot reassign ${prevAssignment.status} assignment`);
      }

      // 2. Cancel the old assignment
      await tx
        .update(editorAssignments)
        .set({ 
          status: 'cancelled',
          cancelledAt: Date.now(),
        })
        .where(eq(editorAssignments.id, prevAssignmentId));

      // 3. Create new assignment with audit trail
      const newId = randomUUID();
      const [newAssignment] = await tx
        .insert(editorAssignments)
        .values({
          id: newId,
          jobId: prevAssignment.jobId,
          editorId: newEditorId,
          status: 'assigned',
          priority: prevAssignment.priority,
          assignedAt: Date.now(),
          notes: notes || `Reassigned from ${prevAssignment.editorId}`,
          reassignedFrom: prevAssignment.editorId,
        })
        .returning();

      return newAssignment;
    });
  }

  async cancelAssignment(id: string): Promise<void> {
    await db
      .update(editorAssignments)
      .set({ 
        status: 'cancelled',
        cancelledAt: Date.now(),
      })
      .where(eq(editorAssignments.id, id));
  }

  async getEditorWorkload(editorId: string): Promise<number> {
    // Count active assignments (assigned or in_progress)
    const assignments = await db
      .select()
      .from(editorAssignments)
      .where(and(
        eq(editorAssignments.editorId, editorId),
        inArray(editorAssignments.status, ['assigned', 'in_progress'])
      ));
    return assignments.length;
  }

  async getEditorWorkloadDetailed(editorId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
  }> {
    const assignments = await db
      .select()
      .from(editorAssignments)
      .where(eq(editorAssignments.editorId, editorId));

    const byStatus: Record<string, number> = {};
    assignments.forEach(a => {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    });

    return {
      total: assignments.length,
      byStatus,
    };
  }

  async getAvailableEditors(filters?: {
    specialization?: string;
    maxWorkload?: boolean;
  }): Promise<Editor[]> {
    if (!filters?.maxWorkload) {
      // Simple query without workload filtering
      const conditions = [eq(editors.availability, 'available')];
      if (filters?.specialization) {
        conditions.push(eq(editors.specialization, filters.specialization));
      }
      return await db
        .select()
        .from(editors)
        .where(and(...conditions))
        .orderBy(editors.name);
    }

    // Complex query with workload filtering using JOIN + GROUP BY to avoid N+1
    const { sql } = await import('drizzle-orm');
    
    // Build WHERE conditions
    const conditions = [eq(editors.availability, 'available')];
    if (filters?.specialization) {
      conditions.push(eq(editors.specialization, filters.specialization));
    }

    // Query editors with aggregated workload count
    const editorsWithWorkload = await db
      .select({
        id: editors.id,
        name: editors.name,
        email: editors.email,
        specialization: editors.specialization,
        availability: editors.availability,
        maxConcurrentJobs: editors.maxConcurrentJobs,
        createdAt: editors.createdAt,
        updatedAt: editors.updatedAt,
        activeAssignments: sql<number>`CAST(COUNT(CASE WHEN ${editorAssignments.status} IN ('assigned', 'in_progress') THEN 1 END) AS INTEGER)`,
      })
      .from(editors)
      .leftJoin(editorAssignments, eq(editors.id, editorAssignments.editorId))
      .where(and(...conditions))
      .groupBy(editors.id)
      .orderBy(editors.name);

    // Filter editors below maxConcurrentJobs capacity
    return editorsWithWorkload
      .filter(e => e.activeAssignments < e.maxConcurrentJobs)
      .map(({ activeAssignments, ...editor }) => editor as Editor);
  }

  // ==================== Media Library (PublicImage) Operations ====================

  async createPublicImage(data: {
    page: string;
    imageKey: string;
    url: string;
    alt: string;
    description?: string;
    displayOrder?: number;
    updatedBy?: string;
  }): Promise<PublicImage> {
    const id = randomUUID();
    const now = Date.now();
    const [publicImage] = await db
      .insert(publicImages)
      .values({
        id,
        ...data,
        displayOrder: data.displayOrder ?? 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return publicImage;
  }

  async getPublicImage(id: string): Promise<PublicImage | undefined> {
    const [publicImage] = await db
      .select()
      .from(publicImages)
      .where(eq(publicImages.id, id));
    return publicImage || undefined;
  }

  async getAllPublicImages(): Promise<PublicImage[]> {
    return await db
      .select()
      .from(publicImages)
      .orderBy(publicImages.page, publicImages.displayOrder);
  }

  async getPublicImagesByPage(page: string): Promise<PublicImage[]> {
    return await db
      .select()
      .from(publicImages)
      .where(eq(publicImages.page, page))
      .orderBy(publicImages.displayOrder);
  }

  async updatePublicImage(id: string, data: {
    url?: string;
    alt?: string;
    description?: string;
    displayOrder?: number;
    isActive?: string;
    updatedBy?: string;
  }): Promise<PublicImage | undefined> {
    const [publicImage] = await db
      .update(publicImages)
      .set({
        ...data,
        updatedAt: Date.now(),
      })
      .where(eq(publicImages.id, id))
      .returning();
    return publicImage || undefined;
  }

  async deletePublicImage(id: string): Promise<void> {
    await db.delete(publicImages).where(eq(publicImages.id, id));
  }

  // ==================== Invoice Operations ====================

  async createInvoice(data: {
    invoiceNumber: string;
    jobId?: string;
    bookingId?: string;
    customerName: string;
    customerEmail: string;
    customerAddress?: string;
    invoiceDate: number;
    dueDate?: number;
    serviceDescription: string;
    lineItems: string;
    netAmount: number;
    vatRate?: number;
    vatAmount: number;
    grossAmount: number;
    status?: string;
    notes?: string;
    createdBy: string;
  }): Promise<Invoice> {
    const id = randomUUID();
    const now = Date.now();
    const [invoice] = await db
      .insert(invoices)
      .values({
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return invoice;
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceNumber, invoiceNumber));
    return invoice || undefined;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.invoiceDate));
  }

  async getUserInvoices(userId: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.createdBy, userId))
      .orderBy(desc(invoices.invoiceDate));
  }

  async updateInvoiceStatus(id: string, status: string, paidAt?: number): Promise<void> {
    const updates: any = { status, updatedAt: Date.now() };
    if (paidAt !== undefined) {
      updates.paidAt = paidAt;
    }
    await db
      .update(invoices)
      .set(updates)
      .where(eq(invoices.id, id));
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | undefined> {
    const [invoice] = await db
      .update(invoices)
      .set({
        ...data,
        updatedAt: Date.now(),
      })
      .where(eq(invoices.id, id))
      .returning();
    return invoice || undefined;
  }

  async deleteInvoice(id: string): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  async getNextInvoiceNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `INV-${currentYear}-`;
    
    // Get all invoices for current year
    const yearInvoices = await db
      .select()
      .from(invoices)
      .where(sql`${invoices.invoiceNumber} LIKE ${yearPrefix + '%'}`);
    
    // Calculate next number
    const nextNumber = yearInvoices.length + 1;
    const paddedNumber = String(nextNumber).padStart(3, '0');
    
    return `${yearPrefix}${paddedNumber}`;
  }

  // ==================== Blog Post Operations ====================

  async createBlogPost(data: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    category: string;
    tags?: string[];
    featuredImage?: string;
    status?: string;
    publishedAt?: number;
    createdBy: string;
  }): Promise<BlogPost> {
    const id = randomUUID();
    const now = Date.now();
    const [blogPost] = await db
      .insert(blogPosts)
      .values({
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return blogPost;
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [blogPost] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));
    return blogPost || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [blogPost] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    return blogPost || undefined;
  }

  async getAllBlogPosts(status?: string): Promise<BlogPost[]> {
    if (status) {
      return await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.status, status))
        .orderBy(desc(blogPosts.publishedAt));
    }
    return await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async updateBlogPost(id: string, data: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const [blogPost] = await db
      .update(blogPosts)
      .set({
        ...data,
        updatedAt: Date.now(),
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return blogPost || undefined;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async publishBlogPost(id: string): Promise<void> {
    await db
      .update(blogPosts)
      .set({
        status: 'published',
        publishedAt: Date.now(),
        updatedAt: Date.now(),
      })
      .where(eq(blogPosts.id, id));
  }

  async unpublishBlogPost(id: string): Promise<void> {
    await db
      .update(blogPosts)
      .set({
        status: 'draft',
        updatedAt: Date.now(),
      })
      .where(eq(blogPosts.id, id));
  }

  // Service Operations
  async createService(data: {
    serviceCode: string;
    category: string;
    name: string;
    description?: string;
    netPrice?: number;
    priceNote?: string;
    notes?: string;
    isActive?: string;
  }): Promise<Service> {
    const id = randomUUID();
    const [service] = await db
      .insert(services)
      .values({
        id,
        serviceCode: data.serviceCode,
        category: data.category,
        name: data.name,
        description: data.description || null,
        netPrice: data.netPrice || null,
        priceNote: data.priceNote || null,
        notes: data.notes || null,
        isActive: data.isActive || 'true',
        createdAt: Date.now(),
      })
      .returning();
    return service;
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServiceByCode(serviceCode: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.serviceCode, serviceCode));
    return service || undefined;
  }

  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(desc(services.createdAt));
  }

  async getActiveServices(): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.isActive, 'true'))
      .orderBy(desc(services.createdAt));
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.category, category))
      .orderBy(desc(services.createdAt));
  }

  async updateService(id: string, data: Partial<Service>): Promise<void> {
    await db
      .update(services)
      .set(data)
      .where(eq(services.id, id));
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // PixCapture Uploaded Files Operations (Intent-based Upload System)
  async createUploadedFile(data: {
    userId: string;
    objectKey: string;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    checksum?: string;
    orderId?: string;
    roomType?: string;
    stackId?: string;
    exifMeta?: string;
  }): Promise<import("@shared/schema").UploadedFile> {
    const id = randomUUID();
    
    // Auto-increment index within (orderId, roomType) scope with advisory lock
    if (data.orderId) {
      const orderId = data.orderId; // Type narrowing for transaction scope
      const effectiveRoomType = data.roomType || 'undefined_space';
      
      // Generate deterministic lock ID from (orderId, roomType) hash
      const lockKey = `${orderId}_${effectiveRoomType}`;
      const lockId = Math.abs(lockKey.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
      }, 0));
      
      // Wrap in transaction to ensure lock, MAX query, and INSERT share same connection
      return await db.transaction(async (tx) => {
        try {
          // Acquire advisory lock to prevent concurrent index collision
          await tx.execute(sql`SELECT pg_advisory_lock(${lockId})`);
          
          // Find next available index under lock
          const [result] = await tx
            .select({ maxIndex: sql<number>`COALESCE(MAX(${uploadedFiles.index}), 0)` })
            .from(uploadedFiles)
            .where(
              and(
                eq(uploadedFiles.orderId, orderId),
                eq(uploadedFiles.roomType, effectiveRoomType)
              )
            );
          const nextIndex = (result?.maxIndex || 0) + 1;
          
          // Insert with unique index
          const [uploadedFile] = await tx
            .insert(uploadedFiles)
            .values({
              id,
              userId: data.userId,
              orderId: orderId,
              objectKey: data.objectKey,
              originalFilename: data.originalFilename,
              mimeType: data.mimeType,
              fileSize: data.fileSize,
              checksum: data.checksum || null,
              status: 'uploaded',
              roomType: data.roomType, // Let DB default apply if undefined
              stackId: data.stackId || null,
              exifMeta: data.exifMeta || null,
              index: nextIndex,
              ver: 1, // Always start at version 1
              createdAt: Date.now(),
              finalizedAt: null,
            })
            .returning();
          
          return uploadedFile;
        } finally {
          // Always release advisory lock (same connection)
          await tx.execute(sql`SELECT pg_advisory_unlock(${lockId})`);
        }
      });
    }
    
    // No orderId: skip index logic
    const [uploadedFile] = await db
      .insert(uploadedFiles)
      .values({
        id,
        userId: data.userId,
        orderId: null,
        objectKey: data.objectKey,
        originalFilename: data.originalFilename,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        checksum: data.checksum || null,
        status: 'uploaded',
        roomType: data.roomType,
        stackId: data.stackId || null,
        exifMeta: data.exifMeta || null,
        createdAt: Date.now(),
        finalizedAt: null,
      })
      .returning();
    return uploadedFile;
  }

  async getUploadedFile(id: string): Promise<import("@shared/schema").UploadedFile | undefined> {
    const [file] = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.id, id));
    return file || undefined;
  }

  async getUploadedFileByObjectKey(objectKey: string): Promise<import("@shared/schema").UploadedFile | undefined> {
    const [file] = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.objectKey, objectKey));
    return file || undefined;
  }

  async getUserUploadedFiles(userId: string): Promise<import("@shared/schema").UploadedFile[]> {
    return await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.userId, userId))
      .orderBy(desc(uploadedFiles.createdAt));
  }

  async updateUploadedFileStatus(id: string, status: string): Promise<void> {
    await db
      .update(uploadedFiles)
      .set({ status })
      .where(eq(uploadedFiles.id, id));
  }

  async finalizeUploadedFile(objectKey: string, finalizedAt: number): Promise<void> {
    await db
      .update(uploadedFiles)
      .set({ finalizedAt })
      .where(eq(uploadedFiles.objectKey, objectKey));
  }

  // Order Files Management Authorization Helper
  private async checkOrderAccess(orderId: string, actorUserId: string): Promise<void> {
    // Get order to check ownership
    const [order] = await db
      .select({ userId: orders.userId })
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!order) {
      throw new Error('Order not found');
    }

    // Get user to check role
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, actorUserId));

    if (!user) {
      throw new Error('User not found');
    }

    // Allow if owner or admin
    if (order.userId !== actorUserId && user.role !== 'admin') {
      throw new Error('Unauthorized: You do not have access to this order');
    }
  }

  // Order Files Management (Phase 1)
  async getOrderFiles(orderId: string, actorUserId: string, options?: {
    roomType?: string;
    marked?: boolean;
    status?: string;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'latest' | 'oldest' | 'filename';
  }): Promise<{
    files: import("@shared/schema").UploadedFile[];
    total: number;
  }> {
    // Authorization check
    await this.checkOrderAccess(orderId, actorUserId);

    const { 
      roomType, 
      marked, 
      status, 
      includeDeleted = false, 
      limit = 50, 
      offset = 0,
      sortBy = 'latest'
    } = options || {};

    // Build WHERE conditions
    const conditions = [eq(uploadedFiles.orderId, orderId)];
    if (!includeDeleted) {
      conditions.push(sql`${uploadedFiles.deletedAt} IS NULL`);
    }
    if (roomType) {
      conditions.push(eq(uploadedFiles.roomType, roomType));
    }
    if (marked !== undefined) {
      conditions.push(eq(uploadedFiles.marked, marked));
    }
    if (status) {
      conditions.push(eq(uploadedFiles.status, status));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(uploadedFiles)
      .where(and(...conditions));
    const total = countResult?.count || 0;

    // Build ORDER BY
    let orderBy;
    if (sortBy === 'oldest') {
      orderBy = uploadedFiles.createdAt;
    } else if (sortBy === 'filename') {
      orderBy = uploadedFiles.originalFilename;
    } else {
      orderBy = desc(uploadedFiles.createdAt);
    }

    // Get paginated files
    const files = await db
      .select()
      .from(uploadedFiles)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return { files, total };
  }

  async getOrderStacks(orderId: string, actorUserId: string, options?: {
    includeDeleted?: boolean;
    previewLimit?: number;
  }): Promise<{
    roomType: string;
    totalFiles: number;
    markedFiles: number;
    deletedFiles?: number;
    latestUpload: number;
    earliestUpload: number;
    previewFiles: import("@shared/schema").UploadedFile[];
  }[]> {
    // Authorization check
    await this.checkOrderAccess(orderId, actorUserId);

    const { includeDeleted = false, previewLimit = 5 } = options || {};

    // Aggregation query for stack metadata
    const baseCondition = eq(uploadedFiles.orderId, orderId);
    const whereCondition = includeDeleted 
      ? baseCondition
      : and(baseCondition, sql`${uploadedFiles.deletedAt} IS NULL`);

    const aggregates = await db
      .select({
        roomType: uploadedFiles.roomType,
        totalFiles: sql<number>`COUNT(*)::int`,
        markedFiles: sql<number>`COUNT(*) FILTER (WHERE ${uploadedFiles.marked} = true)::int`,
        deletedFiles: sql<number>`COUNT(*) FILTER (WHERE ${uploadedFiles.deletedAt} IS NOT NULL)::int`,
        latestUpload: sql<number>`MAX(${uploadedFiles.createdAt})`,
        earliestUpload: sql<number>`MIN(${uploadedFiles.createdAt})`,
      })
      .from(uploadedFiles)
      .where(whereCondition)
      .groupBy(uploadedFiles.roomType);

    // Fetch preview files for each room type
    const stacks = await Promise.all(
      aggregates.map(async (agg) => {
        const previewConditions = [
          eq(uploadedFiles.orderId, orderId),
          eq(uploadedFiles.roomType, agg.roomType),
        ];
        if (!includeDeleted) {
          previewConditions.push(sql`${uploadedFiles.deletedAt} IS NULL`);
        }

        const previewFiles = await db
          .select()
          .from(uploadedFiles)
          .where(and(...previewConditions))
          .orderBy(desc(uploadedFiles.createdAt))
          .limit(previewLimit);

        return {
          roomType: agg.roomType,
          totalFiles: agg.totalFiles,
          markedFiles: agg.markedFiles,
          deletedFiles: includeDeleted ? agg.deletedFiles : undefined,
          latestUpload: agg.latestUpload,
          earliestUpload: agg.earliestUpload,
          previewFiles,
        };
      })
    );

    return stacks;
  }

  async bulkMarkFiles(fileIds: string[], marked: boolean, actorUserId: string): Promise<{ affectedCount: number }> {
    if (fileIds.length === 0) {
      return { affectedCount: 0 };
    }

    // Validate all files belong to same order and user has access
    const files = await db
      .select({ orderId: uploadedFiles.orderId, userId: uploadedFiles.userId })
      .from(uploadedFiles)
      .where(
        and(
          inArray(uploadedFiles.id, fileIds),
          sql`${uploadedFiles.deletedAt} IS NULL`
        )
      );

    if (files.length === 0) {
      return { affectedCount: 0 };
    }

    // Check if all files belong to same order
    const uniqueOrderIds = new Set(files.map(f => f.orderId).filter((id): id is string => id !== null));
    if (uniqueOrderIds.size > 1) {
      throw new Error('All files must belong to the same order');
    }
    if (uniqueOrderIds.size === 0) {
      throw new Error('Files must be associated with an order');
    }

    const orderId = Array.from(uniqueOrderIds)[0];
    
    // Authorization check
    await this.checkOrderAccess(orderId, actorUserId);

    const result = await db
      .update(uploadedFiles)
      .set({ marked, updatedAt: Date.now() })
      .where(
        and(
          inArray(uploadedFiles.id, fileIds),
          sql`${uploadedFiles.deletedAt} IS NULL`
        )
      );

    return { affectedCount: result.rowCount || 0 };
  }

  async bulkDeleteFiles(fileIds: string[], actorUserId: string, options?: {
    allowMarked?: boolean;
  }): Promise<{ affectedCount: number }> {
    if (fileIds.length === 0) {
      return { affectedCount: 0 };
    }

    const { allowMarked = false } = options || {};

    // Validate all files belong to same order
    const files = await db
      .select({ orderId: uploadedFiles.orderId })
      .from(uploadedFiles)
      .where(
        and(
          inArray(uploadedFiles.id, fileIds),
          sql`${uploadedFiles.deletedAt} IS NULL`
        )
      );

    if (files.length === 0) {
      return { affectedCount: 0 };
    }

    const uniqueOrderIds = new Set(files.map(f => f.orderId).filter((id): id is string => id !== null));
    if (uniqueOrderIds.size > 1) {
      throw new Error('All files must belong to the same order');
    }
    if (uniqueOrderIds.size === 0) {
      throw new Error('Files must be associated with an order');
    }

    const orderId = Array.from(uniqueOrderIds)[0];
    
    // Authorization check
    await this.checkOrderAccess(orderId, actorUserId);

    // Build conditions
    const conditions = [
      inArray(uploadedFiles.id, fileIds),
      sql`${uploadedFiles.deletedAt} IS NULL`, // Only delete non-deleted files
    ];

    if (!allowMarked) {
      conditions.push(eq(uploadedFiles.marked, false));
    }

    const result = await db
      .update(uploadedFiles)
      .set({ 
        deletedAt: Date.now(),
        updatedAt: Date.now(),
      })
      .where(and(...conditions));

    return { affectedCount: result.rowCount || 0 };
  }

  async addFileNote(fileId: string, userId: string, text: string): Promise<import("@shared/schema").FileNote> {
    // Validate text length (max 1000 chars)
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      throw new Error('Note text cannot be empty');
    }
    if (trimmedText.length > 1000) {
      throw new Error('Note text cannot exceed 1000 characters');
    }

    // Get file's orderId and validate access
    const [file] = await db
      .select({ orderId: uploadedFiles.orderId })
      .from(uploadedFiles)
      .where(eq(uploadedFiles.id, fileId));

    if (!file) {
      throw new Error('File not found');
    }
    if (!file.orderId) {
      throw new Error('File must be associated with an order');
    }

    // Authorization check
    await this.checkOrderAccess(file.orderId, userId);

    const id = randomUUID();
    const [note] = await db
      .insert(fileNotes)
      .values({
        id,
        fileId,
        userId,
        text: trimmedText,
        createdAt: Date.now(),
      })
      .returning();

    return note;
  }

  async getFileNotes(fileId: string, actorUserId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<{
    notes: Array<import("@shared/schema").FileNote & { 
      author: { id: string; email: string } 
    }>;
    total: number;
  }> {
    // Get file's orderId and validate access
    const [file] = await db
      .select({ orderId: uploadedFiles.orderId })
      .from(uploadedFiles)
      .where(eq(uploadedFiles.id, fileId));

    if (!file) {
      throw new Error('File not found');
    }
    if (!file.orderId) {
      throw new Error('File must be associated with an order');
    }

    // Authorization check
    await this.checkOrderAccess(file.orderId, actorUserId);

    const { limit = 20, offset = 0 } = options || {};

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(fileNotes)
      .where(eq(fileNotes.fileId, fileId));
    const total = countResult?.count || 0;

    // Get notes with author info
    const notesWithAuthor = await db
      .select({
        id: fileNotes.id,
        fileId: fileNotes.fileId,
        userId: fileNotes.userId,
        text: fileNotes.text,
        createdAt: fileNotes.createdAt,
        updatedAt: fileNotes.updatedAt,
        authorId: users.id,
        authorEmail: users.email,
      })
      .from(fileNotes)
      .leftJoin(users, eq(fileNotes.userId, users.id))
      .where(eq(fileNotes.fileId, fileId))
      .orderBy(desc(fileNotes.createdAt))
      .limit(limit)
      .offset(offset);

    const notes = notesWithAuthor.map(row => ({
      id: row.id,
      fileId: row.fileId,
      userId: row.userId,
      text: row.text,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.authorId || row.userId,
        email: row.authorEmail || 'unknown',
      },
    }));

    return { notes, total };
  }

  // ===================================================================
  // Edit Jobs Operations (HALT F4a)
  // ===================================================================
  
  async createEditJob(data: {
    fileId: string;
    orderId: string | null;
    userId: string;
    express?: boolean;
  }): Promise<any> {
    const id = randomUUID();
    const [job] = await db.insert(editJobs).values({
      id,
      fileId: data.fileId,
      orderId: data.orderId,
      userId: data.userId,
      status: 'queued',
      express: data.express || false,
      retryCount: 0,
      createdAt: Date.now(),
    }).returning();
    return job;
  }
  
  async getEditJob(id: string): Promise<any | undefined> {
    const [job] = await db.select().from(editJobs).where(eq(editJobs.id, id)).limit(1);
    return job;
  }
  
  async getEditJobsByStatus(status: string, limit: number = 10): Promise<any[]> {
    const jobs = await db
      .select()
      .from(editJobs)
      .where(eq(editJobs.status, status))
      .orderBy(editJobs.createdAt)
      .limit(limit);
    return jobs;
  }
  
  async getEditJobsByOrder(orderId: string): Promise<any[]> {
    const jobs = await db
      .select()
      .from(editJobs)
      .where(eq(editJobs.orderId, orderId))
      .orderBy(desc(editJobs.createdAt));
    return jobs;
  }
  
  async getEditJobsByFile(fileId: string): Promise<any[]> {
    const jobs = await db
      .select()
      .from(editJobs)
      .where(eq(editJobs.fileId, fileId))
      .orderBy(desc(editJobs.createdAt));
    return jobs;
  }
  
  async updateEditJobStatus(id: string, status: string, data?: {
    startedAt?: number;
    finishedAt?: number;
    error?: string;
    resultPath?: string;
    previewPath?: string;
    resultFileSize?: number;
  }): Promise<void> {
    const updateData: any = { status };
    if (data) {
      if (data.startedAt) updateData.startedAt = data.startedAt;
      if (data.finishedAt) updateData.finishedAt = data.finishedAt;
      if (data.error) updateData.error = data.error;
      if (data.resultPath) updateData.resultPath = data.resultPath;
      if (data.previewPath) updateData.previewPath = data.previewPath;
      if (data.resultFileSize) updateData.resultFileSize = data.resultFileSize;
    }
    await db.update(editJobs).set(updateData).where(eq(editJobs.id, id));
  }
  
  async retryEditJob(id: string): Promise<void> {
    await db
      .update(editJobs)
      .set({ 
        status: 'queued',
        retryCount: sql`${editJobs.retryCount} + 1`,
        error: null,
      })
      .where(eq(editJobs.id, id));
  }
  
  // ===================================================================
  // File Locking Operations (HALT F4a)
  // ===================================================================
  
  async lockFile(fileId: string): Promise<void> {
    await db
      .update(uploadedFiles)
      .set({ locked: true })
      .where(eq(uploadedFiles.id, fileId));
  }
  
  async unlockFile(fileId: string): Promise<void> {
    await db
      .update(uploadedFiles)
      .set({ locked: false })
      .where(eq(uploadedFiles.id, fileId));
  }
  
  async isFileLocked(fileId: string): Promise<boolean> {
    const [file] = await db
      .select({ locked: uploadedFiles.locked })
      .from(uploadedFiles)
      .where(eq(uploadedFiles.id, fileId))
      .limit(1);
    return file?.locked || false;
  }
  
  async getLockedFiles(): Promise<any[]> {
    const files = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.locked, true));
    return files;
  }
  
  // ===================================================================
  // Uploaded Files Extended Operations
  // ===================================================================
  
  async getFilesByStatus(status: string): Promise<any[]> {
    const files = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.status, status))
      .orderBy(desc(uploadedFiles.createdAt));
    return files;
  }
  
  async updateFileStatus(fileId: string, status: string): Promise<void> {
    await db
      .update(uploadedFiles)
      .set({ status, updatedAt: Date.now() })
      .where(eq(uploadedFiles.id, fileId));
  }
  
  // ===================================================================
  // Package & Selection Logic operations
  // ===================================================================
  
  async updateJobPackageSettings(jobId: string, settings: {
    includedImages?: number;
    maxSelectable?: number;
    extraPricePerImage?: number;
    allowFreeExtras?: boolean;
    freeExtraQuota?: number;
    allImagesIncluded?: boolean;
  }, adminUserId: string, reason?: string, reasonCode?: string): Promise<void> {
    // P1: Fetch current state for audit log
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    // P1: Build aggregated diff (oldValue/newValue)
    const oldValue: Record<string, unknown> = {};
    const newValue: Record<string, unknown> = {};
    const updateData: any = {};
    
    if (settings.includedImages !== undefined && settings.includedImages !== job.includedImages) {
      oldValue.includedImages = job.includedImages;
      newValue.includedImages = settings.includedImages;
      updateData.includedImages = settings.includedImages;
    }
    if (settings.maxSelectable !== undefined && settings.maxSelectable !== job.maxSelectable) {
      oldValue.maxSelectable = job.maxSelectable;
      newValue.maxSelectable = settings.maxSelectable;
      updateData.maxSelectable = settings.maxSelectable;
    }
    if (settings.extraPricePerImage !== undefined && settings.extraPricePerImage !== job.extraPricePerImage) {
      oldValue.extraPricePerImage = job.extraPricePerImage;
      newValue.extraPricePerImage = settings.extraPricePerImage;
      updateData.extraPricePerImage = settings.extraPricePerImage;
    }
    if (settings.allowFreeExtras !== undefined && settings.allowFreeExtras !== job.allowFreeExtras) {
      oldValue.allowFreeExtras = job.allowFreeExtras;
      newValue.allowFreeExtras = settings.allowFreeExtras;
      updateData.allowFreeExtras = settings.allowFreeExtras;
    }
    if (settings.freeExtraQuota !== undefined && settings.freeExtraQuota !== job.freeExtraQuota) {
      oldValue.freeExtraQuota = job.freeExtraQuota;
      newValue.freeExtraQuota = settings.freeExtraQuota;
      updateData.freeExtraQuota = settings.freeExtraQuota;
    }
    if (settings.allImagesIncluded !== undefined && settings.allImagesIncluded !== job.allImagesIncluded) {
      oldValue.allImagesIncluded = job.allImagesIncluded;
      newValue.allImagesIncluded = settings.allImagesIncluded;
      updateData.allImagesIncluded = settings.allImagesIncluded;
    }
    
    // Perform update only if there are changes
    if (Object.keys(updateData).length > 0) {
      await db
        .update(jobs)
        .set(updateData)
        .where(eq(jobs.id, jobId));
      
      // P1: Emit single aggregated audit log
      await this.createAuditLog({
        adminUserId,
        jobId,
        actionType: 'update_included_images', // Primary action type
        entityScope: 'job',
        oldValue,
        newValue,
        reason,
        reasonCode,
      });
    }
  }
  
  async getJobSelectionStats(jobId: string): Promise<{
    totalCandidates: number;
    includedCount: number;
    extraPendingCount: number;
    extraPaidCount: number;
    extraFreeCount: number;
    blockedCount: number;
    downloadableCount: number;
  }> {
    const files = await db
      .select()
      .from(uploadedFiles)
      .where(and(
        eq(uploadedFiles.orderId, jobId),
        eq(uploadedFiles.isCandidate, true)
      ));
    
    const stats = {
      totalCandidates: files.length,
      includedCount: files.filter(f => f.selectionState === 'included').length,
      extraPendingCount: files.filter(f => f.selectionState === 'extra_pending').length,
      extraPaidCount: files.filter(f => f.selectionState === 'extra_paid').length,
      extraFreeCount: files.filter(f => f.selectionState === 'extra_free').length,
      blockedCount: files.filter(f => f.selectionState === 'blocked').length,
      downloadableCount: 0,
    };
    
    // Calculate downloadable count: included + extra_paid + extra_free
    stats.downloadableCount = stats.includedCount + stats.extraPaidCount + stats.extraFreeCount;
    
    return stats;
  }
  
  async updateFileSelectionState(fileId: string, state: 'none' | 'included' | 'extra_pending' | 'extra_paid' | 'extra_free' | 'blocked'): Promise<void> {
    await db
      .update(uploadedFiles)
      .set({ selectionState: state, updatedAt: Date.now() })
      .where(eq(uploadedFiles.id, fileId));
  }
  
  // P1: Fixed - pix.immo Orders use uploadedFiles table (was incorrectly querying images table)
  async getJobCandidateFiles(jobId: string, userId: string, role?: string): Promise<any[]> {
    // P1 SECURITY: Verify job ownership BEFORE returning files (prevents cross-tenant access)
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);
    
    if (!job) {
      return []; // Job not found → no files
    }
    
    // P1 SECURITY: Reject if user doesn't own this job (admins bypass)
    if (job.userId !== userId && role !== 'admin') {
      return []; // Unauthorized → no files
    }
    
    const files = await db
      .select()
      .from(uploadedFiles)
      .where(and(
        eq(uploadedFiles.orderId, jobId), // jobId is actually orderId for pix.immo Orders
        eq(uploadedFiles.isCandidate, true)
      ))
      .orderBy(desc(uploadedFiles.createdAt));
    
    return files;
  }
  
  async getJobDownloadableFiles(jobId: string, userId: string, role?: string): Promise<any[]> {
    // P0 SECURITY: Verify job ownership FIRST
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);
    
    if (!job) {
      return [];
    }
    
    // P0 SECURITY: Reject if user doesn't own this job (admins bypass)
    if (job.userId !== userId && role !== 'admin') {
      return [];
    }
    
    // If allImagesIncluded, return all candidate files
    if (job.allImagesIncluded) {
      return await db
        .select()
        .from(uploadedFiles)
        .where(and(
          eq(uploadedFiles.orderId, jobId),
          eq(uploadedFiles.isCandidate, true)
        ))
        .orderBy(desc(uploadedFiles.createdAt));
    }
    
    // Otherwise, only files with downloadable states
    const files = await db
      .select()
      .from(uploadedFiles)
      .where(and(
        eq(uploadedFiles.orderId, jobId),
        eq(uploadedFiles.isCandidate, true),
        or(
          eq(uploadedFiles.selectionState, 'included'),
          eq(uploadedFiles.selectionState, 'extra_paid'),
          eq(uploadedFiles.selectionState, 'extra_free')
        )
      ))
      .orderBy(desc(uploadedFiles.createdAt));
    
    return files;
  }
  
  async setFileKulanzFree(fileId: string, adminUserId: string, reason?: string, reasonCode?: string): Promise<void> {
    // P1: Fetch current state for audit log
    const [file] = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.id, fileId))
      .limit(1);
    
    if (!file) {
      throw new Error(`File ${fileId} not found`);
    }
    
    const oldState = file.selectionState;
    
    // Perform update
    await db
      .update(uploadedFiles)
      .set({ selectionState: 'extra_free', updatedAt: Date.now() })
      .where(eq(uploadedFiles.id, fileId));
    
    // P1: Emit audit log (uploadedFiles.orderId can be null, skip audit if no job)
    if (file.orderId) {
      await this.createAuditLog({
        adminUserId,
        jobId: file.orderId, // uploadedFiles.orderId is the job reference
        actionType: 'change_selection_state_extra_free',
        entityScope: 'uploaded_file',
        affectedUploadedFileId: fileId,
        oldValue: { selectionState: oldState },
        newValue: { selectionState: 'extra_free' },
        reason,
        reasonCode,
      });
    }
  }
  
  async enableAllImagesKulanz(jobId: string, enabled: boolean, adminUserId: string, reason?: string, reasonCode?: string): Promise<void> {
    // P1: Fetch current state for audit log
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    const oldValue = job.allImagesIncluded;
    
    // Perform update
    await db
      .update(jobs)
      .set({ allImagesIncluded: enabled })
      .where(eq(jobs.id, jobId));
    
    // P1: Emit audit log
    await this.createAuditLog({
      adminUserId,
      jobId,
      actionType: 'set_all_images_included',
      entityScope: 'job',
      oldValue: { allImagesIncluded: oldValue },
      newValue: { allImagesIncluded: enabled },
      reason,
      reasonCode,
    });
  }

  // P1: Audit Log operations
  async createAuditLog(params: {
    adminUserId: string;
    jobId: string;
    actionType: 'update_included_images' | 'set_all_images_included' | 'change_selection_state_extra_free' | 'update_max_selectable' | 'update_extra_price_per_image' | 'update_free_extra_quota' | 'bulk_selection_change' | 'update_allow_free_extras';
    entityScope: 'job' | 'uploaded_file' | 'legacy_image';
    affectedUploadedFileId?: string;
    affectedLegacyImageId?: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    reason?: string;
    reasonCode?: string;
  }): Promise<AuditLog> {
    const id = randomUUID();
    const [log] = await db
      .insert(auditLogs)
      .values({
        id,
        timestamp: Date.now(),
        adminUserId: params.adminUserId,
        jobId: params.jobId,
        affectedUploadedFileId: params.affectedUploadedFileId || null,
        affectedLegacyImageId: params.affectedLegacyImageId || null,
        entityScope: params.entityScope,
        actionType: params.actionType,
        oldValue: params.oldValue || null,
        newValue: params.newValue || null,
        reason: params.reason || null,
        reasonCode: params.reasonCode || null,
      })
      .returning();
    return log;
  }

  // Upload Manifest Session operations
  async createManifestSession(data: {
    userId: string;
    jobId?: string;
    clientType: 'pixcapture_ios' | 'pixcapture_android' | 'web_uploader';
    expectedFiles: number;
    totalBytesExpected: number;
  }): Promise<UploadManifestSession> {
    const id = randomUUID();
    const now = Date.now();
    const [session] = await db
      .insert(uploadManifestSessions)
      .values({
        id,
        userId: data.userId,
        jobId: data.jobId || null,
        clientType: data.clientType,
        expectedFiles: data.expectedFiles,
        totalBytesExpected: data.totalBytesExpected,
        state: 'pending',
        errorCount: 0,
        createdAt: now,
        lastActivityAt: now,
      })
      .returning();
    return session;
  }

  async createManifestItems(sessionId: string, items: Array<{
    objectKey: string;
    sizeBytes: number;
    checksum?: string;
  }>): Promise<UploadManifestItem[]> {
    const now = Date.now();
    const itemsToInsert = items.map(item => ({
      id: randomUUID(),
      sessionId,
      objectKey: item.objectKey,
      sizeBytes: item.sizeBytes,
      checksum: item.checksum || null,
      status: 'pending' as const,
      retryCount: 0,
      createdAt: now,
    }));
    
    const result = await db
      .insert(uploadManifestItems)
      .values(itemsToInsert)
      .returning();
    
    return result;
  }

  async getManifestSession(sessionId: string): Promise<UploadManifestSession | undefined> {
    const [session] = await db
      .select()
      .from(uploadManifestSessions)
      .where(eq(uploadManifestSessions.id, sessionId));
    return session || undefined;
  }

  async getManifestItems(sessionId: string): Promise<UploadManifestItem[]> {
    return await db
      .select()
      .from(uploadManifestItems)
      .where(eq(uploadManifestItems.sessionId, sessionId))
      .orderBy(uploadManifestItems.createdAt);
  }

  async updateManifestItemStatus(itemId: string, status: 'pending' | 'uploading' | 'uploaded' | 'verified' | 'failed', errorMessage?: string): Promise<void> {
    const now = Date.now();
    const updateData: any = { status };
    
    if (status === 'uploaded') {
      updateData.uploadedAt = now;
    } else if (status === 'verified') {
      updateData.verifiedAt = now;
    } else if (status === 'failed' && errorMessage) {
      updateData.errorMessage = errorMessage;
    }
    
    await db
      .update(uploadManifestItems)
      .set(updateData)
      .where(eq(uploadManifestItems.id, itemId));
  }

  async updateManifestSessionState(sessionId: string, state: 'pending' | 'in_progress' | 'complete' | 'error' | 'stale'): Promise<void> {
    await db
      .update(uploadManifestSessions)
      .set({ 
        state, 
        lastActivityAt: Date.now(),
      })
      .where(eq(uploadManifestSessions.id, sessionId));
  }

  async incrementManifestSessionErrors(sessionId: string): Promise<void> {
    await db
      .update(uploadManifestSessions)
      .set({ 
        errorCount: sql`${uploadManifestSessions.errorCount} + 1`,
        lastActivityAt: Date.now(),
      })
      .where(eq(uploadManifestSessions.id, sessionId));
  }

  async completeManifestSession(sessionId: string): Promise<void> {
    const now = Date.now();
    await db
      .update(uploadManifestSessions)
      .set({ 
        state: 'complete',
        completedAt: now,
        lastActivityAt: now,
      })
      .where(eq(uploadManifestSessions.id, sessionId));
  }

  async getManifestItemByObjectKey(objectKey: string): Promise<UploadManifestItem | undefined> {
    const [item] = await db
      .select()
      .from(uploadManifestItems)
      .where(eq(uploadManifestItems.objectKey, objectKey));
    return item || undefined;
  }

  // Test Helper operations (NODE_ENV === 'test' only)
  async createJobForTests(userId: string, data: {
    propertyName: string;
    includedImages?: number;
    allImagesIncluded?: boolean;
  }): Promise<Job> {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('createJobForTests() can only be called in test environment');
    }

    // Use existing createJob() with sensible test defaults
    const job = await this.createJob(userId, {
      customerName: 'Test Customer',
      propertyName: data.propertyName,
      propertyAddress: '123 Test St, 20095 Hamburg',
      deadlineAt: Date.now() + 86400000, // Tomorrow
      deliverGallery: true,
      deliverAlttext: false,
      deliverExpose: false,
    });

    // Update package settings if provided (test scenarios need custom limits)
    if (data.includedImages !== undefined || data.allImagesIncluded !== undefined) {
      const updateData: Record<string, unknown> = {};
      if (data.includedImages !== undefined) {
        updateData.includedImages = data.includedImages;
      }
      if (data.allImagesIncluded !== undefined) {
        updateData.allImagesIncluded = data.allImagesIncluded;
      }

      await db
        .update(jobs)
        .set(updateData)
        .where(eq(jobs.id, job.id));

      // Fetch updated job
      const [updatedJob] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, job.id));

      return updatedJob;
    }

    return job;
  }

  async createUploadedFileForTests(data: {
    userId: string;
    orderId: string;
    originalFilename: string;
    selectionState?: 'none' | 'included' | 'extra_free' | 'blocked';
    isCandidate?: boolean;
  }): Promise<import("@shared/schema").UploadedFile> {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('createUploadedFileForTests() can only be called in test environment');
    }

    // Import ulid for unique ID generation
    const { ulid } = await import('ulid');

    // Use existing createUploadedFile() with test defaults
    const file = await this.createUploadedFile({
      userId: data.userId,
      objectKey: `test/${ulid()}.jpg`,
      originalFilename: data.originalFilename,
      mimeType: 'image/jpeg',
      fileSize: 1024,
      orderId: data.orderId,
    });

    // Update selectionState if provided (uses existing method)
    // IMPORTANT: Always update if selectionState is provided, even if it's 'none'
    if (data.selectionState !== undefined) {
      await this.updateFileSelectionState(file.id, data.selectionState);
    }

    // Update isCandidate if explicitly set to false
    if (data.isCandidate === false) {
      await db
        .update(uploadedFiles)
        .set({ isCandidate: false, updatedAt: Date.now() })
        .where(eq(uploadedFiles.id, file.id));
    }

    // Fetch updated file
    const [updatedFile] = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.id, file.id));

    return updatedFile;
  }
}

export const storage = new DatabaseStorage();
