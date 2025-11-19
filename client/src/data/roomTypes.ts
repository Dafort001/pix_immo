export interface RoomType {
  value: string;
  label: string;
}

export interface RoomGroup {
  groupName: string;
  rooms: RoomType[];
}

export const roomGroups: RoomGroup[] = [
  {
    groupName: "Wohnbereiche",
    rooms: [
      { value: "living_room", label: "Wohnzimmer" },
      { value: "dining_area", label: "Essbereich" },
      { value: "kitchen_dining", label: "Wohnküche (offen)" },
      { value: "kitchen", label: "Küche" },
      { value: "living_dining_combined", label: "Wohn-/Esszimmer kombiniert" },
      { value: "office", label: "Arbeitszimmer/Büro" },
    ],
  },
  {
    groupName: "Schlafbereiche",
    rooms: [
      { value: "bedroom_master", label: "Schlafzimmer" },
      { value: "bedroom_child", label: "Kinderzimmer" },
      { value: "bedroom_guest", label: "Gästezimmer" },
      { value: "dressing_room", label: "Ankleidezimmer" },
    ],
  },
  {
    groupName: "Bäder & Sanitär",
    rooms: [
      { value: "bathroom_main", label: "Badezimmer" },
      { value: "bathroom_guest", label: "Gäste-WC" },
    ],
  },
  {
    groupName: "Flure & Übergänge",
    rooms: [
      { value: "entry", label: "Eingangsbereich" },
      { value: "hallway", label: "Flur" },
      { value: "staircase", label: "Treppenhaus" },
    ],
  },
  {
    groupName: "Funktionsräume",
    rooms: [
      { value: "storage_room", label: "Abstellraum" },
      { value: "utility_room", label: "Hauswirtschaftsraum" },
      { value: "laundry_room", label: "Waschküche" },
      { value: "hobby_room", label: "Hobbyraum" },
      { value: "fitness_room", label: "Fitnessraum" },
      { value: "basement", label: "Keller" },
      { value: "attic", label: "Dachboden" },
    ],
  },
  {
    groupName: "Außenbereiche",
    rooms: [
      { value: "balcony", label: "Balkon" },
      { value: "terrace", label: "Terrasse" },
      { value: "wintergarden", label: "Wintergarten" },
      { value: "garden", label: "Garten" },
      { value: "outdoor_area", label: "Außenansicht" },
      { value: "facade", label: "Fassade" },
      { value: "parking_space", label: "Parkplatz" },
      { value: "garage", label: "Garage" },
    ],
  },
  {
    groupName: "Spezialräume",
    rooms: [
      { value: "technical_room", label: "Technikraum" },
      { value: "heating_room", label: "Heizungsraum" },
      { value: "multipurpose_room", label: "Mehrzweckraum" },
    ],
  },
  {
    groupName: "Fallback",
    rooms: [
      { value: "undefined_space", label: "Raum unbestimmt" },
    ],
  },
];

export function getRoomLabelByValue(key: string): string {
  if (!key) return "Nicht zugewiesen";
  
  for (const group of roomGroups) {
    const room = group.rooms.find((r) => r.value === key);
    if (room) return room.label;
  }
  
  return key;
}
