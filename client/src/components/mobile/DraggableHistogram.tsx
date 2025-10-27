import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Histogram } from './Histogram';
import { HapticButton } from './HapticButton';
import { useHaptic } from '@/hooks/useHaptic';

interface DraggableHistogramProps {
  videoElement: HTMLVideoElement | null;
  onClose: () => void;
  onBrightnessChange?: (value: number) => void;
  currentBrightness?: number;
  isLandscape?: boolean;
}

export function DraggableHistogram({ 
  videoElement, 
  onClose, 
  onBrightnessChange,
  currentBrightness = 0,
  isLandscape = false
}: DraggableHistogramProps) {
  const { trigger } = useHaptic();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ 
    x: isLandscape ? window.innerWidth - 180 : window.innerWidth - 164,
    y: isLandscape ? 24 : 144
  });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = { x: clientX, y: clientY };
    initialPosRef.current = { ...position };
    trigger('light');
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    const newX = Math.max(0, Math.min(window.innerWidth - 164, initialPosRef.current.x + deltaX));
    const newY = Math.max(0, Math.min(window.innerHeight - 80, initialPosRef.current.y + deltaY));

    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      trigger('light');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 30,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
        handleDragEnd();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        handleDragStart(e.clientX, e.clientY);
      }}
      onMouseMove={(e) => {
        e.stopPropagation();
        if (isDragging) {
          e.preventDefault();
          handleDragMove(e.clientX, e.clientY);
        }
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
        handleDragEnd();
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        handleDragEnd();
      }}
    >
      <div className={`bg-black/90 backdrop-blur-md rounded-lg p-2 border relative ${
        isDragging ? 'border-blue-400 shadow-lg shadow-blue-500/50' : 'border-white/20'
      }`}>
        <HapticButton
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center text-white hover:bg-red-600 z-10"
          data-testid="button-close-histogram"
        >
          <X className="w-4 h-4" />
        </HapticButton>
        <Histogram 
          videoElement={videoElement} 
          width={140}
          height={40}
          onBrightnessChange={onBrightnessChange}
          currentBrightness={currentBrightness}
        />
      </div>
    </motion.div>
  );
}
