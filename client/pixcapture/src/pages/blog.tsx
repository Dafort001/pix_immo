import { Link } from "wouter";
import { SEOHead } from "@shared/components";
import { FooterPixCapture } from "../components/FooterPixCapture";

export default function PixCaptureBlog() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEOHead
        title="Blog – pixcapture.app"
        description="Tipps und Tricks für bessere Immobilienfotos mit dem iPhone."
        path="/pixcapture/blog"
      />

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Link href="/pixcapture">
            <h1 
              className="text-2xl font-medium tracking-tight cursor-pointer text-black leading-none hover:text-gray-600 transition-colors"
              data-testid="brand-logo"
            >
              pixcapture.app
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-8 py-16 md:py-24">
          <h2 className="text-4xl font-bold mb-4 text-black">Blog</h2>
          <p className="text-lg text-gray-600 mb-12">
            Tipps und Tricks für bessere Immobilienfotos
          </p>

          {/* Placeholder Content */}
          <div className="space-y-12">
            <article className="border-b border-gray-200 pb-12">
              <h3 className="text-2xl font-semibold mb-4 text-black">
                Artikel-Titel Platzhalter
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Hier werden zukünftig hilfreiche Artikel zur Immobilienfotografie erscheinen.
              </p>
              <span className="text-sm text-gray-500">Kommt bald</span>
            </article>

            <article className="border-b border-gray-200 pb-12">
              <h3 className="text-2xl font-semibold mb-4 text-black">
                Weitere Inhalte folgen
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Diese Seite wird mit nützlichen Inhalten gefüllt, sobald die 
                technische Infrastruktur vollständig steht.
              </p>
              <span className="text-sm text-gray-500">In Arbeit</span>
            </article>
          </div>
        </div>
      </main>

      <FooterPixCapture />
    </div>
  );
}
