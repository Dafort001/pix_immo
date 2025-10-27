import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mail, Lock, Eye, EyeOff, Globe } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { StatusBar } from '@/components/mobile/StatusBar';
import { BottomNav } from '@/components/mobile/BottomNav';
import { A2HSHint } from '@/components/mobile/A2HSHint';
import { useHaptic } from '@/hooks/useHaptic';
import { useLocation } from 'wouter';
import { useI18n, useTranslation } from '@/lib/i18n';

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const { trigger } = useHaptic();
  const { language, setLanguage } = useI18n();
  const t = useTranslation();

  const handleLogin = async () => {
    trigger('medium');
    setIsLoading(true);
    
    // Mark user interaction for A2HS hint (sessionStorage = per-session)
    sessionStorage.setItem('user-has-interacted', 'true');
    
    // Mock Login (2 Sekunden Verzögerung)
    setTimeout(() => {
      setIsLoading(false);
      setLocation('/app/camera'); // Nach Login → Kamera
    }, 2000);
  };

  const handleQuickStart = () => {
    trigger('medium');
    
    // Mark user interaction for A2HS hint (sessionStorage = per-session)
    sessionStorage.setItem('user-has-interacted', 'true');
    
    setLocation('/app/camera');
  };

  // Load photo count from sessionStorage
  useEffect(() => {
    const updatePhotoCount = () => {
      const stored = sessionStorage.getItem('appPhotos');
      if (stored) {
        const photos = JSON.parse(stored);
        setPhotoCount(photos.length);
      }
    };
    
    updatePhotoCount();
    
    window.addEventListener('storage', updatePhotoCount);
    return () => window.removeEventListener('storage', updatePhotoCount);
  }, []);

  return (
    <div className="h-full w-full bg-gradient-to-br from-[#EFF6FF] to-white flex flex-col">
      <StatusBar />

      {/* Language Toggle Button */}
      <div className="absolute top-safe-top right-4 z-10 pt-3">
        <button
          onClick={() => {
            trigger('light');
            setLanguage(language === 'de' ? 'en' : 'de');
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white transition-all shadow-sm"
          data-testid="button-language-toggle"
        >
          <Globe className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
          <span className="text-gray-700 font-medium" style={{ fontSize: '14px' }}>
            {language.toUpperCase()}
          </span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-20">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Logo Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-2xl mb-6"
            style={{ background: 'linear-gradient(135deg, #4A5849 0%, #3A4839 100%)' }}
          >
            <Camera className="w-10 h-10 text-white" strokeWidth={1.5} />
          </motion.div>

          {/* Brand Name */}
          <h1 className="text-gray-900 mb-2" style={{ fontSize: '36px' }}>
            PIX.IMMO
          </h1>
          <p className="text-gray-600" style={{ fontSize: '18px' }}>
            Capture
          </p>
          <p className="text-gray-500 mt-2" style={{ fontSize: '14px' }}>
            Professionelle Immobilienfotografie
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-sm space-y-4"
        >
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-gray-700" style={{ fontSize: '14px' }}>
              E-Mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max.mustermann@pix-immo.de"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4A5849] focus:border-transparent transition-all"
                style={{ fontSize: '16px' }}
                data-testid="input-email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-gray-700" style={{ fontSize: '14px' }}>
              Passwort
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4A5849] focus:border-transparent transition-all"
                style={{ fontSize: '16px' }}
                data-testid="input-password"
              />
              <button
                onClick={() => {
                  trigger('light');
                  setShowPassword(!showPassword);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                data-testid="button-toggle-password"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              onClick={() => trigger('light')}
              className="text-[#4A5849] hover:underline"
              style={{ fontSize: '14px' }}
              data-testid="button-forgot-password"
            >
              Passwort vergessen?
            </button>
          </div>

          {/* Login Button - UI-Sage Color */}
          <HapticButton
            onClick={handleLogin}
            disabled={isLoading || !email || !password}
            hapticStyle="medium"
            className="w-full text-white py-3 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ 
              fontSize: '16px',
              backgroundColor: isLoading ? '#8A9989' : '#6E7E6B'
            }}
            data-testid="button-login"
          >
            {isLoading ? 'Anmelden...' : 'Anmelden'}
          </HapticButton>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-gray-500" style={{ fontSize: '14px' }}>
                oder
              </span>
            </div>
          </div>

          {/* Quick Start */}
          <HapticButton
            onClick={handleQuickStart}
            variant="outline"
            hapticStyle="light"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl"
            style={{ fontSize: '16px' }}
            data-testid="button-quick-start"
          >
            Demo starten (ohne Login)
          </HapticButton>

          {/* Register Link */}
          <p className="text-center text-gray-600 mt-6" style={{ fontSize: '14px' }}>
            Noch kein Account?{' '}
            <button
              onClick={() => trigger('light')}
              className="text-[#4A5849] hover:underline"
              data-testid="button-register"
            >
              Jetzt registrieren
            </button>
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="pb-8 text-center px-8">
        <p className="text-gray-500" style={{ fontSize: '12px' }}>
          Nur für iPhone Pro Modelle (13/14/15 Pro/Max)
        </p>
      </div>

      <BottomNav photoCount={photoCount} />
      
      {/* A2HS Hint - Shows after 30s */}
      <A2HSHint delayMs={30000} />
    </div>
  );
}
