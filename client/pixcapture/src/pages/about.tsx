import { Link } from "wouter";
import { SEOHead } from "@shared/components";
import { FooterPixCapture } from "../components/FooterPixCapture";
import { Camera, Upload, Sparkles } from "lucide-react";

export default function PixCaptureAbout() {
  return (
    <div className="min-h-screen bg-[var(--color-white)] flex flex-col">
      <SEOHead
        title="About – pixcapture.app"
        description="Erfahren Sie mehr über pixcapture.app – die Self-Service-Plattform für professionelle Immobilienfotografie."
        path="/pixcapture-about"
      />

      {/* Header */}
      <header className="border-b border-[var(--color-light-grey)]">
        <div className="max-w-[1200px] mx-auto px-8 py-6">
          <Link href="/pixcapture">
            <h1 className="text-[24px] font-medium tracking-[0.05em] cursor-pointer text-[var(--color-black)] leading-none hover:text-[var(--color-grey)] transition-colors">
              pixcapture.app
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-[800px] mx-auto px-8 py-16 md:py-24">
          <h2 className="mb-12">
            Immobilienfotos selbst erstellen – einfach, schnell, professionell
          </h2>

          <div className="space-y-16">
            {/* Intro */}
            <section>
              <p className="text-[var(--color-grey)] leading-relaxed">
                pixcapture.app ist die Self-Service-Plattform für Immobilienmakler:innen und Eigentümer:innen,
                die ihre Immobilienfotos schnell und unkompliziert selbst erstellen möchten.
              </p>
            </section>

            {/* Features */}
            <section>
              <h3 className="mb-8">So funktioniert's</h3>
              
              <div className="space-y-8">
                {/* Feature 1 */}
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] bg-opacity-10 flex items-center justify-center">
                      <Camera size={24} className="text-[var(--color-accent)]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2">1. Mit dem iPhone fotografieren</h4>
                    <p className="text-[var(--color-grey)] text-[16px] leading-relaxed">
                      Nutzen Sie unsere speziell entwickelte Camera-App für iPhone.
                      Automatisches HDR-Bracketing und intelligente Raumzuordnung helfen Ihnen,
                      professionelle Ergebnisse zu erzielen.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] bg-opacity-10 flex items-center justify-center">
                      <Upload size={24} className="text-[var(--color-accent)]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2">2. Bilder hochladen</h4>
                    <p className="text-[var(--color-grey)] text-[16px] leading-relaxed">
                      Laden Sie Ihre Fotos direkt über die App oder das Web-Interface hoch.
                      Sichere Übertragung und automatische Qualitätsprüfung inklusive.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] bg-opacity-10 flex items-center justify-center">
                      <Sparkles size={24} className="text-[var(--color-accent)]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2">3. Professionell bearbeiten lassen</h4>
                    <p className="text-[var(--color-grey)] text-[16px] leading-relaxed">
                      Unser Team bearbeitet Ihre Bilder professionell:
                      HDR-Merge, Farbkorrektur, Perspektivkorrektur und Optimierung für Exposés.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="border-t border-[var(--color-light-grey)] pt-12">
              <h3 className="mb-6">Jetzt starten</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/pixcapture/login">
                  <button className="px-6 py-3 bg-[var(--color-accent)] text-[var(--color-white)] rounded-md hover:opacity-90 transition-opacity text-[16px] tracking-[-0.02em]">
                    Zur Anmeldung
                  </button>
                </Link>
                <a 
                  href="https://pix.immo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-[var(--color-light-grey)] text-[var(--color-black)] rounded-md hover:bg-[var(--color-white)] transition-colors text-center text-[16px] tracking-[-0.02em]"
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
