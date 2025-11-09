import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function AppSplashFirstLaunch() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Nach 1.5 Sekunden automatisch zur Verifikation weiterleiten
    const timer = setTimeout(() => {
      setLocation('/pixcapture-app/verify');
    }, 1500);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0E0E0E]">
      {/* Vollbild-Hintergrundbild */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1602872029708-84d970d3382b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbnRlcmlvciUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjI0MTc3MTF8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Pix Capture"
          className="w-full h-full object-cover opacity-40"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <svg
            width="120"
            height="120"
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-pulse"
          >
            <rect
              width="96"
              height="96"
              rx="20"
              fill="white"
            />
            <path
              d="M30 36h36v24H30V36z"
              fill="#0E0E0E"
            />
            <circle
              cx="48"
              cy="48"
              r="9"
              fill="white"
            />
          </svg>
        </div>

        {/* Haupttext */}
        <h1
          className="text-white mb-3"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: '24pt',
            lineHeight: '30pt',
            letterSpacing: '0.02em',
          }}
        >
          Pix Capture wird gestartet …
        </h1>

        {/* Subtext */}
        <p
          className="text-white/60"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
            fontSize: '15pt',
            lineHeight: '21pt',
          }}
        >
          Bitte kurz warten
        </p>

        {/* Loading Indicator */}
        <div className="mt-12">
          <div
            className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin"
            style={{
              borderWidth: '3px',
            }}
          />
        </div>
      </div>

      {/* Version Info */}
      <div className="absolute bottom-8 left-0 right-0">
        <p
          className="text-white/40 text-center"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
            fontSize: '12pt',
          }}
        >
          Version 1.0.0
        </p>
      </div>
    </div>
  );
}
