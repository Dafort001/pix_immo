import { Link } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ArrowLeft, Camera, Award, Clock, Heart } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Camera,
      title: "Professionalität",
      description: "Hochwertige Ausrüstung und jahrelange Erfahrung in der Immobilienfotografie",
    },
    {
      icon: Clock,
      title: "Zuverlässigkeit",
      description: "Pünktliche Termine und schnelle Lieferung innerhalb von 48 Stunden",
    },
    {
      icon: Award,
      title: "Qualität",
      description: "Jedes Bild wird individuell bearbeitet und optimiert",
    },
    {
      icon: Heart,
      title: "Leidenschaft",
      description: "Wir lieben, was wir tun – und das sieht man in jedem Bild",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Über uns"
        description="PIX.IMMO – Daniel Fortmann. Professionelle Immobilienfotografie aus Hamburg. Erfahren Sie mehr über uns und unsere Arbeitsweise."
        path="/about"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-xl font-semibold tracking-tight cursor-pointer">
                PIX.IMMO
              </span>
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

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl mb-6" data-testid="page-title">
              Über PIX.IMMO
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Professionelle Immobilienfotografie aus Hamburg
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="h-24 w-24 text-muted-foreground/20" />
                </div>
              </div>

              <div>
                <h2 className="text-3xl mb-6">Unsere Geschichte</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    PIX.IMMO wurde von Daniel Fortmann gegründet mit der Vision,
                    Immobilien durch professionelle Fotografie optimal zu präsentieren.
                  </p>
                  <p>
                    Mit Sitz in Hamburg bedienen wir Kunden im Großraum Hamburg.
                    Unsere Expertise liegt in der Kombination aus technischem Know-how
                    und künstlerischem Auge.
                  </p>
                  <p>
                    Jedes Projekt wird individuell betrachtet und mit modernster
                    Technik sowie viel Liebe zum Detail umgesetzt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl mb-4">Unsere Werte</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Was uns ausmacht und antreibt
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="p-6 text-center">
                  <value.icon className="h-10 w-10 mx-auto mb-4 text-primary" />
                  <h3 className="mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl mb-8 text-center">Kontakt</h2>
            
            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2">Daniel Fortmann</h3>
                  <p className="text-muted-foreground">
                    Kaiser-Wilhelm-Straße 47<br />
                    20355 Hamburg<br />
                    Deutschland
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">
                    E-Mail:{" "}
                    <a href="mailto:mail@pix.immo" className="text-foreground hover:text-primary">
                      mail@pix.immo
                    </a>
                  </p>
                </div>

                <div className="pt-6">
                  <Link href="/kontakt">
                    <Button className="w-full sm:w-auto">
                      Kontaktformular
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} PIX.IMMO – Daniel Fortmann. Alle Rechte vorbehalten.</p>
            <div className="mt-4 space-x-4">
              <Link href="/impressum"><span className="hover:text-foreground cursor-pointer">Impressum</span></Link>
              <Link href="/datenschutz"><span className="hover:text-foreground cursor-pointer">Datenschutz</span></Link>
              <Link href="/agb"><span className="hover:text-foreground cursor-pointer">AGB</span></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
