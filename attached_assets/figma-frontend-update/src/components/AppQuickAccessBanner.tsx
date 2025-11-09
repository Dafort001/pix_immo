import { Link } from 'wouter';
import { Smartphone, X } from 'lucide-react';
import { useState } from 'react';

export function AppQuickAccessBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-[#3B82F6] to-[#64BF49] text-white shadow-2xl animate-in slide-in-from-top duration-500">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-1">
            <div className="bg-white/20 p-3 rounded-full animate-pulse">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                📱 PIX.IMMO iPhone App (mit Splash Screen)
              </h3>
              <p className="text-sm text-white/90">
                Klicke hier für die vollständige iPhone App mit Session-Handling
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app-nav">
              <button className="bg-white text-[#3B82F6] px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                📱 iPhone Layout
              </button>
            </Link>
            <Link href="/app">
              <button className="bg-white/20 border-2 border-white text-white px-4 py-3 rounded-full hover:bg-white/30 transition-all">
                ⚡ Splash
              </button>
            </Link>
            <Link href="/dev">
              <button className="bg-white/20 border-2 border-white text-white px-4 py-3 rounded-full hover:bg-white/30 transition-all">
                📋 Dev
              </button>
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
              aria-label="Banner schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
