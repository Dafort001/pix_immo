/**
 * Seed Script: Media Library Import
 * 
 * Importiert statische Bilder aus client/src/data/images.ts in die public_images Tabelle
 * Macht Homepage- und Portfolio-Bilder in der Admin Media Library sichtbar
 * 
 * Usage: tsx server/seed-media-library.ts
 */

import { storage } from "./storage";
import { ulid } from "ulid";

// Importiere die statischen Bilddaten
interface ImageAsset {
  id: string;
  url: string;
  alt: string;
  page: string;
  description?: string;
}

// HOMEPAGE IMAGES
const homePageImages: ImageAsset[] = [
  {
    id: "home-001",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2MjA4ODg1N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Modern House Exterior",
    page: "home",
    description: "Modernes Einfamilienhaus Außenansicht",
  },
  {
    id: "home-002",
    url: "https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjIwNzIxODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Luxury Apartment Interior",
    page: "home",
    description: "Luxuriöses Apartment Innenansicht",
  },
  {
    id: "home-003",
    url: "https://images.unsplash.com/photo-1654176154397-3133364f22e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NjIxMDExODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Real Estate Kitchen",
    page: "home",
    description: "Moderne Küche für Immobilienexposé",
  },
  {
    id: "home-004",
    url: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc2MjA5ODAwMnww&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Modern Living Room",
    page: "home",
    description: "Modernes Wohnzimmer",
  },
  {
    id: "home-005",
    url: "https://images.unsplash.com/photo-1630699376682-84df40131d22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBiYWxjb255JTIwdmlld3xlbnwxfHx8fDE3NjIwMTc0NDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Apartment Balcony View",
    page: "home",
    description: "Balkon mit Ausblick",
  },
  {
    id: "home-006",
    url: "https://images.unsplash.com/photo-1638799869566-b17fa794c4de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiYXRocm9vbXxlbnwxfHx8fDE3NjIwMjYyNDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Modern Bathroom",
    page: "home",
    description: "Modernes Badezimmer",
  },
  {
    id: "home-007",
    url: "https://images.unsplash.com/photo-1712079081178-a77e00259252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGZhY2FkZSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjIxMDExODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "House Facade Architecture",
    page: "home",
    description: "Hausfassade Architektur",
  },
  {
    id: "home-008",
    url: "https://images.unsplash.com/photo-1625579002297-aeebbf69de89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYyMDkyNzQyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Luxury Bedroom Interior",
    page: "home",
    description: "Luxuriöses Schlafzimmer",
  },
  {
    id: "home-009",
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBzcGFjZXxlbnwxfHx8fDE3NjIwOTQ3OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Modern Office Space",
    page: "home",
    description: "Moderner Büroraum",
  },
];

// PIXCAPTURE IMAGES
const pixCaptureImages: ImageAsset[] = [
  {
    id: "pixcap-001",
    url: "https://images.unsplash.com/photo-1739712039253-324be4f33543?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjBjYW1lcmElMjBwaG90b2dyYXBoeSUyMGhhbmRzfGVufDF8fHx8MTc2MjQxNDYyOXww&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "iPhone Camera Photography",
    page: "pixcapture",
    description: "Mit dem iPhone fotografieren",
  },
  {
    id: "pixcap-002",
    url: "https://images.unsplash.com/photo-1749898750456-156660b1ac80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjB0YWtpbmclMjByZWFsJTIwZXN0YXRlJTIwcGhvdG98ZW58MXx8fHwxNzYyNDE0NjI5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Person Taking Real Estate Photo",
    page: "pixcapture",
    description: "Self-Service Immobilienfotografie",
  },
  {
    id: "pixcap-003",
    url: "https://images.unsplash.com/photo-1753685725168-10576bc8436f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwYXBhcnRtZW50JTIwcGhvdG98ZW58MXx8fHwxNzYyNDE0NjI5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Smartphone Apartment Photo",
    page: "pixcapture",
    description: "Wohnung mit Smartphone fotografieren",
  },
  {
    id: "pixcap-004",
    url: "https://images.unsplash.com/photo-1592920746120-6fbb741b4310?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBwaG90b2dyYXBoeSUyMGhvdXNlfGVufDF8fHx8MTc2MjQxNDYzMHww&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Mobile Photography House",
    page: "pixcapture",
    description: "Mobile Fotografie für Immobilien",
  },
  {
    id: "pixcap-005",
    url: "https://images.unsplash.com/photo-1655292913700-bbdb7c40adc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjByZWFsJTIwZXN0YXRlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYyNDE0NjMwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "iPhone Real Estate Interior",
    page: "pixcapture",
    description: "Innenräume mit iPhone",
  },
  {
    id: "pixcap-006",
    url: "https://images.unsplash.com/photo-1655457252959-7d5872e7fdb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWxmJTIwc2VydmljZSUyMHBob3RvZ3JhcGh5JTIwYXBhcnRtZW50fGVufDF8fHx8MTc2MjQxNDYzMXww&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Self-Service Photography",
    page: "pixcapture",
    description: "Selbst fotografieren und hochladen",
  },
  {
    id: "pixcap-007",
    url: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc2MjA5ODAwMnww&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Modern Living Room",
    page: "pixcapture",
    description: "Wohnzimmer fotografieren",
  },
  {
    id: "pixcap-008",
    url: "https://images.unsplash.com/photo-1654176154397-3133364f22e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NjIxMDExODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    alt: "Real Estate Kitchen",
    page: "pixcapture",
    description: "Küche fotografieren",
  },
];

