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
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="page-title">
            Häufig gestellte Fragen
          </h1>
          <p className="text-lg text-gray-700 mb-12">
            Hier finden Sie Antworten auf die wichtigsten Fragen zu unseren Leistungen, Abläufen und Konditionen.
          </p>

          <Accordion type="single" collapsible className="space-y-4" data-testid="faq-accordion">
            {/* Buchung und Ablauf */}
            <AccordionItem value="booking" className="border rounded-lg px-6" data-testid="faq-booking">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Wie funktioniert die Buchung?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Die Buchung erfolgt unkompliziert über unser Kundenportal. Nach der Registrierung können Sie Ihre gewünschten Leistungen auswählen, 
                die Immobilienadresse angeben und einen Wunschtermin nennen. Nach Absenden der Buchung erhalten Sie eine Bestätigung per E-Mail und SMS. 
                Alternativ können Sie uns auch über das <Link href="/kontakt-formular"><span className="underline cursor-pointer">Kontaktformular</span></Link> erreichen.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="duration" className="border rounded-lg px-6" data-testid="faq-duration">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Wie lange dauert ein Vor-Ort-Termin?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Die Dauer hängt von der Größe der Immobilie und den gebuchten Leistungen ab. 
                Für eine typische Wohnung mit 3–4 Zimmern sollten Sie etwa 1–1,5 Stunden einplanen. 
                Bei größeren Objekten oder zusätzlichen Leistungen wie Drohnenaufnahmen kann es auch länger dauern. 
                Wir stimmen den genauen Zeitrahmen bei der Terminvereinbarung mit Ihnen ab.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery-time" className="border rounded-lg px-6" data-testid="faq-delivery-time">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Wann erhalte ich die fertigen Bilder?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Die Standardbearbeitungszeit beträgt 2–4 Werktage nach dem Shooting. 
                In dringenden Fällen können wir gegen Aufpreis auch Express-Bearbeitungen innerhalb von 24 Stunden anbieten. 
                Sobald die Bilder fertig sind, werden sie in Ihrer persönlichen Kunden-Galerie bereitgestellt und Sie erhalten eine Benachrichtigung.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery-format" className="border rounded-lg px-6" data-testid="faq-delivery-format">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                In welchem Format werden die Bilder geliefert?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Die Bilder werden als hochauflösende JPG-Dateien geliefert, optimiert für Web und Druck. 
                Die Auflösung beträgt in der Regel 3000–4000 Pixel in der längeren Kante. 
                Optional bieten wir auch RAW-Dateien oder spezielle Formate für CRM-Systeme an. 
                Zusätzlich können automatisch generierte Alt-Texte als .txt- oder .json-Dateien bereitgestellt werden.
              </AccordionContent>
            </AccordionItem>

            {/* Rechte und Nutzung */}
            <AccordionItem value="rights" className="border rounded-lg px-6" data-testid="faq-rights">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Welche Rechte habe ich an den Bildern?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Sie erhalten ein umfassendes Nutzungsrecht für die Vermarktung der fotografierten Immobilie. 
                Dies umfasst die Verwendung in Exposés, auf Immobilienportalen, auf Ihrer Website und in Social Media. 
                Das Urheberrecht verbleibt bei PIX.IMMO. Details finden Sie in unseren{" "}
                <Link href="/agb"><span className="underline cursor-pointer">AGB</span></Link>.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="editing" className="border rounded-lg px-6" data-testid="faq-editing">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Kann ich eigene Bearbeitungswünsche äußern?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Ja, kleinere Anpassungen sind in der Regel im Preis inbegriffen. 
                Bei umfangreicheren Retuschen oder virtuellen Möblierungen erstellen wir gerne ein individuelles Angebot. 
                Nutzen Sie hierzu unser Kommentarsystem in der Kunden-Galerie oder kontaktieren Sie uns direkt.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="copyright" className="border rounded-lg px-6" data-testid="faq-copyright">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Darf ich die Bilder weitergeben oder verkaufen?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Die Bilder sind ausschließlich für die Vermarktung der fotografierten Immobilie lizenziert. 
                Eine Weitergabe an Dritte (z.B. andere Makler) oder die Verwendung für andere Objekte ist nicht gestattet. 
                Für erweiterte Nutzungsrechte sprechen Sie uns bitte an.
              </AccordionContent>
            </AccordionItem>

            {/* Technik und Qualität */}
            <AccordionItem value="equipment" className="border rounded-lg px-6" data-testid="faq-equipment">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Mit welcher Ausrüstung wird fotografiert?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Wir arbeiten mit professioneller Vollformat-Kameratechnik (Canon, Sony), hochwertigen Weitwinkelobjektiven 
                und portabler Studioblitztechnik. Für Drohnenaufnahmen setzen wir DJI-Drohnen der neuesten Generation ein. 
                Alle Aufnahmen werden im RAW-Format erstellt und anschließend professionell bearbeitet.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="weather" className="border rounded-lg px-6" data-testid="faq-weather">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Was passiert bei schlechtem Wetter (Drohnenaufnahmen)?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Drohnenaufnahmen sind wetterabhängig und können nur bei geeigneten Bedingungen durchgeführt werden 
                (kein starker Wind, kein Regen). Falls das Wetter am geplanten Termin nicht mitspielt, 
                vereinbaren wir einen Ersatztermin – ohne zusätzliche Kosten für Sie. 
                Innenaufnahmen sind davon nicht betroffen und können bei jedem Wetter erstellt werden.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ai-processing" className="border rounded-lg px-6" data-testid="faq-ai-processing">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Was bedeutet KI-gestützte Bildoptimierung?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Wir nutzen künstliche Intelligenz zur automatischen Optimierung von Farben, Kontrast und Belichtung. 
                Außerdem können störende Elemente entfernt und automatische Bildbeschreibungen (Alt-Texte) für CRM-Systeme generiert werden. 
                Die KI-Verarbeitung erfolgt anonymisiert über sichere externe Dienste. 
                Details finden Sie in unserer <Link href="/datenschutz"><span className="underline cursor-pointer">Datenschutzerklärung</span></Link>. 
                Diese Funktion steht ausschließlich für bei PIX.IMMO produzierte Bilder zur Verfügung.
              </AccordionContent>
            </AccordionItem>

            {/* Kosten */}
            <AccordionItem value="pricing" className="border rounded-lg px-6" data-testid="faq-pricing">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Wie setzen sich die Kosten zusammen?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Die Kosten richten sich nach den gebuchten Leistungen (z.B. Fotopakete, Drohnenaufnahmen, Videos). 
                Innerhalb unseres Servicebereichs (Hamburg bis 30 km) ist die Anfahrt inklusive. 
                Für weiter entfernte Objekte berechnen wir 0,80 € pro gefahrenem Kilometer (Hin- und Rückweg). 
                Alle Preise verstehen sich zzgl. 19 % MwSt. 
                Eine detaillierte Preisübersicht finden Sie auf unserer <Link href="/preise"><span className="underline cursor-pointer">Preisseite</span></Link>.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payment" className="border rounded-lg px-6" data-testid="faq-payment">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Wann und wie wird bezahlt?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                Die Rechnungsstellung erfolgt nach Fertigstellung und Bereitstellung der Bilder. 
                Sie erhalten eine Rechnung per E-Mail mit einer Zahlungsfrist von 14 Tagen. 
                Bezahlung ist per Überweisung möglich. Für Geschäftskunden bieten wir auch Rechnungskauf an.
              </AccordionContent>
            </AccordionItem>

            {/* Vorbereitung der Immobilie */}
            <AccordionItem value="preparation" className="border rounded-lg px-6" data-testid="faq-preparation">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Vorbereitung der Immobilie
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                <p className="mb-4">
                  Damit Ihre Immobilie bestmöglich präsentiert werden kann, lohnt sich etwas Vorbereitung vor dem Fototermin. 
                  Schon wenige Handgriffe machen oft einen großen Unterschied im Gesamteindruck.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-black mb-2">Allgemeine Tipps:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Räume aufräumen und persönliche Gegenstände beiseitelegen</li>
                      <li>Vorhänge öffnen und für ausreichend Licht sorgen</li>
                      <li>Blumen, Pflanzen oder kleine Deko-Elemente setzen angenehme Akzente</li>
                      <li>Haustiere, Mülltonnen und Fahrzeuge während der Aufnahmen außer Sicht bringen</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black mb-2">Küche und Bad:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Oberflächen reinigen und freiräumen</li>
                      <li>Handtücher, Putzmittel und Alltagsartikel wegräumen</li>
                      <li>Einheitliche, dezente Farben wirken auf Fotos ruhiger</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black mb-2">Schlaf- und Wohnräume:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Betten ordentlich beziehen</li>
                      <li>Kissen, Decken und Möbel gerade ausrichten</li>
                      <li>Kleine Teppiche oder Wäschekörbe vorübergehend entfernen</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black mb-2">Außenbereich:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Rasen mähen, Wege und Terrasse fegen</li>
                      <li>Gartengeräte, Spielzeug und Mülltonnen verstauen</li>
                    </ul>
                  </div>
                </div>

                <p className="mt-4 text-sm italic">
                  Falls kurzfristig etwas nicht perfekt vorbereitet werden kann, ist das kein Problem – 
                  kleinere Dinge lassen sich bei Bedarf im Rahmen der Bildbearbeitung anpassen.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Contact CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-semibold mb-3">Weitere Fragen?</h2>
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
