/**
 * Sidecar Export System für CRM-Kompatibilität
 * 
 * Erzeugt pro Motiv:
 * - object_meta.json (Pflichtfelder + optionale Metadaten)
 * - alt_text.txt (Dateiname<TAB>Alt-Text in DE)
 */

import type { RoomType, Orientation } from './room-types.js';
import { ROOMS_WITH_ORIENTATION, ORIENTATION_DISPLAY_NAMES } from './room-types.js';

// ==================== DEUTSCHE ALT-TEXT PROMPTS ====================

/**
 * Deutsche Alt-Text-Beschreibungen für jeden Raumtyp
 * Format: kurz, prägnant, SEO-optimiert
 */
export const GERMAN_ALT_TEXT_PROMPTS: Record<RoomType, string> = {
  // Wohnen
  'Wohnzimmer': 'Modernes Wohnzimmer mit komfortabler Sitzgelegenheit und natürlichem Lichteinfall',
  'Esszimmer': 'Einladendes Esszimmer mit eleganter Tischdekoration und stimmungsvoller Beleuchtung',
  'Wintergarten': 'Heller Wintergarten mit Pflanzen und viel Tageslicht',
  
  // Schlafen
  'Schlafzimmer': 'Ruhiges Schlafzimmer mit komfortablem Bett und sanfter Beleuchtung',
  'Kinderzimmer': 'Fröhliches Kinderzimmer mit bunten Farben und organisiertem Stauraum',
  
  // Küche
  'Küche': 'Moderne Küche mit hochwertigen Geräten und funktionaler Aufteilung',
  
  // Bad
  'Bad': 'Sauberes modernes Badezimmer mit hochwertigen Armaturen und guter Beleuchtung',
  'Gäste-WC': 'Kompaktes Gäste-WC mit elegantem Design und praktischer Aufteilung',
  
  // Arbeit
  'Arbeitszimmer': 'Funktionales Arbeitszimmer mit Schreibtisch, Stauraum und gutem Tageslicht',
  
  // Verkehr
  'Flur': 'Einladender Flur mit guter Beleuchtung und funktionalem Design',
  'Treppenhaus': 'Elegantes Treppenhaus mit hochwertigen Materialien und passender Beleuchtung',
  'Eingang': 'Einladender Eingangsbereich mit starker visueller Wirkung',
  
  // Wirtschaft
  'Abstellraum': 'Praktischer Abstellraum mit organisiertem Regalsystem und guter Zugänglichkeit',
  'Keller': 'Sauberer Kellerraum mit ordentlicher Beleuchtung und trockenen Bedingungen',
  'Garage': 'Sichere Garage mit praktischer Aufteilung und ausreichend Platz',
  'Stellplatz': 'Gepflegter Stellplatz mit klarem Zugang und Markierungen',
  
  // Außen
  'Balkon': 'Ansprechender Balkon mit attraktiver Aussicht und nutzbarem Außenbereich',
  'Terrasse': 'Einladende Terrasse ideal für Outdoor-Living und Unterhaltung',
  'Garten': 'Gepflegter Garten mit attraktiver Bepflanzung und Außengestaltung',
  'Fassade': 'Beeindruckende Gebäudefassade mit architektonischen Details',
};

/**
 * Orientierungs-Zusätze für deutsche Alt-Texte
 */
const ORIENTATION_ALT_TEXT_SUFFIX: Record<Orientation, string> = {
  front: 'Vorderansicht',
  back: 'Rückansicht',
  side: 'Seitenansicht',
};

/**
 * Generiert deutschen Alt-Text für ein Motiv
 */
export function generateGermanAltText(
  roomType: RoomType, 
  orientation?: Orientation | null
): string {
  const baseText = GERMAN_ALT_TEXT_PROMPTS[roomType];
  
  // Wenn Orientierung vorhanden und relevant
  if (orientation && ROOMS_WITH_ORIENTATION.includes(roomType)) {
    const orientationSuffix = ORIENTATION_ALT_TEXT_SUFFIX[orientation];
    return `${roomType} (${orientationSuffix}) - ${baseText}`;
  }
  
  return `${roomType} - ${baseText}`;
}

// ==================== OBJECT META STRUCTURE ====================

/**
 * Vollständige Metadaten-Struktur für object_meta.json
 */
export interface ObjectMeta {
  // Pflichtfelder (MUST always be present in JSON, even if null)
  job_id: string;
  display_id: string;  // Human-readable: z.B. "AB3KQ-001"
  date: string;        // YYYY-MM-DD
  shoot_code: string;  // 5-char code
  user_code: string | null;  // User/Photographer identifier (null if not set, but MUST be in JSON)
  room_type: string;   // Lowercase normalized
  orientation: Orientation | null;
  
