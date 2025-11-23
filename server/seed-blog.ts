import { db } from "./db";
import { blogPosts } from "@shared/schema";
import { sql } from "drizzle-orm";
import { ulid } from "ulid";

const BLOG_SEEDS = [
  {
    title: "Perfekte Immobilienfotografie: 10 Tipps für beeindruckende Aufnahmen",
    slug: "perfekte-immobilienfotografie-10-tipps",
    excerpt: "Von der richtigen Beleuchtung bis zur optimalen Perspektive – diese 10 Profi-Tipps machen Ihre Immobilienfotos zum Verkaufsmagnet.",
    content: `
# Perfekte Immobilienfotografie: 10 Tipps für beeindruckende Aufnahmen

Immobilienfotografie ist mehr als nur "Räume ablichten". Es geht darum, Emotionen zu wecken und potenzielle Käufer zu begeistern.

## 1. Die goldene Stunde nutzen

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

## 2. Weitwinkel, aber mit Maß

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.

## 3. Vertikale Linien kontrollieren

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.

> **Profi-Tipp:** Nutzen Sie immer ein Stativ für konsistente, scharfe Aufnahmen ohne Verzerrungen.

## 4. HDR für schwierige Lichtverhältnisse

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.

## 5. Aufräumen und Staging

- Persönliche Gegenstände entfernen
- Neutrale Farbpalette bevorzugen
- Frische Blumen als Akzente
- Alle Lichter einschalten

## Fazit

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
    `,
    author: "Sarah Schmidt",
    category: "Fotografie",
    tags: ["Tipps", "Grundlagen", "HDR"],
    featuredImage: "/attached_assets/gallery-images/home-001.jpg",
    status: "published" as const,
    publishedAt: new Date("2024-11-15T09:00:00Z").getTime(),
  },
  {
    title: "Drohnenaufnahmen im Immobilienmarketing: Lohnt sich die Investition?",
    slug: "drohnenaufnahmen-immobilienmarketing",
    excerpt: "Luftaufnahmen bieten spektakuläre Perspektiven. Wir zeigen, wann sich der Einsatz von Drohnen wirklich rechnet.",
    content: `
# Drohnenaufnahmen im Immobilienmarketing

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vel massa vitae augue tempor volutpat nec nec quam.

## Warum Drohnenaufnahmen?

Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.

### Vorteile auf einen Blick

1. **Einzigartige Perspektiven** - Nullam dictum felis eu pede mollis pretium
2. **Grundstücksgröße visualisieren** - Integer tincidunt cras dapibus
3. **Umgebung zeigen** - Vivamus elementum semper nisi

## Rechtliche Rahmenbedingungen

Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.

> **Wichtig:** Für gewerbliche Drohnenflüge benötigen Sie eine Haftpflichtversicherung und müssen die Datenschutzrichtlinien beachten.

## Kosten vs. Mehrwert

Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.

### Beispielrechnung

\`\`\`
Drohnenaufnahmen: 300€
Höheres Verkaufsinteresse: +40%
Schnellerer Verkauf: -2 Wochen
ROI: Sehr positiv
\`\`\`

## Fazit

Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.
    `,
    author: "Michael Weber",
    category: "Technik",
    tags: ["Drohne", "Marketing", "Luftaufnahmen"],
    featuredImage: "/attached_assets/gallery-images/home-002.jpg",
    status: "published" as const,
    publishedAt: new Date("2024-11-10T14:30:00Z").getTime(),
  },
  {
    title: "Virtuelle Besichtigungen: Die Zukunft der Immobilienpräsentation",
    slug: "virtuelle-besichtigungen-zukunft",
    excerpt: "360°-Touren und VR-Rundgänge revolutionieren die Immobilienbranche. Ein Blick auf Technologien und Best Practices.",
    content: `
# Virtuelle Besichtigungen: Die Zukunft der Immobilienpräsentation

Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh.

## Was sind virtuelle Besichtigungen?

Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero.

### Technologien im Überblick

- **360°-Kameras** - Fusce vulputate eleifend sapien
- **Matterport** - Vestibulum purus quam, scelerisque ut
- **VR-Brillen** - Mollis non, commodo luctus, nisi

## Vorteile für Verkäufer und Käufer

Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.

| Vorteil | Verkäufer | Käufer |
|---------|-----------|--------|
| Zeitersparnis | ✓ | ✓ |
| Größere Reichweite | ✓ | - |
| Vorauswahl | - | ✓ |
| 24/7 verfügbar | ✓ | ✓ |

## Best Practices

Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu.

### Checkliste für erfolgreiche Touren

1. Professionelle Aufnahmen mit stabilem Equipment
2. Optimale Beleuchtung in allen Räumen
3. Intuitive Navigation implementieren
4. Mobile Optimierung nicht vergessen

> **Pro-Tipp:** Kombinieren Sie virtuelle Touren mit klassischen Fotos für maximale Wirkung.

## Fazit

Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum.
    `,
    author: "Anna Müller",
    category: "Innovation",
    tags: ["VR", "360°", "Technologie"],
    featuredImage: "/attached_assets/gallery-images/home-003.jpg",
    status: "published" as const,
    publishedAt: new Date("2024-11-05T10:15:00Z").getTime(),
  },
  {
    title: "Bildbearbeitung für Immobilienfotos: Was ist erlaubt?",
    slug: "bildbearbeitung-immobilienfotos-grenzen",
    excerpt: "Zwischen Optimierung und Täuschung: Welche Bildkorrekturen sind ethisch vertretbar und rechtlich zulässig?",
    content: `
# Bildbearbeitung für Immobilienfotos: Was ist erlaubt?

Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus.

## Die Grauzone der Nachbearbeitung

Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt.

### Erlaubte Optimierungen

- **Belichtungskorrektur** - Duis leo sed fringilla mauris
- **Weißabgleich** - Donec sodales sagittis magna
- **Kontrast & Schärfe** - Sed consequat leo eget
- **Perspektivenkorrektur** - Fusce vulputate eleifend

### Verbotene Manipulationen

Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum.

1. Hinzufügen nicht vorhandener Objekte
2. Entfernen baulicher Mängel
3. Veränderung der Raumgröße
4. Manipulation der Umgebung

## Rechtliche Aspekte

Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero.

> **Rechtlicher Hinweis:** Irreführende Darstellungen können zu Schadensersatzansprüchen und wettbewerbsrechtlichen Abmahnungen führen.

## Best Practices

\`\`\`markdown
✓ Natürliche Farbwiedergabe
✓ Realistische Helligkeitsverteilung  
✓ Transparente Kommunikation
✗ "Sky Replacement"
✗ Virtuelle Möblierung ohne Kennzeichnung
\`\`\`

## Fazit

Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus.
    `,
    author: "Dr. Thomas Schneider",
    category: "Recht",
    tags: ["Bildbearbeitung", "Ethik", "Recht"],
    featuredImage: "/attached_assets/gallery-images/home-004.jpg",
    status: "published" as const,
    publishedAt: new Date("2024-10-28T08:45:00Z").getTime(),
  },
  {
    title: "Immobilien-Homestaging: Die Kunst der perfekten Inszenierung",
    slug: "immobilien-homestaging-inszenierung",
    excerpt: "Mit professionellem Staging bis zu 20% höhere Verkaufspreise erzielen. So funktioniert die Rauminszenierung.",
    content: `
# Immobilien-Homestaging: Die Kunst der perfekten Inszenierung

Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue.

## Was ist Homestaging?

Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.

### Die wichtigsten Elemente

1. **Entrümpelung** - Nam eget dui etiam rhoncus
2. **Neutralisierung** - Maecenas tempus tellus eget
3. **Möblierung** - Curabitur ullamcorper ultricies
4. **Dekoration** - Vestibulum ante ipsum primis

## Statistiken zum Staging-Effekt

Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.

| Metrik | Ohne Staging | Mit Staging |
|--------|--------------|-------------|
| Verkaufsdauer | 120 Tage | 45 Tage |
| Preisnachlass | -8% | -2% |
| Besichtigungen | 12 | 28 |

## Farben und Psychologie

Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

### Farbwirkung

- **Weiß/Beige** - Nullam dictum felis eu pede
- **Grau** - Integer tincidunt cras dapibus  
- **Blau** - Vivamus elementum semper nisi
- **Grün** - Aenean vulputate eleifend

> **Staging-Regel:** Weniger ist mehr. Reduzieren Sie auf das Wesentliche und schaffen Sie Raum zum Träumen.

## DIY vs. Profi

Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.

### Wann lohnt sich ein Profi?

- Hochpreissegment (>500.000€)
- Lange Vermarktungsdauer
- Leerstehende Immobilien
- Schwierige Schnitte

## Fazit

Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus.
    `,
    author: "Sarah Schmidt",
    category: "Verkauf",
    tags: ["Homestaging", "Verkaufstipps", "Inszenierung"],
    featuredImage: "/attached_assets/gallery-images/home-005.jpg",
    status: "published" as const,
    publishedAt: new Date("2024-10-20T11:20:00Z").getTime(),
  },
  {
    title: "Smartphone vs. Profikamera: Reicht das Handy für Immobilienfotos?",
    slug: "smartphone-vs-profikamera-immobilien",
    excerpt: "Moderne Smartphones haben beeindruckende Kameras. Wann reicht das aus und wo sind die Grenzen?",
    content: `
# Smartphone vs. Profikamera: Reicht das Handy für Immobilienfotos?

Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.

## Die Smartphone-Revolution

Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet.

### Vorteile moderner Smartphones

- **Immer dabei** - Quisque rutrum aenean imperdiet
- **Einfache Bedienung** - Etiam ultricies nisi vel
- **Schnelle Bearbeitung** - Curabitur ullamcorper ultricies
- **HDR-Automatik** - Nam eget dui etiam rhoncus

## Technische Limitierungen

Quisque id odio. Praesent venenatis metus at tortor pulvinar varius. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.

### Wo Smartphones schwächeln

1. **Weitwinkel** - Verzerrungen am Bildrand
2. **Low-Light** - Bildrauschen bei wenig Licht
3. **Dynamikumfang** - Überbelichtete Fenster
4. **Objektivqualität** - Chromatische Aberrationen

## Vergleichstabelle

| Kriterium | Smartphone | Profikamera |
|-----------|-----------|-------------|
| Bedienung | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Bildqualität | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Weitwinkel | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Preis | ⭐⭐⭐⭐⭐ | ⭐⭐ |

## Unsere Empfehlung

Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a.

> **Faustregel:** Für private Vermietungen unter 1.000€/m² kann ein gutes Smartphone ausreichen. Für Verkäufe sollten Sie auf Profis setzen.

### Wann Smartphone OK ist

- Mietobjekte im unteren Preissegment
- Erste Exposé-Entwürfe
- Social Media Posts
- Dokumentation von Baufortschritten

### Wann Sie Profis brauchen

- Verkaufsobjekte
- Luxusimmobilien
- Gewerbliche Objekte
- Offizielle Marketingmaterialien

## Fazit

Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum.
    `,
    author: "Michael Weber",
    category: "Technik",
    tags: ["Smartphone", "Kamera", "Vergleich"],
    featuredImage: "/attached_assets/gallery-images/home-006.jpg",
    status: "published" as const,
    publishedAt: new Date("2024-10-12T15:00:00Z").getTime(),
  },
  {
    title: "Saisonale Immobilienfotografie: Frühling, Sommer, Herbst oder Winter?",
    slug: "saisonale-immobilienfotografie",
    excerpt: "Jede Jahreszeit hat ihre Vorzüge. Wir zeigen, wie Sie saisonale Besonderheiten optimal nutzen.",
    content: `
# Saisonale Immobilienfotografie

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.

## Frühling – Zeit des Erwachens

Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

### Frühlings-Vorteile

- Frisches Grün
- Blühende Gärten  
- Angenehmes Licht
- Positive Stimmung

## Sommer – Maximale Helligkeit

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.

### Sommer-Herausforderungen

1. **Hartes Licht** - Starke Kontraste vermeiden
2. **Hitzeflimmern** - Außenaufnahmen früh machen
3. **Reflektionen** - Polfilter verwenden

## Herbst – Warme Farben

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

> **Herbst-Tipp:** Nutzen Sie das goldene Oktoberlicht für warme, einladende Atmosphäre.

## Winter – Kontrovers diskutiert

Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

### Winter-Vor- und Nachteile

| Pro | Contra |
|-----|--------|
| Klare Luft | Kahle Bäume |
| Kamin-Romantik | Kurze Tage |
| Architektur-Fokus | Graue Stimmung |

## Wetter-Strategien

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid.

### Optimales Timing

\`\`\`
Frühling: April - Mai
Sommer: Juni - August (morgens/abends)
Herbst: September - Oktober  
Winter: Nur bei Sonnenschein
\`\`\`

## Fazit

Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.
    `,
    author: "Anna Müller",
    category: "Fotografie",
    tags: ["Jahreszeiten", "Wetter", "Timing"],
    featuredImage: "/attached_assets/gallery-images/home-007.jpg",
    status: "published" as const,
    publishedAt: new Date("2024-10-05T09:30:00Z").getTime(),
  },
  {
    title: "Architektur-Highlights richtig in Szene setzen",
    slug: "architektur-highlights-fotografieren",
    excerpt: "Von Stuck bis Designerküche: So fotografieren Sie besondere architektonische Details professionell.",
    content: `
# Architektur-Highlights richtig in Szene setzen

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti.

## Details, die verkaufen

Atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

### Die wichtigsten Architektur-Features

1. **Stuck und Ornamente**
2. **Parkett und Bodenbeläge**
3. **Fenster und Türen**
4. **Küchen und Bäder**
5. **Treppen und Geländer**

## Licht und Schatten nutzen

Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.

### Detail-Fotografie Basics

- **Makro-Perspektive** - Nam libero tempore cum soluta
- **Seitenlicht** - Nobis est eligendi optio cumque
- **Fokus-Stacking** - Nihil impedit quo minus id
- **Weicher Schatten** - Quod maxime placeat facere

> **Detail-Tipp:** Zeigen Sie Qualität durch Nahaufnahmen von hochwertigen Materialien und Verarbeitung.

## Raum und Detail kombinieren

Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis.

| Aufnahmetyp | Zweck | Brennweite |
|-------------|-------|------------|
| Übersicht | Raumgefühl | 16-24mm |
| Details | Qualität zeigen | 50-100mm |
| Architektur | Linien betonen | 24mm Tilt-Shift |

## Typische Fehler

Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.

### Was Sie vermeiden sollten

- Stürzende Linien bei Fassaden
- Überbelichtete Fenster
- Zu dunkle Ecken
- Verzerrte Proportionen
- Unruhiger Hintergrund

## Equipment-Empfehlungen

Ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur.

\`\`\`markdown
Basis-Set:
- Weitwinkel 16-35mm
- Standard 24-70mm
- Tilt-Shift (optional)
- Stativ (essentiell)
- Fernauslöser
\`\`\`

## Fazit

A sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus.
    `,
    author: "Dr. Thomas Schneider",
    category: "Fotografie",
    tags: ["Architektur", "Details", "Technik"],
    featuredImage: "/attached_assets/gallery-images/home-008.jpg",
    status: "published" as const,
    publishedAt: new Date("2024-09-28T13:45:00Z").getTime(),
  },
  {
    title: "Social Media Marketing für Immobilienmakler: Instagram & Co.",
    slug: "social-media-marketing-immobilien",
    excerpt: "Von Instagram Reels bis LinkedIn-Posts: Wie Sie Social Media erfolgreich für Ihr Immobilien-Marketing nutzen.",
    content: `
# Social Media Marketing für Immobilienmakler

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.

## Die wichtigsten Plattformen

Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.

### Instagram – Die Bildplattform

- **Stories** - Tägliche Updates und Behind-the-Scenes
- **Reels** - Kurze Rundgänge und Tipps
- **Posts** - Hochwertige Immobilienfotos
- **IGTV** - Längere Besichtigungen

## Content-Strategie

Explicabo nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.

### Der Content-Mix (30-30-30-10 Regel)

1. **30% Immobilien** - Sed quia consequuntur magni
2. **30% Mehrwert** - Dolores eos qui ratione
3. **30% Lokales** - Voluptatem sequi nesciunt
4. **10% Persönliches** - Neque porro quisquam est

## Posting-Frequenz

Qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius.

| Plattform | Frequenz | Best Time |
|-----------|----------|-----------|
| Instagram | 1x täglich | 18:00-20:00 |
| Facebook | 3-5x/Woche | 12:00-15:00 |
| LinkedIn | 2-3x/Woche | 07:00-09:00 |
| TikTok | 2x täglich | 19:00-21:00 |

> **Engagement-Tipp:** Antworten Sie innerhalb von 60 Minuten auf Kommentare für maximale Reichweite.

## Hashtag-Strategie

Modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

### Hashtag-Mix

\`\`\`
Große Hashtags (>100k):
#immobilien #Hamburg #wohnung

Mittlere (10k-100k):
#immobilienhamburg #wohnungmieten

Kleine (<10k):
#hamburgaltona #eimsbüttelwohnung
\`\`\`

## Analyse und Optimierung

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.

### KPIs im Überblick

- **Reach** - Wie viele sehen Ihre Posts?
- **Engagement Rate** - Likes + Comments / Follower
- **Click-Through-Rate** - Link-Klicks
- **Lead-Generierung** - Anfragen pro Post

## Fazit

Nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate.
    `,
    author: "Sarah Schmidt",
    category: "Marketing",
    tags: ["Social Media", "Instagram", "Marketing"],
    featuredImage: "/attached_assets/gallery-images/home-009.jpg",
    status: "published" as const,
    publishedAt: new Date("2024-09-15T16:00:00Z").getTime(),
  },
];

async function seedBlogPosts() {
  console.log("🌱 Seeding blog posts...");

  try {
    // Get admin user for createdBy field
    const adminUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.role, "admin"),
    });

    if (!adminUser) {
      console.error("❌ No admin user found. Please create an admin user first.");
      process.exit(1);
    }

    for (const seed of BLOG_SEEDS) {
      // Check if post with this slug already exists
      const existingPost = await db.query.blogPosts.findFirst({
        where: (posts, { eq }) => eq(posts.slug, seed.slug),
      });

      if (existingPost) {
        console.log(`⏭️  Skipping "${seed.title}" (already exists)`);
        continue;
      }

      // Insert new blog post
      const now = Date.now();
      await db.insert(blogPosts).values({
        id: ulid(),
        ...seed,
        createdBy: adminUser.id,
        createdAt: now,
        updatedAt: now,
      });

      console.log(`✅ Created: "${seed.title}"`);
    }

    console.log("\n🎉 Blog seeding completed!");
    console.log(`📊 Total posts created: ${BLOG_SEEDS.length}`);
    
  } catch (error) {
    console.error("❌ Error seeding blog posts:", error);
    process.exit(1);
  }
}

export { seedBlogPosts };

// Run if called directly
seedBlogPosts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
