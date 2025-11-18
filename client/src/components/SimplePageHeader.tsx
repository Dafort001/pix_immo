import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

export function SimplePageHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
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

      {/* Compact Dropdown Menu */}
      {isMenuOpen && (
        <div ref={menuRef} className="fixed top-[72px] right-8 z-50 bg-white shadow-lg rounded-md" data-testid="menu-drawer">
          <nav className="flex flex-col px-8 py-6 gap-6">
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
    </>
  );
}
