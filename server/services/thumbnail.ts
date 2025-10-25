import sharp from "sharp";
import ExifReader from "exifreader";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const R2_ENDPOINT = process.env.CF_R2_ENDPOINT!;
const R2_ACCESS_KEY = process.env.CF_R2_ACCESS_KEY!;
const R2_SECRET_KEY = process.env.CF_R2_SECRET_KEY!;
const R2_BUCKET = process.env.CF_R2_BUCKET!;

// Initialize R2 client
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ENDPOINT}`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

/**
 * Supported RAW formats for thumbnail extraction
 */
const RAW_FORMATS = new Set([
  "dng", "cr2", "cr3", "nef", "arw", "orf", "rw2", "raf",
  "raw", "pef", "srw", "x3f", "erf", "mef", "mos", "nrw"
]);

/**
 * Standard image formats
 */
const STANDARD_FORMATS = new Set([
  "jpg", "jpeg", "png", "webp", "heic", "heif"
]);

/**
 * Detect if file is RAW format
 */
export function isRAWFormat(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || "";
  return RAW_FORMATS.has(ext);
}

/**
 * Detect if file is standard image format
 */
export function isStandardFormat(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || "";
  return STANDARD_FORMATS.has(ext);
}

/**
 * Extract embedded JPEG from RAW file using ExifReader
 */
async function extractRAWPreview(buffer: Buffer): Promise<Buffer | null> {
  try {
    const tags = ExifReader.load(buffer) as any;
    
    // Try to get embedded preview/thumbnail
    if (tags.Thumbnail && tags.Thumbnail.value) {
      return Buffer.from(tags.Thumbnail.value);
    }
    
    // Try JpgFromRaw (some RAW formats)
    if (tags.JpgFromRaw && tags.JpgFromRaw.value) {
      return Buffer.from(tags.JpgFromRaw.value);
    }
    
    // Try PreviewImage
    if (tags.PreviewImage && tags.PreviewImage.value) {
      return Buffer.from(tags.PreviewImage.value);
    }
    
    return null;
  } catch (error) {
    console.error("Failed to extract RAW preview:", error);
    return null;
  }
}

/**
 * Generate thumbnail for standard image formats (JPG, PNG, HEIC, etc.)
 */
async function generateStandardThumbnail(buffer: Buffer, maxWidth: number = 800): Promise<Buffer> {
  return await sharp(buffer)
    .resize(maxWidth, null, {
      withoutEnlargement: true,
      fit: "inside",
    })
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();
}

/**
 * Generate thumbnail from RAW file
 */
async function generateRAWThumbnail(buffer: Buffer, maxWidth: number = 800): Promise<Buffer> {
  // Try to extract embedded preview first
  const embeddedPreview = await extractRAWPreview(buffer);
  
  if (embeddedPreview) {
    // Resize the extracted JPEG
    return await sharp(embeddedPreview)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
  }
  
  // Fallback: Try to let sharp handle it directly (works for some RAW formats)
  try {
    return await sharp(buffer)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
  } catch (error) {
    console.error("Sharp cannot process RAW file directly:", error);
    throw new Error("Unable to generate thumbnail from RAW file");
  }
}

/**
 * Download file from R2 storage
 */
async function downloadFromR2(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  
  const response = await s3.send(command);
  
  if (!response.Body) {
    throw new Error("No body in R2 response");
  }
  
  // Convert stream to buffer
  const stream = response.Body as Readable;
  const chunks: Buffer[] = [];
  
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}

/**
 * Upload thumbnail to R2 storage
 */
async function uploadToR2(key: string, buffer: Buffer): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: "image/jpeg",
  });
  
  await s3.send(command);
}

/**
 * Generate thumbnail for a file and upload to R2
 * 
 * @param sourceR2Key - Source file key in R2 (e.g., "uploads/raw/file.dng")
 * @param targetR2Key - Target thumbnail key in R2 (e.g., "uploads/thumbs/file.jpg")
 * @param maxWidth - Maximum width for thumbnail (default: 800px)
 * @returns The R2 key of the generated thumbnail
 */
export async function generateThumbnail(
  sourceR2Key: string,
  targetR2Key: string,
  maxWidth: number = 800
): Promise<string> {
  // Download source file
  const sourceBuffer = await downloadFromR2(sourceR2Key);
  
  // Detect file type and generate thumbnail
  let thumbnailBuffer: Buffer;
  
  if (isRAWFormat(sourceR2Key)) {
    thumbnailBuffer = await generateRAWThumbnail(sourceBuffer, maxWidth);
  } else if (isStandardFormat(sourceR2Key)) {
    thumbnailBuffer = await generateStandardThumbnail(sourceBuffer, maxWidth);
  } else {
    throw new Error(`Unsupported file format: ${sourceR2Key}`);
  }
  
  // Upload thumbnail
  await uploadToR2(targetR2Key, thumbnailBuffer);
  
  return targetR2Key;
}

/**
 * Generate thumbnail in memory (for immediate preview)
 */
export async function generateThumbnailBuffer(
  buffer: Buffer,
  filename: string,
  maxWidth: number = 800
): Promise<Buffer> {
  if (isRAWFormat(filename)) {
    return await generateRAWThumbnail(buffer, maxWidth);
  } else if (isStandardFormat(filename)) {
    return await generateStandardThumbnail(buffer, maxWidth);
  } else {
    throw new Error(`Unsupported file format: ${filename}`);
  }
}
