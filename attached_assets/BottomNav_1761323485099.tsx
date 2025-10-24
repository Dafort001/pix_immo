import { Camera, Image, Home, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { HapticButton } from './HapticButton';
import type { Screen } from '../App';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  photoCount?: number;
  variant?: 'light' | 'dark'; // Für CameraScreen dark verwenden
}

export function BottomNav({ currentScreen, onNavigate, photoCount = 0, variant = 'light' }: BottomNavProps) {
  const navItems = [
    { screen: 'splash' as Screen, icon: Home, label: 'Start' },
    { screen: 'camera' as Screen, icon: Camera, label: 'Kamera' },
    { screen: 'upload' as Screen, icon: Upload, label: 'Upload' },
    { screen: 'gallery' as Screen, icon: Image, label: 'Galerie', badge: photoCount },
  ];

  const isDark = variant === 'dark' || currentScreen === 'camera';

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-30 border-t shadow-lg ${
      isDark 
        ? 'bg-black/95 backdrop-blur-lg border-white/10' 
        : 'bg-white/95 backdrop-blur-lg border-gray-200/50'
    }`}>
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          const Icon = item.icon;
          
          return (
            <HapticButton
              key={item.screen}
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(item.screen)}
              hapticStyle="light"
              className={`flex flex-col items-center gap-1 relative px-4 py-2 rounded-lg transition-all ${
                isDark
                  ? isActive
                    ? 'bg-[#4A5849]/20 text-[#4A5849]'
                    : 'text-gray-400 hover:bg-white/10'
                  : isActive
                    ? 'bg-[#4A5849]/10 text-[#4A5849]'
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`w-4 h-4 ${ 
                    isDark
                      ? isActive ? 'text-[#4A5849]' : 'text-gray-400'
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
                  >
                    {item.badge}
                  </motion.div>
                )}
              </div>
              <span 
                className={`${
                  isDark
                    ? isActive ? 'text-[#4A5849]' : 'text-gray-400'
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
                    isDark ? 'bg-[#4A5849]' : 'bg-[#4A5849]'
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