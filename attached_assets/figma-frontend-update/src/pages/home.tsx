import { useState } from "react";
import { Link } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { ScrollingImageStrip } from "../components/ScrollingImageStrip";
import { Footer } from "../components/Footer";
import { Menu, X } from "lucide-react";
import { homePageImages, formatForScrollingStrip } from "../data/images";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Bilder aus zentraler Bildverwaltung laden
  const homeImages = formatForScrollingStrip(homePageImages);

  return (
    <div className="bg-[var(--color-white)]">
      <SEOHead
        title="PIX.IMMO - Professionelle Immobilienfotografie"
        description="Professionelle Immobilienfotografie für Hamburg. Hochwertige Aufnahmen für beeindruckende Exposés."
        path="/"
      />

      {/* Logo und Hamburger Menu - Fixed Top */}
      <div className="fixed top-6 left-8 right-8 z-50 flex items-center justify-between">
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
        <div className="fixed top-20 right-8 z-50 bg-[var(--color-white)]">
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
            <Link href="/pixcapture">
              <span
                className="text-[16px] text-[var(--color-black)] cursor-pointer tracking-[-0.02em] hover:text-[var(--color-grey)] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Pixcapture.app
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

      {/* Main viewport section - h-screen */}
      <div className="h-screen flex flex-col">
        {/* White space above */}
        <div className="h-[calc(65vh+31px)]"></div>

        {/* Spacer wo Logo war - kann entfernt werden */}
        <div className="pl-8">
          <div className="h-[56px]"></div>
        </div>

        {/* Spacer to push buttons and strip to bottom */}
        <div className="flex-1"></div>

        {/* Navigation Buttons - Above Strip (Desktop only) */}
        <nav className="hidden lg:flex items-center justify-start gap-6 pb-6 pl-8 bg-[var(--color-white)] h-[40px]">
          <Link href="/gallery">
            <span className="text-[16px] text-[var(--color-black)] hover:text-[var(--color-grey)] transition-colors cursor-pointer tracking-[0.12em]">
              Portfolio
            </span>
          </Link>
          <Link href="/preise">
            <span className="text-[16px] text-[var(--color-black)] hover:text-[var(--color-grey)] transition-colors cursor-pointer tracking-[0.05em]">
              Preise
            </span>
          </Link>
          <Link href="/pixcapture">
            <span className="text-[16px] text-[var(--color-black)] hover:text-[var(--color-grey)] transition-colors cursor-pointer tracking-[0.05em]">
              Pixcapture.app
            </span>
          </Link>
          <Link href="/blog">
            <span className="text-[16px] text-[var(--color-black)] hover:text-[var(--color-grey)] transition-colors cursor-pointer tracking-[0.05em]">
              Blog
            </span>
          </Link>
          <Link href="/login">
            <span className="text-[16px] text-[var(--color-black)] hover:text-[var(--color-grey)] transition-colors cursor-pointer tracking-[0.05em]">
              Login
            </span>
          </Link>
        </nav>

        {/* Scrolling Image Strip */}
        <div className="flex-shrink-0">
          <ScrollingImageStrip images={homeImages} duration={120} clickable={false} />
        </div>
      </div>

      {/* Spacer between strip and footer - 50vh */}
      <div className="h-[50vh]"></div>

      <Footer />
    </div>
  );
}
