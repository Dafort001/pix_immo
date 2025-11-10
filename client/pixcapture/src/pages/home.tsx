import { useState } from "react";
import { Link } from "wouter";
import { SEOHead } from "@shared/components";
import { ScrollingImageStrip } from "../components/ScrollingImageStrip";
import { FooterPixCapture } from "../components/FooterPixCapture";
import { Menu, X } from "lucide-react";
import { pixCaptureImages, formatForScrollingStrip } from "../data/images";

export default function PixCaptureHome() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Bilder aus zentraler Bildverwaltung laden
  const pixImages = formatForScrollingStrip(pixCaptureImages);

  return (
    <div className="bg-white">
      <SEOHead
        title="pixcapture.app – Immobilienfotos selbst erstellen"
        description="Self-Service-Plattform für Immobilienfotografie. Mit dem iPhone fotografieren, hochladen und professionell bearbeiten lassen."
        path="/pixcapture"
      />

      {/* Logo und Hamburger Menu - Fixed Top */}
      <div className="fixed top-6 left-8 right-8 z-50 flex items-center justify-between">
        {/* Logo als Home-Button */}
        <Link href="/pixcapture">
          <h1 
            className="text-2xl font-medium tracking-tight cursor-pointer text-black leading-none hover:text-gray-600 transition-colors"
            data-testid="brand-logo"
          >
            pixcapture.app
          </h1>
        </Link>
        
        {/* Hamburger Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-black"
          aria-label="Menu"
          data-testid="button-menu-toggle"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed top-20 right-8 z-50 bg-white border border-gray-200 shadow-lg rounded-md">
          <nav className="flex flex-col px-8 py-6 gap-6">
            <Link href="/pixcapture/about">
              <span
                className="text-base text-black cursor-pointer tracking-tight hover:text-gray-600 transition-colors"
                onClick={() => setMenuOpen(false)}
                data-testid="menu-link-about"
              >
                About
              </span>
            </Link>
            <Link href="/pixcapture/blog">
              <span
                className="text-base text-black cursor-pointer tracking-tight hover:text-gray-600 transition-colors"
                onClick={() => setMenuOpen(false)}
                data-testid="menu-link-blog"
              >
                Blog
              </span>
            </Link>
            <Link href="/pixcapture/login">
              <span
                className="text-base text-black cursor-pointer tracking-tight hover:text-gray-600 transition-colors"
                onClick={() => setMenuOpen(false)}
                data-testid="menu-link-login"
              >
                Login
              </span>
            </Link>
            <div className="pt-4 mt-2 border-t border-gray-200 flex flex-col gap-3">
              <Link href="/pixcapture/impressum">
                <span
                  className="text-sm text-gray-600 cursor-pointer hover:text-black transition-colors"
                  onClick={() => setMenuOpen(false)}
                  data-testid="menu-link-impressum"
                >
                  Impressum
                </span>
              </Link>
              <Link href="/pixcapture/datenschutz">
                <span
                  className="text-sm text-gray-600 cursor-pointer hover:text-black transition-colors"
                  onClick={() => setMenuOpen(false)}
                  data-testid="menu-link-datenschutz"
                >
                  Datenschutz
                </span>
              </Link>
              <Link href="/pixcapture/agb">
                <span
                  className="text-sm text-gray-600 cursor-pointer hover:text-black transition-colors"
                  onClick={() => setMenuOpen(false)}
                  data-testid="menu-link-agb"
                >
                  AGB
                </span>
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Main viewport section - h-screen */}
      <div className="h-screen flex flex-col">
        {/* White space above */}
        <div className="h-[calc(65vh+31px)]"></div>

        {/* Spacer */}
        <div className="pl-8">
          <div className="h-14"></div>
        </div>

        {/* Spacer to push buttons and strip to bottom */}
        <div className="flex-1"></div>

        {/* Navigation Buttons - Above Strip (Desktop only) */}
        <nav className="hidden lg:flex items-center justify-start gap-6 pb-6 pl-8 bg-white h-10">
          <Link href="/pixcapture/about">
            <span 
              className="text-base text-black hover:text-gray-600 transition-colors cursor-pointer tracking-tight"
              data-testid="link-about"
            >
              About
            </span>
          </Link>
          <Link href="/pixcapture/blog">
            <span 
              className="text-base text-black hover:text-gray-600 transition-colors cursor-pointer tracking-tight"
              data-testid="link-blog"
            >
              Blog
            </span>
          </Link>
          <Link href="/pixcapture/login">
            <span 
              className="text-base text-black hover:text-gray-600 transition-colors cursor-pointer tracking-tight"
              data-testid="link-login"
            >
              Login
            </span>
          </Link>
        </nav>

        {/* Scrolling Image Strip */}
        <div className="flex-shrink-0">
          <ScrollingImageStrip images={pixImages} duration={120} clickable={false} />
        </div>
      </div>

      {/* Spacer between strip and footer */}
      <div className="h-[50vh]"></div>

      <FooterPixCapture />
    </div>
  );
}
