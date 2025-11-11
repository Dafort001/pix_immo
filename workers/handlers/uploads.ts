/**
 * HALT B1b - Upload Route Handlers (Canary-only)
 * R2 HEAD verification + Forward to origin for DB + Signed URL
 */

import type { Context } from 'hono';
import { Env, Variables } from '../edge';
import { uploadIntentSchema, uploadFinalizeSchema } from '../../shared/schema';
import { forwardUploadIntent, forwardUploadFinalize } from '../../server/proxy/originClient';

// Context type with Variables (matches workers/edge.ts)
type EdgeContext = Context<{ Bindings: Env; Variables: Variables }>;

/**
 * POST /api/pixcapture/upload/intent - Forward to Origin for DB + Signed URL
 * Canary-only: Delegates to Express backend for full parity
 */
export async function nativeIntentHandler(c: EdgeContext) {
  try {
    // Parse and validate request body
    const body = await c.req.json();
    const parsed = uploadIntentSchema.safeParse(body);
    
    if (!parsed.success) {
      return c.json({ error: 'Invalid request', details: parsed.error.flatten() }, 400);
    }
    
    const { filename, mimeType, fileSize } = parsed.data;
    
    // Generate unique object key (matches Express pattern)
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `pixcapture/uploads/${timestamp}-${randomSuffix}-${sanitizedFilename}`;
    
    // Forward to origin for DB record + signed URL generation
    const originBaseUrl = c.env.ORIGIN_API_BASE || 'http://localhost:5000';
    const result = await forwardUploadIntent(
      originBaseUrl,
      objectKey,
      filename,
      mimeType, // Keep field name as mimeType (shared schema)
      fileSize,
      c.req.raw.headers,
      c.get('reqId')
    );
    
    c.set('nativeHandler', true); // Mark as natively handled for logging
    
    return c.json(result);
  } catch (error) {
    console.error('[B1b] Error creating upload intent:', error);
    return c.json({ error: 'Failed to create upload intent' }, 500);
  }
}

/**
 * POST /api/pixcapture/upload/finalize - Verify R2 + Forward to Origin for DB
 * Canary-only: R2 HEAD check + delegate to Express backend for DB finalization
 */
export async function nativeFinalizeHandler(c: EdgeContext) {
  try {
    // Parse and validate request body
    const body = await c.req.json();
    const parsed = uploadFinalizeSchema.safeParse(body);
    
    if (!parsed.success) {
      return c.json({ error: 'Invalid request', details: parsed.error.flatten() }, 400);
    }
    
    const { objectKey, checksum, exifMeta } = parsed.data;
    
    // Verify object exists in R2 (HEAD request via R2 Binding)
    try {
      const r2Object = await c.env.R2_BUCKET.head(objectKey);
      
      if (!r2Object) {
        return c.json({ error: 'Upload not found in R2' }, 409);
      }
      
      // Object exists, proceed with finalization
    } catch (r2Error) {
      console.error('[B1b] R2 HEAD failed:', r2Error);
      return c.json({ error: 'Upload verification failed' }, 409);
    }
    
    // Forward to origin for DB finalization
    const originBaseUrl = c.env.ORIGIN_API_BASE || 'http://localhost:5000';
    const result = await forwardUploadFinalize(
      originBaseUrl,
      objectKey,
      checksum,
      exifMeta,
      c.req.raw.headers,
      c.get('reqId')
    );
    
    c.set('nativeHandler', true); // Mark as natively handled for logging
    return c.json(result);
  } catch (error) {
    console.error('[B1b] Error finalizing upload:', error);
    return c.json({ error: 'Failed to finalize upload' }, 500);
  }
}
