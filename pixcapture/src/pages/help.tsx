import { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Camera,
  Upload,
  Palette,
  CreditCard,
  Bell,
  CheckCircle2,
  Play,
  Phone,
  MessageCircle,
  ChevronRight,
  Info,
  Smartphone,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { SEOHead } from '../components/SEOHead';
import { FooterPixCapture } from '../components/FooterPixCapture';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

export default function PixCaptureHelp() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      icon: Camera,
      title: 'Fotografieren',
      description: 'Nutze die integrierte Kamera-App oder wähle Fotos aus deiner Galerie',
      details: [
        'Aktiviere die Wasserwaage für gerade Linien',
        'Nutze HDR für optimale Belichtung',
        'Fotografiere alle Räume systematisch',
        'Achte auf gutes Tageslicht',
      ],
      videoPlaceholder: 'Tutorial: Professionell fotografieren',
    },
    {
      id: 2,
      icon: Upload,
      title: 'Upload starten',
      description: 'Fotos hochladen von iPhone oder Android – automatische Kompression',
      details: [
        'Wähle bis zu 100 Bilder aus',
        'Upload läuft im Hintergrund',
        'Fortschrittsanzeige zeigt Status',
        'Automatische Fehlerbehandlung',
      ],
      videoPlaceholder: 'Tutorial: Upload-Prozess',
    },
    {
      id: 3,
      icon: Palette,
      title: 'Stil auswählen',
      description: 'Wähle deinen Bearbeitungsstil: Natural, Bright, Dramatic',
      details: [
        'Natural: Natürliche Farbkorrektur',
        'Bright: Helle, freundliche Atmosphäre',
        'Dramatic: Kontrastreiche Bearbeitung',
        'Änderung jederzeit möglich',
      ],
      videoPlaceholder: 'Tutorial: Stilauswahl',
    },
    {
      id: 4,
      icon: CreditCard,
      title: 'Bezahlung',
      description: 'Sichere Zahlung per Kreditkarte, PayPal oder SEPA-Lastschrift',
      details: [
        'Preise: 3-5€ pro Bild',
        'Rechnung nach Upload',
        'Sichere Zahlungsabwicklung',
        'Keine Abogebühren',
      ],
      videoPlaceholder: 'Tutorial: Bezahlvorgang',
    },
    {
      id: 5,
      icon: Bell,
      title: 'Status & Benachrichtigungen',
      description: 'Erhalte Push-Benachrichtigungen über den Bearbeitungsstatus',
      details: [
        'Upload abgeschlossen: Sofort',
        'Bearbeitung gestartet: Nach QC',
        'Fertig: Nach 24-48h',
        'Download-Link in App-Galerie',
      ],
      videoPlaceholder: 'Tutorial: Benachrichtigungen',
    },
  ];

  const faqItems = [
    {
      question: 'Welche Geräte werden unterstützt?',
      answer:
        'pixcapture.app funktioniert auf iPhone (iOS 14+) und Android (Android 10+). Die Kamera-Features sind auf beiden Plattformen verfügbar.',
    },
    {
      question: 'Wie lange dauert die Bearbeitung?',
      answer:
        'In der Regel 24-48 Stunden. Bei dringenden Aufträgen bieten wir Express-Bearbeitung innerhalb von 12 Stunden an (Aufpreis 50%).',
    },
    {
      question: 'Kann ich Fotos nachträglich ergänzen?',
      answer:
        'Ja, du kannst jederzeit weitere Fotos zu einem bestehenden Job hochladen, solange dieser noch nicht abgeschlossen ist.',
    },
    {
      question: 'Was passiert bei schlechter Bildqualität?',
      answer:
        'Unser Quality Check Team prüft alle Uploads. Bei technischen Problemen (Unschärfe, Unterbelichtung) erhältst du eine Benachrichtigung mit Hinweisen zur Neuaufnahme.',
    },
    {
      question: 'Wie erhalte ich die bearbeiteten Bilder?',
      answer:
        'Die fertigen Bilder erscheinen in deiner App-Galerie. Du erhältst eine Push-Benachrichtigung und kannst alle Fotos als ZIP herunterladen.',
    },
    {
      question: 'Sind die Fotos rechtlich sicher?',
      answer:
        'Ja, alle Rechte an den Fotos bleiben bei dir. Wir nutzen sie ausschließlich für die Bearbeitung und löschen sie nach 90 Tagen automatisch.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col">
      <SEOHead
        title="Hilfe & Funktionen – pixcapture.app"
        description="Schritt-für-Schritt-Anleitung zur Nutzung von pixcapture.app"
        path="/pixcapture-help"
      />

      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/pixcapture-home">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1
                  className="text-[#111111]"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: '24pt' }}
                >
                  Hilfe & Funktionen
                </h1>
                <p className="text-[#6B7280]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14pt' }}>
                  So funktioniert pixcapture.app
                </p>
              </div>
            </div>

            <Link href="/pixcapture-expert-call">
              <Button className="bg-[#74A4EA] text-white hover:opacity-90" style={{ borderRadius: '0px' }}>
                <Phone className="h-5 w-5 mr-2" />
                Experten-Call buchen
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#74A4EA] to-[#64BF49] text-white py-16">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <Info className="h-16 w-16 mx-auto mb-4 opacity-80" />
            <h2
              className="mb-4"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: '36pt' }}
            >
              Deine Schritt-für-Schritt-Anleitung
            </h2>
            <p className="max-w-[700px] mx-auto text-white/90" style={{ fontSize: '16pt' }}>
              Von der ersten Aufnahme bis zu den fertigen, bearbeiteten Bildern – wir begleiten dich durch jeden Schritt.
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 max-w-[1200px] mx-auto px-6">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`bg-white border-2 rounded-lg p-8 cursor-pointer transition-all ${
                  activeStep === step.id ? 'border-[#64BF49] shadow-lg' : 'border-[#E5E5E5] hover:border-[#74A4EA]'
                }`}
                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
              >
                <div className="flex items-start gap-6">
                  {/* Step Number */}
                  <div
                    className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: activeStep === step.id ? '#64BF49' : '#74A4EA',
                    }}
                  >
                    <step.icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className="text-[#111111]"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '20pt' }}
                      >
                        {index + 1}. {step.title}
                      </h3>
                      <ChevronRight
                        className={`h-6 w-6 text-[#6B7280] transition-transform ${
                          activeStep === step.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                    <p className="text-[#6B7280] mb-4" style={{ fontSize: '14pt' }}>
                      {step.description}
                    </p>

                    {/* Expanded Details */}
                    {activeStep === step.id && (
                      <div className="space-y-4 pt-4 border-t border-[#E5E5E5]">
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Details List */}
                          <div>
                            <h4
                              className="text-[#111111] mb-3"
                              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '14pt' }}
                            >
                              Details:
                            </h4>
                            <ul className="space-y-2">
                              {step.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-[#6B7280]" style={{ fontSize: '13pt' }}>
                                  <CheckCircle2 className="h-5 w-5 text-[#64BF49] flex-shrink-0 mt-0.5" />
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Video Placeholder */}
                          <div>
                            <div className="bg-[#F0F0F0] rounded-lg aspect-video flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#E5E5E5]">
                              <Play className="h-12 w-12 text-[#74A4EA]" />
                              <p className="text-[#6B7280]" style={{ fontSize: '13pt' }}>
                                {step.videoPlaceholder}
                              </p>
                              <Button variant="outline" size="sm" disabled>
                                Demnächst verfügbar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Support */}
        <section className="py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2
              className="text-center mb-12 text-[#111111]"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: '28pt' }}
            >
              Unterstützte Plattformen
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* iPhone */}
              <div className="bg-gradient-to-br from-[#1A1A1C] to-[#3A3A3C] text-white rounded-lg p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <Smartphone className="h-8 w-8" />
                  </div>
                  <div>
                    <h3
                      style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '20pt' }}
                    >
                      iPhone
                    </h3>
                    <p className="text-white/70" style={{ fontSize: '13pt' }}>
                      iOS 14 oder neuer
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-white/90" style={{ fontSize: '13pt' }}>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#64BF49]" />
                    Native Kamera-Integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#64BF49]" />
                    HDR & Wasserwaage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#64BF49]" />
                    Push-Benachrichtigungen
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#64BF49]" />
                    iCloud-Sync (optional)
                  </li>
                </ul>
              </div>

              {/* Android */}
              <div className="bg-gradient-to-br from-[#64BF49] to-[#74A4EA] text-white rounded-lg p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <Smartphone className="h-8 w-8" />
                  </div>
                  <div>
                    <h3
                      style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '20pt' }}
                    >
                      Android
                    </h3>
                    <p className="text-white/70" style={{ fontSize: '13pt' }}>
                      Android 10 oder neuer
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-white/90" style={{ fontSize: '13pt' }}>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    Dateiauswahl aus Galerie
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    Automatische Kompression
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    Push-Benachrichtigungen
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    Google Drive-Integration (optional)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 max-w-[1200px] mx-auto px-6">
          <h2
            className="text-center mb-12 text-[#111111]"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: '28pt' }}
          >
            Häufig gestellte Fragen
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white border border-[#E5E5E5] rounded-lg px-6"
              >
                <AccordionTrigger
                  className="hover:no-underline"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '16pt' }}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#6B7280]" style={{ fontSize: '14pt' }}>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#F0F0F0]">
          <div className="max-w-[800px] mx-auto px-6 text-center">
            <MessageCircle className="h-16 w-16 text-[#74A4EA] mx-auto mb-6" />
            <h2
              className="mb-4 text-[#111111]"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: '28pt' }}
            >
              Noch Fragen?
            </h2>
            <p className="text-[#6B7280] mb-8" style={{ fontSize: '16pt' }}>
              Buche ein kostenloses Expertengespräch und lass dich persönlich beraten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pixcapture-expert-call">
                <Button className="bg-[#74A4EA] text-white hover:opacity-90" style={{ borderRadius: '0px', height: '48px' }}>
                  <Phone className="h-5 w-5 mr-2" />
                  Experten-Call buchen
                </Button>
              </Link>
              <Link href="/kontakt-formular">
                <Button variant="outline" style={{ borderRadius: '0px', height: '48px' }}>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Kontaktformular
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <FooterPixCapture />
    </div>
  );
}
