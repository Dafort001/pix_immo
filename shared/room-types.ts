/**
 * Raum-Taxonomie für pix.immo
 * Version: 7.0 - Vereinfachte Standardliste
 * Stand: 2025-10-28
 * 
 * 20 Raumtypen für professionelle Immobilienfotografie
 */

// ==================== GRUPPEN ====================

export const ROOM_GROUPS = {
  WOHNEN: 'wohnen',
  SCHLAFEN: 'schlafen',
  KUECHE: 'küche',
  BAD: 'bad',
  ARBEIT: 'arbeit',
  VERKEHR: 'verkehr',
  WIRTSCHAFT: 'wirtschaft',
  AUSSEN: 'außen',
} as const;

export type RoomGroup = typeof ROOM_GROUPS[keyof typeof ROOM_GROUPS];

// ==================== ORIENTIERUNG ====================

/**
 * Orientierung für Außenansichten (optional)
 */
export const ORIENTATIONS = {
  FRONT: 'front',
  BACK: 'back',
  SIDE: 'side',
} as const;

export type Orientation = typeof ORIENTATIONS[keyof typeof ORIENTATIONS];

// ==================== RAUMTYPEN ====================

/**
 * Alle Raumtypen für die Kamera-App (vereinfachte Liste - 20 Räume)
 */
export const ALL_ROOM_TYPES = [
  // Wohnen (3)
  'Wohnzimmer',
  'Esszimmer',
  'Wintergarten',
  
  // Schlafen (2)
  'Schlafzimmer',
  'Kinderzimmer',
  
  // Küche (1)
  'Küche',
  
  // Bad (2)
  'Bad',
  'Gäste-WC',
  
  // Arbeit (1)
  'Arbeitszimmer',
  
  // Verkehrsflächen (3)
  'Flur',
  'Treppenhaus',
  'Eingang',
  
  // Wirtschaftsräume (4)
  'Abstellraum',
  'Keller',
  'Garage',
  'Stellplatz',
  
  // Außenbereiche (4)
  'Balkon',
  'Terrasse',
  'Garten',
  'Fassade',
] as const;

export type RoomType = typeof ALL_ROOM_TYPES[number];

/**
 * Standard-Fallback für nicht klassifizierte Räume
 */
export const DEFAULT_ROOM_TYPE: RoomType = 'Wohnzimmer';

/**
 * Raumtypen, die eine Orientierung haben können
 */
export const ROOMS_WITH_ORIENTATION: RoomType[] = [
  'Fassade',
  'Eingang',
  'Terrasse',
  'Balkon',
  'Garten',
];

// ==================== GRUPPENZUORDNUNG ====================

/**
 * Mapping: Raumtyp → Gruppe
 */
export const ROOM_TO_GROUP: Record<RoomType, RoomGroup> = {
  // Wohnen
  'Wohnzimmer': ROOM_GROUPS.WOHNEN,
  'Esszimmer': ROOM_GROUPS.WOHNEN,
  'Wintergarten': ROOM_GROUPS.WOHNEN,
  
  // Schlafen
  'Schlafzimmer': ROOM_GROUPS.SCHLAFEN,
  'Kinderzimmer': ROOM_GROUPS.SCHLAFEN,
  
  // Küche
  'Küche': ROOM_GROUPS.KUECHE,
  
  // Bad
  'Bad': ROOM_GROUPS.BAD,
  'Gäste-WC': ROOM_GROUPS.BAD,
  
  // Arbeit
  'Arbeitszimmer': ROOM_GROUPS.ARBEIT,
  
  // Verkehr
  'Flur': ROOM_GROUPS.VERKEHR,
  'Treppenhaus': ROOM_GROUPS.VERKEHR,
  'Eingang': ROOM_GROUPS.VERKEHR,
  
  // Wirtschaft
  'Abstellraum': ROOM_GROUPS.WIRTSCHAFT,
  'Keller': ROOM_GROUPS.WIRTSCHAFT,
  'Garage': ROOM_GROUPS.WIRTSCHAFT,
  'Stellplatz': ROOM_GROUPS.WIRTSCHAFT,
  
  // Außen
  'Balkon': ROOM_GROUPS.AUSSEN,
  'Terrasse': ROOM_GROUPS.AUSSEN,
  'Garten': ROOM_GROUPS.AUSSEN,
  'Fassade': ROOM_GROUPS.AUSSEN,
};

// ==================== ICON-ZUORDNUNG ====================

