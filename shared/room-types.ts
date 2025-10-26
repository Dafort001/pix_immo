/**
 * Raum-Taxonomie für pix.immo
 * Version: 6.0 - Vollständige Liste
 * Stand: 2025-10-26
 * 
 * 57 Raumtypen für professionelle Immobilienfotografie
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
  SONDER: 'sonder',
  ALLGEMEIN: 'allgemein',
} as const;

export type RoomGroup = typeof ROOM_GROUPS[keyof typeof ROOM_GROUPS];

// ==================== RAUMTYPEN ====================

/**
 * Alle Raumtypen für die Kamera-App (vollständige Liste - 57 Räume)
 */
export const ALL_ROOM_TYPES = [
  // Wohnen (6)
  'Wohnzimmer',
  'Esszimmer',
  'Wohn-/Esszimmer',
  'Salon',
  'Bibliothek',
  'Wintergarten',
  
  // Schlafen (5)
  'Schlafzimmer',
  'Kinderzimmer',
  'Gästezimmer',
  'Ankleide',
  'Garderobe',
  
  // Küche (7)
  'Küche',
  'Offene Küche',
  'Wohnküche',
  'Essküche',
  'Kochnische',
  'Pantry',
  'Hauswirtschaftsraum',
  
  // Bad (8)
  'Bad',
  'Gäste-WC',
  'Duschbad',
  'Wannenbad',
  'En-Suite Bad',
  'Sauna',
  'Wellnessbereich',
  'Waschraum',
  
  // Arbeit & Hobby (4)
  'Arbeitszimmer',
  'Büro',
  'Hobbyraum',
  'Atelier',
  
  // Verkehrsflächen (6)
  'Flur',
  'Diele',
  'Eingangsbereich',
  'Galerie',
  'Treppenhaus',
  'Windfang',
  
  // Wirtschaftsräume (6)
  'Abstellraum',
  'Keller',
  'Kellerraum',
  'Vorratsraum',
  'Technikraum',
  'Garage',
  
  // Außenbereiche (8)
  'Balkon',
  'Terrasse',
  'Balkon/Terrasse',
  'Loggia',
  'Garten',
  'Vorgarten',
  'Innenhof',
  'Fassade',
  
  // Sonderräume (5)
  'Pool',
  'Fitnessraum',
  'Weinkeller',
  'Hauswirtschaft',
  'Empore',
  
  // Allgemein (2)
  'Essbereich',
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
  // Wohnen
  'Wohnzimmer': ROOM_GROUPS.WOHNEN,
  'Esszimmer': ROOM_GROUPS.WOHNEN,
  'Wohn-/Esszimmer': ROOM_GROUPS.WOHNEN,
  'Salon': ROOM_GROUPS.WOHNEN,
  'Bibliothek': ROOM_GROUPS.WOHNEN,
  'Wintergarten': ROOM_GROUPS.WOHNEN,
  
  // Schlafen
  'Schlafzimmer': ROOM_GROUPS.SCHLAFEN,
  'Kinderzimmer': ROOM_GROUPS.SCHLAFEN,
  'Gästezimmer': ROOM_GROUPS.SCHLAFEN,
  'Ankleide': ROOM_GROUPS.SCHLAFEN,
  'Garderobe': ROOM_GROUPS.SCHLAFEN,
  
  // Küche
  'Küche': ROOM_GROUPS.KUECHE,
  'Offene Küche': ROOM_GROUPS.KUECHE,
  'Wohnküche': ROOM_GROUPS.KUECHE,
  'Essküche': ROOM_GROUPS.KUECHE,
  'Kochnische': ROOM_GROUPS.KUECHE,
  'Pantry': ROOM_GROUPS.KUECHE,
  'Hauswirtschaftsraum': ROOM_GROUPS.KUECHE,
  
  // Bad
  'Bad': ROOM_GROUPS.BAD,
  'Gäste-WC': ROOM_GROUPS.BAD,
  'Duschbad': ROOM_GROUPS.BAD,
  'Wannenbad': ROOM_GROUPS.BAD,
  'En-Suite Bad': ROOM_GROUPS.BAD,
  'Sauna': ROOM_GROUPS.BAD,
  'Wellnessbereich': ROOM_GROUPS.BAD,
  'Waschraum': ROOM_GROUPS.BAD,
  
  // Arbeit
  'Arbeitszimmer': ROOM_GROUPS.ARBEIT,
  'Büro': ROOM_GROUPS.ARBEIT,
  'Hobbyraum': ROOM_GROUPS.ARBEIT,
  'Atelier': ROOM_GROUPS.ARBEIT,
  
  // Verkehr
  'Flur': ROOM_GROUPS.VERKEHR,
  'Diele': ROOM_GROUPS.VERKEHR,
  'Eingangsbereich': ROOM_GROUPS.VERKEHR,
  'Galerie': ROOM_GROUPS.VERKEHR,
  'Treppenhaus': ROOM_GROUPS.VERKEHR,
  'Windfang': ROOM_GROUPS.VERKEHR,
  
  // Wirtschaft
  'Abstellraum': ROOM_GROUPS.WIRTSCHAFT,
  'Keller': ROOM_GROUPS.WIRTSCHAFT,
  'Kellerraum': ROOM_GROUPS.WIRTSCHAFT,
  'Vorratsraum': ROOM_GROUPS.WIRTSCHAFT,
  'Technikraum': ROOM_GROUPS.WIRTSCHAFT,
  'Garage': ROOM_GROUPS.WIRTSCHAFT,
  
  // Außen
  'Balkon': ROOM_GROUPS.AUSSEN,
  'Terrasse': ROOM_GROUPS.AUSSEN,
  'Balkon/Terrasse': ROOM_GROUPS.AUSSEN,
  'Loggia': ROOM_GROUPS.AUSSEN,
  'Garten': ROOM_GROUPS.AUSSEN,
  'Vorgarten': ROOM_GROUPS.AUSSEN,
  'Innenhof': ROOM_GROUPS.AUSSEN,
  'Fassade': ROOM_GROUPS.AUSSEN,
  
  // Sonder
  'Pool': ROOM_GROUPS.SONDER,
  'Fitnessraum': ROOM_GROUPS.SONDER,
  'Weinkeller': ROOM_GROUPS.SONDER,
  'Hauswirtschaft': ROOM_GROUPS.SONDER,
  'Empore': ROOM_GROUPS.SONDER,
  
  // Allgemein
  'Essbereich': ROOM_GROUPS.ALLGEMEIN,
  'Raum (unbestimmt)': ROOM_GROUPS.ALLGEMEIN,
};

