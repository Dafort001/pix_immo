/**
 * Scene Analysis Utilities for Live Camera Recommendations
 * 
 * Provides histogram analysis, clipping detection, window detection,
 * and white balance estimation from live video feed.
 */

export interface HistogramData {
  r: number[];
  g: number[];
  b: number[];
  luminance: number[];
}

export interface ClippingAnalysis {
  highlightClipping: number; // Percentage 0-100
  shadowClipping: number;     // Percentage 0-100
  hasExcessiveClipping: boolean; // Both >10%
}

export interface WindowDetectionResult {
  detected: boolean;
  confidence: number; // 0-1
  location: 'top' | 'side' | 'multiple' | 'none';
}

export interface WhiteBalanceEstimate {
  kelvin: number;
  confidence: number; // 0-1
}

/**
 * Calculate histogram from ImageData
 */
export function calculateHistogram(imageData: ImageData): HistogramData {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const luminance = new Array(256).fill(0);

  const data = imageData.data;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    r[red]++;
    g[green]++;
    b[blue]++;

    // Calculate luminance (standard formula)
    const lum = Math.round(0.299 * red + 0.587 * green + 0.114 * blue);
    luminance[lum]++;
  }

  return { r, g, b, luminance };
}

/**
 * Analyze clipping in highlights and shadows
 */
export function analyzeClipping(histogram: HistogramData): ClippingAnalysis {
  const totalPixels = histogram.luminance.reduce((sum, count) => sum + count, 0);

  // Count pixels in shadow range (0-15) and highlight range (240-255)
  let shadowPixels = 0;
  let highlightPixels = 0;

  for (let i = 0; i <= 15; i++) {
    shadowPixels += histogram.luminance[i];
  }

  for (let i = 240; i <= 255; i++) {
    highlightPixels += histogram.luminance[i];
  }

  const shadowClipping = (shadowPixels / totalPixels) * 100;
  const highlightClipping = (highlightPixels / totalPixels) * 100;

  // Excessive clipping: both shadows AND highlights > 10%
  const hasExcessiveClipping = shadowClipping > 10 && highlightClipping > 10;

  return {
    shadowClipping,
    highlightClipping,
    hasExcessiveClipping,
  };
}

/**
 * Detect windows using edge brightness heuristic
 * 
 * Simplified heuristic: Look for bright rectangular areas at image edges
 * Real implementation would use edge detection, but this MVP uses brightness sampling
 */
export function detectWindows(imageData: ImageData): WindowDetectionResult {
  const { width, height, data } = imageData;
  
  // Sample edge regions (top 15%, bottom 15%, left 15%, right 15%)
  const edgeWidth = Math.floor(width * 0.15);
  const edgeHeight = Math.floor(height * 0.15);
  
  let topBrightness = 0;
  let topPixels = 0;
  let sideBrightness = 0;
  let sidePixels = 0;

  // Sample top edge
  for (let y = 0; y < edgeHeight; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      topBrightness += lum;
      topPixels++;
    }
  }

  // Sample left and right edges
  for (let y = edgeHeight; y < height - edgeHeight; y++) {
    // Left edge
    for (let x = 0; x < edgeWidth; x++) {
      const i = (y * width + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sideBrightness += lum;
      sidePixels++;
    }
    // Right edge
    for (let x = width - edgeWidth; x < width; x++) {
      const i = (y * width + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sideBrightness += lum;
      sidePixels++;
    }
  }

  const avgTopBrightness = topBrightness / topPixels;
  const avgSideBrightness = sideBrightness / sidePixels;

  // Calculate center brightness for comparison
  let centerBrightness = 0;
  let centerPixels = 0;
  const centerX1 = Math.floor(width * 0.3);
  const centerX2 = Math.floor(width * 0.7);
  const centerY1 = Math.floor(height * 0.3);
  const centerY2 = Math.floor(height * 0.7);

  for (let y = centerY1; y < centerY2; y++) {
    for (let x = centerX1; x < centerX2; x++) {
      const i = (y * width + x) * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      centerBrightness += lum;
      centerPixels++;
    }
  }

  const avgCenterBrightness = centerBrightness / centerPixels;

  // Window detection heuristic: edges significantly brighter than center
  const topContrast = avgTopBrightness / (avgCenterBrightness + 1);
  const sideContrast = avgSideBrightness / (avgCenterBrightness + 1);

  // High confidence if edges are 2x+ brighter than center, medium if 1.5x+
  let detected = false;
  let confidence = 0;
  let location: 'top' | 'side' | 'multiple' | 'none' = 'none';

  if (topContrast > 2.0 && sideContrast > 2.0) {
    detected = true;
    confidence = 0.85;
    location = 'multiple';
  } else if (topContrast > 2.0) {
    detected = true;
    confidence = 0.75;
    location = 'top';
  } else if (sideContrast > 2.0) {
    detected = true;
    confidence = 0.75;
    location = 'side';
  } else if (topContrast > 1.5 || sideContrast > 1.5) {
    detected = true;
    confidence = 0.5;
    location = topContrast > sideContrast ? 'top' : 'side';
  }

  return {
    detected,
    confidence,
    location,
  };
}

/**
 * Estimate white balance using gray-world assumption
 * 
 * Assumes average scene color should be neutral gray.
 * Calculates Kelvin temperature suggestion based on color cast.
 */
export function estimateWhiteBalance(imageData: ImageData): WhiteBalanceEstimate {
  const data = imageData.data;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let count = 0;

  // Sample every 4th pixel for performance
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Skip very dark or very bright pixels (likely not neutral)
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum < 30 || lum > 225) continue;

    rSum += r;
    gSum += g;
    bSum += b;
    count++;
  }

  if (count === 0) {
    return { kelvin: 5500, confidence: 0 };
  }

  const avgR = rSum / count;
  const avgG = gSum / count;
  const avgB = bSum / count;

  // Calculate color temperature from RGB ratios
  // Blue > Red = warm scene (low Kelvin needed to compensate)
  // Red > Blue = cool scene (high Kelvin needed to compensate)
  
  const colorRatio = avgB / (avgR + 1); // Avoid division by zero
  
  let kelvin: number;
  
  if (colorRatio > 1.15) {
    // Strong blue cast → warm scene → suggest cool WB (low Kelvin)
    kelvin = 3500;
  } else if (colorRatio > 1.05) {
    // Moderate blue cast
    kelvin = 4500;
  } else if (colorRatio < 0.85) {
    // Strong red/orange cast → cool scene → suggest warm WB (high Kelvin)
    kelvin = 6500;
  } else if (colorRatio < 0.95) {
    // Moderate red cast
    kelvin = 5500;
  } else {
    // Relatively neutral
    kelvin = 5000;
  }

  // Calculate confidence based on how far from neutral (1.0 ratio)
  const deviation = Math.abs(colorRatio - 1.0);
  const confidence = Math.min(0.9, deviation * 5); // Higher deviation = higher confidence we need correction

  // Only suggest if confidence is reasonable
  if (confidence < 0.3) {
    return { kelvin: 5500, confidence: 0 };
  }

  return {
    kelvin,
    confidence,
  };
}

/**
 * Capture frame from video element to canvas for analysis
 */
export function captureVideoFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): ImageData | null {
  if (!video.videoWidth || !video.videoHeight) {
    return null;
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  // Resize canvas to match video (use smaller size for performance)
  const scale = 0.25; // Analyze at 1/4 resolution for speed
  canvas.width = video.videoWidth * scale;
  canvas.height = video.videoHeight * scale;

  // Draw current video frame
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Get image data
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
