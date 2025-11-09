import { Link } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Datenschutzerklärung"
        description="Datenschutzerklärung von PIX.IMMO"
        path="/datenschutz"
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
            <h1 className="text-4xl mb-12">Datenschutzerklärung</h1>

            <Card className="p-8">
              <div className="space-y-8 text-sm">
                <div>
                  <h2 className="text-xl mb-4">1. Datenschutz auf einen Blick</h2>
                  <h3 className="font-medium mb-2">Allgemeine Hinweise</h3>
                  <p className="text-muted-foreground">
                    Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
                    personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl mb-4">2. Hosting</h2>
                  <p className="text-muted-foreground">
                    Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser
                    Website erfasst werden, werden auf den Servern des Hosters gespeichert.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>
                  <h3 className="font-medium mb-2">Datenschutz</h3>
                  <p className="text-muted-foreground mb-4">
                    Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst.
                    Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den
                    gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                  </p>
                  <p className="text-muted-foreground">
                    Verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
                  </p>
                  <p className="mt-4">
                    Daniel Fortmann<br />
                    Kaiser-Wilhelm-Straße 47<br />
                    20355 Hamburg<br />
                    E-Mail: mail@pix.immo
                  </p>
                </div>

                <div>
                  <h2 className="text-xl mb-4">4. Datenerfassung auf dieser Website</h2>
                  <h3 className="font-medium mb-2">Kontaktformular</h3>
                  <p className="text-muted-foreground">
                    Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben
                    aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten
                    zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl mb-4">5. Ihre Rechte</h2>
                  <p className="text-muted-foreground">
                    Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten
                    personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der
                    Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung dieser Daten.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
