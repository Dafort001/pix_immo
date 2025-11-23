import { Link } from "wouter";
import { SEOHead, SchemaTemplates } from "@shared/components";
import { ScrollingImageStrip } from "@/components/ScrollingImageStrip";
import { homePageImages, formatForScrollingStrip } from "@/data/images";

export default function Home() {
  const homeImages = formatForScrollingStrip(homePageImages);

  return (
    <div className="bg-white">
      <SEOHead
        title="PIX.IMMO - Professionelle Immobilienfotografie Hamburg"
        description="Professionelle Immobilienfotografie für Hamburg. Hochwertige Aufnahmen für beeindruckende Exposés."
        path="/"
        schema={SchemaTemplates.localBusiness}
      />

      {/* Main viewport section - h-screen */}
      <div className="h-screen flex flex-col">
        {/* White space above */}
        <div className="h-[calc(65vh+31px)]"></div>

        {/* Spacer */}
        <div className="pl-8">
          <div className="h-[56px]"></div>
        </div>

        {/* Spacer to push buttons and strip to bottom */}
        <div className="flex-1"></div>

        {/* Navigation Buttons - Above Strip (Tablet & Desktop) */}
        <nav className="hidden md:flex items-center justify-start gap-4 md:gap-6 pb-6 pl-8 bg-white h-[40px]">
          <Link href="/gallery">
            <span className="text-[14px] md:text-[16px] text-black hover:text-gray-600 transition-colors cursor-pointer tracking-[0.12em]" data-testid="link-portfolio">
              Portfolio
            </span>
          </Link>
          <Link href="/preise">
            <span className="text-[14px] md:text-[16px] text-black hover:text-gray-600 transition-colors cursor-pointer tracking-[0.05em]" data-testid="link-preise">
              Preise
            </span>
          </Link>
          <Link href="/blog">
            <span className="text-[14px] md:text-[16px] text-black hover:text-gray-600 transition-colors cursor-pointer tracking-[0.05em]" data-testid="link-blog">
              Blog
            </span>
          </Link>
          <Link href="/login">
            <span className="text-[14px] md:text-[16px] text-black hover:text-gray-600 transition-colors cursor-pointer tracking-[0.05em]" data-testid="link-login">
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

      {/* Footer placeholder - using existing Footer if available */}
      <footer className="py-12 px-8 bg-gray-50 text-gray-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-black mb-4">PIX.IMMO</h3>
            <p className="text-sm">
              Professionelle Immobilienfotografie für Hamburg
            </p>
            <a href="/pixcapture">
              <h3 className="font-semibold text-black mb-4 mt-8 hover:text-gray-600 cursor-pointer transition-colors" data-testid="link-pixcapture-app">
                PixCapture
              </h3>
            </a>
            <p className="text-sm">
              You capture, we do the rest
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-black mb-4">Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/blog"><span className="text-sm hover:text-black cursor-pointer">Blog</span></Link>
              <Link href="/kontakt"><span className="text-sm hover:text-black cursor-pointer">Kontakt</span></Link>
              <Link href="/faq"><span className="text-sm hover:text-black cursor-pointer">FAQ</span></Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-black mb-4">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link href="/impressum"><span className="text-sm hover:text-black cursor-pointer">Impressum</span></Link>
              <Link href="/datenschutz"><span className="text-sm hover:text-black cursor-pointer">Datenschutz</span></Link>
              <Link href="/agb"><span className="text-sm hover:text-black cursor-pointer">AGB</span></Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-200 text-center text-sm">
          © {new Date().getFullYear()} PIX.IMMO. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
}
