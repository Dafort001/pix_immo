import { Link } from "wouter";
import { SEOHead } from "@shared/components";
import { FooterPixCapture } from "../components/FooterPixCapture";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function PixCaptureImpressum() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Impressum – pixcapture.app"
        description="Impressum von pixcapture.app"
        path="/pixcapture-impressum"
      />

      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/pixcapture">
              <span className="text-xl font-semibold tracking-tight cursor-pointer">pixcapture.app</span>
            </Link>
            <Link href="/pixcapture">
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
            <h1 className="text-4xl mb-12">Impressum</h1>

            <Card className="p-8">
              <div className="space-y-12">
                {/* Impressum */}
                <div>
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
                        pixcapture.app, vertreten durch Daniel Fortmann, behält sich die Nutzung sämtlicher Inhalte dieser Website zum Zweck des kommerziellen Text- und Data-Minings im Sinne von § 44b UrhG ausdrücklich vor.
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Für Nutzungslizenzen kontaktieren Sie uns bitte unter: <a href="mailto:mail@pix.immo" className="text-primary hover:underline">mail@pix.immo</a>
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        English translation: pixcapture.app, represented by Daniel Fortmann, expressly reserves the right to use all content on this website for the purpose of commercial text and data mining within the meaning of Section 44b of the German Copyright Act (UrhG). For usage licenses, please contact mail@pix.immo.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg mb-3">Haftungsausschluss</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Haftung für Inhalte:</strong> Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Haftung für Links:</strong> Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <FooterPixCapture />
    </div>
  );
}
