import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share } from 'lucide-react';
import { isPWAInstalled, promptInstall } from '@/pwa-register';
import { HapticButton } from './HapticButton';

interface A2HSHintProps {
  /** Delay in ms before showing the hint (default: 30000 = 30s) */
  delayMs?: number;
}

export function A2HSHint({ delayMs = 30000 }: A2HSHintProps) {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    // Don't show if already installed
    if (isPWAInstalled()) {
      return;
    }
    
    // Don't show if user already dismissed
    const dismissed = localStorage.getItem('a2hs-hint-dismissed');
    if (dismissed === 'true') {
      return;
    }
    
    // ✅ SPEC REQUIREMENT: Only after user interaction!
    // Check if user has interacted (set by buttons/navigation in app)
    // NOTE: Use sessionStorage so each new session requires fresh interaction
    const hasInteracted = sessionStorage.getItem('user-has-interacted');
    if (hasInteracted !== 'true') {
      // Poll every second to check if user has interacted
      let timer: NodeJS.Timeout | null = null;
      const pollInterval = setInterval(() => {
        if (sessionStorage.getItem('user-has-interacted') === 'true') {
          clearInterval(pollInterval);
          
          // Check if iOS (requires manual instructions)
          const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
          setIsIOS(ios);
          
          // Now start the delay timer
          timer = setTimeout(() => {
            setShow(true);
          }, delayMs);
        }
      }, 1000);
      
      return () => {
        clearInterval(pollInterval);
        if (timer) clearTimeout(timer);
      };
    }
    
    // Check if iOS (requires manual instructions)
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsIOS(ios);
    
    // User has already interacted - show hint after delay
    const timer = setTimeout(() => {
      setShow(true);
    }, delayMs);
    
    return () => clearTimeout(timer);
  }, [delayMs]);
  
  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('a2hs-hint-dismissed', 'true');
  };
  
  const handleInstall = async () => {
    if (isIOS) {
      // iOS requires manual instructions
      // Already shown in the overlay, just keep it open
      return;
    }
    
    // Android/Desktop - use native prompt
    const installed = await promptInstall();
    if (installed) {
      setShow(false);
      localStorage.setItem('a2hs-hint-dismissed', 'true');
    }
  };
  
  if (!show) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-safe"
        data-testid="overlay-a2hs"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleDismiss}
          data-testid="backdrop-a2hs"
        />
        
        {/* Hint Card */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          data-testid="card-a2hs"
        >
          {/* Close Button */}
          <HapticButton
            onClick={handleDismiss}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center"
            data-testid="button-close-a2hs"
          >
            <X className="w-4 h-4" />
          </HapticButton>
          
          <div className="p-6 space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Download className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            {/* Title */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">
                App installieren
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Schneller Zugriff vom Homescreen
              </p>
            </div>
            
            {/* Instructions */}
            {isIOS ? (
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      Tippe unten auf <Share className="inline w-4 h-4 mx-1" /> (Teilen)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      Wähle "Zum Home-Bildschirm"
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      Bestätige mit "Hinzufügen"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <HapticButton
                  onClick={handleInstall}
                  className="w-full min-h-11 bg-primary text-primary-foreground rounded-xl font-medium hover-elevate active-elevate-2"
                  data-testid="button-install-app"
                >
                  Jetzt installieren
                </HapticButton>
                
                <button
                  onClick={handleDismiss}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-maybe-later"
                >
                  Vielleicht später
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
