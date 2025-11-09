import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Building2, MapPin, Copy, Check, Hash } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { IPhoneFrame } from '../components/IPhoneFrame';

interface Job {
  id: number;
  jobId: string; // Format: 20251106-DF741
  title: string;
  address: string;
  date: string; // Wird aus EXIF gesetzt
  time: string; // Wird aus EXIF gesetzt
  status: 'scheduled' | 'in-progress' | 'completed';
  photos: number;
  rooms: number; // Wird aus Raumnamen berechnet
}

// Job-ID Generator: {YYYYMMDD}-{XXXXX}
function generateJobId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  // 5-stelliger alphanumerischer Code (A-Z, 0-9)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codePart = '';
  for (let i = 0; i < 5; i++) {
    codePart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${datePart}-${codePart}`;
}

export default function AppJobNew() {
  const [, setLocation] = useLocation();
  const [jobId, setJobId] = useState('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
  });

  // Job-ID bei Seitenladen generieren
  useEffect(() => {
    setJobId(generateJobId());
  }, []);

  const handleCopyJobId = () => {
    navigator.clipboard.writeText(jobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validierung: Nur Adresse ist Pflicht
    if (!formData.address.trim()) {
      alert('Bitte geben Sie eine Adresse ein');
      return;
    }

    // Lade existierende Jobs
    const savedJobs = localStorage.getItem('pix_recent_jobs');
    let jobs: Job[] = [];
    
    if (savedJobs) {
      try {
        jobs = JSON.parse(savedJobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
      }
    }

    // Erstelle neuen Job
    const newJob: Job = {
      id: Date.now(),
      jobId: jobId, // System-generierte Job-ID
      title: formData.title.trim() || '', // Optional
      address: formData.address.trim(),
      date: '', // Wird aus EXIF-Daten gefüllt
      time: '', // Wird aus EXIF-Daten gefüllt
      status: 'scheduled',
      photos: 0,
      rooms: 0, // Wird aus Raumnamen berechnet
    };

    // Füge Job an den Anfang hinzu und behalte nur die letzten 4
    const updatedJobs = [newJob, ...jobs].slice(0, 4);
    
    // Speichere in localStorage
    localStorage.setItem('pix_recent_jobs', JSON.stringify(updatedJobs));

    // Zurück zur Jobs-Übersicht
    setLocation('/pixcapture-app/jobs');
  };

  const handleCancel = () => {
    setLocation('/pixcapture-app/jobs');
  };

  return (
    <IPhoneFrame>
      <div className="min-h-full bg-[#F9F9F7] dark:bg-[#0E0E0E] flex flex-col" style={{ paddingTop: '59px', paddingBottom: '34px' }}>
        {/* Header */}
        <header className="bg-white dark:bg-[#1A1A1C] border-b border-[#E5E5E5] dark:border-[#2C2C2C] sticky z-10" style={{ top: '59px' }}>
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5 text-[#111111] dark:text-white" />
              </Button>
              <h1
                className="text-[#111111] dark:text-white"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: '22pt',
                  lineHeight: '28pt',
                }}
              >
                Neuer Job
              </h1>
            </div>
          </div>
        </header>

        {/* Form */}
        <main className="flex-1 px-6 py-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6" style={{ paddingBottom: '40px' }}>
            {/* Job-ID Anzeige */}
            <div className="bg-white dark:bg-[#1A1A1C] p-5 border-2 border-[#64BF49] dark:border-[#64BF49]" style={{ borderRadius: '0px' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4 text-[#64BF49]" />
                    <Label
                      className="text-[#6B7280] dark:text-[#A3A3A3]"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: 600,
                        fontSize: '13pt',
                      }}
                    >
                      Job-ID
                    </Label>
                  </div>
                  <p
                    className="text-[#111111] dark:text-white font-mono break-all"
                    style={{
                      fontFamily: 'SF Mono, Monaco, monospace',
                      fontWeight: 600,
                      fontSize: '18pt',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {jobId}
                  </p>
                  <p
                    className="text-[#6B7280] dark:text-[#A3A3A3] mt-2"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '12pt',
                      lineHeight: '16pt',
                    }}
                  >
                    Bitte Job-ID für Rückfragen notieren
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyJobId}
                  className="h-10 w-10 shrink-0"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-[#64BF49]" />
                  ) : (
                    <Copy className="h-5 w-5 text-[#6B7280]" />
                  )}
                </Button>
              </div>
            </div>

            {/* Objektbezeichnung (Optional) */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-[#111111] dark:text-white"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: '15pt',
                }}
              >
                Objektbezeichnung
                <span className="text-[#6B7280] ml-2" style={{ fontWeight: 400, fontSize: '14pt' }}>
                  (optional)
                </span>
              </Label>
              <div className="relative">
                <Building2
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64BF49]"
                  size={20}
                />
                <Input
                  id="title"
                  type="text"
                  placeholder="z.B. Einfamilienhaus Eppendorf"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="pl-12 bg-white dark:bg-[#1A1A1C] border-[#E5E5E5] dark:border-[#2C2C2C]"
                  style={{
                    height: '52pt',
                    borderRadius: '0px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '16pt',
                  }}
                />
              </div>
              <p
                className="text-[#6B7280] dark:text-[#A3A3A3]"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '13pt',
                  lineHeight: '18pt',
                }}
              >
                Wenn leer, wird nur die Job-ID verwendet
              </p>
            </div>

            {/* Adresse (Pflicht) */}
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-[#111111] dark:text-white"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: '15pt',
                }}
              >
                Adresse
                <span className="text-[#E11D48] ml-1">*</span>
              </Label>
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#74A4EA]"
                  size={20}
                />
                <Input
                  id="address"
                  type="text"
                  placeholder="Straße, PLZ Ort"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="pl-12 bg-white dark:bg-[#1A1A1C] border-[#E5E5E5] dark:border-[#2C2C2C]"
                  required
                  style={{
                    height: '52pt',
                    borderRadius: '0px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '16pt',
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                type="submit"
                className="w-full text-white hover:opacity-90"
                style={{
                  height: '56pt',
                  borderRadius: '0px',
                  background: '#1A1A1C',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: '17pt',
                }}
              >
                Job erstellen
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full border-[#E5E5E5] text-[#6B7280] hover:bg-[#F9F9F7]"
                style={{
                  height: '56pt',
                  borderRadius: '0px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: '17pt',
                }}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </main>
      </div>
    </IPhoneFrame>
  );
}
