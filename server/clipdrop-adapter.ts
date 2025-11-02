/**
 * Clipdrop API Integration
 * Alternative zu Replicate für Bildbearbeitung
 * https://clipdrop.co/apis
 */

import { getAIConfig } from './ai-providers';
import FormData from 'form-data';

export interface ClipDropTool {
  id: string;
  name: string;
  description: string;
  category: 'upscale' | 'remove_background' | 'cleanup' | 'relight' | 'sky';
  endpoint: string;
  costPerImage: number; // in cents
  creditsPerImage: number;
  estimatedTimeSeconds: number;
}

export const CLIPDROP_TOOLS: Record<string, ClipDropTool> = {
  upscale_x2: {
    id: 'upscale_x2',
    name: 'Upscale 2x (Clipdrop)',
    description: 'High-quality upscaling using Clipdrop AI',
    category: 'upscale',
    endpoint: 'https://clipdrop-api.co/image-upscaling/v1/upscale',
    costPerImage: 8,
    creditsPerImage: 1,
    estimatedTimeSeconds: 10,
  },
  upscale_x4: {
    id: 'upscale_x4',
    name: 'Upscale 4x (Clipdrop)',
    description: 'Ultra high-quality upscaling to 4x size',
    category: 'upscale',
    endpoint: 'https://clipdrop-api.co/image-upscaling/v1/upscale',
    costPerImage: 15,
    creditsPerImage: 2,
    estimatedTimeSeconds: 15,
  },
  remove_background: {
    id: 'remove_background',
    name: 'Background Removal',
    description: 'Remove background with AI precision',
    category: 'remove_background',
    endpoint: 'https://clipdrop-api.co/remove-background/v1',
    costPerImage: 5,
    creditsPerImage: 1,
    estimatedTimeSeconds: 5,
  },
  cleanup: {
    id: 'cleanup',
    name: 'Object Removal',
    description: 'Remove unwanted objects from images',
    category: 'cleanup',
    endpoint: 'https://clipdrop-api.co/cleanup/v1',
    costPerImage: 10,
    creditsPerImage: 1,
    estimatedTimeSeconds: 8,
  },
  relight: {
    id: 'relight',
    name: 'Portrait Relighting',
    description: 'Relight portraits with AI',
    category: 'relight',
    endpoint: 'https://clipdrop-api.co/portrait-surface-normals/v1',
    costPerImage: 12,
    creditsPerImage: 2,
    estimatedTimeSeconds: 10,
  },
  sky_replacement: {
    id: 'sky_replacement',
    name: 'Sky Replacement',
    description: 'Replace sky in landscape photos',
    category: 'sky',
    endpoint: 'https://clipdrop-api.co/replace-background/v1',
    costPerImage: 12,
    creditsPerImage: 2,
    estimatedTimeSeconds: 12,
  },
};

export interface RunClipDropParams {
  toolId: string;
  imageBuffer: Buffer | ArrayBuffer;
  params?: Record<string, any>;
}

export interface ClipDropResult {
  success: boolean;
  outputBuffer?: Buffer;
  error?: string;
  processingTimeMs?: number;
}

/**
 * Führe Clipdrop-Bildbearbeitung aus
 */
export async function runClipDropTool(params: RunClipDropParams): Promise<ClipDropResult> {
  const config = getAIConfig();
  
  if (!config.clipdropApiKey) {
    throw new Error('Clipdrop API key not configured. Set CLIPDROP_API_KEY environment variable.');
  }

  const tool = CLIPDROP_TOOLS[params.toolId];
  if (!tool) {
    throw new Error(`Unknown Clipdrop tool: ${params.toolId}`);
  }

  const startTime = Date.now();

  try {
    const form = new FormData();
    
    // Füge Bild hinzu
    const imageBuffer = Buffer.isBuffer(params.imageBuffer) 
      ? params.imageBuffer 
      : Buffer.from(params.imageBuffer);
    
    form.append('image_file', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });

    // Tool-spezifische Parameter
    if (params.toolId === 'upscale_x2') {
      form.append('target_width', '2048');
      form.append('target_height', '2048');
    } else if (params.toolId === 'upscale_x4') {
      form.append('target_width', '4096');
      form.append('target_height', '4096');
    }

    // Weitere Parameter
    if (params.params) {
      for (const [key, value] of Object.entries(params.params)) {
        form.append(key, String(value));
      }
    }

    const response = await fetch(tool.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': config.clipdropApiKey,
      },
      body: form as any,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Clipdrop API error: ${response.status} - ${errorText}`);
    }

    const outputBuffer = Buffer.from(await response.arrayBuffer());
    const processingTimeMs = Date.now() - startTime;

    return {
      success: true,
      outputBuffer,
      processingTimeMs,
    };
  } catch (error) {
    console.error('Clipdrop processing failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: Date.now() - startTime,
    };
  }
}

/**
 * Download image from URL
 */
export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Run Clipdrop tool with URL input
 */
export async function runClipDropFromUrl(
  toolId: string,
  imageUrl: string,
  params?: Record<string, any>
): Promise<ClipDropResult> {
  const imageBuffer = await downloadImage(imageUrl);
  return runClipDropTool({ toolId, imageBuffer, params });
}

export function getAllClipDropTools(): ClipDropTool[] {
  return Object.values(CLIPDROP_TOOLS);
}

export function getClipDropToolById(toolId: string): ClipDropTool | undefined {
  return CLIPDROP_TOOLS[toolId];
}
