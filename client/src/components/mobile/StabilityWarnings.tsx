/**
 * Stability Warning Dialogs
 * Pre-capture and post-capture motion warnings for HDR/Night mode
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Camera, CheckCircle2, X } from 'lucide-react';
import { HapticButton } from './HapticButton';

/**
 * Pre-Capture Tripod Warning Dialog
 * Shows before capture if HDR/Night mode is active and device is unstable
 */
interface TripodWarningProps {
  isOpen: boolean;
  mode: 'hdr3' | 'hdr5' | 'night';
  stabilityScore: number;
  onProceed: () => void;
  onCancel: () => void;
}

export function TripodWarning({
  isOpen,
  mode,
  stabilityScore,
  onProceed,
  onCancel,
}: TripodWarningProps) {
  const modeLabel = mode === 'hdr3' ? 'HDR (3 Belichtungen)' : mode === 'hdr5' ? 'HDR (5 Belichtungen)' : 'Nachtmodus';
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-black/95 border border-amber-500/30 rounded-2xl p-6 mx-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-white text-xl font-semibold text-center mb-2">
              Stativ empfohlen
            </h3>

            {/* Message */}
            <p className="text-white/70 text-sm text-center mb-4 leading-relaxed">
              {modeLabel} erkannt mit erkennbarer Bewegung ({Math.round(stabilityScore * 100)}% Stabilität).
              <br /><br />
              Für beste Ergebnisse verwenden Sie ein Stativ oder stabilisieren Sie das Gerät auf einer festen Oberfläche.
            </p>

            {/* Buttons */}
            <div className="space-y-2">
              <HapticButton
                onClick={onProceed}
                className="w-full py-3 bg-[#4A5849] text-white rounded-xl font-medium"
                data-testid="button-stability-proceed"
              >
                Trotzdem aufnehmen
              </HapticButton>
              <HapticButton
                onClick={onCancel}
                hapticStyle="light"
                className="w-full py-3 bg-white/10 text-white rounded-xl font-medium"
                data-testid="button-stability-cancel"
              >
                Abbrechen
              </HapticButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Post-Capture Bracket Alignment Warning
 * Shows after HDR capture if bracket alignment is poor
 */
interface BracketAlignmentWarningProps {
  isOpen: boolean;
  alignmentScore: number;
  brackets: 3 | 5;
  onRetake: () => void;
  onAccept: () => void;
}

export function BracketAlignmentWarning({
  isOpen,
  alignmentScore,
  brackets,
  onRetake,
  onAccept,
}: BracketAlignmentWarningProps) {
  const threshold = brackets === 3 ? 0.70 : 0.80;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onAccept}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-black/95 border border-amber-500/30 rounded-2xl p-6 mx-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-white text-xl font-semibold text-center mb-2">
              Bewegung erkannt
            </h3>

            {/* Message */}
            <p className="text-white/70 text-sm text-center mb-4 leading-relaxed">
              Bewegung zwischen den {brackets} Belichtungen erkannt (Alignment: {Math.round(alignmentScore * 100)}%).
              <br /><br />
              Dies kann zu Geisterbildern oder Unschärfe im finalen HDR-Bild führen.
            </p>

            {/* Score Bar */}
            <div className="mb-6">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    alignmentScore >= threshold ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${alignmentScore * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>0%</span>
                <span className="text-white/70 font-medium">{Math.round(threshold * 100)}% Schwelle</span>
                <span>100%</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <HapticButton
                onClick={onRetake}
                className="w-full py-3 bg-[#4A5849] text-white rounded-xl font-medium flex items-center justify-center gap-2"
                data-testid="button-bracket-retake"
              >
                <Camera className="w-4 h-4" />
                Neu aufnehmen
              </HapticButton>
              <HapticButton
                onClick={onAccept}
                hapticStyle="light"
                className="w-full py-3 bg-white/10 text-white rounded-xl font-medium"
                data-testid="button-bracket-accept"
              >
                Trotzdem behalten
              </HapticButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Long Exposure Tip (Non-blocking)
 * Shows brief tip for long exposures with instability
 */
interface LongExposureTipProps {
  isOpen: boolean;
  estimatedShutter: number; // in seconds
  onDismiss: () => void;
}

export function LongExposureTip({
  isOpen,
  estimatedShutter,
  onDismiss,
}: LongExposureTipProps) {
  const shutterDisplay = estimatedShutter >= 1 
    ? `${estimatedShutter.toFixed(1)}s`
    : `1/${Math.round(1 / estimatedShutter)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-4 right-4 z-40"
        >
          <div className="bg-black/90 border border-blue-500/30 rounded-xl p-4 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-blue-400" />
              </div>
              
              <div className="flex-1">
                <h4 className="text-white text-sm font-semibold mb-1">
                  Lange Belichtung ({shutterDisplay})
                </h4>
                <p className="text-white/70 text-xs leading-relaxed">
                  Bitte stabilisieren Sie das Gerät oder erhöhen Sie ISO für kürzere Belichtungszeit.
                </p>
              </div>

              <button
                onClick={onDismiss}
                className="text-white/50 hover:text-white transition-colors"
                data-testid="button-long-exposure-dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
