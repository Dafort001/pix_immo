import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Smartphone, LogIn, LayoutDashboard, Camera, Settings, User, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function AppIndex() {
  const [hasToken, setHasToken] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState<string | null>(null);

  useEffect(() => {
    // Check for token on mount
    const token = localStorage.getItem('pix_session_token');
    const expiry = localStorage.getItem('pix_token_expiry');
    
    if (token && expiry) {
      const expiryDate = new Date(expiry);
      if (expiryDate > new Date()) {
        setHasToken(true);
        setTokenExpiry(expiry);
      }
    }
  }, []);
  const appPages = [
    {
      name: 'Splash Screen',
      path: '/app',
      icon: Smartphone,
      status: 'completed',
      description: 'App-Start mit Session-Check und Auto-Login',
    },
    {
      name: 'Login',
      path: '/app/login',
      icon: LogIn,
      status: 'completed',
      description: 'E-Mail/Passwort Login mit iOS-Design',
    },
    {
      name: 'Jobs-Liste',
      path: '/app/jobs',
      icon: LayoutDashboard,
      status: 'completed',
      description: 'Job-Übersicht mit Search und Filter',
    },
    {
      name: 'Einstellungen',
      path: '/app/settings',
      icon: Settings,
      status: 'completed',
      description: 'App-Einstellungen, Profil und Logout',
    },
    {
      name: 'Kamera',
      path: '/app/camera',
      icon: Camera,
      status: 'planned',
      description: 'Native Kamera-Integration für Foto-Upload',
    },
    {
      name: 'Registrierung',
      path: '/app/register',
      icon: User,
      status: 'planned',
      description: 'Multi-Step Registrierungsformular',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Smartphone className="h-8 w-8 text-[#3B82F6]" />
              <div>
                <h1 className="text-2xl">PIX.IMMO iPhone App</h1>
                <p className="text-[#6B7280] text-sm mt-1">
                  iOS Design System & App-Seiten
                </p>
              </div>
            </div>
            
            {/* Token Status */}
            <div className="hidden md:flex items-center gap-3">
              {hasToken ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#F0FDF4] border border-[#64BF49] rounded-lg">
                  <CheckCircle className="h-4 w-4 text-[#64BF49]" />
                  <div>
                    <p className="text-xs font-medium text-[#64BF49]">Session aktiv</p>
                    <p className="text-xs text-[#6B7280]">
                      Gültig bis {tokenExpiry ? new Date(tokenExpiry).toLocaleString('de-DE') : 'unbekannt'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#FEF2F2] border border-[#C94B38] rounded-lg">
                  <XCircle className="h-4 w-4 text-[#C94B38]" />
                  <p className="text-xs font-medium text-[#C94B38]">Kein Token</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        
        {/* Quick Access Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-[#64BF49] to-[#74A4EA] rounded-xl shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-[#3B82F6]" />
              </div>
              <div className="text-white">
                <h3 className="font-semibold">Splash Screen direkt starten</h3>
                <p className="text-sm text-white/90">Session-Check mit Auto-Login testen</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/app">
                <Button className="bg-white text-[#3B82F6] hover:bg-white/90 shadow-md">
                  🚀 Zur App
                </Button>
              </Link>
              <Link href="/app-overview">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  📄 Dokumentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Info Section */}
        <Card className="p-6 mb-8 bg-[#EFF6FF] border-[#3B82F6]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3B82F6] flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl mb-2">iPhone 15 Pro Design</h2>
              <p className="text-[#6B7280] mb-4">
                Alle App-Seiten folgen den exakten Design-Spezifikationen für iPhone 15 Pro
                im Portrait-Modus mit Safe Area Support und Light/Dark Mode.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">393 × 852 pt</Badge>
                <Badge variant="secondary">Safe Area ON</Badge>
                <Badge variant="secondary">8 pt Grid</Badge>
                <Badge variant="secondary">Inter Font</Badge>
                <Badge variant="secondary">iOS HIG</Badge>
              </div>
              <Link href="/app">
                <Button className="bg-[#64BF49] hover:bg-[#64BF49]/90 text-white">
                  🚀 App jetzt starten
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Splash Screen Preview */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-[#1A1A1C] to-[#3B82F6]">
          <div className="text-center text-white">
            <h2 className="text-2xl mb-4">📱 Splash Screen Preview</h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Der Splash Screen erscheint beim App-Start, prüft automatisch deinen Login-Status
              und leitet dich entweder zur Jobs-Liste (bei gültigem Token) oder zum Login weiter.
            </p>
            
            {/* iPhone Frame with Splash Screen */}
            <div className="inline-block bg-[#1A1A1C] rounded-[3rem] p-3 shadow-2xl">
              <div className="bg-white dark:bg-[#0E0E0E] rounded-[2.5rem] overflow-hidden" style={{ width: '280px', height: '580px' }}>
                {/* Status Bar */}
                <div className="h-12 bg-white dark:bg-[#0E0E0E] flex items-center justify-between px-6">
                  <span className="text-xs">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-3 border border-black dark:border-white rounded-sm" />
                  </div>
                </div>
                
                {/* Splash Content */}
                <div className="flex flex-col items-center justify-center pt-32">
                  {/* Logo */}
                  <div className="mb-4 animate-pulse">
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 96 96"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="96" height="96" rx="20" fill="#1A1A1C" />
                      <path d="M30 36h36v24H30V36z" fill="white" />
                      <circle cx="48" cy="48" r="9" fill="#1A1A1C" />
                    </svg>
                  </div>
                  
                  {/* Logo Text */}
                  <h1 className="text-2xl font-semibold tracking-wider mb-2">PIX.IMMO</h1>
                  
                  {/* Status Text */}
                  <p className="text-sm text-[#6B7280] dark:text-[#A3A3A3] mb-6">
                    pix.immo wird gestartet…
                  </p>
                  
                  {/* Spinner */}
                  <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                  
                  {/* Version */}
                  <p className="text-xs text-[#6B7280] dark:text-[#A3A3A3] absolute bottom-20">
                    Version 1.0.0
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              <Link href="/app">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  🚀 Live Demo starten
                </Button>
              </Link>
              <a href="/SPLASH_SCREEN_GUIDE.md" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  📱 Splash Screen Guide
                </Button>
              </a>
              <a href="/IPHONE_APP_SESSION.md" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  📖 Session-Docs
                </Button>
              </a>
            </div>
          </div>
        </Card>

        {/* App Pages Grid */}
        <div>
          <h2 className="text-2xl mb-6">App-Seiten</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appPages.map((page) => {
              const Icon = page.icon;
              const isCompleted = page.status === 'completed';
              
              return (
                <Card
                  key={page.path}
                  className={`p-6 ${
                    isCompleted
                      ? 'hover:shadow-lg transition-shadow cursor-pointer'
                      : 'opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
                      <Icon className="h-6 w-6 text-[#3B82F6]" />
                    </div>
                    <Badge
                      className={
                        isCompleted
                          ? 'bg-[#64BF49] text-white'
                          : 'bg-[#8E9094] text-white'
                      }
                    >
                      {isCompleted ? 'Fertig' : 'Geplant'}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl mb-2">{page.name}</h3>
                  <p className="text-[#6B7280] text-sm mb-4">{page.description}</p>
                  
                  {isCompleted ? (
                    <Link href={page.path}>
                      <Button className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90">
                        Seite öffnen
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      In Entwicklung
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Design Documentation */}
        <Card className="p-6 mt-8">
          <h2 className="text-2xl mb-4">Design-Dokumentation</h2>
          <p className="text-[#6B7280] mb-6">
            Vollständige Spezifikationen für Layout, Farben, Typografie und Komponenten.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F8F9FA] rounded-lg">
              <h3 className="font-medium mb-2">📐 Layout-System</h3>
              <ul className="text-sm text-[#6B7280] space-y-1">
                <li>• 8 pt Grid-System</li>
                <li>• Safe Area Support</li>
                <li>• Top-Padding: 64 pt</li>
                <li>• Bottom-Padding: 24 pt</li>
              </ul>
            </div>
            
            <div className="p-4 bg-[#F8F9FA] rounded-lg">
              <h3 className="font-medium mb-2">🎨 Farb-System</h3>
              <ul className="text-sm text-[#6B7280] space-y-1">
                <li>• Light & Dark Mode</li>
                <li>• Brand: #3B82F6</li>
                <li>• Text Primary: #111111</li>
                <li>• Text Secondary: #6B7280</li>
              </ul>
            </div>
            
            <div className="p-4 bg-[#F8F9FA] rounded-lg">
              <h3 className="font-medium mb-2">📱 Komponenten</h3>
              <ul className="text-sm text-[#6B7280] space-y-1">
                <li>• Input Fields: 56 pt Höhe</li>
                <li>• Buttons: 56 pt Höhe</li>
                <li>• Corner-Radius: 16 pt</li>
                <li>• Icons: 20 pt Standard</li>
              </ul>
            </div>
            
            <div className="p-4 bg-[#F8F9FA] rounded-lg">
              <h3 className="font-medium mb-2">✅ Accessibility</h3>
              <ul className="text-sm text-[#6B7280] space-y-1">
                <li>• Min Touch Target: 44 pt</li>
                <li>• WCAG AA Kontraste</li>
                <li>• Screen Reader Support</li>
                <li>• Dynamic Type Ready</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <a href="/IPHONE_APP_DESIGN.md" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                📄 Vollständige Dokumentation
              </Button>
            </a>
            <Link href="/app">
              <Button className="bg-[#64BF49] hover:bg-[#64BF49]/90 text-white">
                🚀 App starten (Splash Screen)
              </Button>
            </Link>
            <Link href="/app/login">
              <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90">
                Login-Seite testen
              </Button>
            </Link>
          </div>
        </Card>

        {/* Session Demo */}
        <Card className="p-6 mt-8 bg-[#FFF8E6] border-[#C9B55A]">
          <h2 className="text-2xl mb-4">🔐 Session-Handling Demo</h2>
          <p className="text-[#6B7280] mb-6">
            Teste den kompletten App-Flow mit automatischem Session-Check:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#3B82F6] text-white flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-medium mb-1">Starte die App</h3>
                <p className="text-sm text-[#6B7280] mb-3">
                  Klicke auf "App starten" → Splash Screen erscheint mit Logo-Animation (1.2s)
                </p>
                <Link href="/app">
                  <Button size="sm" className="bg-[#3B82F6] hover:bg-[#3B82F6]/90">
                    → /app starten
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#3B82F6] text-white flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-medium mb-1">Automatischer Token-Check</h3>
                <p className="text-sm text-[#6B7280]">
                  Kein gültiger Token gefunden → Weiterleitung zum Login-Screen
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#3B82F6] text-white flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-medium mb-1">Login oder Demo</h3>
                <p className="text-sm text-[#6B7280] mb-3">
                  Wähle zwischen normalem Login oder Demo-Modus (2h Token)
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">24h Token (Normal)</Badge>
                  <Badge variant="secondary">30d Token (Angemeldet bleiben)</Badge>
                  <Badge className="bg-[#C9B55A] text-white">2h Token (Demo)</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#64BF49] text-white flex items-center justify-center flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-medium mb-1">Jobs-Liste & Navigation</h3>
                <p className="text-sm text-[#6B7280]">
                  Nach erfolgreichem Login → Jobs-Liste mit Bottom-Navigation
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#8E9094] text-white flex items-center justify-center flex-shrink-0">
                5
              </div>
              <div>
                <h3 className="font-medium mb-1">Erneuter App-Start</h3>
                <p className="text-sm text-[#6B7280] mb-3">
                  Token ist noch gültig → Automatischer Login ohne Eingabe!
                </p>
                <p className="text-xs text-[#6B7280] italic">
                  💡 Tipp: Nach dem Login erneut auf "App starten" klicken, um Auto-Login zu testen
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Back to Main Site */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="ghost">
              ← Zurück zur Hauptseite
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E9E9E9] mt-12 py-8">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center text-sm text-[#6B7280]">
          <p>PIX.IMMO iPhone App · Version 1.0.0 · Design System</p>
        </div>
      </footer>
    </div>
  );
}
