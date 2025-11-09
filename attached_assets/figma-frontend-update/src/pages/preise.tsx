import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { SEOHead } from "../components/SEOHead";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export default function Pricing() {
  const services = [
    {
      title: "Immobilienfotografie",
      price: "ab 180 € zzgl. MwSt.",
      features: [
        "Aufnahmen von Innen- und Außenbereichen",
        "Professionelle Kamera- und Lichttechnik",
        "Auswahl und Bearbeitung der besten Motive",
        "Hochauflösende Dateien (Web und Druck)",
      ],
    },
    {
      title: "Drohnenaufnahmen",
      price: "ab 150 € zzgl. MwSt.",
      features: [
        "ab 100 € als Teil eines Fotopakets",
        "Außenaufnahmen aus der Luft",
        "Darstellung von Lage und Umgebung",
        "Mehrere Perspektiven in hoher Auflösung",
        "Wetterabhängig",
      ],
    },
    {
      title: "Videoaufnahmen",
      price: "ab 199 € zzgl. MwSt.",
      features: [
        "Kurze Videoclips für Social Media",
        "Kombination aus Boden- und Luftaufnahmen",
        "Quer- oder Hochformat (Reels, Instagram, YouTube)",
        "Professioneller Schnitt",
      ],
    },
    {
      title: "Virtuelle Rundgänge (360°)",
      price: "ab 100 € zzgl. MwSt.",
      features: [
        "360°-Aufnahmen für Online-Exposés",
        "Basis-Variante ab 100 € für MLS/CRM-Systeme",
        "Erweiterte Variante ab 239 € mit Navigation",
        "Grundriss-Verknüpfung und Hosting (6 Monate)",
      ],
    },
    {
      title: "Virtuelles Staging",
      price: "auf Anfrage",
      features: [
        "Individuelles Briefing und Moodboard",
        "Preisgestaltung nach Raumgröße und Detailgrad",
        "Verschiedene Stilrichtungen",
        "Ideal für leerstehende Objekte",
      ],
    },
    {
      title: "Bildbearbeitung",
      price: "ab 3,90 € pro Bild zzgl. MwSt.",
      features: [
        "Kleine Retuschen",
        "Störende Details entfernen",
        "Größere Objektentfernung auf Wunsch",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Preise und Leistungen"
        description="Professionelle Immobilienfotografie ab 180€. Drohnenaufnahmen, 360°-Touren, Videos und KI-gestützte Bildoptimierung für Hamburg."
        path="/preise"
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
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl mb-6" data-testid="page-title">
              Preise und Leistungen
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Transparente Preise für professionelle Immobilienpräsentationen
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <Card key={index} className="p-8" data-testid={`service-${index}`}>
                  <h2 className="text-2xl mb-2">{service.title}</h2>
                  <p className="mb-1">{service.price}</p>
                  {service.subtitle && (
                    <p className="text-sm text-muted-foreground mb-4">{service.subtitle}</p>
                  )}
                  
                  <ul className={`space-y-2 ${service.subtitle ? 'mt-4' : 'mt-6'}`}>
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Travel Info */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <h2 className="text-2xl mb-4">Anfahrt und Geltungsbereich</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Unsere Leistungen werden im Großraum Hamburg angeboten.
                  Die Anfahrt ist innerhalb von <strong className="text-foreground">30 Kilometern um Hamburg</strong> im Preis enthalten.
                </p>
                <p>
                  Für weiter entfernte Objekte werden{" "}
                  <strong className="text-foreground">0,60 € pro gefahrenem Kilometer</strong> (Hin- und Rückweg) berechnet.
                </p>
                <p>
                  Bei größeren Projekten oder mehreren Objekten pro Termin erfolgt die Berechnung
                  individuell und transparent nach Aufwand.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl mb-4">Anfrage und Buchung</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Für ein individuelles Angebot oder zur direkten Buchung kontaktieren Sie uns
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/booking">
                <Button size="lg">
                  Jetzt buchen
                </Button>
              </Link>
              <Link href="/kontakt">
                <Button variant="outline" size="lg">
                  Kontakt aufnehmen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="flex-grow"></div>

      <Footer />
    </div>
  );
}
