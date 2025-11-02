/**
 * AI Provider Configuration
 * 
 * Moderne Anbindungen:
 * 1. Replicate oder Clipdrop für Bildbearbeitung
 * 2. OpenAI ChatGPT für Captioning und Textgenerierung
 */

export type ImageProvider = 'replicate' | 'clipdrop';
export type TextProvider = 'openai';

export interface AIProviderConfig {
  // Image Processing Provider (wähle einen)
  imageProvider: ImageProvider;
  replicateApiKey?: string;
  clipdropApiKey?: string;
  
  // Text/Caption Provider
  textProvider: TextProvider;
  openaiApiKey?: string;
}

export function getAIConfig(): AIProviderConfig {
  const imageProvider = (process.env.AI_IMAGE_PROVIDER || 'replicate') as ImageProvider;
  const textProvider = (process.env.AI_TEXT_PROVIDER || 'openai') as TextProvider;

  return {
    imageProvider,
    replicateApiKey: process.env.REPLICATE_API_TOKEN,
    clipdropApiKey: process.env.CLIPDROP_API_KEY,
    textProvider,
    openaiApiKey: process.env.OPENAI_API_KEY,
  };
}

export function validateAIConfig(config: AIProviderConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate Image Provider
  if (config.imageProvider === 'replicate' && !config.replicateApiKey) {
    errors.push('REPLICATE_API_TOKEN is required when using Replicate as image provider');
  }
  if (config.imageProvider === 'clipdrop' && !config.clipdropApiKey) {
    errors.push('CLIPDROP_API_KEY is required when using Clipdrop as image provider');
  }

  // Validate Text Provider
  if (config.textProvider === 'openai' && !config.openaiApiKey) {
    errors.push('OPENAI_API_KEY is required when using OpenAI as text provider');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export interface ImageEnhancementTool {
  id: string;
  name: string;
  description: string;
  category: 'upscale' | 'denoise' | 'color' | 'sky' | 'hdr' | 'general';
  provider: ImageProvider;
  costPerImage: number; // in cents
  creditsPerImage: number;
  estimatedTimeSeconds: number;
}

export interface CaptionResult {
  caption: string;
  language: string;
  confidence?: number;
}
