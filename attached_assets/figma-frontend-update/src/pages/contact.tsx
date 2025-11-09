import { Link } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Kontakt"
        description="Kontaktieren Sie PIX.IMMO für professionelle Immobilienfotografie in Hamburg"
        path="/kontakt"
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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl mb-4 text-center">Kontakt</h1>
            <p className="text-center text-muted-foreground mb-12">
              Sie erreichen uns direkt an unseren beiden Standorten.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Hamburg */}
              <Card className="p-8">
                <h2 className="text-2xl mb-2">Hamburg (Hauptsitz)</h2>
                <p className="text-sm text-muted-foreground mb-6">Daniel Fortmann</p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Kaiser-Wilhelm-Straße 47<br />
                        20355 Hamburg<br />
                        Deutschland
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <a href="mailto:mail@pix.immo" className="text-sm text-primary hover:underline">
                        mail@pix.immo
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <a href="tel:+491724307071" className="text-sm text-primary hover:underline">
                        +49 172 430 7071
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                PIX.IMMO ist ein Angebot von Daniel Fortmann, Kaiser-Wilhelm-Straße 47, 20355 Hamburg.
              </p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                © 2022–2025 Daniel Fortmann – Alle Rechte vorbehalten.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <div className="flex-grow"></div>

      <Footer />
    </div>
  );
}
