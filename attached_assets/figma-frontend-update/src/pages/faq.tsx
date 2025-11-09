import { Link } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { Button } from "../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { ArrowLeft } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      question: "Wie lange dauert ein Fotoshooting?",
      answer: "Ein Standard-Shooting dauert je nach Objektgröße zwischen 1-3 Stunden.",
    },
    {
      question: "Wann erhalte ich die fertigen Bilder?",
      answer: "Die bearbeiteten Bilder erhalten Sie innerhalb von 48 Stunden nach dem Shooting.",
    },
    {
      question: "Kann ich die Bilder für alle Zwecke nutzen?",
      answer: "Ja, Sie erhalten die volle Nutzungslizenz für Web, Print und Social Media.",
    },
    {
      question: "Was passiert bei schlechtem Wetter?",
      answer: "Bei schlechtem Wetter können wir den Termin kostenfrei verschieben.",
    },
    {
      question: "Bieten Sie auch 360°-Touren an?",
      answer: "Ja, wir bieten virtuelle Rundgänge ab 100€ an.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="FAQ - Häufige Fragen"
        description="Antworten auf häufige Fragen zur Immobilienfotografie bei PIX.IMMO"
        path="/faq"
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
            <h1 className="text-4xl md:text-5xl mb-6 text-center">Häufige Fragen</h1>
            <p className="text-lg text-muted-foreground mb-12 text-center">
              Antworten auf die wichtigsten Fragen
            </p>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Weitere Fragen?
              </p>
              <Link href="/kontakt">
                <Button>Kontakt aufnehmen</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
