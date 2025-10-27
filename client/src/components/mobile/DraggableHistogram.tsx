import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Histogram } from './Histogram';
import { useHaptic } from '@/hooks/useHaptic';

interface DraggableHistogramProps {
  videoElement: HTMLVideoElement | null;
  onClose: () => void;
  onBrightnessChange?: (value: number) => void;
  currentBrightness?: number;
  isLandscape?: boolean;
}

const STORAGE_KEY = 'histogram-position';

function getDefaultPosition(isLandscape: boolean) {
  return {
    x: isLandscape ? window.innerWidth - 180 : window.innerWidth - 164,
    y: isLandscape ? 24 : 144
  };
}

function loadSavedPosition(isLandscape: boolean) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate position is still within bounds
      const maxX = window.innerWidth - 164;
      const maxY = window.innerHeight - 80;
      
      if (parsed.x >= 0 && parsed.x <= maxX && parsed.y >= 0 && parsed.y <= maxY) {
        return { x: parsed.x, y: parsed.y };
      }
    }
  } catch (e) {
    // Fall back to default if parsing fails
  }
  return getDefaultPosition(isLandscape);
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
  const [position, setPosition] = useState(() => loadSavedPosition(isLandscape));
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
      // Save position to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
      } catch (e) {
        // Ignore storage errors
      }
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
      <div className={`rounded-lg p-2 border relative ${
        isDragging ? 'border-blue-400 shadow-lg shadow-blue-500/50' : 'border-white/20'
      }`}>
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
