import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles, Image } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { BottomNav } from '@/components/mobile/BottomNav';
import { useLocation } from 'wouter';

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full w-full bg-gradient-to-br from-[#4A5849]/5 to-white flex flex-col items-center justify-center p-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-sm flex-1 flex flex-col justify-center"
      >
        {/* Logo mit Animation */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.6,
            type: 'spring',
            stiffness: 200,
          }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#4A5849] to-[#3A4839] shadow-2xl mb-4">
            <Camera className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 style={{ fontSize: '32px' }} className="text-gray-900 mb-2 font-bold">
            pix.immo Capture
          </h1>
          <p style={{ fontSize: '16px' }} className="text-gray-600 mb-10">
            Professionelle Immobilienfotografie
          </p>
        </motion.div>

        {/* Action Buttons - Horizontal angeordnet */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex gap-4 justify-center"
        >
          <HapticButton
            size="lg"
            onClick={() => setLocation('/app/camera')}
            className="bg-[#4A5849] hover:bg-[#3A4839] text-white px-8"
            hapticStyle="medium"
            style={{ fontSize: '16px' }}
            data-testid="button-start-camera"
          >
            <Sparkles className="w-5 h-5 mr-2" strokeWidth={1.5} />
            Neues Projekt
          </HapticButton>
          
          <HapticButton
            size="lg"
            variant="outline"
            onClick={() => setLocation('/app/gallery')}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 px-8"
            hapticStyle="light"
            style={{ fontSize: '16px' }}
            data-testid="button-open-gallery"
          >
            <Image className="w-5 h-5 mr-2" strokeWidth={1.5} />
            Projekt fortsetzen
          </HapticButton>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-10 flex items-center justify-center gap-8 text-gray-500"
          style={{ fontSize: '13px' }}
        >
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4A5849]" />
            RAW Format
          </span>
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4A5849]" />
            57 Raumtypen
          </span>
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4A5849]" />
            Auto-Upload
          </span>
        </motion.div>
      </motion.div>

      <BottomNav />
    </div>
  );
}
