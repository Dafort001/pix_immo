/**
 * Live Recommendations Component
 * 
 * Displays intelligent shooting recommendations based on scene analysis:
 * - HDR + EV adjustment for high dynamic range scenes
 * - Window detection alerts
 * - White balance suggestions
 * 
 * Shows max 1 chip per 8-10 seconds, auto-dismisses after 30s
 */

import { useEffect, useState } from 'react';
import { Camera, Sun, Thermometer } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';

export type RecommendationType = 
  | 'hdr-ev-clipping'    // Both highlights & shadows clipping
  | 'hdr-ev-window'      // Window detected
  | 'wb-estimate';       // White balance suggestion

export interface Recommendation {
  type: RecommendationType;
  message: string;
  applyLabel: string;
  onApply: () => void;
  confidence: number; // 0-1
  timestamp: number;
}

interface LiveRecommendationsProps {
  recommendation: Recommendation | null;
  onDismiss: () => void;
}

export function LiveRecommendations({ recommendation, onDismiss }: LiveRecommendationsProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (recommendation) {
      setVisible(true);
      
      // Auto-dismiss after 30 seconds
      const dismissTimer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300); // Wait for fade animation
      }, 30000);

      return () => clearTimeout(dismissTimer);
    } else {
      setVisible(false);
    }
  }, [recommendation, onDismiss]);

  if (!recommendation) return null;

  const handleApply = () => {
    recommendation.onApply();
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleDismissClick = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  // Icon based on recommendation type
  const Icon = recommendation.type === 'wb-estimate' 
    ? Thermometer 
    : recommendation.type === 'hdr-ev-window'
    ? Sun
    : Camera;

  return (
    <div 
      className={`absolute top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
      data-testid="live-recommendation"
    >
      <div className="bg-blue-500/95 backdrop-blur-md text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 max-w-sm">
        {/* Icon */}
        <div className="flex-shrink-0 bg-white/20 rounded-full p-2">
          <Icon className="w-5 h-5" />
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight">
            {recommendation.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <HapticButton
            size="sm"
            onClick={handleApply}
            className="bg-white text-blue-600 hover:bg-white/90 font-bold px-4 py-1.5 h-auto min-h-0 rounded-lg text-xs whitespace-nowrap"
            hapticStyle="medium"
            data-testid="button-apply-recommendation"
          >
            {recommendation.applyLabel}
          </HapticButton>
          
          <HapticButton
            size="icon"
            variant="ghost"
            onClick={handleDismissClick}
            className="w-8 h-8 text-white/80 hover:text-white hover:bg-white/10 flex-shrink-0"
            hapticStyle="light"
            data-testid="button-dismiss-recommendation"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </HapticButton>
        </div>
      </div>

      {/* Confidence indicator (subtle) */}
      {recommendation.confidence > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-white/60 transition-all duration-300"
            style={{ width: `${recommendation.confidence * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
