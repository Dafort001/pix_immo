import { Check, Clock, Sparkles, Download, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

type TimelineStatus = 'completed' | 'active' | 'pending';

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: TimelineStatus;
  date?: string;
  icon: React.ReactNode;
}

export function StatusTimelineScreen() {
  const estimatedDelivery = new Date('2025-10-25T14:00:00');
  const now = new Date();
  const hoursRemaining = Math.max(0, Math.floor((estimatedDelivery.getTime() - now.getTime()) / (1000 * 60 * 60)));

  const timelineSteps: TimelineStep[] = [
    {
      id: '1',
      title: 'Upload abgeschlossen',
      description: '24 Fotos erfolgreich hochgeladen',
      status: 'completed',
      date: '2025-10-23, 09:15',
      icon: <Check strokeWidth={1.5} className="w-5 h-5" />,
    },
    {
      id: '2',
      title: 'Zahlung bestätigt',
      description: 'Zahlung via Kreditkarte erfolgreich',
      status: 'completed',
      date: '2025-10-23, 09:18',
      icon: <Check strokeWidth={1.5} className="w-5 h-5" />,
    },
    {
      id: '3',
      title: 'Bearbeitung läuft',
      description: 'Ihre Fotos werden professionell bearbeitet',
      status: 'active',
      date: 'Gestartet am 2025-10-23, 10:00',
      icon: <Sparkles strokeWidth={1.5} className="w-5 h-5" />,
    },
    {
      id: '4',
      title: 'Bereit zum Download',
      description: 'Bearbeitete Fotos werden bereitgestellt',
      status: 'pending',
      icon: <Download strokeWidth={1.5} className="w-5 h-5" />,
    },
  ];

  const statusConfig: Record<TimelineStatus, { bg: string; text: string; border: string }> = {
    completed: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-500' },
    active: { bg: 'bg-[#4A5849]', text: 'text-white', border: 'border-[#4A5849]' },
    pending: { bg: 'bg-gray-200', text: 'text-gray-400', border: 'border-gray-300' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft strokeWidth={1.5} className="w-4 h-4 mr-2" />
                Zurück
              </Button>
              <div>
                <h1 style={{ fontSize: '24px' }} className="text-gray-900">
                  Projektstatus
                </h1>
                <p style={{ fontSize: '14px' }} className="text-gray-600">
                  Einfamilienhaus Musterstraße 12
                </p>
              </div>
            </div>
            <Badge className="bg-[#4A5849]/10 text-[#4A5849] border-[#4A5849]/30" style={{ fontSize: '14px' }}>
              In Bearbeitung
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estimated Delivery */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-[#4A5849]/10 rounded-full p-3">
              <Clock strokeWidth={1.5} className="w-6 h-6 text-[#4A5849]" />
            </div>
            <div className="flex-1">
              <h2 style={{ fontSize: '18px' }} className="text-gray-900 mb-1">
                Voraussichtliche Fertigstellung
              </h2>
              <p style={{ fontSize: '16px' }} className="text-gray-600 mb-3">
                {estimatedDelivery.toLocaleDateString('de-DE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })} um {estimatedDelivery.toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })} Uhr
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#4A5849] h-full rounded-full transition-all"
                    style={{ width: '60%' }}
                  />
                </div>
                <span style={{ fontSize: '14px' }} className="text-gray-600 whitespace-nowrap">
                  ca. {hoursRemaining}h verbleibend
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 style={{ fontSize: '18px' }} className="text-gray-900 mb-6">
            Fortschritt
          </h2>

          <div className="space-y-8">
            {timelineSteps.map((step, index) => {
              const config = statusConfig[step.status];
              const isLast = index === timelineSteps.length - 1;

              return (
                <div key={step.id} className="relative">
                  <div className="flex gap-4">
                    {/* Icon Circle */}
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-full border-2 ${config.border} ${config.bg} ${config.text} flex items-center justify-center transition-all ${
                          step.status === 'active' ? 'ring-4 ring-blue-100' : ''
                        }`}
                      >
                        {step.icon}
                      </div>
                      {/* Connecting Line */}
                      {!isLast && (
                        <div
                          className={`absolute left-1/2 top-12 w-0.5 h-8 -ml-px ${
                            step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <h3 style={{ fontSize: '16px' }} className="text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p style={{ fontSize: '14px' }} className="text-gray-600 mb-2">
                        {step.description}
                      </p>
                      {step.date && (
                        <p style={{ fontSize: '12px' }} className="text-gray-500">
                          {step.date}
                        </p>
                      )}

                      {/* Active Step Actions */}
                      {step.status === 'active' && (
                        <div className="mt-4 p-4 bg-[#4A5849]/10 rounded-lg border border-[#4A5849]/30">
                          <div className="flex items-start gap-3">
                            <Sparkles strokeWidth={1.5} className="w-5 h-5 text-[#4A5849] mt-0.5" />
                            <div>
                              <p style={{ fontSize: '14px' }} className="text-gray-900 mb-1">
                                Bearbeitung in vollem Gange
                              </p>
                              <p style={{ fontSize: '12px' }} className="text-gray-600">
                                Unser Team arbeitet mit Hochdruck an Ihren Fotos. Sie erhalten eine
                                Benachrichtigung, sobald die Bearbeitung abgeschlossen ist.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Contact */}
        <div className="mt-6 bg-gray-100 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="bg-white rounded-full p-2">
              <svg
                className="w-5 h-5 text-[#4A5849]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '16px' }} className="text-gray-900 mb-1">
                Fragen zu Ihrem Projekt?
              </h3>
              <p style={{ fontSize: '14px' }} className="text-gray-600 mb-3">
                Unser Support-Team hilft Ihnen gerne weiter.
              </p>
              <Button variant="outline" size="sm" style={{ fontSize: '14px' }}>
                Support kontaktieren
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}