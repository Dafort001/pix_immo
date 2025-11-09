import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Phone, HelpCircle, Upload, User, Info } from 'lucide-react';
import { Button } from './ui/button';

export function PixCaptureNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { href: '/pixcapture-home', label: 'Start', icon: null },
    { href: '/app-upload', label: 'Upload', icon: Upload },
    { href: '/pixcapture-help', label: 'Hilfe', icon: HelpCircle },
    { href: '/pixcapture-expert-call', label: 'Experten-Call', icon: Phone },
    { href: '/pixcapture-about', label: 'About', icon: Info },
    { href: '/app-login', label: 'Mein Konto', icon: User },
  ];

  const isActive = (href: string) => location === href;

  return (
    <>
      {/* Desktop Navigation */}
      <header className="hidden md:block bg-white border-b border-[#E5E5E5] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/pixcapture-home">
              <h1
                className="text-[#1A1A1C] cursor-pointer hover:text-[#64BF49] transition-colors"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: '24pt',
                  letterSpacing: '0.05em',
                }}
              >
                pixcapture.app
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`cursor-pointer transition-colors flex items-center gap-2 ${
                      isActive(item.href)
                        ? 'text-[#64BF49] font-semibold'
                        : 'text-[#6B7280] hover:text-[#1A1A1C]'
                    }`}
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '14pt',
                    }}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <header className="md:hidden bg-white border-b border-[#E5E5E5] sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/pixcapture-home">
            <h1
              className="text-[#1A1A1C]"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: '20pt',
                letterSpacing: '0.05em',
              }}
            >
              pixcapture.app
            </h1>
          </Link>

          {/* Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            className="h-10 w-10"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-[#E5E5E5] shadow-lg">
            <nav className="px-6 py-4 space-y-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 py-2 cursor-pointer transition-colors ${
                      isActive(item.href)
                        ? 'text-[#64BF49] font-semibold'
                        : 'text-[#6B7280] hover:text-[#1A1A1C]'
                    }`}
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '16pt',
                    }}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    {item.label}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

// Lightweight Version (für Seiten die bereits einen eigenen Header haben)
export function PixCaptureNavMinimal() {
  const [location] = useLocation();

  const navItems = [
    { href: '/pixcapture-home', label: 'Start' },
    { href: '/app-upload', label: 'Upload' },
    { href: '/pixcapture-help', label: 'Hilfe' },
    { href: '/pixcapture-expert-call', label: 'Experten-Call' },
  ];

  const isActive = (href: string) => location === href;

  return (
    <nav className="flex items-center gap-6 flex-wrap">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <span
            className={`text-[14px] cursor-pointer transition-colors ${
              isActive(item.href)
                ? 'text-[#64BF49] font-semibold'
                : 'text-[#6B7280] hover:text-[#1A1A1C]'
            }`}
          >
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
