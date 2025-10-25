import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'motion/react';
import { SplashScreen } from './components/screens/SplashScreen';
import { CameraScreen } from './components/screens/CameraScreen';
import { GalleryScreen } from './components/screens/GalleryScreen';
import { UploadScreen } from './components/screens/UploadScreen';
import { PhoneFrame } from './components/PhoneFrame';
import { WebPortalApp } from './components/WebPortalApp';
import { BottomNav } from './components/BottomNav';
import { useHaptic } from './hooks/useHaptic';

export type Screen = 'splash' | 'camera' | 'upload' | 'gallery';
export type AppMode = 'mobile' | 'web';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('mobile'); // Start mit iPhone App
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const { trigger } = useHaptic();
  const x = useMotionValue(0);

  // Mock photo count für Badge
  const photoCount = 6;

  // Screen-Reihenfolge für Swipe-Navigation
  const screenOrder: Screen[] = ['splash', 'camera', 'upload', 'gallery'];

  const handleDragEnd = (_: any, info: PanInfo) => {
    const currentIndex = screenOrder.indexOf(currentScreen);
    const threshold = 50;

    // Swipe nach links (nächster Screen)
    if (info.offset.x < -threshold && currentIndex < screenOrder.length - 1) {
      trigger('light');
      setCurrentScreen(screenOrder[currentIndex + 1]);
    }
    // Swipe nach rechts (vorheriger Screen)
    else if (info.offset.x > threshold && currentIndex > 0) {
      trigger('light');
      setCurrentScreen(screenOrder[currentIndex - 1]);
    }
  };

  const handleNavigate = (screen: Screen) => {
    trigger('medium');
    setCurrentScreen(screen);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8">
      {/* Mode Switcher (Development) */}
      <div className="absolute top-4 right-4 z-50 flex gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg">
        {/* Mode Switcher */}
        <button
          onClick={() => setAppMode('mobile')}
          className={`px-4 py-2 rounded-lg transition-all ${
            appMode === 'mobile'
              ? 'bg-[#3B82F6] text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={{ fontSize: '14px' }}
        >
          📱 iPhone
        </button>

        {/* Web Mode */}
        <button
          onClick={() => setAppMode('web')}
          className={`px-4 py-2 rounded-lg transition-all ${
            appMode === 'web'
              ? 'bg-[#4A5849] text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={{ fontSize: '14px' }}
        >
          💻 Web
        </button>
      </div>

      {appMode === 'mobile' ? (
        <PhoneFrame>
          <div className="h-full w-full bg-white overflow-hidden relative">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{ x }}
              className="h-full"
            >
              <AnimatePresence mode="wait">
                {currentScreen === 'splash' && (
                  <motion.div
                    key="splash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: '-100%' }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <SplashScreen onNavigate={handleNavigate} />
                  </motion.div>
                )}
                {currentScreen === 'camera' && (
                  <motion.div
                    key="camera"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="h-full"
                  >
                    <CameraScreen onNavigate={handleNavigate} />
                  </motion.div>
                )}
                {currentScreen === 'upload' && (
                  <motion.div
                    key="upload"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="h-full"
                  >
                    <UploadScreen onNavigate={handleNavigate} />
                  </motion.div>
                )}
                {currentScreen === 'gallery' && (
                  <motion.div
                    key="gallery"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="h-full"
                  >
                    <GalleryScreen onNavigate={handleNavigate} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Bottom Navigation - immer sichtbar */}
            <BottomNav 
              currentScreen={currentScreen} 
              onNavigate={handleNavigate}
              photoCount={photoCount}
            />
          </div>
        </PhoneFrame>
      ) : (
        <WebPortalApp />
      )}
    </div>
  );
}