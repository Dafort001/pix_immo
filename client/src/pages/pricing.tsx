import { Link } from "wouter";
import { SEOHead } from "@shared/components";
import { SimplePageHeader } from "@/components/SimplePageHeader";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Preise und Leistungen"
        description="Professionelle Immobilienfotografie ab 180€. Drohnenaufnahmen, 360°-Touren, Videos und KI-gestützte Bildoptimierung für Hamburg."
        path="/preise"
      />
      <SimplePageHeader />

      {/* Content */}
      <div className="py-12 md:py-20">
        <div className="w-full max-w-3xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="page-title">
            Preise und Leistungen
          </h1>
          <p className="text-lg text-gray-700 mb-2">
            Immobilienfotografie Hamburg
          </p>
          <p className="text-base text-gray-600 mb-12 leading-relaxed">
            Professionelle Immobilienfotografie, Drohnenaufnahmen, Videos und 360°-Rundgänge für Exposés, Online-Präsentationen und soziale Medien.
            Alle Aufnahmen werden auftragsbezogen geplant, mit professioneller Kamera- und Lichttechnik umgesetzt und sorgfältig nachbearbeitet.
            Optional kann eine KI-gestützte Optimierung zur automatischen Licht- und Farbkorrektur eingesetzt werden.
          </p>

          <div className="space-y-12">
            {/* Immobilienfotografie */}
            <section data-testid="section-photography">
              <h2 className="text-2xl font-semibold mb-3">Immobilienfotografie</h2>
              <p className="text-xl font-medium text-gray-900 mb-4">ab 180 € zzgl. MwSt.</p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Aufnahmen von Innen- und Außenbereichen</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Auswahl und Bearbeitung der besten Motive</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Lieferung als hochauflösende JPG-Dateien, optimiert für Web und Druck</span>
                </li>
              </ul>
              <p className="text-sm text-gray-600 italic">
                Ideal für hochwertige Exposés, Online-Anzeigen und Social-Media-Beiträge.
              </p>
            </section>

            {/* Drohnenaufnahmen */}
            <section data-testid="section-drone">
              <h2 className="text-2xl font-semibold mb-3">Drohnenaufnahmen</h2>
              <p className="text-xl font-medium text-gray-900 mb-1">ab 150 € zzgl. MwSt.</p>
              <p className="text-lg font-medium text-gray-700 mb-4">ab 100 €, wenn Bestandteil eines Fotopakets</p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Außenaufnahmen aus der Luft zur Darstellung von Lage, Grundstück und Umgebung</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Durchführung nach rechtlicher und wetterbedingter Machbarkeit</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Lieferung mehrerer Perspektiven in hoher Auflösung</span>
                </li>
              </ul>
              <p className="text-sm text-gray-600 italic">
                Empfohlen als Ergänzung zur klassischen Immobilienfotografie.
              </p>
            </section>

            {/* Videoaufnahmen */}
            <section data-testid="section-video">
              <h2 className="text-2xl font-semibold mb-3">Videoaufnahmen</h2>
              <p className="text-xl font-medium text-gray-900 mb-4">ab 199 € zzgl. MwSt.</p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Kurze Videoclips für Online- und Social-Media-Plattformen</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Kombination aus Boden- und Luftaufnahmen möglich</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Quer- oder Hochformat für Reels, Instagram und YouTube</span>
                </li>
              </ul>
              <p className="text-sm text-gray-600 italic">
                Für Makler, Bauträger und Agenturen, die Immobilien filmisch präsentieren möchten.
              </p>
            </section>

            {/* Virtuelle Rundgänge */}
            <section data-testid="section-360">
              <h2 className="text-2xl font-semibold mb-3">Virtuelle Rundgänge (360°-Touren)</h2>
              <p className="text-xl font-medium text-gray-900 mb-4">ab 100 € zzgl. MwSt.</p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Erstellung von 360°-Aufnahmen und virtuellen Rundgängen für Online-Exposés</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Basis-Variante ab 100 € für die Nutzung in CRM-Systemen (z. B. FIO, onOffice, Propstack)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Erweiterte Variante ab 239 € mit interaktiver Navigation, Grundriss-Verknüpfung und optionalem Hosting (6 Monate)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Lieferung in Formaten, die mit gängiger Maklersoftware kompatibel sind</span>
                </li>
              </ul>
              <p className="text-sm text-gray-600 italic">
                Ideal zur Integration in Exposés, Immobilienportale oder Kunden-Galerien.
              </p>
            </section>

            {/* Virtuelles Staging */}
            <section data-testid="section-staging">
              <h2 className="text-2xl font-semibold mb-3">Virtuelles Staging</h2>
              <p className="text-xl font-medium text-gray-900 mb-4">auf Anfrage</p>
              <p className="text-gray-700 mb-4">
                Virtuelles Staging wird individuell nach Briefing und Moodboard angeboten.
                Die Preisgestaltung richtet sich nach Raumgröße, Stilrichtung und gewünschtem Detailgrad.
              </p>
              <p className="text-sm text-gray-600 italic">
                Ideal für leerstehende oder renovierungsbedürftige Objekte.
              </p>
            </section>

            {/* Bildoptimierung */}
            <section data-testid="section-retouching">
              <h2 className="text-2xl font-semibold mb-3">Bildoptimierung und KI-Retusche</h2>
              <p className="text-xl font-medium text-gray-900 mb-4">ab 3,90 € pro Bild zzgl. MwSt.</p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Anpassung von Farben, Kontrast und Belichtung</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Entfernen kleiner Objekte oder störender Elemente</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Auf Wunsch automatische Optimierung über internes KI-System (separat berechnet)</span>
                </li>
              </ul>
              <p className="text-sm text-gray-600 italic">
                Für eine harmonische und technisch saubere Bildwirkung.
              </p>
            </section>

            {/* Anfahrt */}
            <section data-testid="section-travel">
              <h2 className="text-2xl font-semibold mb-3">Anfahrt und Geltungsbereich</h2>
              <p className="text-gray-700 mb-4">
                Die Leistungen werden im Großraum Hamburg angeboten.
                Die Anfahrt ist innerhalb von 30 km um Hamburg im Preis enthalten (Entfernung ab Stadtgrenze).
              </p>
              <p className="text-gray-700 mb-4">
                Für weiter entfernte Objekte werden 0,60 € pro gefahrenem Kilometer (Hin- und Rückweg) berechnet.
                Zusätzliche Reisezeiten oder Übernachtungen werden nach Absprache vereinbart.
              </p>
              <p className="text-gray-700">
                Bei größeren Projekten oder mehreren Objekten an einem Termin erfolgt die Preisberechnung individuell nach Aufwand.
              </p>
            </section>

            {/* Allgemeine Hinweise */}
            <section data-testid="section-notes">
              <h2 className="text-2xl font-semibold mb-3">Allgemeine Hinweise</h2>
              <p className="text-gray-700 mb-2">
                Alle Preise verstehen sich zzgl. 19 % MwSt.
              </p>
              <p className="text-gray-700 mb-2">
                Preise gelten vorbehaltlich technischer Machbarkeit und aktueller Verfügbarkeit.
              </p>
              <p className="text-gray-700">
                KI-gestützte Nachbearbeitungen erfolgen nur nach ausdrücklicher Freigabe und werden gesondert berechnet.
              </p>
            </section>

            {/* Anfrage und Buchung */}
            <section data-testid="section-booking" className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700">
                Für individuelle Angebote oder Buchungen nutzen Sie bitte den{" "}
                <Link href="/login">
                  <span className="font-semibold text-black hover:underline cursor-pointer" data-testid="link-login">
                    Kunden-Login
                  </span>
                </Link>
                {" "}oder das{" "}
                <Link href="/kontakt-formular">
                  <span className="font-semibold text-black hover:underline cursor-pointer" data-testid="link-contact">
                    Kontaktformular
                  </span>
                </Link>
                {" "}auf unserer Website.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
