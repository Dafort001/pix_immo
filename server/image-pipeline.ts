import sharp from "sharp";
import { getJobPaths, uploadToR2, getR2ObjectBuffer } from "./r2-helpers";
import type { FinalImage } from "@shared/schema";

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
  orientation?: number;
  exif?: Record<string, any>;
}

export interface JobExposeData {
  jobId: number;
  images: Array<{
    id: number;
    filename: string;
    galleryUrl: string;
    thumbUrl: string;
    metadata: ImageMetadata;
  }>;
  generatedAt: string;
}

export async function extractMetadata(imageBuffer: Buffer): Promise<ImageMetadata> {
  const metadata = await sharp(imageBuffer).metadata();
  
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || "unknown",
    size: imageBuffer.length,
    hasAlpha: metadata.hasAlpha || false,
    orientation: metadata.orientation,
    exif: metadata.exif as Record<string, any> | undefined,
  };
}

export async function generateThumbnail(
  imageBuffer: Buffer,
  maxWidth: number = 800,
  maxHeight: number = 600
): Promise<Buffer> {
  return await sharp(imageBuffer)
    .resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}

export async function processFinalImage(
  finalImage: FinalImage,
  imageBuffer: Buffer
): Promise<void> {
  const paths = getJobPaths(finalImage.jobId);
  
  const metadata = await extractMetadata(imageBuffer);
  
  const metadataJson = JSON.stringify(metadata, null, 2);
  await uploadToR2(
    `${paths.pipeline.meta}/${finalImage.filename}.json`,
    metadataJson,
    "application/json"
  );
  
  const thumbnail = await generateThumbnail(imageBuffer);
  await uploadToR2(
    `${paths.pipeline.thumbs}/${finalImage.filename}`,
    thumbnail,
    "image/jpeg"
  );
  
  console.log(`[Pipeline] Processed ${finalImage.filename}: ${metadata.width}x${metadata.height}`);
}

export async function generateDepthMap(
  finalImage: FinalImage,
  imageBuffer: Buffer
): Promise<void> {
  const paths = getJobPaths(finalImage.jobId);
  
  const placeholder = JSON.stringify({
    status: "stub",
    message: "Depth map generation with FAL API - coming soon",
    imageId: finalImage.id,
    filename: finalImage.filename,
  }, null, 2);
  
  await uploadToR2(
    `${paths.pipeline.depth}/${finalImage.filename}.json`,
    placeholder,
    "application/json"
  );
  
  console.log(`[Pipeline] Depth stub created for ${finalImage.filename}`);
}

export async function generateSegmentation(
  finalImage: FinalImage,
  imageBuffer: Buffer
): Promise<void> {
  const paths = getJobPaths(finalImage.jobId);
  
  const placeholder = JSON.stringify({
    status: "stub",
    message: "Segmentation with LLM Vision API - coming soon",
    imageId: finalImage.id,
    filename: finalImage.filename,
  }, null, 2);
  
  await uploadToR2(
    `${paths.pipeline.segments}/${finalImage.filename}.json`,
    placeholder,
    "application/json"
  );
  
  console.log(`[Pipeline] Segmentation stub created for ${finalImage.filename}`);
}

export async function generateJobExpose(
  jobId: number,
  finalImages: FinalImage[]
): Promise<void> {
  const paths = getJobPaths(jobId);
  
  const imageData = await Promise.all(
    finalImages.map(async (img) => {
      const metaKey = `${paths.pipeline.meta}/${img.filename}.json`;
      let metadata: ImageMetadata;
      
      try {
        const metaBuffer = await getR2ObjectBuffer(metaKey);
        metadata = JSON.parse(metaBuffer.toString());
      } catch (error) {
        console.warn(`[Pipeline] No metadata for ${img.filename}, using defaults`);
        metadata = {
          width: 0,
          height: 0,
          format: "unknown",
          size: 0,
          hasAlpha: false,
        };
      }
      
      return {
        id: img.id,
        filename: img.filename,
        galleryUrl: `${paths.gallery}/${img.filename}`,
        thumbUrl: `${paths.pipeline.thumbs}/${img.filename}`,
        metadata,
      };
    })
  );
  
  const exposeData: JobExposeData = {
    jobId,
    images: imageData,
    generatedAt: new Date().toISOString(),
  };
  
  const exposeJson = JSON.stringify(exposeData, null, 2);
  await uploadToR2(
    `${paths.pipeline.base}/job_expose.json`,
    exposeJson,
    "application/json"
  );
  
  console.log(`[Pipeline] Generated job_expose.json for job ${jobId} with ${imageData.length} images`);
}

export async function runFullPipeline(
  finalImage: FinalImage,
  imageBuffer: Buffer
): Promise<void> {
  await processFinalImage(finalImage, imageBuffer);
  
  await Promise.all([
    generateDepthMap(finalImage, imageBuffer),
    generateSegmentation(finalImage, imageBuffer),
  ]);
  
  console.log(`[Pipeline] Full pipeline completed for ${finalImage.filename}`);
}
