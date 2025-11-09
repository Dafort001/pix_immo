import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Trash2, CheckCircle2, RotateCcw } from 'lucide-react';

export default function DevResetApp() {
  const [resetComplete, setResetComplete] = useState(false);

  const handleResetAll = () => {
    // Alle pixcapture-bezogenen Daten löschen
    localStorage.removeItem('pix_device_verified');
    localStorage.removeItem('pix_device_token');
    localStorage.removeItem('pix_device_token_expiry');
    localStorage.removeItem('pix_session_token');
    localStorage.removeItem('pix_token_expiry');
    localStorage.removeItem('pix_user_email');
    localStorage.removeItem('pix_upload_wifi_only');
    localStorage.removeItem('pix_upload_auto');
    
    setResetComplete(true);
  };

  const handleResetDevice = () => {
    // Nur Geräte-Verifikation zurücksetzen
    localStorage.removeItem('pix_device_verified');
    localStorage.removeItem('pix_device_token');
    localStorage.removeItem('pix_device_token_expiry');
    
    setResetComplete(true);
  };

  const handleResetSession = () => {
    // Nur Session-Daten löschen
    localStorage.removeItem('pix_session_token');
    localStorage.removeItem('pix_token_expiry');
    localStorage.removeItem('pix_user_email');
    
    setResetComplete(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0E0E0E] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl mb-8">🛠️ App Reset Tool</h1>

        {resetComplete && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="text-green-600 dark:text-green-400" />
            <div>
              <p className="text-green-600 dark:text-green-400 font-medium">
                Reset erfolgreich!
              </p>
              <p className="text-sm text-green-600/80 dark:text-green-400/80">
                Starten Sie die App neu, um den Flow zu testen.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#1A1A1C] rounded-2xl border border-[#E9E9E9] dark:border-[#2C2C2C] overflow-hidden">
          
          {/* Reset All */}
          <div className="p-6 border-b border-[#E9E9E9] dark:border-[#2C2C2C]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Kompletter Reset</h3>
                <p className="text-sm text-[#6B7280] dark:text-[#A3A3A3] mb-4">
                  Löscht alle App-Daten inklusive Geräte-Verifikation und Session. 
                  Simuliert eine Neuinstallation der App.
                </p>
                <Button 
                  onClick={handleResetAll}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Alles zurücksetzen
                </Button>
              </div>
            </div>
          </div>

          {/* Reset Device Only */}
          <div className="p-6 border-b border-[#E9E9E9] dark:border-[#2C2C2C]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Geräte-Verifikation zurücksetzen</h3>
                <p className="text-sm text-[#6B7280] dark:text-[#A3A3A3] mb-4">
                  Löscht nur die Geräte-Verifikation. Session bleibt erhalten.
                  Simuliert ein neues/zurückgesetztes Gerät.
                </p>
                <Button 
                  onClick={handleResetDevice}
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Gerät zurücksetzen
                </Button>
              </div>
            </div>
          </div>

          {/* Reset Session Only */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Session zurücksetzen</h3>
                <p className="text-sm text-[#6B7280] dark:text-[#A3A3A3] mb-4">
                  Löscht nur Session-Daten. Geräte-Verifikation bleibt erhalten.
                  Simuliert einen Logout.
                </p>
                <Button 
                  onClick={handleResetSession}
                  variant="outline"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Session zurücksetzen
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Current State */}
        <div className="mt-6 bg-white dark:bg-[#1A1A1C] rounded-2xl border border-[#E9E9E9] dark:border-[#2C2C2C] p-6">
          <h3 className="text-lg font-semibold mb-4">Aktueller Status</h3>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B7280] dark:text-[#A3A3A3]">pix_device_verified:</span>
              <span className={localStorage.getItem('pix_device_verified') ? 'text-green-600' : 'text-red-600'}>
                {localStorage.getItem('pix_device_verified') || 'null'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280] dark:text-[#A3A3A3]">pix_device_token:</span>
              <span className={localStorage.getItem('pix_device_token') ? 'text-green-600' : 'text-red-600'}>
                {localStorage.getItem('pix_device_token') ? '✓ vorhanden' : 'null'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280] dark:text-[#A3A3A3]">pix_session_token:</span>
              <span className={localStorage.getItem('pix_session_token') ? 'text-green-600' : 'text-red-600'}>
                {localStorage.getItem('pix_session_token') ? '✓ vorhanden' : 'null'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280] dark:text-[#A3A3A3]">pix_user_email:</span>
              <span className={localStorage.getItem('pix_user_email') ? 'text-green-600' : 'text-red-600'}>
                {localStorage.getItem('pix_user_email') || 'null'}
              </span>
            </div>
          </div>
        </div>

        {/* Test Links */}
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold mb-3">Test-Links</h3>
          <Link href="/pixcapture-app">
            <Button variant="outline" className="w-full justify-start">
              → Starte App (Splash)
            </Button>
          </Link>
          <Link href="/pixcapture-app/firstlaunch">
            <Button variant="outline" className="w-full justify-start">
              → First Launch Splash
            </Button>
          </Link>
          <Link href="/pixcapture-app/verify">
            <Button variant="outline" className="w-full justify-start">
              → User-Verifikation
            </Button>
          </Link>
          <Link href="/pixcapture-app/login">
            <Button variant="outline" className="w-full justify-start">
              → Login-Screen
            </Button>
          </Link>
          <Link href="/pixcapture-app/jobs">
            <Button variant="outline" className="w-full justify-start">
              → Jobs (Haupt-App)
            </Button>
          </Link>
        </div>

        {/* Back to Dev */}
        <div className="mt-8">
          <Link href="/dev">
            <Button variant="ghost">
              ← Zurück zum Dev-Index
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
