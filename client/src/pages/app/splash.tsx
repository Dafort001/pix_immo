import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mail, Lock, Eye, EyeOff, Globe, Image as ImageIcon, Upload as UploadIcon } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { StatusBar } from '@/components/mobile/StatusBar';
import { BottomNav } from '@/components/mobile/BottomNav';
import { A2HSHint } from '@/components/mobile/A2HSHint';
import { useHaptic } from '@/hooks/useHaptic';
import { useLocation } from 'wouter';
import { useI18n, useTranslation } from '@/lib/i18n';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const { trigger } = useHaptic();
  const { language, setLanguage} = useI18n();
  const { t } = useTranslation();

  // Check authentication status
  const { data: authData, isLoading: isAuthLoading } = useQuery<{ user: { id: number; email: string; role: string } }>({
    queryKey: ['/api/auth/me'],
    retry: false, // Don't retry if not authenticated
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });

  const isAuthenticated = !!authData?.user;

  const handleLogin = async () => {
    trigger('medium');
    setIsLoading(true);
    
    // Mark user interaction for A2HS hint (sessionStorage = per-session)
    sessionStorage.setItem('user-has-interacted', 'true');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          staySignedIn,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Login failed');
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('Login successful:', data.user);
      setLocation('/app/camera'); // Nach Login → Kamera
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleQuickStart = async () => {
    trigger('medium');
    setIsLoading(true);
    
    // Mark user interaction for A2HS hint (sessionStorage = per-session)
    sessionStorage.setItem('user-has-interacted', 'true');
    
    try {
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Demo login failed');
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('Demo login successful:', data.user);
      setLocation('/app/camera');
    } catch (error) {
      console.error('Demo login error:', error);
      alert('Demo login failed. Please try again.');
      setIsLoading(false);
    }
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
            {t('app_name')}
          </h1>
          <p className="text-gray-600" style={{ fontSize: '18px' }}>
            {t('splash.subtitle')}
          </p>
          <p className="text-gray-500 mt-2" style={{ fontSize: '14px' }}>
            {t('splash.tagline')}
          </p>
        </motion.div>

        {/* Show loading state while checking auth */}
        {isAuthLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600"
            style={{ fontSize: '16px' }}
          >
            {t('splash.checking_auth') || 'Checking authentication...'}
          </motion.div>
        )}

        {/* Show navigation buttons if authenticated */}
        {!isAuthLoading && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-full max-w-sm space-y-4"
          >
            <p className="text-center text-gray-700 mb-6" style={{ fontSize: '16px' }}>
              {t('splash.welcome_back') || 'Welcome back!'} {authData?.user?.email}
            </p>

            <HapticButton
              onClick={() => {
                trigger('medium');
                setLocation('/app/camera');
              }}
              className="w-full bg-[#6E7E6B] text-white py-4 rounded-xl shadow-md hover:bg-[#5A6A59] transition-colors flex items-center justify-center gap-3"
              style={{ fontSize: '16px' }}
              data-testid="button-go-camera"
            >
              <Camera className="w-5 h-5" strokeWidth={1.5} />
              {t('splash.go_camera') || 'Open Camera'}
            </HapticButton>

            <HapticButton
              onClick={() => {
                trigger('light');
                setLocation('/app/gallery');
              }}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 py-4 rounded-xl flex items-center justify-center gap-3"
              style={{ fontSize: '16px' }}
              data-testid="button-go-gallery"
            >
              <ImageIcon className="w-5 h-5" strokeWidth={1.5} />
              {t('splash.go_gallery') || 'View Gallery'}
            </HapticButton>

            <HapticButton
              onClick={() => {
                trigger('light');
                setLocation('/app/upload');
              }}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 py-4 rounded-xl flex items-center justify-center gap-3"
              style={{ fontSize: '16px' }}
              data-testid="button-go-upload"
            >
              <UploadIcon className="w-5 h-5" strokeWidth={1.5} />
              {t('splash.go_upload') || 'Upload Photos'}
            </HapticButton>

            {/* Logout Button */}
            <button
              onClick={async () => {
                trigger('medium');
                await fetch('/api/auth/logout', {
                  method: 'POST',
                  credentials: 'include',
                });
                window.location.reload();
              }}
              className="w-full text-[#A85B2E] hover:underline mt-4"
              style={{ fontSize: '14px' }}
              data-testid="button-logout"
            >
              {t('splash.logout') || 'Logout'}
            </button>
          </motion.div>
        )}

        {/* Show login form if not authenticated */}
        {!isAuthLoading && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-full max-w-sm space-y-4"
          >
            {/* Email Input */}
          <div className="space-y-2">
            <label className="text-gray-700" style={{ fontSize: '14px' }}>
              {t('splash.email_label')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('splash.email_placeholder')}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4A5849] focus:border-transparent transition-all"
                style={{ fontSize: '16px' }}
                data-testid="input-email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-gray-700" style={{ fontSize: '14px' }}>
              {t('splash.password_label')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('splash.password_placeholder')}
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

          {/* Stay Signed In Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={staySignedIn}
              onCheckedChange={(checked) => {
                trigger('light');
                setStaySignedIn(checked as boolean);
              }}
              data-testid="checkbox-stay-signed-in"
            />
            <label className="text-gray-700 cursor-pointer" style={{ fontSize: '14px' }} data-testid="label-stay-signed-in">
              {t('splash.stay_signed_in')}
            </label>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              onClick={() => trigger('light')}
              className="text-[#4A5849] hover:underline"
              style={{ fontSize: '14px' }}
              data-testid="button-forgot-password"
            >
              {t('splash.forgot_password')}
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
            {isLoading ? t('splash.login_loading') : t('splash.login_button')}
          </HapticButton>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-gray-500" style={{ fontSize: '14px' }}>
                {t('splash.or')}
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
            {t('splash.demo_button')}
          </HapticButton>

          {/* Register Link */}
          <p className="text-center text-gray-600 mt-6" style={{ fontSize: '14px' }}>
            {t('splash.no_account')}{' '}
            <button
              onClick={() => trigger('light')}
              className="text-[#4A5849] hover:underline"
              data-testid="button-register"
            >
              {t('splash.register_link')}
            </button>
          </p>
        </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="pb-8 text-center px-8">
        <p className="text-gray-500" style={{ fontSize: '12px' }}>
          {t('splash.device_notice')}
        </p>
      </div>

      <BottomNav photoCount={photoCount} />
      
      {/* A2HS Hint - Shows after 30s */}
      <A2HSHint delayMs={30000} />
    </div>
  );
}
