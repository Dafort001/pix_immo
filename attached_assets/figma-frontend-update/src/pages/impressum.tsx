import { Link } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Impressum und Datenschutz"
        description="Impressum und Datenschutzerklärung von PIX.IMMO"
        path="/impressum"
      />

      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-xl font-semibold tracking-tight cursor-pointer">PIX.IMMO</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl mb-12">Impressum und Datenschutz</h1>

            <Card className="p-8">
              <div className="space-y-12">
                {/* Impressum */}
                <div>
                  <h2 className="text-2xl mb-6">Impressum</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg mb-3">Verantwortlich gemäß § 5 TMG und § 18 Abs. 2 MStV</h3>
                      <p className="text-muted-foreground">
                        Daniel Fortmann<br />
                        Kaiser-Wilhelm-Straße 47<br />
                        20355 Hamburg<br />
                        Deutschland
                      </p>
                      <p className="mt-3 text-muted-foreground">
                        E-Mail: <a href="mailto:mail@pix.immo" className="text-primary hover:underline">mail@pix.immo</a><br />
                        USt-IdNr.: DE117975393
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Plattform der EU-Kommission zur Online-Streitbeilegung (OS):{" "}
                        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          https://ec.europa.eu/consumers/odr/
                        </a>
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg mb-3">Vorbehalt gemäß § 44b UrhG – Text- und Data-Mining (TDM)</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Pix.immo, vertreten durch Daniel Fortmann, behält sich die Nutzung sämtlicher Inhalte dieser Website zum Zweck des kommerziellen Text- und Data-Minings im Sinne von § 44b UrhG ausdrücklich vor.
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Für Nutzungslizenzen kontaktieren Sie uns bitte unter: <a href="mailto:mail@pix.immo" className="text-primary hover:underline">mail@pix.immo</a>
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        English translation: PIX.IMMO, represented by Daniel Fortmann, expressly reserves the right to use all content on this website for the purpose of commercial text and data mining within the meaning of Section 44b of the German Copyright Act (UrhG). For usage licenses, please contact mail@pix.immo.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Datenschutzerklärung */}
                <div className="border-t border-border pt-12">
                  <h2 className="text-2xl mb-6">Datenschutzerklärung</h2>
                  
                  <div className="space-y-8">
                    <p className="text-muted-foreground">
                      Wir informieren Sie nachfolgend gemäß Art. 13 DSGVO darüber, wie Ihre personenbezogenen Daten verarbeitet werden, wenn Sie unsere Website besuchen oder unsere Online-Dienste nutzen.
                    </p>

                    <div>
                      <h3 className="text-lg mb-3">1. Verantwortlicher</h3>
                      <p className="text-muted-foreground">
                        Daniel Fortmann<br />
                        Kaiser-Wilhelm-Straße 47<br />
                        20355 Hamburg<br />
                        Deutschland<br />
                        E-Mail: <a href="mailto:mail@pix.immo" className="text-primary hover:underline">mail@pix.immo</a>
                      </p>
                      <p className="text-sm text-muted-foreground mt-3">
                        Es besteht keine Verpflichtung zur Bestellung eines Datenschutzbeauftragten.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg mb-3">2. Allgemeine Datenverarbeitung</h3>
                      <p className="text-muted-foreground mb-3">
                        Beim Aufrufen unserer Website werden automatisch folgende Daten verarbeitet (Server-Logfiles):
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                        <li>Besuchte Seite oder Datei</li>
                        <li>Datum und Uhrzeit des Zugriffs</li>
                        <li>Übertragene Datenmenge</li>
                        <li>Browsertyp und Version</li>
                        <li>Betriebssystem</li>
                        <li>Referrer-URL</li>
                        <li>IP-Adresse</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-3">
                        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Stabilität und Sicherheit).
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Speicherdauer:</strong> in der Regel maximal 30 Tage.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg mb-3">3. Cookies und lokale Speicherung</h3>
                      <p className="text-muted-foreground mb-3">
                        Wir verwenden Cookies und ähnliche Technologien, um grundlegende Funktionen bereitzustellen, Nutzungsstatistiken zu erstellen und die Sicherheit zu gewährleisten.
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Rechtsgrundlagen:</strong>
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                        <li>Notwendige Cookies: Art. 6 Abs. 1 lit. f DSGVO</li>
                        <li>Statistik oder Marketing-Cookies: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung über Cookie-Banner)</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-3">
                        Sie können Cookies im Browser löschen oder blockieren. Einige Funktionen könnten dadurch eingeschränkt sein.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg mb-3">8. Rechte der betroffenen Personen</h3>
                      <p className="text-muted-foreground mb-3">
                        Sie haben das Recht auf:
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                        <li>Auskunft (Art. 15 DSGVO)</li>
                        <li>Berichtigung (Art. 16 DSGVO)</li>
                        <li>Löschung (Art. 17 DSGVO)</li>
                        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                        <li>Widerspruch (Art. 21 DSGVO)</li>
                        <li>Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-3">
                        Zudem haben Sie das Recht auf Beschwerde bei einer Datenschutzaufsichtsbehörde, z. B. Der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit (HmbBfDI), Ludwig-Erhard-Str. 22, 20459 Hamburg.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg mb-3">13. Kontakt</h3>
                      <p className="text-muted-foreground">
                        Daniel Fortmann<br />
                        Kaiser-Wilhelm-Straße 47<br />
                        20355 Hamburg<br />
                        Deutschland<br />
                        E-Mail: <a href="mailto:mail@pix.immo" className="text-primary hover:underline">mail@pix.immo</a>
                      </p>
                    </div>

                    <div className="pt-6 border-t border-border">
                      <p className="text-xs text-muted-foreground text-center">
                        © 2022–2025 Daniel Fortmann. Alle Rechte vorbehalten.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <div className="flex-grow"></div>

      <Footer />
    </div>
  );
}
