/**
 * Raum-Taxonomie für pix.immo
 * Version: 4.0
 * Stand: 2025-10-25
 * 
 * Vollständige Liste aller Raumtypen für Immobilienfotografie
 */

// ==================== KATEGORIEN ====================

export const ROOM_CATEGORIES = {
  WOHNBEREICHE: 'wohnbereiche',
  SCHLAFBEREICHE: 'schlafbereiche',
  SANITAER: 'sanitaer',
  ARBEIT_HOBBY: 'arbeit_hobby',
  AUSSENBEREICHE: 'aussenbereiche',
  NEBENRAEUME: 'nebenraeume',
  KELLER_DACH: 'keller_dach',
  AUSSENANSICHTEN: 'aussenansichten',
  SONSTIGES: 'sonstiges',
} as const;

export type RoomCategory = typeof ROOM_CATEGORIES[keyof typeof ROOM_CATEGORIES];

// ==================== RAUMTYPEN ====================

/**
 * Alle Raumtypen für die Kamera-App
 * Direkt verwendbar als Display-Namen
 */
export const ALL_ROOM_TYPES = [
  // Wohnbereiche
  'Wohnzimmer',
  'Esszimmer',
  'Küche',
  'Offene Küche',
  'Essbereich',
  'Flur/Eingang',
  'Diele',
  'Galerie',
  'Wintergarten',
  
  // Schlafbereiche
  'Schlafzimmer',
  'Hauptschlafzimmer',
  'Kinderzimmer',
  'Gästezimmer',
  'Ankleidezimmer',
  
  // Sanitär
  'Badezimmer',
  'Gästebad',
  'Hauptbad',
  'En-Suite Bad',
  'WC',
  'Sauna',
  'Wellness',
  
  // Arbeit/Hobby
  'Arbeitszimmer',
  'Homeoffice',
  'Bibliothek',
  'Hobbyraum',
  'Atelier',
  
  // Außenbereiche
  'Balkon',
  'Terrasse',
  'Loggia',
  'Dachterrasse',
  'Garten',
  'Innenhof',
  'Pool',
  'Poolhaus',
  
  // Nebenräume
  'Abstellraum',
  'Hauswirtschaftsraum',
  'Waschküche',
  'Speisekammer',
  'Garderobe',
  
  // Keller/Dach
  'Keller',
  'Weinkeller',
  'Fitnessraum',
  'Partyraum',
  'Dachboden',
  
  // Außenansichten
  'Außenansicht Vorne',
  'Außenansicht Hinten',
  'Außenansicht Seitlich',
  'Fassade',
  'Eingangsbereich',
  'Carport',
  'Garage',
  
  // Sonstiges
  'Treppenhaus',
  'Gemeinschaftsraum',
  'Sonstiges'
] as const;

export type RoomType = typeof ALL_ROOM_TYPES[number];

/**
 * Standard-Fallback für nicht klassifizierte Räume
 */
export const DEFAULT_ROOM_TYPE: RoomType = 'Sonstiges';

// ==================== KATEGORIEZUORDNUNG ====================

/**
 * Mapping: Raumtyp → Kategorie
 */
