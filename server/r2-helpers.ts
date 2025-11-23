import { GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET } from "./r2";

export interface JobPaths {
  base: string;
  finalInput: string;
  pipeline: {
    base: string;
    thumbs: string;
    depth: string;
    meta: string;
    segments: string;
  };
  gallery: string;
}

export function getJobPaths(jobId: number): JobPaths {
  const base = `pix-jobs/${jobId}`;
  return {
    base,
    finalInput: `${base}/final_input`,
    pipeline: {
      base: `${base}/pipeline`,
      thumbs: `${base}/pipeline/thumbs`,
      depth: `${base}/pipeline/depth`,
      meta: `${base}/pipeline/meta`,
      segments: `${base}/pipeline/segments`,
    },
    gallery: `${base}/gallery`,
  };
}

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType?: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await r2Client.send(command);
}

export async function getR2ObjectUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  return await getSignedUrl(r2Client, command, { expiresIn });
}

export async function listR2Objects(prefix: string): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET,
    Prefix: prefix,
  });
  
  const response = await r2Client.send(command);
  return response.Contents?.map(obj => obj.Key!).filter(Boolean) || [];
}

export async function deleteR2Object(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  await r2Client.send(command);
}

export async function getR2ObjectBuffer(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  
  const response = await r2Client.send(command);
  const stream = response.Body as NodeJS.ReadableStream;
  
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  
  return Buffer.concat(chunks);
}
