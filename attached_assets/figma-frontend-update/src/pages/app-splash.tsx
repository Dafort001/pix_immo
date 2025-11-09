import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function AppSplash() {
  const [, setLocation] = useLocation();
  const [fadeIn, setFadeIn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('App wird geladen…');

  useEffect(() => {
    // Fade-In Animation starten
    setFadeIn(true);

    // Progress-Animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 120);

    // Session Token Check
    const checkSession = async () => {
      // Schritt 1: Loading
      setStatusText('App wird geladen…');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Schritt 2: First Launch Check
      setStatusText('Gerät wird geprüft…');
      setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Prüfe ob Gerät bereits verifiziert ist
      const deviceVerified = localStorage.getItem('pix_device_verified');
      const deviceToken = localStorage.getItem('pix_device_token');
      const deviceTokenExpiry = localStorage.getItem('pix_device_token_expiry');

      // First Launch: Gerät nicht verifiziert
      if (!deviceVerified || !deviceToken || !deviceTokenExpiry) {
        setStatusText('Geräte-Verifikation erforderlich');
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Zu First Launch Splash
        setLocation('/pixcapture-app/firstlaunch');
        return;
      }

      // Gerät-Token abgelaufen?
      const deviceExpiryDate = new Date(deviceTokenExpiry);
      const now = new Date();
      if (deviceExpiryDate <= now) {
        setStatusText('Geräte-Verifikation abgelaufen');
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Zur Verifikation
        setLocation('/pixcapture-app/verify');
        return;
      }
      
      // Schritt 3: Session-Check
      setStatusText('Session wird geprüft…');
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 400));

      // Prüfe ob Session-Token vorhanden ist
      const sessionToken = localStorage.getItem('pix_session_token');
      const tokenExpiry = localStorage.getItem('pix_token_expiry');

      if (sessionToken && tokenExpiry) {
        const expiryDate = new Date(tokenExpiry);

        // Token ist gültig und nicht abgelaufen
        if (expiryDate > now) {
          // Schritt 4: Token gültig
          setStatusText('Anmeldung erfolgreich ✓');
          setProgress(100);
          await new Promise(resolve => setTimeout(resolve, 400));
          
          // Navigiere zur Jobs-Liste
          setLocation('/pixcapture-app/jobs');
          return;
        }
      }

      // Kein gültiger Session-Token → Login-Screen
      setStatusText('Anmeldung erforderlich');
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setLocation('/pixcapture-app/login');
    };

    checkSession();

    return () => clearInterval(progressInterval);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0E0E0E] flex flex-col items-center justify-center px-6">
      {/* Logo mit Fade-In Animation */}
      <div
        className={`transition-opacity duration-700 ${
          fadeIn ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* pixcapture Logo */}
        <div className="flex items-center justify-center mb-6">
          <svg
            width="96"
            height="96"
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-pulse"
          >
            <rect
              width="96"
              height="96"
              rx="20"
              fill="#3B82F6"
            />
            <path
              d="M30 36h36v24H30V36z"
              fill="white"
            />
            <circle
              cx="48"
              cy="48"
              r="9"
              fill="#3B82F6"
            />
          </svg>
        </div>

        {/* Wortmarke */}
        <h1
          className="text-[#111111] dark:text-white text-center mb-4"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: '24pt',
            lineHeight: '30pt',
            letterSpacing: '0.05em',
          }}
        >
          pixcapture
        </h1>

        {/* Status-Text */}
        <p
          className="text-[#111111] dark:text-white text-center mb-6"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
            fontSize: '15pt',
            lineHeight: '21pt',
            opacity: 0.6,
          }}
        >
          {statusText}
        </p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-[#E5E7EB] dark:bg-[#374151] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3B82F6] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Spinner */}
        <div className="flex justify-center mt-8">
          <div
            className="w-8 h-8 border-3 border-[#3B82F6] border-t-transparent rounded-full animate-spin"
            style={{
              borderWidth: '3px',
            }}
          />
        </div>
      </div>



      {/* Version Info (unten) */}
      <div className="absolute bottom-8">
        <p
          className="text-[#6B7280] dark:text-[#A3A3A3] text-center"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
            fontSize: '13pt',
            opacity: 0.6,
          }}
        >
          Version 1.0.0
        </p>
      </div>
    </div>
  );
}