  // Kameraeinstellungen
  lens?: string | null;           // z.B. "ultrawide" | "wide" | "tele"
  ev?: number | null;             // EV compensation
  wb_mode?: string | null;        // "auto" | "daylight" | "cloudy" | "shade" | "tungsten" | "fluorescent" | "flash" | "custom"
  wb_k?: number | null;           // Kelvin wenn wb_mode="custom"
  hdr_brackets?: number | null;   // 0, 3, 5, 7
  file_format?: string | null;    // "jpeg" | "dng"
  
  // Zeitstempel
  capture_time?: string | null;   // ISO timestamp
  
  // Dateinamen
  filenames: {
    sources: string[];      // RAW/HDR frames (kann leer sein für JPEG-only)
    merged?: string | null; // Final merged JPEG
  };
  
  // Version
  version: number;  // v1, v2, v3...
  
  // Optional: Weitere Metadaten
  device_info?: {
    make?: string;
    model?: string;
    os?: string;
  } | null;
  
  location?: {
    lat?: number;
    lng?: number;
  } | null;
}

/**
 * Generiert object_meta.json für ein Motiv
 */
export function generateObjectMeta(data: {
  jobId: string;
  displayId: string;
  date: string;
  shootCode: string;
  userCode?: string;
  roomType: RoomType;
  orientation?: Orientation | null;
  lens?: string | null;
  ev?: number | null;
  wbMode?: string | null;
  wbK?: number | null;
  hdrBrackets?: number | null;
  fileFormat?: string | null;
  captureTime?: string | null;
  sourceFilenames: string[];
  mergedFilename?: string | null;
  version: number;
  deviceInfo?: { make?: string; model?: string; os?: string } | null;
  location?: { lat?: number; lng?: number } | null;
}): ObjectMeta {
  return {
    job_id: data.jobId,
    display_id: data.displayId,
    date: data.date,
    shoot_code: data.shootCode,
    user_code: data.userCode ?? null,  // MUST be present in JSON (null if not set)
    room_type: data.roomType.toLowerCase(),
    orientation: data.orientation ?? null,
    
    lens: data.lens ?? null,
    ev: data.ev ?? null,
    wb_mode: data.wbMode ?? null,
    wb_k: data.wbK ?? null,
    hdr_brackets: data.hdrBrackets ?? null,
    file_format: data.fileFormat ?? null,
    
    capture_time: data.captureTime ?? null,
    
    filenames: {
      sources: data.sourceFilenames,
      merged: data.mergedFilename ?? null,
    },
    
    version: data.version,
    
    device_info: data.deviceInfo ?? null,
    location: data.location ?? null,
  };
}

// ==================== ALT TEXT FILE GENERATION ====================

/**
 * Generiert alt_text.txt Content
 * Format: Eine Zeile pro Bild: "DATEINAME<TAB>ALT-TEXT"
 */
export function generateAltTextFile(entries: Array<{
  filename: string;
  roomType: RoomType;
  orientation?: Orientation | null;
}>): string {
  return entries
    .map(entry => {
      const altText = generateGermanAltText(entry.roomType, entry.orientation);
      return `${entry.filename}\t${altText}`;
    })
    .join('\n');
}

// ==================== VALIDATION ====================

/**
 * Validiert ObjectMeta und gibt Warnungen zurück
 * Fehlende optionale Felder sind OK (Warnung, kein Error)
 */
export function validateObjectMeta(meta: ObjectMeta): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Pflichtfelder prüfen
  if (!meta.job_id) errors.push('job_id fehlt');
  if (!meta.display_id) errors.push('display_id fehlt');
  if (!meta.date) errors.push('date fehlt');
  if (!meta.shoot_code) errors.push('shoot_code fehlt');
  if (!meta.room_type) errors.push('room_type fehlt');
  if (meta.version === undefined || meta.version === null) errors.push('version fehlt');
  if (!meta.filenames?.merged && (!meta.filenames?.sources || meta.filenames.sources.length === 0)) {
    errors.push('filenames.merged oder filenames.sources muss gesetzt sein');
  }
  
  // Optionale Felder prüfen (nur Warnungen)
  if (!meta.user_code) warnings.push('user_code nicht gesetzt');
  if (!meta.lens) warnings.push('lens nicht gesetzt');
  if (meta.ev === undefined || meta.ev === null) warnings.push('ev nicht gesetzt');
  if (!meta.wb_mode && !meta.wb_k) warnings.push('wb_mode/wb_k nicht gesetzt');
  if (meta.hdr_brackets === undefined || meta.hdr_brackets === null) warnings.push('hdr_brackets nicht gesetzt');
  if (!meta.file_format) warnings.push('file_format nicht gesetzt');
  if (!meta.capture_time) warnings.push('capture_time nicht gesetzt');
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ==================== HELPERS ====================

/**
 * Serialisiert ObjectMeta zu JSON (hübsch formatiert)
 */
export function serializeObjectMeta(meta: ObjectMeta): string {
  return JSON.stringify(meta, null, 2);
}

/**
 * Parse ObjectMeta von JSON string
 */
export function parseObjectMeta(json: string): ObjectMeta {
  return JSON.parse(json);
}
