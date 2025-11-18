import { useRef, useState, useEffect } from 'react';
import { X, Pencil, Eraser, Undo, Redo, Save, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnnotationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (annotationData: string) => void;
  image: string;
  filename: string;
}

export function AnnotationOverlay({ 
  isOpen, 
  onClose, 
  onSave,
  image,
  filename
}: AnnotationOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#ef4444'); // Rot
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'arrow'>('pen');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [tempCanvas, setTempCanvas] = useState<ImageData | null>(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Lade das Bild
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Speichere initialen State
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([imageData]);
      setHistoryStep(0);
    };
  }, [isOpen, image]);

  // Hilfsfunktion zum Zeichnen von Pfeilen
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string
  ) => {
    const headLength = 20; // Länge der Pfeilspitze
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    // Pfeil-Linie
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    // Pfeilspitze
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Pfeil-Tool: Zwei Klicks für Start und Ende
    if (currentTool === 'arrow') {
      if (!arrowStart) {
        // Erster Klick: Startpunkt setzen
        setArrowStart({ x, y });
        // Speichere aktuellen Canvas-Zustand
        setTempCanvas(ctx.getImageData(0, 0, canvas.width, canvas.height));
      } else {
        // Zweiter Klick: Pfeil zeichnen und fertigstellen
        drawArrow(ctx, arrowStart.x, arrowStart.y, x, y, currentColor);
        
        // Speichere in History
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(imageData);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
        
        // Reset
        setArrowStart(null);
        setTempCanvas(null);
      }
      return;
    }
    
    // Stift und Radierer
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Pfeil-Vorschau während der Mausbewegung
    if (currentTool === 'arrow' && arrowStart && tempCanvas) {
      // Restore gespeicherter Canvas-Zustand
      ctx.putImageData(tempCanvas, 0, 0);
      // Zeichne Vorschau-Pfeil
      drawArrow(ctx, arrowStart.x, arrowStart.y, x, y, currentColor);
      return;
    }
    
    // Stift und Radierer
    if (!isDrawing) return;
    
    if (currentTool === 'pen') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = 'source-over';
    } else if (currentTool === 'eraser') {
      ctx.lineWidth = 20;
      ctx.globalCompositeOperation = 'destination-out';
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Speichere in History
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep <= 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const newStep = historyStep - 1;
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const newStep = historyStep + 1;
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    if (onSave) {
      onSave(dataUrl);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center overflow-auto">
      {/* Werkzeugleiste */}
      <div className="absolute left-2 sm:left-8 top-4 sm:top-1/2 sm:-translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-2 sm:p-4 flex flex-row sm:flex-col gap-2 sm:gap-3">
        {/* Stift */}
        <button
          onClick={() => {
            setCurrentTool('pen');
            setArrowStart(null);
            setTempCanvas(null);
          }}
          className={`p-2 sm:p-3 rounded transition-colors ${
            currentTool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
          title="Stift"
          data-testid="button-tool-pen"
        >
          <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        {/* Pfeil */}
        <button
          onClick={() => {
            setCurrentTool('arrow');
            setArrowStart(null);
            setTempCanvas(null);
          }}
          className={`p-2 sm:p-3 rounded transition-colors ${
            currentTool === 'arrow' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
          title="Pfeil"
          data-testid="button-tool-arrow"
        >
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        {/* Farben */}
        <div className="hidden sm:block h-px bg-gray-300 my-1"></div>
        <div className="sm:hidden w-px bg-gray-300 mx-1"></div>
        
        <button
          onClick={() => setCurrentColor('#ef4444')}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded bg-red-500 border-2 ${
            currentColor === '#ef4444' ? 'border-gray-800' : 'border-transparent'
          }`}
          title="Rot"
        />
        <button
          onClick={() => setCurrentColor('#f59e0b')}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded bg-amber-500 border-2 ${
            currentColor === '#f59e0b' ? 'border-gray-800' : 'border-transparent'
          }`}
          title="Gelb"
        />
        <button
          onClick={() => setCurrentColor('#3b82f6')}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded bg-blue-500 border-2 ${
            currentColor === '#3b82f6' ? 'border-gray-800' : 'border-transparent'
          }`}
          title="Blau"
        />
        
        {/* Undo/Redo */}
        <div className="hidden sm:block h-px bg-gray-300 my-1"></div>
        <div className="sm:hidden w-px bg-gray-300 mx-1"></div>
        
        <button
          onClick={undo}
          disabled={historyStep <= 0}
          className="p-2 sm:p-3 rounded bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Rückgängig"
          data-testid="button-undo"
        >
          <Undo className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={redo}
          disabled={historyStep >= history.length - 1}
          className="p-2 sm:p-3 rounded bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Wiederholen"
          data-testid="button-redo"
        >
          <Redo className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        {/* Radierer */}
        <div className="hidden sm:block h-px bg-gray-300 my-1"></div>
        <div className="sm:hidden w-px bg-gray-300 mx-1"></div>
        
        <button
          onClick={() => {
            setCurrentTool('eraser');
            setArrowStart(null);
            setTempCanvas(null);
          }}
          className={`p-2 sm:p-3 rounded transition-colors ${
            currentTool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
          }`}
          title="Radierer"
          data-testid="button-tool-eraser"
        >
          <Eraser className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        {/* Speichern/Abbrechen */}
        <div className="hidden sm:block h-px bg-gray-300 my-1"></div>
        <div className="sm:hidden w-px bg-gray-300 mx-1"></div>
        
        <button
          onClick={handleSave}
          className="p-2 sm:p-3 rounded bg-green-500 text-white transition-colors"
          title="Speichern"
          data-testid="button-save-annotation"
        >
          <Save className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-2 sm:p-3 rounded bg-gray-100 text-gray-700 transition-colors"
          title="Abbrechen"
          data-testid="button-cancel-annotation"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      
      {/* Canvas */}
      <div className="flex flex-col items-center gap-2 sm:gap-4 px-2 sm:px-4 pt-20 sm:pt-4 pb-4">
        <div className="text-white text-center">
          <h2 className="text-base sm:text-xl">{filename}</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {currentTool === 'arrow' && !arrowStart && 'Klicken Sie für den Startpunkt des Pfeils'}
            {currentTool === 'arrow' && arrowStart && 'Klicken Sie für den Endpunkt des Pfeils'}
            {currentTool !== 'arrow' && 'Markieren Sie die Bereiche, die bearbeitet werden sollen'}
          </p>
        </div>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
              clientX: touch.clientX,
              clientY: touch.clientY
            });
            canvasRef.current?.dispatchEvent(mouseEvent);
            e.preventDefault();
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
              clientX: touch.clientX,
              clientY: touch.clientY
            });
            canvasRef.current?.dispatchEvent(mouseEvent);
            e.preventDefault();
          }}
          onTouchEnd={(e) => {
            const mouseEvent = new MouseEvent('mouseup');
            canvasRef.current?.dispatchEvent(mouseEvent);
            e.preventDefault();
          }}
          className={`max-w-[95vw] sm:max-w-[80vw] lg:max-w-[70vw] max-h-[60vh] sm:max-h-[70vh] bg-white rounded shadow-2xl touch-none ${
            currentTool === 'arrow' ? 'cursor-crosshair' : 'cursor-crosshair'
          }`}
          style={{ width: 'auto', height: 'auto', maxWidth: '95vw', maxHeight: '60vh' }}
        />
      </div>
    </div>
  );
}
