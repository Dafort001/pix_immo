import { useEffect, useRef, useState } from 'react';

interface HistogramProps {
  videoElement: HTMLVideoElement | null;
  className?: string;
  width?: number;
  height?: number;
  onBrightnessChange?: (value: number) => void;
  currentBrightness?: number;
}

export function Histogram({ 
  videoElement, 
  className = '', 
  width = 256, 
  height = 80,
  onBrightnessChange,
  currentBrightness = 0
}: HistogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = (clientY: number) => {
    if (!containerRef.current || !onBrightnessChange) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const percentage = 1 - (y / rect.height);
    const brightness = (percentage - 0.5) * 4;
    
    onBrightnessChange(Math.max(-2, Math.min(2, brightness)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleInteraction(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleInteraction(e.touches[0].clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleInteraction(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleInteraction(e.clientY);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!videoElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tempCtx) return;

    tempCanvas.width = 256;
    tempCanvas.height = 144;

    const updateHistogram = () => {
      try {
        tempCtx.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        const histogram = new Array(256).fill(0);
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luminance = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
          histogram[luminance]++;
        }

        const maxValue = Math.max(...histogram);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / 256;
        
        for (let i = 0; i < 256; i++) {
          const normalizedHeight = (histogram[i] / maxValue) * canvas.height;
          const x = i * barWidth;
          const y = canvas.height - normalizedHeight;

          const hue = 200;
          const saturation = Math.abs(128 - i) / 128 * 60;
          const lightness = 40 + (i / 255) * 40;

          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
          ctx.fillRect(x, y, Math.ceil(barWidth), normalizedHeight);
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;

        [0, 85, 170, 255].forEach((x) => {
          const pos = (x / 255) * canvas.width;
          ctx.beginPath();
          ctx.moveTo(pos, 0);
          ctx.lineTo(pos, canvas.height);
          ctx.stroke();
        });

        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

      } catch (error) {
        console.debug('Histogram update skipped:', error);
      }

      animationFrameRef.current = requestAnimationFrame(updateHistogram);
    };

    updateHistogram();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoElement]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className} cursor-ns-resize select-none touch-none`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="pointer-events-none"
        style={{
          imageRendering: 'crisp-edges',
        }}
      />
      
      {/* Brightness Indicator Line */}
      {onBrightnessChange && (
        <div
          className="absolute left-0 right-0 h-0.5 bg-yellow-400 shadow-lg pointer-events-none"
          style={{
            top: `${((1 - (currentBrightness + 2) / 4) * 100)}%`,
            boxShadow: '0 0 8px rgba(250, 204, 21, 0.8)'
          }}
        >
          <div className="absolute left-0 w-2 h-2 -mt-0.5 bg-yellow-400 rounded-full" />
          <div className="absolute right-0 w-2 h-2 -mt-0.5 bg-yellow-400 rounded-full" />
        </div>
      )}
      
      {/* Visual Feedback when dragging */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 pointer-events-none border-2 border-blue-400" />
      )}
    </div>
  );
}
