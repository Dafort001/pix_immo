import { Link } from "wouter";

export function FooterPixCapture() {
  return (
    <footer className="py-12 px-8 bg-gray-50 text-gray-600">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-semibold text-black mb-4" data-testid="footer-brand">
            pixcapture.app
          </h3>
          <p className="text-sm">
            You capture, we do the rest
          </p>
          <a href="/">
            <h3 
              className="font-semibold text-black mb-4 mt-8 hover:text-gray-600 cursor-pointer transition-colors" 
              data-testid="link-piximmo"
            >
              PIX.IMMO
            </h3>
          </a>
          <p className="text-sm">
            Professionelle Immobilienfotografie für Hamburg
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-black mb-4">Links</h4>
          <div className="flex flex-col gap-2">
            <Link href="/pixcapture/about">
              <span className="text-sm hover:text-black cursor-pointer" data-testid="footer-link-about">
                About
              </span>
            </Link>
            <Link href="/pixcapture/blog">
              <span className="text-sm hover:text-black cursor-pointer" data-testid="footer-link-blog">
                Blog
              </span>
            </Link>
            <a href="/login">
              <span className="text-sm hover:text-black cursor-pointer" data-testid="footer-link-login">
                Login
              </span>
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-black mb-4">Legal</h4>
          <div className="flex flex-col gap-2">
            <Link href="/pixcapture/impressum">
              <span className="text-sm hover:text-black cursor-pointer" data-testid="footer-link-impressum">
                Impressum
              </span>
            </Link>
            <Link href="/pixcapture/datenschutz">
              <span className="text-sm hover:text-black cursor-pointer" data-testid="footer-link-datenschutz">
                Datenschutz
              </span>
            </Link>
            <Link href="/pixcapture/agb">
              <span className="text-sm hover:text-black cursor-pointer" data-testid="footer-link-agb">
                AGB
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-200 text-center text-sm">
        © {new Date().getFullYear()} pixcapture.app. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}
