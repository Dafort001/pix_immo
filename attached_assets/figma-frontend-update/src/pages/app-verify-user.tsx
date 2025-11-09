import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { IPhoneFrame } from '../components/IPhoneFrame';
import { toast } from 'sonner@2.0.3';

type VerificationStep = 'email' | 'code' | 'success';

export default function AppVerifyUser() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<VerificationStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validierung
    if (!email || !email.includes('@')) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Bestätigungscode wurde gesendet!');
      setStep('code');
      setIsLoading(false);
    }, 1500);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validierung
    if (code.length !== 6) {
      toast.error('Bitte geben Sie den 6-stelligen Code ein.');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Erfolgreiche Verifikation
      const verificationToken = 'device_token_' + Date.now();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90); // 90 Tage Geräte-Token
      
      // Speichern
      localStorage.setItem('pix_device_verified', 'true');
      localStorage.setItem('pix_device_token', verificationToken);
      localStorage.setItem('pix_device_token_expiry', expiryDate.toISOString());
      localStorage.setItem('pix_user_email', email);
      
      // Session Token erstellen
      localStorage.setItem('pix_session_token', verificationToken);
      localStorage.setItem('pix_token_expiry', expiryDate.toISOString());
      
      setStep('success');
      setIsLoading(false);
      
      // Nach 1.5 Sekunden zur App
      setTimeout(() => {
        setLocation('/pixcapture-app/jobs');
      }, 1500);
    }, 1500);
  };

  return (
    <IPhoneFrame>
      <div className="min-h-full bg-[var(--color-white)] flex flex-col" style={{ paddingTop: '59px', paddingBottom: '34px' }}>
        
        {/* Success State */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="mb-8">
              <CheckCircle2 size={80} strokeWidth={1.5} className="text-[var(--color-green)]" />
            </div>
            <h1 className="text-[var(--color-black)] text-center mb-4">
              Verifiziert!
            </h1>
            <p className="text-[var(--color-grey)] text-center max-w-[280px] mb-8">
              Ihr Gerät wurde erfolgreich verifiziert
            </p>
            <div className="w-8 h-8 border-2 border-[var(--color-grey)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Email Input Step */}
        {step === 'email' && (
          <div className="flex-1 flex flex-col px-6 pt-20 overflow-y-auto" style={{ paddingBottom: '40px' }}>
            {/* Header */}
            <div className="mb-12">
              {/* Title */}
              <h1 className="text-[var(--color-black)] mb-3">
                Gerät verifizieren
              </h1>

              {/* Subtitle */}
              <p className="text-[var(--color-grey)]">
                Diese Verifikation ist einmalig pro Gerät erforderlich. Danach startet Pix Capture automatisch.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRequestCode} className="flex-1 flex flex-col">
              <div className="space-y-6 mb-8">
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-3 text-[var(--color-black)]"
                  >
                    E-Mail-Adresse
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-grey)]"
                      size={20}
                      strokeWidth={1.5}
                    />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ihre@email.de"
                      className="pl-12 h-[52px] border-[var(--color-grey)] focus:border-[var(--color-blue)] text-[var(--color-black)]"
                      style={{
                        fontSize: '15pt',
                      }}
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-[var(--color-off-white)] border border-[var(--color-grey)]">
                  <p className="text-[var(--color-blue)] text-[12pt] leading-[18pt]">
                    ℹ️ Sie erhalten einen 6-stelligen Code per E-Mail. Dieser ist 10 Minuten gültig.
                  </p>
                </div>
              </div>

              <div className="mt-auto">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[52px] bg-[var(--color-blue)] hover:bg-[var(--color-blue)]/90 text-white"
                  style={{
                    fontSize: '16pt',
                  }}
                >
                  {isLoading ? 'Wird gesendet…' : 'Code anfordern'}
                </Button>

                {/* Legal Links */}
                <div className="mt-6 pt-6 border-t border-[var(--color-grey)]">
                  <div className="flex items-center justify-center gap-4">
                    <Link href="/pixcapture-agb">
                      <span className="text-[var(--color-blue)] hover:underline cursor-pointer text-[12pt]">
                        AGB
                      </span>
                    </Link>
                    <span className="text-[var(--color-grey)]">·</span>
                    <Link href="/pixcapture-datenschutz">
                      <span className="text-[var(--color-blue)] hover:underline cursor-pointer text-[12pt]">
                        Datenschutz
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Code Input Step */}
        {step === 'code' && (
          <div className="flex-1 flex flex-col px-6 pt-20 overflow-y-auto" style={{ paddingBottom: '40px' }}>
            {/* Header */}
            <div className="mb-12">
              {/* Title */}
              <h1 className="text-[var(--color-black)] mb-3">
                Gerät verifizieren
              </h1>

              {/* Subtitle */}
              <p className="text-[var(--color-grey)]">
                Code wurde an {email} gesendet
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleVerifyCode} className="flex-1 flex flex-col">
              <div className="space-y-6 mb-8">
                <div>
                  <label
                    htmlFor="code"
                    className="block mb-3 text-[var(--color-black)]"
                  >
                    Bestätigungscode
                  </label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="tracking-widest text-center h-[52px] border-[var(--color-grey)] focus:border-[var(--color-blue)] text-[var(--color-black)]"
                    style={{
                      fontSize: '20pt',
                    }}
                    autoFocus
                  />
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-full h-[52px] bg-[var(--color-blue)] hover:bg-[var(--color-blue)]/90 text-white"
                  style={{
                    fontSize: '16pt',
                  }}
                >
                  {isLoading ? 'Wird verifiziert…' : 'Verifizieren'}
                </Button>

                {/* Zurück Button */}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStep('email');
                    setCode('');
                  }}
                  className="w-full h-[48px] text-[var(--color-grey)] hover:text-[var(--color-black)]"
                >
                  Zurück zur E-Mail-Eingabe
                </Button>

                {/* Legal Links */}
                <div className="pt-6 border-t border-[var(--color-grey)]">
                  <div className="flex items-center justify-center gap-4">
                    <Link href="/pixcapture-agb">
                      <span className="text-[var(--color-blue)] hover:underline cursor-pointer text-[12pt]">
                        AGB
                      </span>
                    </Link>
                    <span className="text-[var(--color-grey)]">·</span>
                    <Link href="/pixcapture-datenschutz">
                      <span className="text-[var(--color-blue)] hover:underline cursor-pointer text-[12pt]">
                        Datenschutz
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </IPhoneFrame>
  );
}
