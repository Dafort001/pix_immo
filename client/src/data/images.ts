/**
 * Zentrale Bildverwaltung für PIX.IMMO
 * 
 * Jedes Bild hat:
 * - id: Eindeutige Kennung
 * - url: Bild-URL (Unsplash oder eigene Assets)
 * - alt: Alternativtext für Accessibility
 * - page: Seitenzugehörigkeit
 * - description: Optionale Beschreibung
 */

export interface ImageAsset {
  id: string;
  url: string;
  alt: string;
  page: string;
  description?: string;
}

// ========================================
// HOMEPAGE IMAGES
// ========================================
export const homePageImages: ImageAsset[] = [
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

// ========================================
// PIXCAPTURE.APP IMAGES (Self-Service)
// ========================================
export const pixCaptureImages: ImageAsset[] = [
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

// ========================================
// GALLERY IMAGES
// ========================================
export const galleryImages: ImageAsset[] = [
  // Hier können Gallery-Bilder hinzugefügt werden
];

// ========================================
// BLOG IMAGES
// ========================================
export const blogImages: ImageAsset[] = [
  // Hier können Blog-Bilder hinzugefügt werden
];

// ========================================
// HILFSFUNKTIONEN
// ========================================

/**
 * Holt ein einzelnes Bild anhand der ID
 */
export function getImageById(id: string): ImageAsset | undefined {
  const allImages = [...homePageImages, ...pixCaptureImages, ...galleryImages, ...blogImages];
  return allImages.find((img) => img.id === id);
}

/**
 * Holt alle Bilder einer bestimmten Seite
 */
export function getImagesByPage(page: string): ImageAsset[] {
  const allImages = [...homePageImages, ...pixCaptureImages, ...galleryImages, ...blogImages];
  return allImages.filter((img) => img.page === page);
}

/**
 * Erstellt die Bildstruktur für ScrollingImageStrip
 */
export function formatForScrollingStrip(images: ImageAsset[]) {
  return images.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt,
  }));
}
