/**
 * Raum-Taxonomie für pix.immo
 * Version: 5.0 - Vereinfachte Liste
 * Stand: 2025-10-26
 * 
 * Reduziert auf 14 essenzielle Raumtypen für Mobile-First Workflow
 */

// ==================== GRUPPEN ====================

export const ROOM_GROUPS = {
  INNEN: 'innen',
  AUSSEN: 'außen',
  ALLGEMEIN: 'allgemein',
  FALLBACK: 'fallback',
} as const;

export type RoomGroup = typeof ROOM_GROUPS[keyof typeof ROOM_GROUPS];

// ==================== RAUMTYPEN ====================

/**
 * Alle Raumtypen für die Kamera-App (vereinfachte Liste)
 */
export const ALL_ROOM_TYPES = [
  // Innen (7 Räume)
  'Wohnzimmer',
  'Küche',
  'Bad',
  'Schlafzimmer',
  'Flur',
  'Arbeitszimmer',
  
  // Außen (3 Räume)
  'Balkon/Terrasse',
  'Garten',
  'Fassade',
  
  // Allgemein (3 Räume)
  'Treppenhaus',
  'Keller',
  'Abstellraum',
  'Technikraum',
  
  // Fallback (1 Raum)
  'Raum (unbestimmt)',
] as const;

export type RoomType = typeof ALL_ROOM_TYPES[number];

/**
 * Standard-Fallback für nicht klassifizierte Räume
 */
export const DEFAULT_ROOM_TYPE: RoomType = 'Raum (unbestimmt)';

// ==================== GRUPPENZUORDNUNG ====================

/**
 * Mapping: Raumtyp → Gruppe
 */
export const ROOM_TO_GROUP: Record<RoomType, RoomGroup> = {
  // Innen
  'Wohnzimmer': ROOM_GROUPS.INNEN,
  'Küche': ROOM_GROUPS.INNEN,
  'Bad': ROOM_GROUPS.INNEN,
  'Schlafzimmer': ROOM_GROUPS.INNEN,
  'Flur': ROOM_GROUPS.INNEN,
  'Arbeitszimmer': ROOM_GROUPS.INNEN,
  
  // Außen
  'Balkon/Terrasse': ROOM_GROUPS.AUSSEN,
  'Garten': ROOM_GROUPS.AUSSEN,
  'Fassade': ROOM_GROUPS.AUSSEN,
  
  // Allgemein
  'Treppenhaus': ROOM_GROUPS.ALLGEMEIN,
  'Keller': ROOM_GROUPS.ALLGEMEIN,
  'Abstellraum': ROOM_GROUPS.ALLGEMEIN,
  'Technikraum': ROOM_GROUPS.ALLGEMEIN,
  
  // Fallback
  'Raum (unbestimmt)': ROOM_GROUPS.FALLBACK,
};

// ==================== ICON-ZUORDNUNG ====================

/**
 * Lucide Icons für jeden Raumtyp
 */
export const ROOM_ICONS: Record<RoomType, string> = {
  'Wohnzimmer': 'sofa',
  'Küche': 'utensils',
  'Bad': 'bath',
  'Schlafzimmer': 'bed',
  'Flur': 'door-open',
  'Arbeitszimmer': 'briefcase',
  'Balkon/Terrasse': 'sun',
  'Garten': 'leaf',
  'Fassade': 'building',
  'Treppenhaus': 'stairs',
  'Keller': 'box',
  'Abstellraum': 'archive',
  'Technikraum': 'cog',
  'Raum (unbestimmt)': 'square',
};

// ==================== GRUPPIERUNG NACH GRUPPE ====================

/**
 * Gruppiert alle Raumtypen nach Gruppe für UI-Darstellung
 */
export function getRoomsByGroup(): Record<RoomGroup, RoomType[]> {
  const groups: Record<RoomGroup, RoomType[]> = {
    [ROOM_GROUPS.INNEN]: [],
    [ROOM_GROUPS.AUSSEN]: [],
    [ROOM_GROUPS.ALLGEMEIN]: [],
    [ROOM_GROUPS.FALLBACK]: [],
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
  [ROOM_GROUPS.INNEN]: 'Innenräume',
  [ROOM_GROUPS.AUSSEN]: 'Außenbereiche',
  [ROOM_GROUPS.ALLGEMEIN]: 'Allgemeine Räume',
  [ROOM_GROUPS.FALLBACK]: 'Unbestimmt',
};

// ==================== VALIDIERUNG & HELPERS ====================

/**
 * Prüft, ob ein String ein gültiger Raumtyp ist
 */
export function isValidRoomType(value: string): value is RoomType {
  return ALL_ROOM_TYPES.includes(value as RoomType);
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
 * Gibt alle Raumtypen mit Metadaten zurück
 */
export function getAllRoomsWithMeta() {
  return ALL_ROOM_TYPES.map(roomType => ({
    id: roomType,
    label: roomType,
    icon: getRoomIcon(roomType),
    group: getRoomGroup(roomType),
  }));
}

// ==================== KEYBOARD SHORTCUTS ====================

/**
 * Keyboard Shortcuts für häufigste Räume (1-9, 0)
 */
export const KEYBOARD_SHORTCUTS: Record<string, RoomType> = {
  '1': 'Wohnzimmer',
  '2': 'Schlafzimmer',
  '3': 'Küche',
  '4': 'Bad',
  '5': 'Balkon/Terrasse',
  '6': 'Garten',
  '7': 'Fassade',
  '8': 'Keller',
  '9': 'Arbeitszimmer',
  '0': 'Raum (unbestimmt)',
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
