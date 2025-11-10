import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEOHead } from "@shared/components";
import { SimplePageHeader } from "@/components/SimplePageHeader";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Häufig gestellte Fragen (FAQ)"
        description="Antworten auf häufige Fragen zu Buchung, Ablauf, Bearbeitungszeiten, Rechten und Kosten der Immobilienfotografie."
        path="/faq"
      />
      <SimplePageHeader />

      {/* Content */}
      <div className="py-12 md:py-20">
        <div className="w-full max-w-3xl mx-auto px-6">
          <h1 className="text-lg font-bold mb-4" data-testid="page-title">
            Häufig gestellte Fragen
          </h1>
          <p className="text-base text-gray-700 mb-12">
            Hier finden Sie Antworten auf die wichtigsten Fragen zu unseren Leistungen, Abläufen und Konditionen.
          </p>

          <Accordion type="single" collapsible className="space-y-4" data-testid="faq-accordion">
            {/* Buchung & Ablauf */}
            <AccordionItem value="booking" className="border rounded-lg px-6" data-testid="faq-booking">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Wie funktioniert die Buchung?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Die Buchung erfolgt über das Kundenportal. Nach Registrierung wählen Sie die gewünschten Leistungen, 
                geben die Objektadresse und einen Wunschtermin an. Sie erhalten anschließend eine Bestätigung per E-Mail und SMS. 
                Alternativ können Sie uns über das <Link href="/kontakt-formular"><span className="underline cursor-pointer">Kontaktformular</span></Link> kontaktieren.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="duration" className="border rounded-lg px-6" data-testid="faq-duration">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Wie lange dauert ein Termin vor Ort?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Je nach Größe und Umfang der Immobilie. Eine Wohnung mit 3–4 Zimmern dauert in der Regel 1–1,5 Stunden. 
                Bei größeren Objekten oder zusätzlichen Leistungen wie Drohnenaufnahmen entsprechend länger.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery-time" className="border rounded-lg px-6" data-testid="faq-delivery-time">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Wann erhalte ich die fertigen Bilder?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Die Lieferung erfolgt innerhalb von 2 Werktagen nach dem Termin.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery-format" className="border rounded-lg px-6" data-testid="faq-delivery-format">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                In welchem Format werden die Bilder geliefert?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Die Bilder werden als JPG-Dateien mit 2800 Pixeln an der langen Seite geliefert, optimiert für Web und Druck. 
                Auf Wunsch können ergänzende Formate für CRM-Systeme bereitgestellt werden.
              </AccordionContent>
            </AccordionItem>

            {/* Rechte & Nutzung */}
            <AccordionItem value="rights" className="border rounded-lg px-6" data-testid="faq-rights">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Welche Nutzungsrechte erhalte ich?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Sie dürfen die Bilder zur Vermarktung der fotografierten Immobilie nutzen – für Exposés, Online-Portale, 
                Social Media oder Print. Das Urheberrecht bleibt bei PIX.IMMO.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="third-party" className="border rounded-lg px-6" data-testid="faq-third-party">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Darf ich die Bilder an Dritte weitergeben?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Nur im Rahmen der Vermarktung des fotografierten Objekts. Eine Weitergabe oder Nutzung für andere Immobilien 
                ist nicht erlaubt. Für erweiterte Nutzungsrechte bitte anfragen.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="editing" className="border rounded-lg px-6" data-testid="faq-editing">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Kann ich individuelle Bearbeitungen beauftragen?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Ja, zusätzliche Bearbeitungen wie Objektentfernung, virtuelle Möblierung oder Retusche sind möglich. 
                Die jeweiligen Kosten werden vorab transparent mitgeteilt.
              </AccordionContent>
            </AccordionItem>

            {/* Technik & Qualität */}
            <AccordionItem value="equipment" className="border rounded-lg px-6" data-testid="faq-equipment">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Mit welcher Ausrüstung wird fotografiert?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Wir arbeiten mit professioneller Kamera- und Lichttechnik, die je nach Auftrag und Objektgröße ausgewählt wird. 
                Ziel ist eine konsistente, technisch saubere und präzise Bildwiedergabe.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="weather" className="border rounded-lg px-6" data-testid="faq-weather">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Was passiert bei schlechtem Wetter?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Bei Regen, starkem Wind oder ungeeignetem Licht können Außen- und Drohnenaufnahmen verschoben werden. 
                Wird ein Termin witterungsbedingt nicht kurzfristig durchführbar, kann ein Ausfallhonorar entstehen.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ai-processing" className="border rounded-lg px-6" data-testid="faq-ai-processing">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Was bedeutet KI-gestützte Bearbeitung?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Bei der optionalen Nutzung von KI-Systemen werden Farben, Kontrast und Belichtung optimiert oder störende Objekte digital entfernt. 
                Diese Leistungen werden separat berechnet und vor Ausführung abgestimmt.
              </AccordionContent>
            </AccordionItem>

            {/* Kosten & Zahlung */}
            <AccordionItem value="pricing" className="border rounded-lg px-6" data-testid="faq-pricing">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Wie setzen sich die Preise zusammen?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Die Preise richten sich nach den gebuchten Leistungen. Innerhalb von 30 km um Hamburg ist die Anfahrt inklusive. 
                Ab 30 km Entfernung berechnen wir 0,60 € pro gefahrenem Kilometer (Hin- und Rückweg). Alle Preise zzgl. 19 % MwSt.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payment" className="border rounded-lg px-6" data-testid="faq-payment">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Wann und wie wird bezahlt?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Die Rechnung wird nach Lieferung der Bilder gestellt. Zahlungsziel: 7 Tage ab Rechnungsdatum. 
                Bei digitalen Zusatzleistungen wie KI-Bearbeitung oder virtuellem Staging kann die Zahlung direkt bei Beauftragung erfolgen.
              </AccordionContent>
            </AccordionItem>

            {/* Vorbereitung der Immobilie */}
            <AccordionItem value="preparation" className="border rounded-lg px-6" data-testid="faq-preparation">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                Wie sollte die Immobilie vor dem Fototermin vorbereitet werden?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                <p className="mb-3">
                  Eine aufgeräumte und gepflegte Immobilie wirkt auf Bildern größer und ansprechender. 
                  Folgende Punkte helfen, ein sauberes Ergebnis zu erzielen:
                </p>
                
                <ul className="list-disc pl-6 space-y-1 mb-3">
                  <li>Räume vollständig aufräumen und reinigen</li>
                  <li>Persönliche Gegenstände weitgehend entfernen</li>
                  <li>Vorhänge öffnen und für gute Beleuchtung sorgen</li>
                  <li>Mülltonnen, Gartengeräte und Fahrzeuge entfernen</li>
                  <li>Küche und Bad frei von Putzmitteln, Handtüchern und Alltagsgegenständen halten</li>
                  <li>Betten ordentlich beziehen, Wäsche wegräumen</li>
                  <li>Außenbereich (Rasen, Wege, Terrasse) in Ordnung bringen</li>
                </ul>

                <p className="text-sm">
                  Wenn das im Alltag nicht vollständig umsetzbar ist, können kleinere Makel im Rahmen der Nachbearbeitung 
                  oder auf Wunsch digital korrigiert werden.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Contact CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-3">Weitere Fragen?</h2>
            <p className="text-gray-700 mb-4">
              Haben Sie eine Frage, die hier nicht beantwortet wurde? Wir helfen Ihnen gerne weiter!
            </p>
            <Link href="/kontakt-formular">
              <button className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors" data-testid="button-contact">
                Kontakt aufnehmen
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
