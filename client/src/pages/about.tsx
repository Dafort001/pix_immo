import { Link } from "wouter";
import { Camera, Plane, Video, Box, Wand2 } from "lucide-react";
import { SEOHead } from "@shared/components";
import { SimplePageHeader } from "@/components/SimplePageHeader";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Über PIX.IMMO"
        description="Professionelle Immobilienfotografie für Hamburg. Hochwertige Aufnahmen, Drohnenvideos, 360°-Touren und KI-gestützte Bildoptimierung."
        path="/about"
      />
      <SimplePageHeader />

      {/* Content */}
      <div className="py-12 md:py-20">
        <div className="w-full max-w-3xl mx-auto px-6">
          <h1 className="text-lg font-bold mb-4" data-testid="page-title">
            Über PIX.IMMO
          </h1>
          <p className="text-base text-gray-700 mb-12">
            Professionelle Immobilienfotografie für Hamburg
          </p>

          <div className="space-y-12">
            {/* Intro */}
            <section>
              <p className="text-gray-700 leading-relaxed mb-4">
                PIX.IMMO ist spezialisiert auf hochwertige Immobilienfotografie für Makler, Bauträger und Immobilienverwalter. 
                Mit Standort in Hamburg bieten wir ein umfassendes Leistungsportfolio, das von klassischer Objektfotografie 
                über Drohnenaufnahmen bis hin zu KI-gestützter Bildoptimierung reicht.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Unser Ziel ist es, Immobilien optimal zu präsentieren und Ihre Vermarktung durch professionelle visuelle Inhalte zu unterstützen. 
                Dabei setzen wir auf modernste Technik, effiziente Workflows und eine enge Zusammenarbeit mit unseren Kunden.
              </p>
            </section>

            {/* Services */}
            <section data-testid="section-services">
              <h2 className="text-lg font-semibold mb-6">Unsere Leistungen</h2>
              
              <div className="space-y-8">
                {/* Immobilienfotografie */}
                <div className="flex gap-4" data-testid="service-photography">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Camera className="h-6 w-6 text-gray-700" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-2">Immobilienfotografie</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Professionelle Innen- und Außenaufnahmen mit hochwertiger Kamera- und Lichttechnik. 
                      Wir erfassen die Atmosphäre Ihrer Immobilie und liefern optimierte Dateien für Web, Print und Social Media. 
                      Perfekt für Exposés und Online-Anzeigen.
                    </p>
                  </div>
                </div>

                {/* Drohnenaufnahmen */}
                <div className="flex gap-4" data-testid="service-drone">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Plane className="h-6 w-6 text-gray-700" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-2">Drohnenaufnahmen</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Luftaufnahmen zur Darstellung von Lage, Grundstück und Umgebung. 
                      Ideal zur Ergänzung klassischer Immobilienfotografie. 
                      Durchführung erfolgt nach rechtlicher und wetterbedingter Machbarkeit.
                    </p>
                  </div>
                </div>

                {/* Videoaufnahmen */}
                <div className="flex gap-4" data-testid="service-video">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Video className="h-6 w-6 text-gray-700" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-2">Videoaufnahmen</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Kurze Videoclips für Online- und Social-Media-Plattformen. 
                      Kombination aus Boden- und Luftaufnahmen möglich. 
                      Verfügbar in Quer- oder Hochformat für Reels, Instagram und YouTube.
                    </p>
                  </div>
                </div>

                {/* 360° Rundgänge */}
                <div className="flex gap-4" data-testid="service-360">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Box className="h-6 w-6 text-gray-700" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-2">Virtuelle Rundgänge (360°-Touren)</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Interaktive 360°-Aufnahmen für Online-Exposés. 
                      Basis-Variante für MLS- und CRM-Systeme (z.B. FIO, onOffice, Propstack). 
                      Erweiterte Variante mit Navigation, Grundriss-Verknüpfung und optionalem Hosting.
                    </p>
                  </div>
                </div>

                {/* KI-Bildoptimierung */}
                <div className="flex gap-4" data-testid="service-ai">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Wand2 className="h-6 w-6 text-gray-700" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-2">KI-gestützte Bildoptimierung</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Automatische Optimierung von Farben, Kontrast und Belichtung. 
                      Entfernen störender Elemente. 
                      Virtuelles Staging auf Anfrage. 
                      Ausschließlich für bei PIX.IMMO produzierte Bilder verfügbar.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Standort */}
            <section data-testid="section-locations">
              <h2 className="text-lg font-semibold mb-4">Unser Standort</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg max-w-lg">
                <h3 className="text-xl font-semibold mb-2">Hamburg</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Daniel Fortmann</strong>
                </p>
                <p className="text-gray-700">
                  Servicebereich: Hamburg und Umgebung (bis 30 km inklusive)
                </p>
              </div>

              <p className="text-gray-700 mt-6">
                Für Objekte außerhalb dieses Bereichs berechnen wir 0,80 € pro gefahrenem Kilometer (Hin- und Rückweg). 
                Weitere Informationen finden Sie auf unserer{" "}
                <Link href="/preise">
                  <span className="underline cursor-pointer">Preisseite</span>
                </Link>.
              </p>
            </section>

            {/* Workflow */}
            <section data-testid="section-workflow">
              <h2 className="text-lg font-semibold mb-4">Unser Workflow</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-1">1. Buchung</h3>
                  <p className="leading-relaxed">
                    Schnelle und unkomplizierte Buchung über unser Kundenportal oder per Kontaktformular.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">2. Vor-Ort-Termin</h3>
                  <p className="leading-relaxed">
                    Professionelle Aufnahmen durch erfahrene Fotografen mit hochwertiger Ausrüstung.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">3. Nachbearbeitung</h3>
                  <p className="leading-relaxed">
                    Sorgfältige Auswahl und Bearbeitung der besten Aufnahmen. Optional: KI-gestützte Optimierung.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">4. Lieferung</h3>
                  <p className="leading-relaxed">
                    Bereitstellung über unsere sichere Kunden-Galerie mit Download-Funktion und optionalen Alt-Texten für CRM-Systeme.
                  </p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="bg-gray-50 p-6 rounded-lg" data-testid="section-cta">
              <h2 className="text-lg font-semibold mb-3">Starten Sie Ihr Projekt</h2>
              <p className="text-gray-700 mb-4">
                Interessiert an professioneller Immobilienfotografie? Kontaktieren Sie uns für ein individuelles Angebot!
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/kontakt-formular">
                  <button className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors" data-testid="button-contact">
                    Kontakt aufnehmen
                  </button>
                </Link>
                <Link href="/preise">
                  <button className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" data-testid="button-pricing">
                    Preise ansehen
                  </button>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
