import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { IPhoneFrame } from '../components/IPhoneFrame';

export default function AppLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      const mockToken = 'mock_jwt_token_' + Date.now();
      const expiryDate = new Date();
      
      if (rememberMe) {
        expiryDate.setDate(expiryDate.getDate() + 30);
      } else {
        expiryDate.setHours(expiryDate.getHours() + 24);
      }
      
      localStorage.setItem('pix_session_token', mockToken);
      localStorage.setItem('pix_token_expiry', expiryDate.toISOString());
      localStorage.setItem('pix_user_email', email);
      
      setIsLoading(false);
      setLocation('/pixcapture-app/jobs');
    }, 1500);
  };

  const handleDemoStart = () => {
    const mockToken = 'demo_token_' + Date.now();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 2);
    
    localStorage.setItem('pix_session_token', mockToken);
    localStorage.setItem('pix_token_expiry', expiryDate.toISOString());
    localStorage.setItem('pix_user_email', 'demo@pixcapture.app');
    
    setLocation('/pixcapture-app/jobs');
  };

  return (
    <IPhoneFrame>
      <div className="flex flex-col h-full overflow-hidden" style={{ paddingTop: '59px', paddingBottom: '34px' }}>
        
        {/* Upper Half: Camera View with Branding - Collapsible on keyboard */}
        <div 
          className="relative flex items-center justify-center transition-all duration-300"
          style={{
            background: 'radial-gradient(circle at 50% 40%, #2D2D2F 0%, #1A1A1C 100%)',
            minHeight: '35%',
            flex: '0 0 auto',
          }}
        >
          {/* Subtle Pattern */}
          <div className="absolute inset-0 opacity-[0.04]">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="white"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>

          {/* Ambient Glow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, #64BF49 0%, transparent 60%)',
            }}
          />

          {/* Logo & Branding */}
          <div className="relative z-10 text-center px-8">
            {/* Brand Text - Kompakter für mehr Platz */}
            <h1
              className="text-white mb-2"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '28px',
                lineHeight: '34px',
                letterSpacing: '-0.02em',
              }}
            >
              pixcapture.app
            </h1>

            <p
              className="text-white/70"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.005em',
              }}
            >
              you capture, we do the rest
            </p>
          </div>
        </div>

        {/* Lower Half: Warm White Login Form - Scrollable */}
        <div 
          className="flex-1 px-8 pt-6 overflow-y-auto"
          style={{
            minHeight: '65%',
            backgroundColor: '#F9F9F7',
            paddingBottom: '24px',
          }}
        >
          <form onSubmit={handleLogin} className="flex flex-col min-h-full" style={{ paddingBottom: '40px' }}>
            
            {/* Login Button at Top */}
            <div className="mb-6 flex justify-center">
              <Button
                type="submit"
                disabled={isLoading}
                className="text-white disabled:opacity-50 shadow-lg shadow-[#1A1A1C]/15 hover:shadow-xl hover:shadow-[#1A1A1C]/20 active:scale-[0.98] transition-all duration-200"
                style={{
                  height: '56px',
                  borderRadius: '0px',
                  fontSize: '17px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  background: '#1A1A1C',
                  letterSpacing: '-0.01em',
                  width: '85%',
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Anmelden...</span>
                  </div>
                ) : (
                  'Anmelden'
                )}
              </Button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5">
              {/* E-Mail Field */}
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors">
                  <Mail className="text-[#8E9094] group-focus-within:text-[#64BF49]" size={18} />
                </div>
                <Input
                  type="email"
                  placeholder="E-Mail-Adresse"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => {
                    // Scroll input into view when keyboard appears
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                  className="w-full bg-[#F8F9FA] text-[#1A1A1C] border-transparent placeholder:text-[#8E9094] focus:border-[#64BF49] focus:bg-white focus:ring-1 focus:ring-[#64BF49] transition-all duration-200"
                  style={{
                    height: '52px',
                    borderRadius: '16px',
                    paddingLeft: '48px',
                    paddingRight: '16px',
                    fontSize: '16px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                  }}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password Field */}
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors">
                  <Lock className="text-[#8E9094] group-focus-within:text-[#64BF49]" size={18} />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => {
                    // Scroll input into view when keyboard appears
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                  className="w-full bg-[#F8F9FA] text-[#1A1A1C] border-transparent placeholder:text-[#8E9094] focus:border-[#64BF49] focus:bg-white focus:ring-1 focus:ring-[#64BF49] transition-all duration-200"
                  style={{
                    height: '52px',
                    borderRadius: '16px',
                    paddingLeft: '48px',
                    paddingRight: '48px',
                    fontSize: '16px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                  }}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F0F0F0] transition-colors"
                  aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  {showPassword ? (
                    <EyeOff className="text-[#8E9094]" size={19} />
                  ) : (
                    <Eye className="text-[#8E9094]" size={19} />
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 pb-4">
                <label
                  htmlFor="remember-me"
                  className="flex items-center gap-2 cursor-pointer group/label"
                >
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-[#D0D0D0] text-[#64BF49] focus:ring-[#64BF49] focus:ring-offset-0 focus:ring-2 transition-all"
                    style={{
                      accentColor: '#64BF49',
                    }}
                  />
                  <span
                    className="text-[#8E9094] group-hover/label:text-[#1A1A1C] transition-colors"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '13px',
                      fontWeight: 400,
                      letterSpacing: '-0.005em',
                    }}
                  >
                    Angemeldet bleiben
                  </span>
                </label>

                <Link href="/login-otp-request">
                  <button
                    type="button"
                    className="text-[#74A4EA] hover:text-[#5A8FD8] transition-colors"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '13px',
                      fontWeight: 500,
                      letterSpacing: '-0.005em',
                    }}
                  >
                    Passwort vergessen?
                  </button>
                </Link>
              </div>
            </div>

            {/* Spacer - Fills available space */}
            <div className="flex-1 min-h-[20px]"></div>

            {/* Footer Link - Sticky at bottom */}
            <div className="text-center pt-6 pb-2">
              <Link href="/pixcapture-app">
                <button
                  type="button"
                  className="text-[#8E9094] hover:text-[#1A1A1C] transition-colors inline-flex items-center gap-1.5"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    letterSpacing: '-0.005em',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M8.5 10.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Zurück zum Start
                </button>
              </Link>
            </div>
          </form>
        </div>

      </div>
    </IPhoneFrame>
  );
}
