/**
 * Filename Generator v3.1 for pix.immo
 * 
 * Final JPEG: {date}-{shootcode}_{room_type}_{index}_v{ver}.jpg
 * RAW/HDR frames: {date}-{shootcode}_{room_type}_{index}_g{stack}_e{ev}.{ext}
 * Merged JPEG: {date}-{shootcode}_{room_type}_{index}_v{ver}.jpg (no g/e suffixes)
 * 
 * Examples:
 * - RAW frames: 2025-10-28-AB3KQ_fassade_001_g001_e-2.dng
 * - Merged JPEG: 2025-10-28-AB3KQ_fassade_001_v1.jpg
 * - Orientation ONLY in JSON metadata, NOT in filename
 */

import type { RoomType } from './room-types';

/**
 * Convert room type display name to lowercase filename component
 * 
 * Examples:
 * - "Fassade" → "fassade"
 * - "Wohnzimmer" → "wohnzimmer"
 * - "Gäste-WC" → "gaeste-wc"
 */
export function normalizeRoomTypeForFilename(roomType: RoomType): string {
  return roomType
    .toLowerCase()
    .normalize('NFD') // Decompose umlauts
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format index as 001, 002, 003, etc.
 */
export function formatIndex(index: number): string {
  return String(index).padStart(3, '0');
}

/**
 * Format version as v1, v2, v3, etc.
 */
export function formatVersion(version: number): string {
  return `v${version}`;
}

/**
 * Format stack number as g001, g002, etc.
 */
export function formatStackNumber(stackNumber: number): string {
  return `g${String(stackNumber).padStart(3, '0')}`;
}

/**
 * Format EV value as e-4, e-2, e0, e+2, e+4
 */
export function formatEvValue(ev: number): string {
  if (ev === 0) return 'e0';
  if (ev > 0) return `e+${ev}`;
  return `e${ev}`;
}

/**
 * Components for final JPEG filename
 */
export interface FinalJpegComponents {
  date: string; // YYYY-MM-DD
  shootCode: string; // 5-char code (e.g., AB3KQ)
  roomType: string; // normalized room type (e.g., fassade, wohnzimmer)
  index: number; // 1, 2, 3... (auto-increments per subject)
  version: number; // 1, 2, 3... (starts at 1)
}

/**
 * Components for RAW/HDR frame filename
 */
export interface RawFrameComponents extends FinalJpegComponents {
  stackNumber: number; // 1, 2, 3... (for multi-stack captures)
  evValue: number; // -4, -2, 0, +2, +4
  extension: string; // dng, cr2, nef, etc. (without dot)
}

/**
 * Generate final JPEG filename
 * 
 * Example: 2025-10-28-AB3KQ_fassade_001_v1.jpg
 */
export function generateFinalJpegFilename(components: FinalJpegComponents): string {
  const {
    date,
    shootCode,
    roomType,
    index,
    version,
  } = components;

  const normalizedRoom = normalizeRoomTypeForFilename(roomType as RoomType);
  const formattedIndex = formatIndex(index);
  const formattedVersion = formatVersion(version);

  return `${date}-${shootCode}_${normalizedRoom}_${formattedIndex}_${formattedVersion}.jpg`;
}

/**
 * Generate RAW/HDR frame filename
 * 
 * Example: 2025-10-28-AB3KQ_fassade_001_g001_e-2.dng
 */
export function generateRawFrameFilename(components: RawFrameComponents): string {
  const {
    date,
    shootCode,
    roomType,
    index,
    stackNumber,
    evValue,
    extension,
  } = components;

  const normalizedRoom = normalizeRoomTypeForFilename(roomType as RoomType);
  const formattedIndex = formatIndex(index);
  const formattedStack = formatStackNumber(stackNumber);
  const formattedEv = formatEvValue(evValue);

  // Remove leading dot from extension if present
  const cleanExt = extension.startsWith('.') ? extension.slice(1) : extension;

  return `${date}-${shootCode}_${normalizedRoom}_${formattedIndex}_${formattedStack}_${formattedEv}.${cleanExt}`;
}

/**
 * Parse final JPEG filename back into components
 * 
 * Pattern: YYYY-MM-DD-XXXXX_roomtype_NNN_vN.jpg
 */
export function parseFinalJpegFilename(filename: string): FinalJpegComponents | null {
  // Pattern: {date}-{shootcode}_{roomtype}_{index}_v{ver}.jpg
  const pattern = /^(\d{4}-\d{2}-\d{2})-([A-Z0-9]{5})_([a-z-]+)_(\d{3})_v(\d+)\.jpg$/;
  const match = filename.match(pattern);

  if (!match) {
    return null;
  }

  return {
    date: match[1],
    shootCode: match[2],
    roomType: match[3],
    index: parseInt(match[4], 10),
    version: parseInt(match[5], 10),
  };
}

/**
 * Parse RAW/HDR frame filename back into components
 * 
 * Pattern: YYYY-MM-DD-XXXXX_roomtype_NNN_gNNN_eX.ext
 */
export function parseRawFrameFilename(filename: string): RawFrameComponents | null {
  // Pattern: {date}-{shootcode}_{roomtype}_{index}_g{stack}_e{ev}.{ext}
  const pattern = /^(\d{4}-\d{2}-\d{2})-([A-Z0-9]{5})_([a-z-]+)_(\d{3})_(g\d{3})_(e[+-]?\d+)\.([a-z0-9]+)$/;
  const match = filename.match(pattern);

  if (!match) {
    return null;
  }

  // Parse stack number (remove 'g' prefix)
  const stackNumber = parseInt(match[5].slice(1), 10);
  
  // Parse EV value (remove 'e' prefix and handle +/-)
  const evString = match[6].slice(1); // Remove 'e'
  const evValue = parseInt(evString, 10);

  return {
    date: match[1],
    shootCode: match[2],
    roomType: match[3],
    index: parseInt(match[4], 10),
    stackNumber,
    evValue,
    extension: match[7],
    version: 1, // RAW frames don't have version in filename
  };
}

/**
 * Index tracking for auto-increment per room type within a shoot
 */
export class FilenameIndexTracker {
  private indices: Map<string, number> = new Map();

  /**
   * Get next index for a room type (auto-increments)
   * Returns 1 for first occurrence, 2 for second, etc.
   */
  getNextIndex(roomType: RoomType): number {
    const normalized = normalizeRoomTypeForFilename(roomType);
    const current = this.indices.get(normalized) || 0;
    const next = current + 1;
    this.indices.set(normalized, next);
    return next;
  }

  /**
   * Get current index for a room type without incrementing
   */
  getCurrentIndex(roomType: RoomType): number {
    const normalized = normalizeRoomTypeForFilename(roomType);
    return this.indices.get(normalized) || 0;
  }

  /**
   * Reset all indices (for new shoot)
   */
  reset(): void {
    this.indices.clear();
  }

  /**
   * Set specific index for a room type (useful for resuming)
   */
  setIndex(roomType: RoomType, index: number): void {
    const normalized = normalizeRoomTypeForFilename(roomType);
    this.indices.set(normalized, index);
  }
}

/**
 * Version tracking for re-exports of the same photo
 */
export class FilenameVersionTracker {
  private versions: Map<string, number> = new Map();

  /**
   * Get next version for a specific photo (identified by base name)
   * 
   * @param baseName - Base name without version: {date}-{shootcode}_{roomtype}_{index}
   * @returns Next version number (starts at 1)
   */
  getNextVersion(baseName: string): number {
    const current = this.versions.get(baseName) || 0;
    const next = current + 1;
    this.versions.set(baseName, next);
    return next;
  }

  /**
   * Get current version without incrementing
   */
  getCurrentVersion(baseName: string): number {
    return this.versions.get(baseName) || 0;
  }

  /**
   * Reset all versions
   */
  reset(): void {
    this.versions.clear();
  }

  /**
   * Set specific version (useful for resuming)
   */
  setVersion(baseName: string, version: number): void {
    this.versions.set(baseName, version);
  }
}

/**
 * Helper to extract base name from filename (without version or g/e suffixes)
 * 
 * Used for version tracking
 * 
 * Examples:
 * - Input: "2025-10-28-AB3KQ_fassade_001_v1.jpg" → "2025-10-28-AB3KQ_fassade_001"
 * - Input: "2025-10-28-AB3KQ_fassade_001_g001_e-2.dng" → "2025-10-28-AB3KQ_fassade_001"
 */
export function extractBaseName(filename: string): string | null {
  // Try parsing as final JPEG
  const jpegComponents = parseFinalJpegFilename(filename);
  if (jpegComponents) {
    const normalizedRoom = normalizeRoomTypeForFilename(jpegComponents.roomType as RoomType);
    const formattedIndex = formatIndex(jpegComponents.index);
    return `${jpegComponents.date}-${jpegComponents.shootCode}_${normalizedRoom}_${formattedIndex}`;
  }

  // Try parsing as RAW frame
  const rawComponents = parseRawFrameFilename(filename);
  if (rawComponents) {
    const normalizedRoom = normalizeRoomTypeForFilename(rawComponents.roomType as RoomType);
    const formattedIndex = formatIndex(rawComponents.index);
    return `${rawComponents.date}-${rawComponents.shootCode}_${normalizedRoom}_${formattedIndex}`;
  }

  return null;
}