/**
 * Lucide Icons für jeden Raumtyp
 */
export const ROOM_ICONS: Record<RoomType, string> = {
  // Wohnen
  'Wohnzimmer': 'sofa',
  'Esszimmer': 'utensils',
  'Wintergarten': 'flower-2',
  
  // Schlafen
  'Schlafzimmer': 'bed',
  'Kinderzimmer': 'baby',
  
  // Küche
  'Küche': 'chef-hat',
  
  // Bad
  'Bad': 'bath',
  'Gäste-WC': 'toilet',
  
  // Arbeit
  'Arbeitszimmer': 'briefcase',
  
  // Verkehr
  'Flur': 'door-open',
  'Treppenhaus': 'stairs',
  'Eingang': 'door-closed',
  
  // Wirtschaft
  'Abstellraum': 'archive',
  'Keller': 'box',
  'Garage': 'car',
  'Stellplatz': 'square-parking',
  
  // Außen
  'Balkon': 'sun',
  'Terrasse': 'sun-medium',
  'Garten': 'leaf',
  'Fassade': 'building',
};

// ==================== AI CAPTION PROMPTS ====================

/**
 * Caption-Prompts für AI-gestützte Bildbeschreibungen
 * Format: room_type → descriptive prompt for image captioning
 */
export const ROOM_CAPTION_PROMPTS: Record<RoomType, string> = {
  // Wohnen
  'Wohnzimmer': 'A modern living room with comfortable seating, natural light, and tasteful decor',
  'Esszimmer': 'An inviting dining room with elegant table setting and ambient lighting',
  'Wintergarten': 'A bright conservatory filled with plants and natural light',
  
  // Schlafen
  'Schlafzimmer': 'A peaceful bedroom with comfortable bed and soft lighting',
  'Kinderzimmer': 'A cheerful children\'s room with playful colors and organized storage',
  
  // Küche
  'Küche': 'A well-equipped modern kitchen with quality appliances and functional layout',
  
  // Bad
  'Bad': 'A clean and modern bathroom with quality fixtures and good lighting',
  'Gäste-WC': 'A compact guest bathroom with elegant design and practical layout',
  
  // Arbeit
  'Arbeitszimmer': 'A functional home office with desk, storage, and good natural light',
  
  // Verkehr
  'Flur': 'A welcoming hallway with good lighting and functional design',
  'Treppenhaus': 'An elegant staircase with quality materials and proper lighting',
  'Eingang': 'An inviting entrance area that creates a strong first impression',
  
  // Wirtschaft
  'Abstellraum': 'A practical storage room with organized shelving and accessibility',
  'Keller': 'A clean basement space with proper lighting and dry conditions',
  'Garage': 'A secure garage with practical layout and adequate space',
  'Stellplatz': 'A well-maintained parking space with clear access and markings',
  
  // Außen
  'Balkon': 'A pleasant balcony with attractive views and usable outdoor space',
  'Terrasse': 'An inviting terrace perfect for outdoor living and entertaining',
  'Garten': 'A well-maintained garden with attractive landscaping and outdoor features',
  'Fassade': 'An impressive building facade showing architectural details and condition',
};

/**
 * Caption-Prompts mit Orientierung für Außenansichten
 */
export function getCaptionPrompt(roomType: RoomType, orientation?: Orientation): string {
  const basePrompt = ROOM_CAPTION_PROMPTS[roomType];
  
  if (!orientation || !ROOMS_WITH_ORIENTATION.includes(roomType)) {
    return basePrompt;
  }
  
  const orientationSuffix: Record<Orientation, string> = {
    front: 'from the front perspective',
    back: 'from the rear perspective',
    side: 'from the side perspective',
  };
  
  return `${basePrompt} ${orientationSuffix[orientation]}`;
}

// ==================== GRUPPIERUNG NACH GRUPPE ====================

/**
 * Gruppiert alle Raumtypen nach Gruppe für UI-Darstellung
 */
export function getRoomsByGroup(): Record<RoomGroup, RoomType[]> {
  const groups: Record<RoomGroup, RoomType[]> = {
    [ROOM_GROUPS.WOHNEN]: [],
    [ROOM_GROUPS.SCHLAFEN]: [],
    [ROOM_GROUPS.KUECHE]: [],
    [ROOM_GROUPS.BAD]: [],
    [ROOM_GROUPS.ARBEIT]: [],
    [ROOM_GROUPS.VERKEHR]: [],
    [ROOM_GROUPS.WIRTSCHAFT]: [],
    [ROOM_GROUPS.AUSSEN]: [],
  };

  ALL_ROOM_TYPES.forEach(room => {
    const group = ROOM_TO_GROUP[room];
    groups[group].push(room);
  });

  return groups;
}

