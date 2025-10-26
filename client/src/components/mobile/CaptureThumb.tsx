/**
 * Capture Thumbnail Component
 * Shows a preview of the last captured photo with optional progress indicator
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useManualModeStore } from '@/lib/manual-mode/store';
import { X } from 'lucide-react';

interface CaptureThumbProps {
  imageUrl: string | null;
  progress?: { current: number; total: number } | null;
  onDismiss?: () => void;
}

export function CaptureThumb({ imageUrl, progress, onDismiss }: CaptureThumbProps) {
  const showCaptureThumb = useManualModeStore((state) => state.showCaptureThumb);
  const autoHideThumb = useManualModeStore((state) => state.autoHideThumb);
  const showThumbProgress = useManualModeStore((state) => state.showThumbProgress);
  
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!showCaptureThumb || !imageUrl) {
      setVisible(false);
      return;
    }

    // Show thumbnail
    setVisible(true);

    // Auto-hide after 4 seconds if enabled
    if (autoHideThumb) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [imageUrl, showCaptureThumb, autoHideThumb, onDismiss]);

  if (!showCaptureThumb || !imageUrl) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-4 z-30 pointer-events-auto"
          data-testid="capture-thumb"
        >
          <div className="relative">
            {/* Thumbnail Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white/30 bg-black/50 backdrop-blur-sm shadow-lg">
              <img
                src={imageUrl}
                alt="Last capture"
                className="w-full h-full object-cover"
                data-testid="thumb-image"
              />
            </div>

            {/* Progress Overlay (for stacks) */}
            {showThumbProgress && progress && progress.total > 1 && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg"
                data-testid="thumb-progress"
              >
                <span className="text-white text-sm font-bold">
                  {progress.current} / {progress.total}
                </span>
              </div>
            )}

            {/* Close Button (if not auto-hiding) */}
            {!autoHideThumb && (
              <button
                onClick={() => {
                  setVisible(false);
                  if (onDismiss) onDismiss();
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center border border-white/30 hover:bg-black/90 transition-colors"
                data-testid="button-dismiss-thumb"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}

            {/* Success Checkmark (pulse animation) */}
            {!progress && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
