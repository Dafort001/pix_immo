import { useState } from "react";
import { Link } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { Footer } from "../components/Footer";
import { Menu, X } from "lucide-react";

// Sekundäre Akzentfarben aus der Palette
const accentColors = [
  "#64E649", // Green
  "#74A4EA", // Blue
  "#C94B38", // Red
  "#D8B95A", // Yellow
  "#D87098", // Pink
  "#CB8C48", // Orange
];

// Akzentfarbe basierend auf Position im Grid
// Jede Zeile hat 3 verschiedene Farben
// Keine Farbe erscheint direkt untereinander
const getAccentColorForPosition = (index: number) => {
  const row = Math.floor(index / 3); // 3 Spalten
  const col = index % 3;
  const colorIndex = (row * 2 + col) % accentColors.length;
  return accentColors[colorIndex];
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  slug: string;
  date: string;
  category: string;
}

export default function Blog() {
  const [menuOpen, setMenuOpen] = useState(false);

  // 12 gefüllte Blog-Posts
  const filledPosts: BlogPost[] = [
    {
      id: "1",
      title: "Die goldene Stunde: Warum Timing alles ist",
      excerpt: "Erfahren Sie, warum die richtige Tageszeit den Unterschied zwischen guten und herausragenden Immobilienfotos ausmacht.",
      imageUrl: "https://images.unsplash.com/photo-1642317444075-f7bb9865a1b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjBob3VyJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc2MjExMjAyOXww&ixlib=rb-4.1.0&q=80&w=1080",
      slug: "goldene-stunde-timing",
      date: "15. Oktober 2024",
      category: "Fotografie-Tipps",
    },
    {
      id: "2",
      title: "Drohnenaufnahmen: Perspektiven, die verkaufen",
      excerpt: "Luftaufnahmen bieten einzigartige Perspektiven und zeigen die Lage einer Immobilie auf beeindruckende Weise.",
      imageUrl: "https://images.unsplash.com/photo-1599875140968-b4e3c63d6cd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBkcm9uZSUyMHJlYWwlMjBlc3RhdGV8ZW58MXx8fHwxNzYyMTEyMDMwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      slug: "drohnenaufnahmen-perspektiven",
      date: "8. Oktober 2024",
      category: "Drohnen",
    },
    {
      id: "3",
      title: "Homestaging für die Kamera",
      excerpt: "Kleine Handgriffe mit großer Wirkung – wie Sie Räume optimal für professionelle Aufnahmen vorbereiten.",
      imageUrl: "https://images.unsplash.com/photo-1646592473974-b2ea9bd24717?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFnZWQlMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc2MjExMjAzMHww&ixlib=rb-4.1.0&q=80&w=1080",
      slug: "homestaging-kamera",
      date: "1. Oktober 2024",
      category: "Vorbereitung",
    },
    {
      id: "4",
      title: "Warum professionelle Fotografie sich auszahlt",
      excerpt: "Immobilien mit professionellen Fotos verkaufen sich 32% schneller und erzielen höhere Preise.",
      imageUrl: "https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwcm9wZXJ0eSUyMGludGVyaW9yfGVufDF8fHx8MTc2MjA2NjkyOHww&ixlib=rb-4.1.0&q=80&w=1080",
      slug: "professionelle-fotografie-wert",
      date: "24. September 2024",
      category: "Business",
    },
    {
      id: "5",
      title: "Architektur richtig in Szene setzen",
      excerpt: "Von Weitwinkel bis Detail – wie Sie die architektonischen Besonderheiten einer Immobilie optimal präsentieren.",
      imageUrl: "https://images.unsplash.com/photo-1624226784657-1e30fccdd59b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmUlMjBleHRlcmlvcnxlbnwxfHx8fDE3NjIwNzgyNDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      slug: "architektur-in-szene-setzen",
      date: "17. September 2024",
      category: "Fotografie-Tipps",
    },
    {
      id: "6",
      title: "HDR in der Immobilienfotografie",
      excerpt: "High Dynamic Range Technologie sorgt für ausgewogene Belichtung – auch bei schwierigen Lichtverhältnissen.",
      imageUrl: "https://images.unsplash.com/photo-1634434796037-3f0ffccc6c63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcmlvciUyMHBob3RvZ3JhcGh5JTIwd2luZG93JTIwbGlnaHR8ZW58MXx8fHwxNzYyMTEyMDMxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      slug: "hdr-immobilienfotografie",
      date: "10. September 2024",
      category: "Technik",
    },
    {
      id: "7",
      title: "Lichtführung in der Immobilienfotografie",
      excerpt: "Natürliches Licht optimal nutzen und mit künstlichem Licht die perfekte Atmosphäre schaffen.",
      imageUrl: "https://images.unsplash.com/photo-1661461623227-7feafeded348?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwbGlnaHRpbmd8ZW58MXx8fHwxNzYyMTEyMDMxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      slug: "lichtfuehrung-immobilienfotografie",
      date: "3. September 2024",
      category: "Fotografie-Tipps",
    },
    {
      id: "8",
      title: "Der perfekte Winkel für jeden Raum",
      excerpt: "Raumgeometrie verstehen und mit der richtigen Perspektive mehr Weite und Tiefe erzeugen.",
      imageUrl: "https://images.unsplash.com/photo-1761403124296-dcabf185d129?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb29tJTIwcGVyc3BlY3RpdmUlMjBhbmdsZXxlbnwxfHx8fDE3NjIxMTIwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      slug: "perfekter-winkel-raum",
      date: "27. August 2024",
      category: "Fotografie-Tipps",
    },
    {
      id: "9",
      title: "Außenaufnahmen bei jedem Wetter",
      excerpt: "Auch bei bewölktem Himmel oder Regen lassen sich beeindruckende Außenaufnahmen realisieren.",
      imageUrl: "https://images.unsplash.com/photo-1758546717941-13e64aac4faa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGV4dGVyaW9yJTIwd2VhdGhlcnxlbnwxfHx8fDE3NjIxMTIwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      slug: "aussenaufnahmen-wetter",
      date: "20. August 2024",
      category: "Fotografie-Tipps",
    },
    {
      id: "10",
      title: "Virtuelle Touren: Die Zukunft der Immobilienpräsentation",
      excerpt: "360-Grad-Aufnahmen und virtuelle Rundgänge ermöglichen Interessenten ein immersives Erlebnis.",
      imageUrl: "https://images.unsplash.com/photo-1615652164703-8cd8927ff7fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXJ0dWFsJTIwdG91ciUyMDM2MHxlbnwxfHx8fDE3NjIwNzIwODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      slug: "virtuelle-touren-zukunft",
      date: "13. August 2024",
      category: "Technik",
    },
    {
      id: "11",
      title: "Bildbearbeitung: Weniger ist mehr",
      excerpt: "Professionelle Nachbearbeitung verstärkt die Qualität, ohne die Authentizität zu verlieren.",
      imageUrl: "https://images.unsplash.com/photo-1741504303353-b06138843ed7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90byUyMGVkaXRpbmclMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYyMTEyMDMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      slug: "bildbearbeitung-weniger-ist-mehr",
      date: "6. August 2024",
      category: "Nachbearbeitung",
    },
    {
      id: "12",
      title: "Equipment für professionelle Immobilienfotos",
      excerpt: "Welche Kamera, Objektive und Zubehör Sie für professionelle Immobilienfotografie benötigen.",
      imageUrl: "https://images.unsplash.com/photo-1611599738437-740eade51365?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBlcXVpcG1lbnQlMjBwaG90b2dyYXBoeXxlbnwxfHx8fDE3NjIwNjIxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      slug: "equipment-professionelle-fotos",
      date: "30. Juli 2024",
      category: "Technik",
    },
  ];

  // 33 Platzhalter für später
  const placeholders = Array.from({ length: 33 }, (_, i) => ({
    id: `placeholder-${i + 13}`,
    title: "",
    excerpt: "",
    imageUrl: "",
    slug: "",
    date: "",
    category: "",
    isPlaceholder: true,
  }));

  // Alle 45 Blöcke kombinieren
  const allPosts = [...filledPosts, ...placeholders];

  return (
    <div className="bg-[var(--color-white)] min-h-screen flex flex-col">
      <SEOHead
        title="Blog - PIX.IMMO"
        description="Tipps und Insights rund um professionelle Immobilienfotografie in Hamburg."
        path="/blog"
      />

      {/* Logo und Hamburger Menu - Scrollt mit */}
      <div className="pt-6 px-8 flex items-center justify-between">
        {/* Logo als Home-Button */}
        <Link href="/">
          <h1 className="text-[24px] font-medium tracking-[0.05em] cursor-pointer text-[var(--color-black)] leading-none hover:text-[var(--color-grey)] transition-colors">
            PIX.IMMO
          </h1>
        </Link>
        
        {/* Hamburger Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-[var(--color-black)]"
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-20 right-8 z-50 bg-[var(--color-white)] shadow-lg">
          <nav className="flex flex-col px-8 py-6 gap-6">
            <Link href="/gallery">
              <span
                className="text-[16px] text-[var(--color-black)] cursor-pointer tracking-[-0.02em] hover:text-[var(--color-grey)] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Portfolio
              </span>
            </Link>
            <Link href="/preise">
              <span
                className="text-[16px] text-[var(--color-black)] cursor-pointer tracking-[-0.02em] hover:text-[var(--color-grey)] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Preise
              </span>
            </Link>
            <Link href="/blog">
              <span
                className="text-[16px] text-[var(--color-black)] cursor-pointer tracking-[-0.02em] hover:text-[var(--color-grey)] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Blog
              </span>
            </Link>
            <Link href="/login">
              <span
                className="text-[16px] text-[var(--color-black)] cursor-pointer tracking-[-0.02em] hover:text-[var(--color-grey)] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </span>
            </Link>
          </nav>
        </div>
      )}

      {/* Main Content - Grid with 45 blocks */}
      <div className="pt-12 px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Textbereich oben - Platzhalter für späteren erklärenden Text */}
          <div className="mb-16 min-h-[120px]">
            {/* Hier kann später Text eingefügt werden */}
          </div>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {allPosts.map((post, index) => {
              const accentColor = getAccentColorForPosition(index);
              
              return (
                <div key={post.id}>
                  {post.isPlaceholder ? (
                    // Platzhalter Block - 9:16 Portrait mit Sekundärfarbe
                    <div 
                      className="aspect-[9/16] relative group cursor-not-allowed"
                      style={{ backgroundColor: accentColor }}
                    >
                      <div className="absolute inset-0 bg-[#1A1A1C]/0 group-hover:bg-[#1A1A1C]/70 transition-all duration-300 flex items-center justify-center p-8">
                        {/* "Kommt später" Text beim Hover */}
                        <h3
                          className="text-[24px] font-medium tracking-[-0.02em] leading-tight text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ color: accentColor }}
                        >
                          Kommt später
                        </h3>
                      </div>
                    </div>
                  ) : (
                    // Gefüllter Blog Block - 9:16 Portrait
                    <Link href={`/blog/${post.slug}`}>
                      <div className="aspect-[9/16] relative group cursor-pointer overflow-hidden">
                        {/* Bild */}
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Dunkelgrauer Overlay beim Hover */}
                        <div className="absolute inset-0 bg-[#1A1A1C]/0 group-hover:bg-[#1A1A1C]/70 transition-all duration-300 flex items-center justify-center p-8">
                          {/* Titel erscheint beim Hover in Akzentfarbe - Farbe basiert auf Zeile */}
                          <h3
                            className="text-[24px] font-medium tracking-[-0.02em] leading-tight text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ color: accentColor }}
                          >
                            {post.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spacer um Footer ans Ende zu schieben */}
      <div className="flex-grow"></div>

      <Footer />
    </div>
  );
}
