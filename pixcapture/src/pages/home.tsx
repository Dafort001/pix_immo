import { useState } from "react";
import { Link } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { ScrollingImageStrip } from "../components/ScrollingImageStrip";
import { FooterPixCapture } from "../components/FooterPixCapture";
import { Menu, X } from "lucide-react";
import { pixCaptureImages, formatForScrollingStrip } from "../data/images";

export default function PixCaptureHome() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Bilder aus zentraler Bildverwaltung laden
  const pixImages = formatForScrollingStrip(pixCaptureImages);

  return (
    <div className="bg-[var(--color-white)]">
      <SEOHead
        title="pixcapture.app – Immobilienfotos selbst erstellen"
        description="Self-Service-Plattform für Immobilienfotografie. Mit dem iPhone fotografieren, hochladen und professionell bearbeiten lassen."
        path="/pixcapture-home"
      />

      {/* Logo und Hamburger Menu - Fixed Top */}
      <div className="fixed top-6 left-8 right-8 z-50 flex items-center justify-between">
        {/* Logo als Home-Button */}
        <Link href="/pixcapture-home">
          <h1 className="text-[24px] font-medium tracking-[0.05em] cursor-pointer text-[var(--color-black)] leading-none hover:text-[var(--color-grey)] transition-colors">
            pixcapture.app
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
        <div className="fixed top-20 right-8 z-50 bg-[var(--color-white)] border border-[var(--color-light-grey)] shadow-lg">
          <nav className="flex flex-col px-8 py-6 gap-6">
            <Link href="/pixcapture-app">
              <span
                className="text-[16px] text-[var(--color-black)] cursor-pointer tracking-[-0.02em] hover:text-[var(--color-grey)] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Upload
              </span>
            </Link>
            <Link href="/pixcapture-help">
              <span
                className="text-[16px] text-[var(--color-black)] cursor-pointer tracking-[-0.02em] hover:text-[var(--color-grey)] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Hilfe
              </span>
            </Link>
            <Link href="/pixcapture-expert-call">
              <span
                className="text-[16px] text-[var(--color-black)] cursor-pointer tracking-[-0.02em] hover:text-[var(--color-grey)] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Expertengespräch
              </span>
            </Link>
            <Link href="/pixcapture-about">
              <span
                className="text-[16px] text-[var(--color-black)] cursor-pointer tracking-[-0.02em] hover:text-[var(--color-grey)] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                About
              </span>
            </Link>
            <Link href="/pixcapture-app/login">
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
          <Link href="/pixcapture-app">
            <span className="text-[16px] text-[var(--color-black)] hover:text-[var(--color-grey)] transition-colors cursor-pointer tracking-[0.12em]">
              Upload
            </span>
          </Link>
          <Link href="/pixcapture-help">
            <span className="text-[16px] text-[var(--color-black)] hover:text-[var(--color-grey)] transition-colors cursor-pointer tracking-[0.05em]">
              Hilfe
            </span>
          </Link>
          <Link href="/pixcapture-expert-call">
            <span className="text-[16px] text-[var(--color-black)] hover:text-[var(--color-grey)] transition-colors cursor-pointer tracking-[0.05em]">
              Expertengespräch
            </span>
          </Link>
          <Link href="/pixcapture-about">
            <span className="text-[16px] text-[var(--color-black)] hover:text-[var(--color-grey)] transition-colors cursor-pointer tracking-[0.05em]">
              About
            </span>
          </Link>
          <Link href="/pixcapture-app/login">
            <span className="text-[16px] text-[var(--color-black)] hover:text-[var(--color-grey)] transition-colors cursor-pointer tracking-[0.05em]">
              Login
            </span>
          </Link>
        </nav>

        {/* Scrolling Image Strip */}
        <div className="flex-shrink-0">
          <ScrollingImageStrip images={pixImages} duration={120} clickable={false} />
        </div>
      </div>

      {/* Feature Cards Section */}
      <section className="max-w-[1200px] mx-auto px-8 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Help Card */}
          <Link href="/pixcapture-help">
            <div className="bg-[#74A4EA] p-12 cursor-pointer hover:opacity-90 transition-opacity min-h-[280px] flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h2 className="text-white mb-4" style={{ fontSize: '28pt', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.2 }}>
                  Brauchst du Hilfe?
                </h2>
                <p className="text-white/90" style={{ fontSize: '16pt', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Schritt-für-Schritt-Anleitung zur App-Nutzung
                </p>
              </div>
              <div className="flex items-center gap-2 text-white mt-6">
                <span style={{ fontSize: '16pt', fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>Mehr erfahren</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Expert Call Card - Coming Soon Badge */}
          <div className="relative bg-[#64BF49] p-12 opacity-60 min-h-[280px] flex flex-col justify-between">
            {/* Coming Soon Badge */}
            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white text-sm font-semibold tracking-wider">DEMNÄCHST</span>
            </div>
            
            <div>
              <div className="h-12 w-12 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-12 h-12">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <h2 className="text-white mb-4" style={{ fontSize: '28pt', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.2 }}>
                Sprich mit einem Experten
              </h2>
              <p className="text-white/90" style={{ fontSize: '16pt', fontFamily: 'Inter, system-ui, sans-serif' }}>
                Kostenlose Beratung zur professionellen Immobilienfotografie
              </p>
            </div>
            <div className="flex items-center gap-2 text-white/70 mt-6">
              <span style={{ fontSize: '16pt', fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}>Bald verfügbar</span>
            </div>
          </div>
        </div>

        {/* Upload Quick Access */}
        <div className="mt-8">
          <Link href="/app-upload">
            <div className="bg-[#1A1A1C] p-12 cursor-pointer hover:bg-[#2A2A2C] transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white mb-3" style={{ fontSize: '32pt', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.2 }}>
                    Jetzt Fotos hochladen
                  </h2>
                  <p className="text-white/80" style={{ fontSize: '16pt', fontFamily: 'Inter, system-ui, sans-serif' }}>
                    Einfach mit dem iPhone fotografieren und direkt hochladen
                  </p>
                </div>
                <div className="hidden md:block">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Spacer before footer */}
      <div className="h-[20vh]"></div>

      <FooterPixCapture />
    </div>
  );
}
