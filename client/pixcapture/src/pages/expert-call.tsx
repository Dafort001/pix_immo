import { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Phone,
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  MessageCircle,
  User,
  Mail,
  Building2,
  Zap,
  Star,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SEOHead } from '@shared/components';
import { FooterPixCapture } from '../components/FooterPixCapture';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function PixCaptureExpertCall() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    topic: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    callType: 'video',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integration mit TidyCal / Google Calendar API
    toast({
      title: 'Anfrage erfolgreich gesendet!',
      description: 'Wir melden uns innerhalb von 24 Stunden bei dir.',
    });
    console.log('Expert Call Request:', formData);
  };

  const experts = [
    {
      name: 'Lisa Schneider',
      role: 'Immobilienfotografie-Expertin',
      specialty: 'Smartphone-Fotografie & Staging',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      availability: 'Verfügbar: Mo-Fr 9-18 Uhr',
    },
    {
      name: 'Thomas Wagner',
      role: 'Technischer Support',
      specialty: 'App-Funktionen & Upload',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      availability: 'Verfügbar: Mo-Fr 8-20 Uhr',
    },
    {
      name: 'Sarah Müller',
      role: 'Beratung & Bildbearbeitung',
      specialty: 'Stilwahl & Optimierung',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      availability: 'Verfügbar: Di-Sa 10-16 Uhr',
    },
  ];

  const topics = [
    { value: 'smartphone-photo', label: 'Smartphone-Fotografie-Tipps', icon: Phone },
    { value: 'app-usage', label: 'App-Nutzung & Funktionen', icon: Zap },
    { value: 'style-selection', label: 'Stilauswahl & Bearbeitung', icon: Star },
    { value: 'pricing', label: 'Preise & Pakete', icon: Building2 },
    { value: 'technical', label: 'Technischer Support', icon: Shield },
    { value: 'other', label: 'Sonstiges', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col">
      <SEOHead
        title="Experten-Call buchen – pixcapture.app"
        description="Buche ein kostenloses Beratungsgespräch mit unseren Immobilienfotografie-Experten"
        path="/pixcapture-expert-call"
      />

      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/pixcapture/help">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1
                className="text-[#111111]"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: '24pt' }}
              >
                Experten-Call buchen
              </h1>
              <p className="text-[#6B7280]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14pt' }}>
                Kostenlose Beratung von unseren Profis
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#74A4EA] to-[#64BF49] text-white py-16">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <Phone className="h-16 w-16 mx-auto mb-4 opacity-80" />
            <h2
              className="mb-4"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: '36pt' }}
            >
              Sprich mit einem Experten
            </h2>
            <p className="max-w-[700px] mx-auto text-white/90 mb-8" style={{ fontSize: '16pt' }}>
              Hol dir professionelle Tipps für bessere Immobilienfotos, Hilfe bei der App-Nutzung oder individuelle
              Beratung – kostenlos und unverbindlich.
            </p>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-3" />
                <h3 className="mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '16pt' }}>
                  Kostenlos
                </h3>
                <p className="text-white/80" style={{ fontSize: '13pt' }}>
                  15-30 Minuten Beratung komplett gratis
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Video className="h-8 w-8 mx-auto mb-3" />
                <h3 className="mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '16pt' }}>
                  Video oder Telefon
                </h3>
                <p className="text-white/80" style={{ fontSize: '13pt' }}>
                  Wähle deine bevorzugte Kommunikation
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Calendar className="h-8 w-8 mx-auto mb-3" />
                <h3 className="mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '16pt' }}>
                  Flexibel
                </h3>
                <p className="text-white/80" style={{ fontSize: '13pt' }}>
                  Termine Mo-Fr 8-20 Uhr, auch abends
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Experts Section */}
        <section className="py-16 max-w-[1200px] mx-auto px-6">
          <h2
            className="text-center mb-12 text-[#111111]"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: '28pt' }}
          >
            Unsere Experten
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {experts.map((expert, index) => (
              <div key={index} className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-[#74A4EA] to-[#64BF49] relative">
                  <img
                    src={expert.image}
                    alt={expert.name}
                    className="w-full h-full object-cover mix-blend-multiply opacity-90"
                  />
                </div>
                <div className="p-6">
                  <h3
                    className="mb-1 text-[#111111]"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '18pt' }}
                  >
                    {expert.name}
                  </h3>
                  <p className="text-[#74A4EA] mb-2" style={{ fontSize: '14pt', fontWeight: 500 }}>
                    {expert.role}
                  </p>
                  <p className="text-[#6B7280] mb-4" style={{ fontSize: '13pt' }}>
                    {expert.specialty}
                  </p>
                  <div className="flex items-center gap-2 text-[#64BF49]" style={{ fontSize: '12pt' }}>
                    <Clock className="h-4 w-4" />
                    {expert.availability}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-16 bg-white">
          <div className="max-w-[800px] mx-auto px-6">
            <h2
              className="text-center mb-8 text-[#111111]"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: '28pt' }}
            >
              Termin anfragen
            </h2>
            <p className="text-center text-[#6B7280] mb-12" style={{ fontSize: '14pt' }}>
              Fülle das Formular aus und wir melden uns innerhalb von 24 Stunden für die Terminabstimmung.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Call Type */}
              <div>
                <label className="block text-[#111111] mb-3 font-semibold" style={{ fontSize: '14pt' }}>
                  Gesprächsart
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, callType: 'video' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.callType === 'video'
                        ? 'border-[#74A4EA] bg-[#74A4EA]/5'
                        : 'border-[#E5E5E5] hover:border-[#74A4EA]'
                    }`}
                  >
                    <Video className={`h-8 w-8 mx-auto mb-2 ${formData.callType === 'video' ? 'text-[#74A4EA]' : 'text-[#6B7280]'}`} />
                    <p className="font-semibold" style={{ fontSize: '14pt' }}>
                      Video-Call
                    </p>
                    <p className="text-[#6B7280]" style={{ fontSize: '12pt' }}>
                      Google Meet / Zoom
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, callType: 'phone' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.callType === 'phone'
                        ? 'border-[#64BF49] bg-[#64BF49]/5'
                        : 'border-[#E5E5E5] hover:border-[#64BF49]'
                    }`}
                  >
                    <Phone className={`h-8 w-8 mx-auto mb-2 ${formData.callType === 'phone' ? 'text-[#64BF49]' : 'text-[#6B7280]'}`} />
                    <p className="font-semibold" style={{ fontSize: '14pt' }}>
                      Telefon
                    </p>
                    <p className="text-[#6B7280]" style={{ fontSize: '12pt' }}>
                      Klassischer Anruf
                    </p>
                  </button>
                </div>
              </div>

              {/* Personal Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#111111] mb-2 font-semibold" style={{ fontSize: '14pt' }}>
                    Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
                    <Input
                      required
                      placeholder="Max Mustermann"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 h-12"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#111111] mb-2 font-semibold" style={{ fontSize: '14pt' }}>
                    E-Mail *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
                    <Input
                      required
                      type="email"
                      placeholder="max@beispiel.de"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 h-12"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#111111] mb-2 font-semibold" style={{ fontSize: '14pt' }}>
                    Telefon *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
                    <Input
                      required
                      type="tel"
                      placeholder="+49 40 1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 h-12"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#111111] mb-2 font-semibold" style={{ fontSize: '14pt' }}>
                    Firma (optional)
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
                    <Input
                      placeholder="Immobilien Mustermann GmbH"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="pl-10 h-12"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Topic Selection */}
              <div>
                <label className="block text-[#111111] mb-3 font-semibold" style={{ fontSize: '14pt' }}>
                  Thema
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {topics.map((topic) => (
                    <button
                      key={topic.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, topic: topic.value })}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg transition-all text-left ${
                        formData.topic === topic.value
                          ? 'border-[#64BF49] bg-[#64BF49]/5'
                          : 'border-[#E5E5E5] hover:border-[#74A4EA]'
                      }`}
                    >
                      <topic.icon className={`h-5 w-5 ${formData.topic === topic.value ? 'text-[#64BF49]' : 'text-[#6B7280]'}`} />
                      <span style={{ fontSize: '13pt' }}>{topic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Date & Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#111111] mb-2 font-semibold" style={{ fontSize: '14pt' }}>
                    Wunschdatum
                  </label>
                  <Input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="h-12"
                    style={{ borderRadius: '0px' }}
                  />
                </div>
                <div>
                  <label className="block text-[#111111] mb-2 font-semibold" style={{ fontSize: '14pt' }}>
                    Wunschzeit
                  </label>
                  <Input
                    type="time"
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="h-12"
                    style={{ borderRadius: '0px' }}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[#111111] mb-2 font-semibold" style={{ fontSize: '14pt' }}>
                  Deine Frage / Nachricht (optional)
                </label>
                <Textarea
                  placeholder="Beschreibe kurz, wobei wir dir helfen können..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="min-h-[120px]"
                  style={{ borderRadius: '0px', fontSize: '13pt' }}
                />
              </div>

              {/* Info Box */}
              <div className="bg-[#74A4EA]/5 border border-[#74A4EA]/20 rounded-lg p-4">
                <p className="text-[#6B7280]" style={{ fontSize: '13pt' }}>
                  📅 <strong>Hinweis:</strong> Dies ist eine unverbindliche Terminanfrage. Wir melden uns innerhalb von 24
                  Stunden per E-Mail oder Telefon, um einen passenden Termin zu vereinbaren.
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-[#64BF49] text-white hover:opacity-90"
                style={{ borderRadius: '0px', height: '52px', fontSize: '16pt', fontWeight: 600 }}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Termin anfragen
              </Button>
            </form>
          </div>
        </section>

        {/* Alternative Contact */}
        <section className="py-16 max-w-[1200px] mx-auto px-6">
          <div className="bg-[#F0F0F0] rounded-lg p-8 text-center">
            <h3
              className="mb-4 text-[#111111]"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '20pt' }}
            >
              Lieber schriftlich?
            </h3>
            <p className="text-[#6B7280] mb-6" style={{ fontSize: '14pt' }}>
              Nutze unser Kontaktformular oder schreib uns direkt per E-Mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/kontakt-formular">
                <Button variant="outline" style={{ borderRadius: '0px', height: '44px' }}>
                  Kontaktformular
                </Button>
              </Link>
              <a href="mailto:support@pixcapture.app">
                <Button variant="outline" style={{ borderRadius: '0px', height: '44px' }}>
                  support@pixcapture.app
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <FooterPixCapture />
    </div>
  );
}