// GALLERY IMAGES (Portfolio Page) - All 45 images from gallery.tsx
const galleryImages: ImageAsset[] = [
  { id: "gallery-001", url: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1500&h=1000&fit=crop", alt: "Modern living room with floor-to-ceiling windows", page: "gallery", description: "Portfolio: Modernes Wohnzimmer mit bodentiefen Fenstern" },
  { id: "gallery-002", url: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1500&h=1000&fit=crop", alt: "Luxury kitchen with marble countertops and island", page: "gallery", description: "Portfolio: Luxusküche mit Marmor und Kochinsel" },
  { id: "gallery-003", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&h=1500&fit=crop", alt: "Grand staircase with wrought iron railing", page: "gallery", description: "Portfolio: Repräsentatives Treppenhaus mit schmiedeeisernem Geländer" },
  { id: "gallery-004", url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1500&h=1000&fit=crop", alt: "Spacious master bedroom with king bed", page: "gallery", description: "Portfolio: Geräumiges Hauptschlafzimmer mit Kingsize-Bett" },
  { id: "gallery-005", url: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1500&h=1000&fit=crop", alt: "Elegant bathroom with modern fixtures and tub", page: "gallery", description: "Portfolio: Elegantes Badezimmer mit moderner Ausstattung" },
  { id: "gallery-006", url: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1500&h=1000&fit=crop", alt: "Beautiful backyard with swimming pool and patio", page: "gallery", description: "Portfolio: Traumhafter Garten mit Pool und Terrasse" },
  { id: "gallery-007", url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1000&h=1500&fit=crop", alt: "Tall ceiling in great room", page: "gallery", description: "Portfolio: Hohe Decken im Wohnbereich" },
  { id: "gallery-008", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1500&h=1000&fit=crop", alt: "Contemporary home exterior with modern architecture", page: "gallery", description: "Portfolio: Zeitgenössische Architektur Außenansicht" },
  { id: "gallery-009", url: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1500&h=1000&fit=crop", alt: "Cozy dining area with pendant lighting", page: "gallery", description: "Portfolio: Gemütlicher Essbereich mit Pendelleuchten" },
  { id: "gallery-010", url: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1000&h=1000&fit=crop", alt: "Circular dining table with modern chairs", page: "gallery", description: "Portfolio: Runder Esstisch mit modernen Stühlen" },
  { id: "gallery-011", url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1500&h=1000&fit=crop", alt: "Modern apartment building with glass facade", page: "gallery", description: "Portfolio: Modernes Apartmenthaus mit Glasfassade" },
  { id: "gallery-012", url: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1500&h=1000&fit=crop", alt: "Luxurious penthouse with city views", page: "gallery", description: "Portfolio: Luxuriöses Penthouse mit Stadtblick" },
  { id: "gallery-013", url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1000&h=1500&fit=crop", alt: "Floor-to-ceiling window wall", page: "gallery", description: "Portfolio: Bodentiefe Fensterwand" },
  { id: "gallery-014", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1500&h=1000&fit=crop", alt: "Charming cottage exterior with garden", page: "gallery", description: "Portfolio: Charmantes Cottage mit Garten" },
  { id: "gallery-015", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1500&h=1000&fit=crop", alt: "Renovated loft space with exposed brick", page: "gallery", description: "Portfolio: Renovierter Loft mit Ziegelwand" },
  { id: "gallery-016", url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1500&h=1000&fit=crop", alt: "Open concept kitchen and living area", page: "gallery", description: "Portfolio: Offene Küche mit Wohnbereich" },
  { id: "gallery-017", url: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1000&h=1000&fit=crop", alt: "Reading nook with armchair", page: "gallery", description: "Portfolio: Leseecke mit Sessel" },
  { id: "gallery-018", url: "https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1500&h=1000&fit=crop", alt: "Sunlit guest bedroom with neutral tones", page: "gallery", description: "Portfolio: Lichtdurchflutetes Gästezimmer in neutralen Tönen" },
  { id: "gallery-019", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1000&h=1500&fit=crop", alt: "Two-story living room with chandelier", page: "gallery", description: "Portfolio: Zweigeschossiges Wohnzimmer mit Kronleuchter" },
  { id: "gallery-020", url: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1500&h=1000&fit=crop", alt: "Spa-like bathroom with rainfall shower", page: "gallery", description: "Portfolio: Spa-ähnliches Badezimmer mit Regendusche" },
  { id: "gallery-021", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1500&h=1000&fit=crop", alt: "Balcony terrace with outdoor furniture", page: "gallery", description: "Portfolio: Balkonterrasse mit Gartenmöbeln" },
  { id: "gallery-022", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&h=1000&fit=crop", alt: "Powder room with vessel sink", page: "gallery", description: "Portfolio: Gäste-WC mit Aufsatzwaschbecken" },
  { id: "gallery-023", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1500&h=1000&fit=crop", alt: "Wine cellar with custom storage", page: "gallery", description: "Portfolio: Weinkeller mit maßgefertigter Lagerung" },
  { id: "gallery-024", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&h=1500&fit=crop", alt: "Vertical garden wall in entryway", page: "gallery", description: "Portfolio: Vertikale Gartenwand im Eingangsbereich" },
  { id: "gallery-025", url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1500&h=1000&fit=crop", alt: "Media room with projection screen", page: "gallery", description: "Portfolio: Medienraum mit Projektionsleinwand" },
  { id: "gallery-026", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1500&h=1000&fit=crop", alt: "Fitness room with equipment and mirrors", page: "gallery", description: "Portfolio: Fitnessraum mit Geräten und Spiegeln" },
  { id: "gallery-027", url: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1500&h=1000&fit=crop", alt: "Library with built-in bookshelves", page: "gallery", description: "Portfolio: Bibliothek mit eingebauten Bücherregalen" },
  { id: "gallery-028", url: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1000&h=1000&fit=crop", alt: "Built-in window seat with cushions", page: "gallery", description: "Portfolio: Eingebauter Fensterplatz mit Kissen" },
  { id: "gallery-029", url: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1500&h=1000&fit=crop", alt: "Chef's kitchen with professional appliances", page: "gallery", description: "Portfolio: Kochküche mit Profi-Geräten" },
  { id: "gallery-030", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1500&h=1000&fit=crop", alt: "Walk-in closet with custom cabinetry", page: "gallery", description: "Portfolio: Begehbarer Kleiderschrank mit maßgefertigten Schränken" },
  { id: "gallery-031", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1500&h=1000&fit=crop", alt: "Laundry room with washer and dryer", page: "gallery", description: "Portfolio: Waschküche mit Waschmaschine und Trockner" },
  { id: "gallery-032", url: "https://images.unsplash.com/photo-1600210492497-9a3a56c88b24?w=1500&h=1000&fit=crop", alt: "Breakfast nook with bay windows", page: "gallery", description: "Portfolio: Frühstücksecke mit Erkerfenstern" },
  { id: "gallery-033", url: "https://images.unsplash.com/photo-1600210492497-9a3a56c88b24?w=1000&h=1000&fit=crop", alt: "Corner fireplace with mantel", page: "gallery", description: "Portfolio: Eckkamin mit Kaminsims" },
  { id: "gallery-034", url: "https://images.unsplash.com/photo-1600210492497-9a3a56c88b24?w=1500&h=1000&fit=crop", alt: "Game room with pool table", page: "gallery", description: "Portfolio: Spielzimmer mit Billardtisch" },
  { id: "gallery-035", url: "https://images.unsplash.com/photo-1600210492497-9a3a56c88b24?w=1500&h=1000&fit=crop", alt: "Mudroom with storage benches", page: "gallery", description: "Portfolio: Garderobe mit Sitzbänken und Stauraum" },
  { id: "gallery-036", url: "https://images.unsplash.com/photo-1600210492497-9a3a56c88b24?w=1500&h=1000&fit=crop", alt: "Pantry with organized shelving", page: "gallery", description: "Portfolio: Vorratskammer mit organisierten Regalen" },
  { id: "gallery-037", url: "https://images.unsplash.com/photo-1600210492497-9a3a56c88b24?w=1500&h=1000&fit=crop", alt: "Nursery with crib and changing table", page: "gallery", description: "Portfolio: Kinderzimmer mit Babybett und Wickeltisch" },
  { id: "gallery-038", url: "https://images.unsplash.com/photo-1600210492497-9a3a56c88b24?w=1500&h=1000&fit=crop", alt: "Craft room with work surfaces", page: "gallery", description: "Portfolio: Bastelzimmer mit Arbeitsflächen" },
  { id: "gallery-039", url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1500&h=1000&fit=crop", alt: "Outdoor kitchen with grill station", page: "gallery", description: "Portfolio: Außenküche mit Grillstation" },
  { id: "gallery-040", url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1500&h=1000&fit=crop", alt: "Fire pit seating area", page: "gallery", description: "Portfolio: Sitzbereich mit Feuerstelle" },
  { id: "gallery-041", url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1500&h=1000&fit=crop", alt: "Garden pathway with landscaping", page: "gallery", description: "Portfolio: Gartenweg mit Landschaftsgestaltung" },
  { id: "gallery-042", url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1500&h=1000&fit=crop", alt: "Three-car garage with storage", page: "gallery", description: "Portfolio: Dreifachgarage mit Stauraum" },
  { id: "gallery-043", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1500&h=1000&fit=crop", alt: "Home office with natural light and desk setup", page: "gallery", description: "Portfolio: Homeoffice mit Tageslicht und Schreibtisch" },
  { id: "gallery-044", url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1500&h=1000&fit=crop", alt: "Elegant foyer with chandelier", page: "gallery", description: "Portfolio: Elegantes Foyer mit Kronleuchter" },
  { id: "gallery-045", url: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1000&h=1000&fit=crop", alt: "Skylight with natural illumination", page: "gallery", description: "Portfolio: Dachfenster mit natürlicher Beleuchtung" },
];

async function seedMediaLibrary() {
  console.log("🌱 Starting Media Library Seed...\n");

  const allImages = [
    ...homePageImages,
    ...pixCaptureImages,
    ...galleryImages,
  ];

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const image of allImages) {
    try {
      // Check if image already exists (by imageKey)
      const existingImages = await storage.getAllPublicImages();
      const exists = existingImages.some(img => img.imageKey === image.id);

      if (exists) {
        console.log(`⏭️  Skipped: ${image.id} (already exists)`);
        skipped++;
        continue;
      }

      // Create new image entry
      await storage.createPublicImage({
        page: image.page,
        imageKey: image.id,
        url: image.url,
        alt: image.alt,
        description: image.description,
        displayOrder: created,
      });

      console.log(`✅ Created: ${image.id} (${image.page})`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating ${image.id}:`, error);
      errors++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`📊 Seed Summary:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📸 Total: ${allImages.length}`);
  console.log("=".repeat(50));
  console.log("\n✨ Media Library Seed Complete!");
  console.log("👉 Visit /admin/media-library to view your images\n");
}

// Run the seed
seedMediaLibrary()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error during seed:", error);
    process.exit(1);
  });