// ==================== ICON-ZUORDNUNG ====================

/**
 * Lucide Icons für jeden Raumtyp
 */
export const ROOM_ICONS: Record<RoomType, string> = {
  // Wohnen
  'Wohnzimmer': 'sofa',
  'Esszimmer': 'utensils',
  'Wohn-/Esszimmer': 'home',
  'Salon': 'armchair',
  'Bibliothek': 'book-open',
  'Wintergarten': 'flower-2',
  
  // Schlafen
  'Schlafzimmer': 'bed',
  'Kinderzimmer': 'baby',
  'Gästezimmer': 'bed-double',
  'Ankleide': 'shirt',
  'Garderobe': 'coat-hanger',
  
  // Küche
  'Küche': 'chef-hat',
  'Offene Küche': 'cooking-pot',
  'Wohnküche': 'utensils-crossed',
  'Essküche': 'fork-knife',
  'Kochnische': 'microwave',
  'Pantry': 'refrigerator',
  'Hauswirtschaftsraum': 'washing-machine',
  
  // Bad
  'Bad': 'bath',
  'Gäste-WC': 'toilet',
  'Duschbad': 'shower-head',
  'Wannenbad': 'bath',
  'En-Suite Bad': 'bath',
  'Sauna': 'thermometer',
  'Wellnessbereich': 'sparkles',
  'Waschraum': 'droplets',
  
  // Arbeit
  'Arbeitszimmer': 'briefcase',
  'Büro': 'laptop',
  'Hobbyraum': 'palette',
  'Atelier': 'paintbrush',
  
  // Verkehr
  'Flur': 'door-open',
  'Diele': 'move',
  'Eingangsbereich': 'door-closed',
  'Galerie': 'gallery-vertical',
  'Treppenhaus': 'stairs',
  'Windfang': 'wind',
  
  // Wirtschaft
  'Abstellraum': 'archive',
  'Keller': 'box',
  'Kellerraum': 'package',
  'Vorratsraum': 'package-check',
  'Technikraum': 'cog',
  'Garage': 'car',
  
  // Außen
  'Balkon': 'sun',
  'Terrasse': 'sun-medium',
  'Balkon/Terrasse': 'sun',
  'Loggia': 'square-dashed',
  'Garten': 'leaf',
  'Vorgarten': 'tree-deciduous',
  'Innenhof': 'square',
  'Fassade': 'building',
  
  // Sonder
  'Pool': 'waves',
  'Fitnessraum': 'dumbbell',
  'Weinkeller': 'wine',
  'Hauswirtschaft': 'home',
  'Empore': 'arrow-up-circle',
  
  // Allgemein
  'Essbereich': 'utensils',
  'Raum (unbestimmt)': 'square',
};

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
    [ROOM_GROUPS.SONDER]: [],
    [ROOM_GROUPS.ALLGEMEIN]: [],
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
  [ROOM_GROUPS.BAD]: 'Bad & Wellness',
  [ROOM_GROUPS.ARBEIT]: 'Arbeit & Hobby',
  [ROOM_GROUPS.VERKEHR]: 'Verkehrsflächen',
  [ROOM_GROUPS.WIRTSCHAFT]: 'Wirtschaft',
  [ROOM_GROUPS.AUSSEN]: 'Außenbereiche',
  [ROOM_GROUPS.SONDER]: 'Sonderräume',
  [ROOM_GROUPS.ALLGEMEIN]: 'Allgemein',
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
    groupName: GROUP_DISPLAY_NAMES[getRoomGroup(roomType)],
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
  '6': 'Balkon/Terrasse',
  '7': 'Garten',
  '8': 'Flur',
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