export const ROOM_TO_CATEGORY: Record<RoomType, RoomCategory> = {
  // Wohnbereiche
  'Wohnzimmer': ROOM_CATEGORIES.WOHNBEREICHE,
  'Esszimmer': ROOM_CATEGORIES.WOHNBEREICHE,
  'Küche': ROOM_CATEGORIES.WOHNBEREICHE,
  'Offene Küche': ROOM_CATEGORIES.WOHNBEREICHE,
  'Essbereich': ROOM_CATEGORIES.WOHNBEREICHE,
  'Flur/Eingang': ROOM_CATEGORIES.WOHNBEREICHE,
  'Diele': ROOM_CATEGORIES.WOHNBEREICHE,
  'Galerie': ROOM_CATEGORIES.WOHNBEREICHE,
  'Wintergarten': ROOM_CATEGORIES.WOHNBEREICHE,
  
  // Schlafbereiche
  'Schlafzimmer': ROOM_CATEGORIES.SCHLAFBEREICHE,
  'Hauptschlafzimmer': ROOM_CATEGORIES.SCHLAFBEREICHE,
  'Kinderzimmer': ROOM_CATEGORIES.SCHLAFBEREICHE,
  'Gästezimmer': ROOM_CATEGORIES.SCHLAFBEREICHE,
  'Ankleidezimmer': ROOM_CATEGORIES.SCHLAFBEREICHE,
  
  // Sanitär
  'Badezimmer': ROOM_CATEGORIES.SANITAER,
  'Gästebad': ROOM_CATEGORIES.SANITAER,
  'Hauptbad': ROOM_CATEGORIES.SANITAER,
  'En-Suite Bad': ROOM_CATEGORIES.SANITAER,
  'WC': ROOM_CATEGORIES.SANITAER,
  'Sauna': ROOM_CATEGORIES.SANITAER,
  'Wellness': ROOM_CATEGORIES.SANITAER,
  
  // Arbeit/Hobby
  'Arbeitszimmer': ROOM_CATEGORIES.ARBEIT_HOBBY,
  'Homeoffice': ROOM_CATEGORIES.ARBEIT_HOBBY,
  'Bibliothek': ROOM_CATEGORIES.ARBEIT_HOBBY,
  'Hobbyraum': ROOM_CATEGORIES.ARBEIT_HOBBY,
  'Atelier': ROOM_CATEGORIES.ARBEIT_HOBBY,
  
  // Außenbereiche
  'Balkon': ROOM_CATEGORIES.AUSSENBEREICHE,
  'Terrasse': ROOM_CATEGORIES.AUSSENBEREICHE,
  'Loggia': ROOM_CATEGORIES.AUSSENBEREICHE,
  'Dachterrasse': ROOM_CATEGORIES.AUSSENBEREICHE,
  'Garten': ROOM_CATEGORIES.AUSSENBEREICHE,
  'Innenhof': ROOM_CATEGORIES.AUSSENBEREICHE,
  'Pool': ROOM_CATEGORIES.AUSSENBEREICHE,
  'Poolhaus': ROOM_CATEGORIES.AUSSENBEREICHE,
  
  // Nebenräume
  'Abstellraum': ROOM_CATEGORIES.NEBENRAEUME,
  'Hauswirtschaftsraum': ROOM_CATEGORIES.NEBENRAEUME,
  'Waschküche': ROOM_CATEGORIES.NEBENRAEUME,
  'Speisekammer': ROOM_CATEGORIES.NEBENRAEUME,
  'Garderobe': ROOM_CATEGORIES.NEBENRAEUME,
  
  // Keller/Dach
  'Keller': ROOM_CATEGORIES.KELLER_DACH,
  'Weinkeller': ROOM_CATEGORIES.KELLER_DACH,
  'Fitnessraum': ROOM_CATEGORIES.KELLER_DACH,
  'Partyraum': ROOM_CATEGORIES.KELLER_DACH,
  'Dachboden': ROOM_CATEGORIES.KELLER_DACH,
  
  // Außenansichten
  'Außenansicht Vorne': ROOM_CATEGORIES.AUSSENANSICHTEN,
  'Außenansicht Hinten': ROOM_CATEGORIES.AUSSENANSICHTEN,
  'Außenansicht Seitlich': ROOM_CATEGORIES.AUSSENANSICHTEN,
  'Fassade': ROOM_CATEGORIES.AUSSENANSICHTEN,
  'Eingangsbereich': ROOM_CATEGORIES.AUSSENANSICHTEN,
  'Carport': ROOM_CATEGORIES.AUSSENANSICHTEN,
  'Garage': ROOM_CATEGORIES.AUSSENANSICHTEN,
  
  // Sonstiges
  'Treppenhaus': ROOM_CATEGORIES.SONSTIGES,
  'Gemeinschaftsraum': ROOM_CATEGORIES.SONSTIGES,
  'Sonstiges': ROOM_CATEGORIES.SONSTIGES,
};

