import { Link } from "wouter";
import { SEOHead } from "@shared/components";
import { FooterPixCapture } from "../components/FooterPixCapture";
import { Camera, Upload, Sparkles } from "lucide-react";

export default function PixCaptureAbout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEOHead
        title="About – pixcapture.app"
        description="Erfahren Sie mehr über pixcapture.app – die Self-Service-Plattform für professionelle Immobilienfotografie."
        path="/pixcapture/about"
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
        <div className="max-w-3xl mx-auto px-8 py-16 md:py-24">
          <h2 className="text-4xl font-bold mb-12 text-black">
            Immobilienfotos selbst erstellen – einfach, schnell, professionell
          </h2>

          <div className="space-y-16">
            {/* Intro */}
            <section>
              <p className="text-gray-600 leading-relaxed text-lg">
                pixcapture.app ist die Self-Service-Plattform für Immobilienmakler:innen und Eigentümer:innen,
                die ihre Immobilienfotos schnell und unkompliziert selbst erstellen möchten.
              </p>
            </section>

            {/* Features */}
            <section>
              <h3 className="text-2xl font-semibold mb-8 text-black">So funktioniert's</h3>
              
              <div className="space-y-8">
                {/* Feature 1 */}
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Camera size={24} className="text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-black">1. Mit dem iPhone fotografieren</h4>
                    <p className="text-gray-600 text-base leading-relaxed">
                      Nutzen Sie unsere speziell entwickelte Camera-App für iPhone.
                      Automatisches HDR-Bracketing und intelligente Raumzuordnung helfen Ihnen,
                      professionelle Ergebnisse zu erzielen.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Upload size={24} className="text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-black">2. Bilder hochladen</h4>
                    <p className="text-gray-600 text-base leading-relaxed">
                      Laden Sie Ihre Fotos direkt über die App oder das Web-Interface hoch.
                      Sichere Übertragung und automatische Qualitätsprüfung inklusive.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Sparkles size={24} className="text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-black">3. Professionell bearbeiten lassen</h4>
                    <p className="text-gray-600 text-base leading-relaxed">
                      Unser Team bearbeitet Ihre Bilder professionell:
                      HDR-Merge, Farbkorrektur, Perspektivkorrektur und Optimierung für Exposés.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="border-t border-gray-200 pt-12">
              <h3 className="text-2xl font-semibold mb-6 text-black">Jetzt starten</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/login">
                  <button 
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-base tracking-tight"
                    data-testid="button-login"
                  >
                    Zur Anmeldung
                  </button>
                </a>
                <a 
                  href="/" 
                  className="px-6 py-3 border border-gray-300 text-black rounded-md hover:bg-gray-50 transition-colors text-center text-base tracking-tight"
                  data-testid="link-piximmo"
                >
                  Professionelle Fotografie: pix.immo
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      <FooterPixCapture />
    </div>
  );
}
