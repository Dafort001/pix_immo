import { Link } from 'wouter';
import { Smartphone, Home, Layout, User, Settings as SettingsIcon, FileText, Briefcase, Laptop, RotateCcw } from 'lucide-react';

export default function DevIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4" style={{ fontWeight: '700', color: '#1A1A1C' }}>
            PIX.IMMO Development Hub
          </h1>
          <p className="text-xl text-[#6B7280]">
            Schnellzugriff auf alle wichtigen Seiten
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* iPhone App Navigation - HIGHLIGHTED */}
          <Link href="/app-nav">
            <div className="bg-gradient-to-br from-[#3B82F6] to-[#64BF49] p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all cursor-pointer transform hover:scale-105 animate-pulse">
              <div className="flex flex-col items-center text-white">
                <Smartphone className="h-16 w-16 mb-4" />
                <h3 className="text-2xl mb-2" style={{ fontWeight: '700' }}>
                  📱 iPhone Navigation
                </h3>
                <p className="text-sm text-white/90 text-center mb-3">
                  Alle App-Seiten im iPhone-Layout
                </p>
                <div className="bg-white/20 px-4 py-2 rounded-full text-sm">
                  /app-nav (START HIER!)
                </div>
              </div>
            </div>
          </Link>

          {/* App Overview */}
          <Link href="/app-overview">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-[#3B82F6]">
              <div className="flex flex-col items-center">
                <Layout className="h-12 w-12 mb-4 text-[#3B82F6]" />
                <h3 className="text-xl mb-2" style={{ fontWeight: '600' }}>
                  App Übersicht
                </h3>
                <p className="text-sm text-[#6B7280] text-center mb-3">
                  Dokumentation & Status
                </p>
                <div className="bg-[#EFF6FF] px-4 py-1 rounded-full text-sm text-[#3B82F6]">
                  /app-overview
                </div>
              </div>
            </div>
          </Link>

          {/* Admin Dashboard */}
          <Link href="/admin-dashboard">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer">
              <div className="flex flex-col items-center">
                <Briefcase className="h-12 w-12 mb-4 text-[#1A1A1C]" />
                <h3 className="text-xl mb-2" style={{ fontWeight: '600' }}>
                  Admin Dashboard
                </h3>
                <p className="text-sm text-[#6B7280] text-center mb-3">
                  Order Management
                </p>
                <div className="bg-[#F3F4F6] px-4 py-1 rounded-full text-sm text-[#1A1A1C]">
                  /admin-dashboard
                </div>
              </div>
            </div>
          </Link>

          {/* Public Website */}
          <Link href="/">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer">
              <div className="flex flex-col items-center">
                <Home className="h-12 w-12 mb-4 text-[#1A1A1C]" />
                <h3 className="text-xl mb-2" style={{ fontWeight: '600' }}>
                  Public Website
                </h3>
                <p className="text-sm text-[#6B7280] text-center mb-3">
                  Homepage (Public)
                </p>
                <div className="bg-[#F3F4F6] px-4 py-1 rounded-full text-sm text-[#1A1A1C]">
                  /
                </div>
              </div>
            </div>
          </Link>

          {/* Dashboard */}
          <Link href="/dashboard">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer">
              <div className="flex flex-col items-center">
                <User className="h-12 w-12 mb-4 text-[#1A1A1C]" />
                <h3 className="text-xl mb-2" style={{ fontWeight: '600' }}>
                  User Dashboard
                </h3>
                <p className="text-sm text-[#6B7280] text-center mb-3">
                  Customer Portal
                </p>
                <div className="bg-[#F3F4F6] px-4 py-1 rounded-full text-sm text-[#1A1A1C]">
                  /dashboard
                </div>
              </div>
            </div>
          </Link>

          {/* App Reset Tool */}
          <Link href="/dev/reset-app">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer">
              <div className="flex flex-col items-center text-white">
                <RotateCcw className="h-12 w-12 mb-4" />
                <h3 className="text-xl mb-2" style={{ fontWeight: '600' }}>
                  🛠️ App Reset Tool
                </h3>
                <p className="text-sm text-white/90 text-center mb-3">
                  Test First-Launch Flow
                </p>
                <div className="bg-white/20 px-4 py-1 rounded-full text-sm">
                  /dev/reset-app
                </div>
              </div>
            </div>
          </Link>

          {/* Documentation */}
          <a href="/SPLASH_SCREEN_GUIDE.md" target="_blank" rel="noopener noreferrer">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer">
              <div className="flex flex-col items-center">
                <FileText className="h-12 w-12 mb-4 text-[#1A1A1C]" />
                <h3 className="text-xl mb-2" style={{ fontWeight: '600' }}>
                  Splash Screen Guide
                </h3>
                <p className="text-sm text-[#6B7280] text-center mb-3">
                  Vollständige Anleitung
                </p>
                <div className="bg-[#F3F4F6] px-4 py-1 rounded-full text-sm text-[#1A1A1C]">
                  📖 Docs
                </div>
              </div>
            </div>
          </a>

        </div>

        {/* Direct Links */}
        <div className="mt-12 p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl mb-6 text-center" style={{ fontWeight: '600' }}>
            🎯 Direktlinks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/app-nav">
              <div className="bg-gradient-to-r from-[#3B82F6] to-[#64BF49] text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center">
                <span className="text-lg">📱 iPhone Navigation (/app-nav)</span>
              </div>
            </Link>
            <Link href="/pixcapture-app">
              <div className="bg-[#EFF6FF] text-[#3B82F6] px-6 py-4 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center border border-[#3B82F6]">
                <span className="text-lg">⚡ Splash Screen (/pixcapture-app)</span>
              </div>
            </Link>
            <Link href="/pixcapture-app/login">
              <div className="bg-[#EFF6FF] text-[#3B82F6] px-6 py-4 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center border border-[#3B82F6]">
                <span className="text-lg">🔐 Login (/pixcapture-app/login)</span>
              </div>
            </Link>
            <Link href="/pixcapture-app/jobs">
              <div className="bg-[#EFF6FF] text-[#3B82F6] px-6 py-4 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center border border-[#3B82F6]">
                <span className="text-lg">📋 Jobs (/pixcapture-app/jobs)</span>
              </div>
            </Link>
            <Link href="/pixcapture-app/settings">
              <div className="bg-[#EFF6FF] text-[#3B82F6] px-6 py-4 rounded-xl hover:shadow-lg transition-all cursor-pointer text-center border border-[#3B82F6]">
                <span className="text-lg">⚙️ Settings (/pixcapture-app/settings)</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Routes Info */}
        <div className="mt-8 p-6 bg-[#F0FDF4] border-2 border-[#64BF49] rounded-xl">
          <h3 className="text-lg mb-3" style={{ fontWeight: '600', color: '#1A1A1C' }}>
            💡 Flow: Proportionen im iPhone-Layout sehen
          </h3>
          <div className="space-y-2 text-sm text-[#1A1A1C]">
            <div className="flex items-center gap-2">
              <span className="bg-[#64BF49] text-white px-2 py-1 rounded text-xs">1</span>
              <span>Klicke auf "📱 iPhone Navigation" oben (große blaue Karte)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#64BF49] text-white px-2 py-1 rounded text-xs">2</span>
              <span>Oder gib <code className="bg-white px-2 py-1 rounded">/app-nav</code> in die URL ein</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#64BF49] text-white px-2 py-1 rounded text-xs">3</span>
              <span>Siehst iPhone 15 Pro Container mit allen Links + Specs rechts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#64BF49] text-white px-2 py-1 rounded text-xs">4</span>
              <span>Klicke auf Karten im iPhone → Öffnet die richtige Seite</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-[#6B7280]">
          <p>PIX.IMMO Development Environment · Version 1.0.0</p>
          <p className="mt-2">
            <a href="/COMPLETE_PAGES_OVERVIEW.md" target="_blank" className="text-[#3B82F6] hover:underline">
              Alle 47 Seiten ansehen
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
