import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronLeft,
  User,
  Bell,
  Moon,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Wifi,
  Upload,
  UserCog,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { AppNavigationBar } from '../components/AppNavigationBar';
import { IPhoneFrame } from '../components/IPhoneFrame';

export default function AppSettings() {
  const [, setLocation] = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [autoUpload, setAutoUpload] = useState(false);

  const userEmail = localStorage.getItem('pix_user_email') || 'user@pix.immo';

  // Load upload preferences
  useEffect(() => {
    const savedWifiOnly = localStorage.getItem('pix_upload_wifi_only');
    const savedAutoUpload = localStorage.getItem('pix_upload_auto');
    
    if (savedWifiOnly !== null) {
      setWifiOnly(savedWifiOnly === 'true');
    }
    if (savedAutoUpload !== null) {
      setAutoUpload(savedAutoUpload === 'true');
    }
  }, []);

  // Save upload preferences
  const handleWifiOnlyChange = (checked: boolean) => {
    setWifiOnly(checked);
    localStorage.setItem('pix_upload_wifi_only', checked.toString());
  };

  const handleAutoUploadChange = (checked: boolean) => {
    setAutoUpload(checked);
    localStorage.setItem('pix_upload_auto', checked.toString());
  };

  const handleLogout = () => {
    // Token löschen
    localStorage.removeItem('pix_session_token');
    localStorage.removeItem('pix_token_expiry');
    localStorage.removeItem('pix_user_email');

    // Zurück zum Login
    setLocation('/pixcapture-app/login');
  };

  const handleUserSwitch = () => {
    // Alle Tokens löschen (inkl. Device-Token)
    localStorage.removeItem('pix_session_token');
    localStorage.removeItem('pix_token_expiry');
    localStorage.removeItem('pix_user_email');
    localStorage.removeItem('pix_device_verified');
    localStorage.removeItem('pix_device_token');
    localStorage.removeItem('pix_device_token_expiry');

    // Zur Verifikation
    setLocation('/pixcapture-app/verify');
  };

  return (
    <IPhoneFrame>
      <div className="min-h-full bg-[#F8F9FA] dark:bg-[#0E0E0E] flex flex-col" style={{ position: 'relative', height: '100%', paddingTop: '59px', paddingBottom: '34px' }}>
      {/* Header */}
      <header className="bg-white dark:bg-[#1A1A1C] border-b border-[#E9E9E9] dark:border-[#2C2C2C] sticky z-10" style={{ top: '59px' }}>
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/pixcapture-app/jobs">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 -ml-3"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1
              className="text-[#111111] dark:text-white flex-1"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '22pt',
                lineHeight: '28pt',
              }}
            >
              Einstellungen
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-6 overflow-y-auto" style={{ paddingBottom: '40px' }}>
        {/* Profile Section */}
        <div className="bg-white dark:bg-[#1A1A1C] rounded-2xl p-4 border border-[#E9E9E9] dark:border-[#2C2C2C] mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#3B82F6] rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3
                className="text-[#111111] dark:text-white"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: '17pt',
                }}
              >
                Profil
              </h3>
              <p className="text-[#6B7280] dark:text-[#A3A3A3] text-sm">
                {userEmail}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* App-Einstellungen */}
          <div>
            <h2
              className="text-[#6B7280] dark:text-[#A3A3A3] mb-3 px-2"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '13pt',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              App
            </h2>
            
            <div className="bg-white dark:bg-[#1A1A1C] rounded-2xl border border-[#E9E9E9] dark:border-[#2C2C2C] overflow-hidden">
              {/* Push-Benachrichtigungen */}
              <button
                onClick={() => setLocation('/pixcapture-app/notifications')}
                className="w-full flex items-center justify-between p-4 border-b border-[#E9E9E9] dark:border-[#2C2C2C] hover:bg-[#F9F9F9] dark:hover:bg-[#252525] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
                  <div>
                    <p
                      className="text-[#111111] dark:text-white"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '17pt',
                      }}
                    >
                      Benachrichtigungen
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3]">
                      Push-Einstellungen verwalten
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
              </button>

              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
                  <div>
                    <p
                      className="text-[#111111] dark:text-white"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '17pt',
                      }}
                    >
                      Dark Mode
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3]">
                      Automatisch nach System
                    </p>
                  </div>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </div>
          </div>

          {/* Upload-Einstellungen */}
          <div>
            <h2
              className="text-[#6B7280] dark:text-[#A3A3A3] mb-3 px-2"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '13pt',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              Upload
            </h2>
            
            <div className="bg-white dark:bg-[#1A1A1C] rounded-2xl border border-[#E9E9E9] dark:border-[#2C2C2C] overflow-hidden">
              {/* Nur WLAN */}
              <div className="flex items-center justify-between p-4 border-b border-[#E9E9E9] dark:border-[#2C2C2C]">
                <div className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
                  <div>
                    <p
                      className="text-[#111111] dark:text-white"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '17pt',
                      }}
                    >
                      Nur über WLAN
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3]">
                      Upload nur bei WLAN-Verbindung
                    </p>
                  </div>
                </div>
                <Switch
                  checked={wifiOnly}
                  onCheckedChange={handleWifiOnlyChange}
                />
              </div>

              {/* Auto-Upload */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
                  <div>
                    <p
                      className="text-[#111111] dark:text-white"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '17pt',
                      }}
                    >
                      Automatischer Upload
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3]">
                      Fotos nach Aufnahme hochladen
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoUpload}
                  onCheckedChange={handleAutoUploadChange}
                />
              </div>
            </div>
          </div>

          {/* Nutzerverwaltung */}
          <div>
            <h2
              className="text-[#6B7280] dark:text-[#A3A3A3] mb-3 px-2"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '13pt',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              Nutzerverwaltung
            </h2>
            
            <div className="bg-white dark:bg-[#1A1A1C] rounded-2xl border border-[#E9E9E9] dark:border-[#2C2C2C] overflow-hidden">
              {/* Aktueller Nutzer */}
              <div className="p-4 border-b border-[#E9E9E9] dark:border-[#2C2C2C]">
                <div className="flex items-center gap-3 mb-2">
                  <UserCog className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
                  <p
                    className="text-[#111111] dark:text-white"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '17pt',
                      fontWeight: 500,
                    }}
                  >
                    Aktueller Nutzer
                  </p>
                </div>
                <p
                  className="text-[#3B82F6] ml-8"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '15pt',
                    fontWeight: 500,
                  }}
                >
                  {userEmail}
                </p>
              </div>

              {/* Nutzer wechseln */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full flex items-center justify-between p-4 active:bg-[#F8F9FA] dark:active:bg-[#2C2C2C] transition-colors">
                    <div className="flex-1 text-left">
                      <p
                        className="text-[#111111] dark:text-white mb-1"
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontSize: '17pt',
                        }}
                      >
                        Nutzer wechseln
                      </p>
                      <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3]">
                        Der neue Nutzer muss per E-Mail verifiziert werden
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Nutzer wechseln?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Beim Nutzerwechsel muss der neue Nutzer per E-Mail-Verifikation freigegeben werden. 
                      Alle lokalen Sitzungsdaten werden gelöscht.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleUserSwitch}
                      className="bg-[#3B82F6] hover:bg-[#3B82F6]/90"
                    >
                      Nutzer wechseln
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Info-Box */}
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p
                className="text-[#3B82F6] dark:text-blue-400"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 400,
                  fontSize: '12pt',
                  lineHeight: '18pt',
                }}
              >
                ℹ️ Mehrere Nutzer können dasselbe Gerät verwenden, aber nie gleichzeitig.
              </p>
            </div>
          </div>

          {/* Sicherheit */}
          <div>
            <h2
              className="text-[#6B7280] dark:text-[#A3A3A3] mb-3 px-2"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '13pt',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              Sicherheit
            </h2>
            
            <div className="bg-white dark:bg-[#1A1A1C] rounded-2xl border border-[#E9E9E9] dark:border-[#2C2C2C] overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 active:bg-[#F8F9FA] dark:active:bg-[#2C2C2C] transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
                  <p
                    className="text-[#111111] dark:text-white"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '17pt',
                    }}
                  >
                    Passwort ändern
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
              </button>
            </div>
          </div>

          {/* Support */}
          <div>
            <h2
              className="text-[#6B7280] dark:text-[#A3A3A3] mb-3 px-2"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '13pt',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              Support
            </h2>
            
            <div className="bg-white dark:bg-[#1A1A1C] rounded-2xl border border-[#E9E9E9] dark:border-[#2C2C2C] overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 border-b border-[#E9E9E9] dark:border-[#2C2C2C] active:bg-[#F8F9FA] dark:active:bg-[#2C2C2C] transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
                  <p
                    className="text-[#111111] dark:text-white"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '17pt',
                    }}
                  >
                    Hilfe & FAQ
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
              </button>

              <Link href="/pixcapture-impressum">
                <button className="w-full flex items-center justify-between p-4 border-b border-[#E9E9E9] dark:border-[#2C2C2C] active:bg-[#F8F9FA] dark:active:bg-[#2C2C2C] transition-colors">
                  <p
                    className="text-[#111111] dark:text-white"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '17pt',
                    }}
                  >
                    Impressum
                  </p>
                  <ChevronRight className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
                </button>
              </Link>

              <Link href="/pixcapture-datenschutz">
                <button className="w-full flex items-center justify-between p-4 active:bg-[#F8F9FA] dark:active:bg-[#2C2C2C] transition-colors">
                  <p
                    className="text-[#111111] dark:text-white"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '17pt',
                    }}
                  >
                    Datenschutz
                  </p>
                  <ChevronRight className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
                </button>
              </Link>
            </div>
          </div>

          {/* Logout */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-[#C94B38] text-[#C94B38] hover:bg-[#C94B38]/10"
                style={{
                  height: '56pt',
                  borderRadius: '16pt',
                  fontSize: '17pt',
                  fontWeight: 600,
                }}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Abmelden
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Wirklich abmelden?</AlertDialogTitle>
                <AlertDialogDescription>
                  Du wirst zur Login-Seite weitergeleitet und musst dich beim nächsten Start neu anmelden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="bg-[#C94B38] hover:bg-[#C94B38]/90"
                >
                  Abmelden
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Version Info */}
          <p className="text-center text-xs text-[#6B7280] dark:text-[#A3A3A3] py-4">
            PIX.IMMO Version 1.0.0
          </p>
        </div>
      </main>

        {/* Navigation Bar */}
        <AppNavigationBar activeRoute="/pixcapture-app/settings" />
      </div>
    </IPhoneFrame>
  );
}
