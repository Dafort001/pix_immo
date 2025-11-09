import { useState } from "react";
import { Link, useParams } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { Footer } from "../components/Footer";
import { Menu, X, ArrowLeft } from "lucide-react";

export default function BlogPost() {
  const [menuOpen, setMenuOpen] = useState(false);
  const params = useParams();
  const slug = params.slug || "";

  // Mock-Daten basierend auf dem Slug
  const blogPosts: Record<string, any> = {
    "goldene-stunde-timing": {
      title: "Die goldene Stunde: Warum Timing alles ist",
      subheadline: "Erfahren Sie, warum die richtige Tageszeit den Unterschied zwischen guten und herausragenden Immobilienfotos ausmacht.",
      date: "15. Oktober 2024",
      category: "Fotografie-Tipps",
      heroImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzYyMDk3NDIzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      introText: "In der Immobilienfotografie kann die Wahl der richtigen Tageszeit über Erfolg oder Misserfolg einer Aufnahme entscheiden. Die sogenannte \"Goldene Stunde\" – die Zeit kurz nach Sonnenaufgang oder vor Sonnenuntergang – bietet einzigartiges, weiches Licht, das Räume und Fassaden in einem warmen, einladenden Glanz erscheinen lässt.",
      content: [
        {
          type: "h2",
          text: "Was ist die goldene Stunde?",
        },
        {
          type: "paragraph",
          text: "Die goldene Stunde bezeichnet die Zeit kurz nach Sonnenaufgang und kurz vor Sonnenuntergang. In dieser Phase steht die Sonne tief am Horizont und erzeugt ein weiches, warmes Licht mit einem goldenen Farbton. Für Immobilienfotografen ist dies die beste Zeit für Außenaufnahmen.",
        },
        {
          type: "paragraph",
          text: "Das Licht in der goldenen Stunde ist diffuser und weniger hart als zur Mittagszeit. Es entstehen weiche Schatten, die architektonische Details betonen, ohne dabei zu stark zu kontrastieren. Die warme Farbtemperatur verleiht Gebäuden eine einladende, gemütliche Atmosphäre.",
        },
        {
          type: "h2",
          text: "Vorteile für Außenaufnahmen",
        },
        {
          type: "paragraph",
          text: "Bei Außenaufnahmen von Immobilien spielt das natürliche Licht eine entscheidende Rolle. Während der goldenen Stunde erhalten Fassaden eine natürliche Tiefe und Dimension. Fenster reflektieren weniger, und die Umgebung – Gärten, Bäume, Zufahrten – erscheint lebendiger und ansprechender.",
        },
        {
          type: "quote",
          text: "Die goldene Stunde ist mein Geheimnis für Außenaufnahmen, die Emotionen wecken. Das warme Licht lässt jede Immobilie wie ein Zuhause aussehen, nicht nur wie ein Gebäude.",
        },
        {
          type: "paragraph",
          text: "Ein weiterer Vorteil: Der Himmel hat während dieser Zeit oft spektakuläre Farben – von sanften Rosatönen bis zu kräftigem Orange. Dies kann besonders bei Luxusimmobilien oder Objekten mit besonderen architektonischen Merkmalen einen dramatischen Effekt erzielen.",
        },
        {
          type: "image",
          src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzYyMDk3NDIzfDA&ixlib=rb-4.1.0&q=80&w=1080",
          alt: "Immobilie während der goldenen Stunde",
        },
        {
          type: "h2",
          text: "Timing ist entscheidend",
        },
        {
          type: "paragraph",
          text: "Die goldene Stunde dauert nicht lange – je nach Jahreszeit und geografischer Lage zwischen 30 und 60 Minuten. Deshalb ist eine sorgfältige Planung unerlässlich. Als professionelle Fotografen nutzen wir Apps und Tools, um die exakte Zeit der goldenen Stunde zu berechnen und sind bereits vor Ort, um die besten Momente einzufangen.",
        },
        {
          type: "paragraph",
          text: "Für Innenaufnahmen gelten andere Regeln: Hier ist oft die Mittagszeit ideal, wenn das natürliche Licht durch Fenster strömt und Räume hell und einladend wirken lässt. Doch für Außenaufnahmen bleibt die goldene Stunde unschlagbar.",
        },
        {
          type: "h2",
          text: "Fazit",
        },
        {
          type: "paragraph",
          text: "Die Wahl der richtigen Tageszeit kann den Unterschied zwischen durchschnittlichen und außergewöhnlichen Immobilienfotos ausmachen. Bei PIX.IMMO planen wir jedes Shooting sorgfältig, um das beste Licht für Ihre Immobilie zu nutzen – sei es die goldene Stunde für Außenaufnahmen oder optimales Tageslicht für Innenräume.",
        },
      ],
    },
  };

  const post = blogPosts[slug] || {
    title: "Blogartikel nicht gefunden",
    subheadline: "Der gewünschte Artikel konnte nicht geladen werden.",
    date: "",
    category: "",
    heroImage: "",
    introText: "",
    content: [],
  };

  return (
    <div className="bg-[var(--color-white)] min-h-screen flex flex-col">
      <SEOHead
        title={`${post.title} - PIX.IMMO Blog`}
        description={post.subheadline}
        path={`/blog/${slug}`}
      />

      {/* Logo und Hamburger Menu - Scrollt mit */}
      <div className="pt-6 px-4 md:px-8 flex items-center justify-between">
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
        <div className="absolute top-20 right-4 md:right-8 z-50 bg-[var(--color-white)] shadow-lg">
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

      {/* Desktop Container - 740px centered */}
      <article className="mx-auto px-7 md:px-0" style={{ maxWidth: "740px" }}>
        {/* Padding top/bottom: 96px desktop, 64px mobile */}
        <div className="py-16 md:py-24">
          {/* Back to Blog Link */}
          <Link href="/blog">
            <div className="flex items-center gap-2 text-[var(--color-grey)] hover:text-[var(--color-black)] transition-colors cursor-pointer mb-12 md:mb-16">
              <ArrowLeft size={20} />
              <span className="text-[16px] tracking-[-0.02em]">Zurück zum Blog</span>
            </div>
          </Link>

          {/* Spacing: 48px desktop, 32px mobile */}
          <div className="space-y-8 md:space-y-12">
            {/* H1: 30-32px mobile, 38-42px desktop, LH 1.2 */}
            <h1
              className="text-[30px] md:text-[40px] tracking-[-0.02em] text-[var(--color-black)]"
              style={{ lineHeight: "1.2" }}
            >
              {post.title}
            </h1>

            {/* Subheadline: 18-20px mobile, 20-22px desktop, LH 1.4 */}
            <p
              className="text-[18px] md:text-[21px] text-[var(--color-grey)] tracking-[-0.02em]"
              style={{ lineHeight: "1.4" }}
            >
              {post.subheadline}
            </p>

            {/* Date and Category */}
            {post.date && (
              <div className="flex items-center gap-4 text-[14px] text-[var(--color-grey)]">
                <span>{post.date}</span>
                {post.category && (
                  <>
                    <span>·</span>
                    <span>{post.category}</span>
                  </>
                )}
              </div>
            )}

            {/* Hero Image: 740 × ~420px */}
            {post.heroImage && (
              <div className="w-full">
                <img
                  src={post.heroImage}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: "740/420" }}
                />
              </div>
            )}

            {/* Intro Text: 16px mobile / 18px desktop, LH 1.6 */}
            {post.introText && (
              <p
                className="text-[16px] md:text-[18px] text-[var(--color-black)] tracking-[-0.02em]"
                style={{ lineHeight: "1.6" }}
              >
                {post.introText}
              </p>
            )}

            {/* Content Blocks */}
            {post.content.map((block: any, index: number) => {
              if (block.type === "h2") {
                return (
                  <h2
                    key={index}
                    className="text-[22px] md:text-[28px] text-[var(--color-black)] tracking-[-0.02em] mt-12 md:mt-16"
                    style={{ lineHeight: "1.3" }}
                  >
                    {block.text}
                  </h2>
                );
              }

              if (block.type === "paragraph") {
                return (
                  <p
                    key={index}
                    className="text-[16px] md:text-[18px] text-[var(--color-black)] tracking-[-0.02em]"
                    style={{ lineHeight: "1.6" }}
                  >
                    {block.text}
                  </p>
                );
              }

              if (block.type === "quote") {
                return (
                  <blockquote
                    key={index}
                    className="border-l-[3px] border-[var(--color-grey)] pl-6 py-6 my-12 md:my-16"
                  >
                    <p
                      className="text-[16px] md:text-[19px] text-[var(--color-grey)] tracking-[-0.02em] italic"
                      style={{ lineHeight: "1.4" }}
                    >
                      {block.text}
                    </p>
                  </blockquote>
                );
              }

              if (block.type === "image") {
                return (
                  <div key={index} className="my-10 md:my-14">
                    <img
                      src={block.src}
                      alt={block.alt}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </article>

      {/* Spacer um Footer ans Ende zu schieben */}
      <div className="flex-grow"></div>

      <Footer />
    </div>
  );
}