/**
 * Gruppen-Anzeigenamen für UI
 */
export const GROUP_DISPLAY_NAMES: Record<RoomGroup, string> = {
  [ROOM_GROUPS.WOHNEN]: 'Wohnen',
  [ROOM_GROUPS.SCHLAFEN]: 'Schlafen',
  [ROOM_GROUPS.KUECHE]: 'Küche',
  [ROOM_GROUPS.BAD]: 'Bad',
  [ROOM_GROUPS.ARBEIT]: 'Arbeit',
  [ROOM_GROUPS.VERKEHR]: 'Verkehrsflächen',
  [ROOM_GROUPS.WIRTSCHAFT]: 'Wirtschaft',
  [ROOM_GROUPS.AUSSEN]: 'Außenbereiche',
};

// ==================== VALIDIERUNG & HELPERS ====================

/**
 * Prüft, ob ein String ein gültiger Raumtyp ist
 */
export function isValidRoomType(value: string): value is RoomType {
  return ALL_ROOM_TYPES.includes(value as RoomType);
}

/**
 * Prüft, ob ein String eine gültige Orientierung ist
 */
export function isValidOrientation(value: string): value is Orientation {
  return Object.values(ORIENTATIONS).includes(value as Orientation);
}

/**
 * Gibt die Gruppe eines Raumtyps zurück
 */
export function getRoomGroup(roomType: RoomType): RoomGroup {
  return ROOM_TO_GROUP[roomType];
}

/**
 * Gibt Icon-Namen für einen Raumtyp zurück
 */
export function getRoomIcon(roomType: RoomType): string {
  return ROOM_ICONS[roomType];
}

/**
 * Prüft, ob ein Raumtyp eine Orientierung haben kann
 */
export function canHaveOrientation(roomType: RoomType): boolean {
  return ROOMS_WITH_ORIENTATION.includes(roomType);
}

/**
 * Gibt alle Raumtypen mit Metadaten zurück
 */
export function getAllRoomsWithMeta() {
  return ALL_ROOM_TYPES.map(roomType => ({
    id: roomType,
    label: roomType,
    icon: getRoomIcon(roomType),
    group: getRoomGroup(roomType),
    groupName: GROUP_DISPLAY_NAMES[getRoomGroup(roomType)],
    canHaveOrientation: canHaveOrientation(roomType),
  }));
}

// ==================== KEYBOARD SHORTCUTS ====================

/**
 * Keyboard Shortcuts für häufigste Räume (1-9, 0)
 */
export const KEYBOARD_SHORTCUTS: Record<string, RoomType> = {
  '1': 'Wohnzimmer',
  '2': 'Esszimmer',
  '3': 'Küche',
  '4': 'Bad',
  '5': 'Schlafzimmer',
  '6': 'Kinderzimmer',
  '7': 'Balkon',
  '8': 'Terrasse',
  '9': 'Flur',
  '0': 'Fassade',
};

/**
 * Reverse Mapping: Raumtyp → Tastatur-Shortcut
 */
export const SHORTCUTS_REVERSE: Record<RoomType, string | undefined> = Object.entries(KEYBOARD_SHORTCUTS)
  .reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {} as Record<RoomType, string | undefined>);

/**
 * Gibt den Shortcut für einen Raumtyp zurück (falls vorhanden)
 */
export function getShortcutForRoom(roomType: RoomType): string | undefined {
  return SHORTCUTS_REVERSE[roomType];
}

// ==================== LEGACY COMPATIBILITY ====================

/**
 * Alte Kategorie-Namen für Backward-Compatibility
 * @deprecated Verwende stattdessen ROOM_GROUPS
 */
export const ROOM_CATEGORIES = ROOM_GROUPS;
export type RoomCategory = RoomGroup;

/**
 * @deprecated Verwende stattdessen getRoomsByGroup()
 */
export const getRoomsByCategory = getRoomsByGroup;

/**
 * @deprecated Verwende stattdessen GROUP_DISPLAY_NAMES
 */
export const CATEGORY_DISPLAY_NAMES = GROUP_DISPLAY_NAMES;

/**
 * @deprecated Verwende stattdessen getRoomGroup()
 */
export const getRoomCategory = getRoomGroup;
