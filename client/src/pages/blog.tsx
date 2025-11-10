import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

// Mock blog data - 9 portrait images with titles
const blogPosts = [
  {
    id: 1,
    slug: "fruehlingsduft",
    title: "Es fliegt, es fliegt ...der warme Frühlingsduft",
    thumbnail: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=600&h=900&fit=crop",
  },
  {
    id: 2,
    slug: "kaffee-moment",
    title: "Der perfekte Kaffee-Moment",
    thumbnail: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=900&fit=crop",
  },
  {
    id: 3,
    slug: "urban-leben",
    title: "Urbanes Leben in der Moderne",
    thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=900&fit=crop",
  },
  {
    id: 4,
    slug: "kulinarik",
    title: "Kulinarische Entdeckungen",
    thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=900&fit=crop",
  },
  {
    id: 5,
    slug: "natur-pur",
    title: "Natur Pur",
    thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=900&fit=crop",
  },
  {
    id: 6,
    slug: "architektur",
    title: "Architektonische Meisterwerke",
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=900&fit=crop",
  },
  {
    id: 7,
    slug: "lichtspiel",
    title: "Das Spiel mit dem Licht",
    thumbnail: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=600&h=900&fit=crop",
  },
  {
    id: 8,
    slug: "minimalism",
    title: "Minimalismus im Alltag",
    thumbnail: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=600&h=900&fit=crop",
  },
  {
    id: 9,
    slug: "zeitlos",
    title: "Zeitlose Eleganz",
    thumbnail: "https://images.unsplash.com/photo-1464550838636-1a3496df938b?w=600&h=900&fit=crop",
  },
];

export default function Blog() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-[5vw] py-4">
          <Link href="/">
            <div className="text-base font-semibold tracking-wide cursor-pointer" data-testid="brand-logo">
              PIX.IMMO
            </div>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            aria-label="Menü"
            aria-expanded={isMenuOpen}
            data-testid="button-menu-toggle"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Blog Grid */}
      <main className="px-[5vw] py-12">
        <h1 className="text-lg font-bold mb-12 tracking-wide" data-testid="page-title">
          Blog
        </h1>

        {/* 3-column grid for portrait images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[11px]">
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <div
                className="relative aspect-[2/3] overflow-hidden bg-gray-100 cursor-pointer group"
                onMouseEnter={() => setHoveredId(post.id)}
                onMouseLeave={() => setHoveredId(null)}
                data-testid={`blog-card-${post.slug}`}
              >
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Dark overlay with title on hover */}
                <div
                  className={`absolute inset-0 bg-black/60 flex items-center justify-center p-6 transition-opacity duration-300 ${
                    hoveredId === post.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <h2 className="text-white text-lg md:text-base font-semibold text-center leading-tight">
                    {post.title}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Compact Dropdown Menu */}
      {isMenuOpen && (
        <div ref={menuRef} className="fixed top-[72px] right-8 z-50 bg-white shadow-lg rounded-md" data-testid="menu-drawer">
          <nav className="flex flex-col px-8 py-6 gap-6">
            <Link href="/gallery">
              <span
                className="text-base text-black cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                data-testid="menu-link-portfolio"
              >
                Portfolio
              </span>
            </Link>
            <Link href="/preise">
              <span
                className="text-base text-black cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                data-testid="menu-link-preise"
              >
                Preise
              </span>
            </Link>
            <Link href="/blog">
              <span
                className="text-base text-black cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                data-testid="menu-link-blog"
              >
                Blog
              </span>
            </Link>
            <Link href="/kontakt">
              <span
                className="text-base text-black cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                data-testid="menu-link-kontakt"
              >
                Kontakt
              </span>
            </Link>
            <Link href="/faq">
              <span
                className="text-base text-black cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                data-testid="menu-link-faq"
              >
                FAQ
              </span>
            </Link>
            <Link href="/login">
              <span
                className="text-base text-black cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                data-testid="menu-link-login"
              >
                Login
              </span>
            </Link>
            <div className="pt-4 mt-2 border-t border-gray-200 flex flex-col gap-3">
              <Link href="/impressum">
                <span
                  className="text-sm text-gray-600 cursor-pointer hover:text-black transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid="menu-link-impressum"
                >
                  Impressum
                </span>
              </Link>
              <Link href="/datenschutz">
                <span
                  className="text-sm text-gray-600 cursor-pointer hover:text-black transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid="menu-link-datenschutz"
                >
                  Datenschutz
                </span>
              </Link>
              <Link href="/agb">
                <span
                  className="text-sm text-gray-600 cursor-pointer hover:text-black transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid="menu-link-agb"
                >
                  AGB
                </span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
