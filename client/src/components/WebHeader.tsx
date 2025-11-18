import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

export function WebHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
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
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            aria-label="Menü öffnen"
            aria-expanded={isMenuOpen}
            data-testid="button-menu-open"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Hamburger Menu Drawer */}
      {isMenuOpen && (
        <aside
          className="fixed inset-0 z-50 bg-white"
          aria-hidden={!isMenuOpen}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMenuOpen(false);
          }}
          data-testid="menu-drawer"
        >
          <div className="flex items-center justify-between px-[5vw] py-4 border-b">
            <Link href="/">
              <div className="text-base font-semibold tracking-wide cursor-pointer" onClick={() => setIsMenuOpen(false)}>
                PIX.IMMO
              </div>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="hover:opacity-70"
              aria-label="Menü schließen"
              data-testid="button-menu-close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="px-[5vw] py-8">
            <ul className="space-y-4">
              <li>
                <Link href="/dashboard">
                  <span
                    className="block text-lg font-medium hover:underline cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                    data-testid="menu-link-dashboard"
                  >
                    Dashboard
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/portal/uploads">
                  <span
                    className="block text-lg font-medium hover:underline cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                    data-testid="menu-link-uploads"
                  >
                    Uploads
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/preise">
                  <span
                    className="block text-lg font-medium hover:underline cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                    data-testid="menu-link-preise"
                  >
                    Preise
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <span
                    className="block text-lg font-medium hover:underline cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                    data-testid="menu-link-blog"
                  >
                    Blog
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/kontakt">
                  <span
                    className="block text-lg font-medium hover:underline cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                    data-testid="menu-link-kontakt"
                  >
                    Kontakt
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <span
                    className="block text-lg font-medium hover:underline cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                    data-testid="menu-link-faq"
                  >
                    FAQ
                  </span>
                </Link>
              </li>
              <li className="pt-4 mt-4 border-t border-gray-200">
                <Link href="/impressum">
                  <span
                    className="block text-sm text-gray-600 hover:underline cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                    data-testid="menu-link-impressum"
                  >
                    Impressum
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/datenschutz">
                  <span
                    className="block text-sm text-gray-600 hover:underline cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                    data-testid="menu-link-datenschutz"
                  >
                    Datenschutz
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/agb">
                  <span
                    className="block text-sm text-gray-600 hover:underline cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                    data-testid="menu-link-agb"
                  >
                    AGB
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
      )}
    </>
  );
}
