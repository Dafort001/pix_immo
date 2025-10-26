/**
 * Manual Mode Settings Types
 * Complete type definitions for professional camera controls
 */

export type FocusMode = 'auto' | 'manual';
export type MeteringMode = 'matrix' | 'center-weighted' | 'spot';
export type FileFormat = 'heic' | 'jpg' | 'raw';
export type GridType = 'none' | '3x3' | 'golden-ratio';
export type WhiteBalancePreset = 'daylight' | 'cloudy' | 'tungsten' | 'fluorescent' | 'shade' | 'custom';

/**
 * Complete Manual Mode Settings
 */
export interface ManualModeSettings {
  // Core Mode
  enabled: boolean;
  
  // ISO Control
  iso: number | 'auto'; // 32-6400 or 'auto'
  
  // Shutter Speed (in seconds, 1/8000 = 0.000125, 30s = 30)
  shutterSpeed: number | 'auto'; // 0.000125 - 30 or 'auto'
  
  // White Balance (Kelvin)
  whiteBalanceKelvin: number; // 2800-7500
  whiteBalancePreset: WhiteBalancePreset;
  
  // Focus
  focusMode: FocusMode;
  focusDistance: number | null; // 0-1 (null = auto)
  focusPeakingEnabled: boolean;
  
  // Exposure
  exposureCompensation: number; // -2 to +2 in 1/3 steps
  
  // File Format
  fileFormat: FileFormat;
  
  // Stabilization
  oisEnabled: boolean;
  tripodMode: boolean;
  
  // Night Mode
  nightModeEnabled: boolean;
  
  // Grid & Overlays
  gridType: GridType;
  horizonLevelEnabled: boolean;
  
  // Metering
  meteringMode: MeteringMode;
  
  // Histogram
  histogramEnabled: boolean;
}

/**
 * Default Settings (Auto Mode)
 */
export const DEFAULT_MANUAL_SETTINGS: ManualModeSettings = {
  enabled: false,
  iso: 'auto',
  shutterSpeed: 'auto',
  whiteBalanceKelvin: 5500,
  whiteBalancePreset: 'daylight',
  focusMode: 'auto',
  focusDistance: null,
  focusPeakingEnabled: false,
  exposureCompensation: 0,
  fileFormat: 'jpg',
  oisEnabled: true,
  tripodMode: false,
  nightModeEnabled: false,
  gridType: 'none',
  horizonLevelEnabled: false,
  meteringMode: 'matrix',
  histogramEnabled: false,
};

/**
 * Shutter Speed Presets
 */
export const SHUTTER_PRESETS = {
  DAY: 1 / 500, // 1/500s
  DUSK: 1 / 60, // 1/60s
  NIGHT: 1, // 1s
} as const;

/**
 * White Balance Presets (Kelvin)
 */
export const WHITE_BALANCE_PRESETS = {
  daylight: 5500,
  cloudy: 6500,
  tungsten: 3200,
  fluorescent: 4500,
  shade: 7500,
  custom: 5500,
} as const;

/**
 * ISO Limits
 */
export const ISO_LIMITS = {
  MIN: 32,
  MAX: 6400,
  DEFAULT: 400,
} as const;

/**
 * Shutter Speed Limits (seconds)
 */
export const SHUTTER_LIMITS = {
  MIN: 1 / 8000, // Fastest: 1/8000s
  MAX: 30, // Slowest: 30s
  HAND_HELD_WARNING: 1, // Warn for exposures >= 1s
} as const;

/**
 * Helper Functions
 */
export function formatShutterSpeed(seconds: number | 'auto'): string {
  if (seconds === 'auto') return 'Auto';
  if (seconds >= 1) return `${seconds}s`;
  return `1/${Math.round(1 / seconds)}`;
}

export function formatISO(iso: number | 'auto'): string {
  if (iso === 'auto') return 'Auto ISO';
  return `ISO ${iso}`;
}

export function formatWhiteBalance(kelvin: number): string {
  return `${kelvin}K`;
}

export function formatExposureComp(ev: number): string {
  if (ev === 0) return '±0';
  return ev > 0 ? `+${ev.toFixed(1)}` : `${ev.toFixed(1)}`;
}
