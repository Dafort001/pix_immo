import { Camera, Image, Upload, Home, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { HapticButton } from './HapticButton';
import { useLocation } from 'wouter';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface BottomNavProps {
  photoCount?: number;
  variant?: 'light' | 'dark';
  isLandscape?: boolean;
}

export function BottomNav({ photoCount = 0, variant = 'light', isLandscape = false }: BottomNavProps) {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/app', icon: Home, label: t('bottomNav.start'), testId: 'nav-splash' },
    { path: '/app/camera', icon: Camera, label: t('bottomNav.camera'), testId: 'nav-camera' },
    { path: '/app/gallery', icon: Image, label: t('bottomNav.gallery'), badge: photoCount, testId: 'nav-gallery' },
    { path: '/app/upload', icon: Upload, label: t('bottomNav.upload'), testId: 'nav-upload' },
    { path: '/app/settings', icon: Settings, label: t('bottomNav.manual'), testId: 'nav-settings' },
  ];

  const isDark = variant === 'dark' || location === '/app/camera';

  // Landscape: Compact Bottom Navigation (avoid Dynamic Island on left)
  if (isLandscape) {
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-30 border-t ${
        isDark 
          ? 'bg-[#1C1C1E]/70 backdrop-blur-xl border-white/5' 
          : 'bg-white/95 backdrop-blur-lg border-gray-200/50'
      }`} data-testid="bottom-nav">
        <div className="flex items-center justify-center gap-2 px-4 py-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <HapticButton
                key={item.path}
                variant="ghost"
                onClick={() => setLocation(item.path)}
                hapticStyle="light"
                className={`flex items-center justify-center relative w-11 h-11 rounded-lg transition-all ${
                  isDark
                    ? isActive
                      ? 'bg-[#4A5849]/20 text-[#6B8268]'
                      : 'text-gray-400 hover:bg-white/10'
                    : isActive
                      ? 'bg-[#4A5849]/10 text-[#4A5849]'
                      : 'text-gray-600 hover:bg-gray-50'
                }`}
                data-testid={item.testId}
              >
                <div className="relative">
                  <Icon 
                    className={`w-5 h-5 ${
                      isDark
                        ? isActive ? 'text-[#6B8268]' : 'text-gray-400'
                        : isActive ? 'text-[#4A5849]' : 'text-gray-600'
                    }`} 
                    strokeWidth={1.5} 
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-[#4A5849] text-white rounded-full min-w-5 h-5 flex items-center justify-center px-1"
                      style={{ fontSize: '10px' }}
                      data-testid={`${item.testId}-badge`}
                    >
                      {item.badge}
                    </motion.div>
                  )}
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeTabLandscape"
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full ${
                      isDark ? 'bg-[#6B8268]' : 'bg-[#4A5849]'
                    }`}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </HapticButton>
            );
          })}
        </div>
      </div>
    );
  }

  // Portrait: Bottom Navigation (original)
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-30 border-t safe-bottom-nav ${
      isDark 
        ? 'bg-[#1C1C1E]/70 backdrop-blur-xl border-white/5' 
        : 'bg-white/95 backdrop-blur-lg border-gray-200/50'
    }`} data-testid="bottom-nav">
      <div className="flex items-center justify-around px-4 py-1 touch-target">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <HapticButton
              key={item.path}
              variant="ghost"
              onClick={() => setLocation(item.path)}
              hapticStyle="light"
              className={`flex flex-col items-center gap-1 relative px-4 py-3 rounded-lg transition-all touch-target ${
                isDark
                  ? isActive
                    ? 'bg-[#4A5849]/20 text-[#6B8268]'
                    : 'text-gray-400 hover:bg-white/10'
                  : isActive
                    ? 'bg-[#4A5849]/10 text-[#4A5849]'
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
              data-testid={item.testId}
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 ${
                    isDark
                      ? isActive ? 'text-[#6B8268]' : 'text-gray-400'
                      : isActive ? 'text-[#4A5849]' : 'text-gray-600'
                  }`} 
                  strokeWidth={1.5} 
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-[#4A5849] text-white rounded-full min-w-5 h-5 flex items-center justify-center px-1"
                    style={{ fontSize: '10px' }}
                    data-testid={`${item.testId}-badge`}
                  >
                    {item.badge}
                  </motion.div>
                )}
              </div>
              <span 
                className={`${
                  isDark
                    ? isActive ? 'text-[#6B8268]' : 'text-gray-400'
                    : isActive ? 'text-[#4A5849]' : 'text-gray-600'
                }`}
                style={{ fontSize: '11px' }}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${
                    isDark ? 'bg-[#6B8268]' : 'bg-[#4A5849]'
                  }`}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </HapticButton>
          );
        })}
      </div>
    </div>
  );
}