// ==================== GRUPPIERUNG NACH KATEGORIE ====================

/**
 * Gruppiert alle Raumtypen nach Kategorie für UI-Darstellung
 */
export function getRoomsByCategory(): Record<RoomCategory, RoomType[]> {
  const groups: Record<RoomCategory, RoomType[]> = {
    [ROOM_CATEGORIES.WOHNBEREICHE]: [],
    [ROOM_CATEGORIES.SCHLAFBEREICHE]: [],
    [ROOM_CATEGORIES.SANITAER]: [],
    [ROOM_CATEGORIES.ARBEIT_HOBBY]: [],
    [ROOM_CATEGORIES.AUSSENBEREICHE]: [],
    [ROOM_CATEGORIES.NEBENRAEUME]: [],
    [ROOM_CATEGORIES.KELLER_DACH]: [],
    [ROOM_CATEGORIES.AUSSENANSICHTEN]: [],
    [ROOM_CATEGORIES.SONSTIGES]: [],
  };

  ALL_ROOM_TYPES.forEach(room => {
    const category = ROOM_TO_CATEGORY[room];
    groups[category].push(room);
  });

  return groups;
}

/**
 * Kategorie-Anzeigenamen für UI
 */
export const CATEGORY_DISPLAY_NAMES: Record<RoomCategory, string> = {
  [ROOM_CATEGORIES.WOHNBEREICHE]: 'Wohnbereiche',
  [ROOM_CATEGORIES.SCHLAFBEREICHE]: 'Schlafbereiche',
  [ROOM_CATEGORIES.SANITAER]: 'Sanitär',
  [ROOM_CATEGORIES.ARBEIT_HOBBY]: 'Arbeit/Hobby',
  [ROOM_CATEGORIES.AUSSENBEREICHE]: 'Außenbereiche',
  [ROOM_CATEGORIES.NEBENRAEUME]: 'Nebenräume',
  [ROOM_CATEGORIES.KELLER_DACH]: 'Keller/Dach',
  [ROOM_CATEGORIES.AUSSENANSICHTEN]: 'Außenansichten',
  [ROOM_CATEGORIES.SONSTIGES]: 'Sonstiges',
};

// ==================== VALIDIERUNG & HELPERS ====================

/**
 * Prüft, ob ein String ein gültiger Raumtyp ist
 */
export function isValidRoomType(value: string): value is RoomType {
  return ALL_ROOM_TYPES.includes(value as RoomType);
}

/**
 * Gibt die Kategorie eines Raumtyps zurück
 */
export function getRoomCategory(roomType: RoomType): RoomCategory {
  return ROOM_TO_CATEGORY[roomType];
}

/**
 * Gibt alle Raumtypen mit Kategorie zurück
 */
export function getAllRoomsWithMeta() {
  return ALL_ROOM_TYPES.map(roomType => ({
    id: roomType,
    name: roomType, // Display-Name ist identisch
    category: getRoomCategory(roomType),
  }));
}

// ==================== LEGACY COMPATIBILITY ====================

/**
 * Display-Namen (für Backward-Compatibility)
 * In v4.0 sind die Raumtypen bereits in lesbarer Form
 */
export const ROOM_DISPLAY_NAMES: Record<RoomType, string> = ALL_ROOM_TYPES.reduce((acc, room) => {
  acc[room] = room;
  return acc;
}, {} as Record<RoomType, string>);

/**
 * Keyboard Shortcuts für häufigste Räume (1-9, 0)
 */
export const KEYBOARD_SHORTCUTS: Record<string, RoomType> = {
  '1': 'Wohnzimmer',
  '2': 'Schlafzimmer',
  '3': 'Küche',
  '4': 'Badezimmer',
  '5': 'Esszimmer',
  '6': 'Balkon',
  '7': 'Terrasse',
  '8': 'Garten',
  '9': 'Außenansicht Vorne',
  '0': 'Sonstiges',
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
