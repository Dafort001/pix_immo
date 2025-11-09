export type GalleryImageStatus = 'neu' | 'zur-pruefung' | 'korrektur' | 'freigegeben' | 'v2+';

export type GalleryImage = {
  id: string;
  filename: string;
  url: string;
  thumbnail: string;
  resolution: string;
  uploadDate: string;
  status: GalleryImageStatus;
  altText?: string;
  roomType?: string;
  version: number;
  versions?: Array<{
    version: number;
    url: string;
    date: string;
    aiEdited?: boolean;
  }>;
  comments?: Array<{
    id: string;
    author: string;
    role: 'kunde' | 'bearbeiter' | 'admin';
    text: string;
    date: string;
    status: 'offen' | 'in-arbeit' | 'geloest';
  }>;
  markers?: Array<{
    id: string;
    x: number;
    y: number;
    color: 'red' | 'yellow' | 'green';
    note?: string;
  }>;
};

export const mockGalleryImages: GalleryImage[] = [
  {
    id: 'img-001',
    filename: 'wohnzimmer-01.jpg',
    url: 'https://images.unsplash.com/photo-1600210492493-0946911123ea',
    thumbnail: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400',
    resolution: '6000 × 4000',
    uploadDate: '2025-11-01',
    status: 'freigegeben',
    altText: 'Modernes Wohnzimmer mit großem Sofa, Couchtisch und bodentiefen Fenstern mit Stadtblick',
    roomType: 'Wohnzimmer',
    version: 1,
  },
  {
    id: 'img-002',
    filename: 'kueche-01.jpg',
    url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba',
    thumbnail: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400',
    resolution: '5472 × 3648',
    uploadDate: '2025-11-01',
    status: 'zur-pruefung',
    altText: 'Offene Küche mit weißen Hochglanzfronten, Kochinsel und integrierten Elektrogeräten',
    roomType: 'Küche',
    version: 2,
    versions: [
      { version: 1, url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba', date: '2025-10-30' },
      { version: 2, url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba', date: '2025-11-01', aiEdited: true },
    ],
  },
  {
    id: 'img-003',
    filename: 'schlafzimmer-01.jpg',
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0',
    thumbnail: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400',
    resolution: '6000 × 4000',
    uploadDate: '2025-11-02',
    status: 'korrektur',
    altText: 'Helles Schlafzimmer mit Doppelbett, Nachttischen und minimalistischer Einrichtung',
    roomType: 'Schlafzimmer',
    version: 1,
    comments: [
      {
        id: 'c1',
        author: 'Max Müller',
        role: 'kunde',
        text: 'Bitte das Kabel rechts neben dem Bett entfernen',
        date: '2025-11-02',
        status: 'in-arbeit',
      },
    ],
    markers: [
      { id: 'm1', x: 720, y: 480, color: 'red', note: 'Kabel entfernen' },
    ],
  },
  {
    id: 'img-004',
    filename: 'badezimmer-01.jpg',
    url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14',
    thumbnail: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400',
    resolution: '5184 × 3456',
    uploadDate: '2025-11-02',
    status: 'neu',
    altText: 'Modernes Badezimmer mit freistehender Badewanne, Regendusche und Marmorwänden',
    roomType: 'Badezimmer',
    version: 1,
  },
  {
    id: 'img-005',
    filename: 'balkon-01.jpg',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    resolution: '6000 × 4000',
    uploadDate: '2025-11-01',
    status: 'freigegeben',
    altText: 'Großzügiger Balkon mit Holzdielen, Lounge-Möbeln und Blick ins Grüne',
    roomType: 'Balkon',
    version: 1,
  },
  {
    id: 'img-006',
    filename: 'esszimmer-01.jpg',
    url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200',
    thumbnail: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400',
    resolution: '5472 × 3648',
    uploadDate: '2025-11-02',
    status: 'zur-pruefung',
    altText: 'Elegantes Esszimmer mit großem Esstisch, Designer-Stühlen und Pendelleuchte',
    roomType: 'Esszimmer',
    version: 1,
  },
  {
    id: 'img-007',
    filename: 'arbeitszimmer-01.jpg',
    url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858',
    thumbnail: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400',
    resolution: '6000 × 4000',
    uploadDate: '2025-11-01',
    status: 'freigegeben',
    altText: 'Helles Home-Office mit Schreibtisch, ergonomischem Stuhl und Bücherregal',
    roomType: 'Arbeitszimmer',
    version: 1,
  },
  {
    id: 'img-008',
    filename: 'eingang-01.jpg',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
    resolution: '5184 × 3456',
    uploadDate: '2025-11-02',
    status: 'neu',
    altText: 'Eingangsbereich mit Garderobe, Spiegel und hellem Holzboden',
    roomType: 'Eingang',
    version: 1,
  },
  {
    id: 'img-009',
    filename: 'wohnzimmer-02.jpg',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    resolution: '6000 × 4000',
    uploadDate: '2025-11-01',
    status: 'v2+',
    altText: 'Gemütliches Wohnzimmer mit Kamin, Sessel und warmem Licht',
    roomType: 'Wohnzimmer',
    version: 3,
    versions: [
      { version: 1, url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', date: '2025-10-28' },
      { version: 2, url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', date: '2025-10-30', aiEdited: true },
      { version: 3, url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', date: '2025-11-01' },
    ],
  },
  {
    id: 'img-010',
    filename: 'terrasse-01.jpg',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    resolution: '5472 × 3648',
    uploadDate: '2025-11-02',
    status: 'zur-pruefung',
    altText: 'Moderne Terrasse mit Outdoor-Küche, Loungebereich und Sonnenschutz',
    roomType: 'Terrasse',
    version: 1,
  },
  {
    id: 'img-011',
    filename: 'kinderzimmer-01.jpg',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    resolution: '6000 × 4000',
    uploadDate: '2025-11-01',
    status: 'freigegeben',
    altText: 'Freundliches Kinderzimmer mit Einzelbett, Spielecke und bunten Akzenten',
    roomType: 'Kinderzimmer',
    version: 1,
  },
  {
    id: 'img-012',
    filename: 'gaestebad-01.jpg',
    url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101',
    thumbnail: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400',
    resolution: '5184 × 3456',
    uploadDate: '2025-11-02',
    status: 'korrektur',
    altText: 'Kompaktes Gästebad mit Walk-in-Dusche, WC und modernen Armaturen',
    roomType: 'Gästebad',
    version: 1,
    comments: [
      {
        id: 'c2',
        author: 'Anna Schmidt',
        role: 'bearbeiter',
        text: 'Spiegelreflexion bearbeitet',
        date: '2025-11-02',
        status: 'geloest',
      },
    ],
  },
];
