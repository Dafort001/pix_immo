import { useState, useEffect, useRef } from 'react';

interface HistogramOverlayProps {
  orientation: 'portrait' | 'landscape';
  visible: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
}

type HistogramSize = 'small' | 'medium';

export function HistogramOverlay({ 
  orientation, 
  visible,
  safeAreaTop,
  safeAreaBottom,
}: HistogramOverlayProps) {
  const [size, setSize] = useState<HistogramSize>('small');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [histogramData, setHistogramData] = useState<number[]>([]);
  
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });
  const lastTapTime = useRef(0);
  const longPressTimer = useRef<number | null>(null);
  
  // Dimensions based on size (reduced: width -30%, height -50%)
  const width = size === 'small' ? 84 : 126;
  const height = size === 'small' ? 30 : 45;
  
  // Default positions
  const getDefaultPosition = () => {
    const viewportWidth = orientation === 'landscape' ? 932 : 430;
    const viewportHeight = orientation === 'landscape' ? 430 : 932;
    
    // Bottom right in viewport
    return {
      x: viewportWidth - width - 16 - (orientation === 'landscape' ? 80 : 0), // margin from control bar in landscape
      y: viewportHeight - safeAreaBottom - height - 16 - (orientation === 'portrait' ? 120 : 0), // margin from control bar in portrait
    };
  };

  // Initialize position
  useEffect(() => {
    // Always use default position for now (ignore localStorage to debug)
    const defaultPos = getDefaultPosition();
    console.log('Setting histogram position:', defaultPos);
    setPosition(defaultPos);
  }, [orientation, size]);

  // Generate simulated histogram data (live updates)
  useEffect(() => {
    const generateData = () => {
      // Generate 32 bars for histogram (simplified)
      const data: number[] = [];
      const time = Date.now() / 1000;
      
      for (let i = 0; i < 32; i++) {
        // Create a bell curve-like distribution with some variation
        const center = 16;
        const spread = 8;
        const distance = Math.abs(i - center);
        const base = Math.exp(-Math.pow(distance / spread, 2));
        const noise = Math.sin(time * 0.5 + i * 0.3) * 0.2 + Math.random() * 0.1;
        data.push(Math.max(0, Math.min(1, base + noise)));
      }
      
      setHistogramData(data);
    };

    generateData();
    const interval = setInterval(generateData, 100); // Update 10 times per second
    return () => clearInterval(interval);
  }, []);

  // Handle drag start
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    elementStartPos.current = { ...position };
  };

  // Handle drag move
  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;
    
    const newX = elementStartPos.current.x + deltaX;
    const newY = elementStartPos.current.y + deltaY;
    
    // Constrain to viewport with safe areas
    const viewportWidth = orientation === 'landscape' ? 932 - 72 : 430; // subtract nav bar in landscape
    const viewportHeight = orientation === 'landscape' ? 430 : 932;
    
    const constrainedX = Math.max(8, Math.min(viewportWidth - width - 8, newX));
    const constrainedY = Math.max(safeAreaTop + 8, Math.min(viewportHeight - safeAreaBottom - height - 8, newY));
    
    setPosition({ x: constrainedX, y: constrainedY });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    // Save position
    localStorage.setItem('histogram-position', JSON.stringify(position));
  };

  // Handle tap (single, double, long press)
  const handleTapStart = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    
    // Check for double tap
    if (now - lastTapTime.current < 300) {
      // Double tap - toggle size
      setSize(size === 'small' ? 'medium' : 'small');
      lastTapTime.current = 0;
      return;
    }
    
    lastTapTime.current = now;
    
    // Start long press timer
    longPressTimer.current = window.setTimeout(() => {
      // Long press - reset to default position
      setPosition(getDefaultPosition());
      localStorage.setItem('histogram-position', JSON.stringify(getDefaultPosition()));
    }, 1000);
    
    // Start drag
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    handleDragStart(clientX, clientY);
  };

  const handleTapEnd = () => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // If not dragging much, show label briefly
    if (!isDragging) {
      setShowLabel(true);
      setTimeout(() => setShowLabel(false), 2000);
    }
    
    handleDragEnd();
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    handleDragMove(clientX, clientY);
    
    // Cancel long press if moved
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Setup global mouse/touch handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e);
    const handleTouchMove = (e: TouchEvent) => handleMove(e);
    const handleMouseUp = () => handleTapEnd();
    const handleTouchEnd = () => handleTapEnd();
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, position]);

  if (!visible) {
    console.log('Histogram not visible, returning null');
    return null;
  }

  console.log('Rendering histogram at:', position, 'size:', { width, height });

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        padding: '8px',
        zIndex: 100,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
        transition: isDragging ? 'none' : 'all 0.15s ease-in-out',
        opacity: 1,
        pointerEvents: 'auto',
      }}
      onMouseDown={handleTapStart}
      onTouchStart={handleTapStart}
    >
      {/* Histogram bars */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '1px',
          position: 'relative',
        }}
      >
        {histogramData.map((value, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              height: `${value * 100}%`,
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '1px 1px 0 0',
              minHeight: '2px',
              transition: 'height 0.1s ease-out',
            }}
          />
        ))}
        
        {/* Mode label (shows on tap) */}
        {showLabel && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              animation: 'fadeInOut 2s ease-in-out',
            }}
          >
            Luma
          </div>
        )}
      </div>
      
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}
