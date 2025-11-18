import { Download, Plus, X, Check, StickyNote, Play } from 'lucide-react';

interface ThumbnailProps {
  image: string;
  filename: string;
  alt: string;
  variant?: 'normal' | 'locked' | 'editing' | 'selected';
  onClick?: () => void;
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  isDisabled?: boolean;
  isPackageImage?: boolean;
  hasNote?: boolean;
  mediaType?: 'image' | 'video';
  thumbnailUrl?: string;
  duration?: number;
}

export function Thumbnail({ 
  image, 
  filename, 
  alt, 
  variant = 'normal', 
  onClick, 
  isSelected = false, 
  onSelect, 
  isDisabled = false, 
  isPackageImage = false, 
  hasNote = false,
  mediaType = 'image',
  thumbnailUrl,
  duration
}: ThumbnailProps) {
  const displayImage = mediaType === 'video' && thumbnailUrl ? thumbnailUrl : image;
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const handleContainerClick = (e: React.MouseEvent) => {
    // Wenn onSelect existiert und das Checkbox-Icon geklickt wurde, nur onSelect aufrufen
    const target = e.target as HTMLElement;
    if (onSelect && target.closest('.selection-checkbox')) {
      onSelect(e);
      return;
    }
    // Ansonsten normaler Bild-Klick
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className="flex flex-col cursor-pointer group"
      onClick={handleContainerClick}
      data-testid={`thumbnail-${filename}`}
    >
      <div className="relative overflow-hidden bg-gray-100 rounded">
        {/* Bild oder Video Thumbnail */}
        <img 
          src={displayImage} 
          alt={alt}
          className="w-full h-auto object-contain group-hover:opacity-90 transition-opacity"
          data-testid={`img-${filename}`}
        />

        {/* Video Play Button Overlay */}
        {mediaType === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm rounded-full p-4">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Video Duration Badge */}
        {mediaType === 'video' && duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(duration)}
          </div>
        )}
        
        {/* Locked Variant - X-Kreuz Overlay */}
        {variant === 'locked' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Diagonales Kreuz SVG - schmal und lang */}
            <svg 
              className="absolute w-full h-full" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              <line 
                x1="0" 
                y1="0" 
                x2="100" 
                y2="100" 
                stroke="#ffffff" 
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <line 
                x1="100" 
                y1="0" 
                x2="0" 
                y2="100" 
                stroke="#ffffff" 
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        )}
        
        {/* Editing Variant - dunkles Overlay + Label */}
        {variant === 'editing' && (
          <>
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <X className="w-24 h-24 text-white/60 absolute" />
            </div>
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 px-3 py-2 rounded text-center text-gray-800">
              In Bearbeitung
            </div>
          </>
        )}
        
        {/* Auswahl-Checkbox (immer sichtbar bei hover oder wenn ausgewählt) */}
        {(variant === 'normal' || variant === 'selected') && onSelect && (
          <div 
            className={`selection-checkbox absolute top-2 left-2 transition-opacity ${
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isDisabled || isSelected) {
                onSelect(e);
              }
            }}
            data-testid={`checkbox-${filename}`}
          >
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
              isDisabled && !isSelected
                ? 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-50'
                : isSelected 
                  ? 'bg-blue-500 border-blue-500 cursor-pointer' 
                  : 'bg-white/90 border-gray-400 hover:border-blue-500 cursor-pointer'
            }`}>
              {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>
        )}
        
        {/* Selected Variant - farbiger Rahmen (veraltet, wird durch isSelected ersetzt) */}
        {variant === 'selected' && !onSelect && (
          <>
            <div className="absolute inset-0 border-4 border-blue-500 rounded"></div>
            <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
              <Plus className="w-4 h-4 text-white" />
            </div>
          </>
        )}
        
        {/* Rahmen wenn ausgewählt */}
        {isSelected && (
          <>
            <div className={`absolute inset-0 border-4 rounded pointer-events-none ${
              isPackageImage ? 'border-green-500' : 'border-amber-500'
            }`}></div>
            {isPackageImage && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                <span>✓</span>
                <span>Paket</span>
              </div>
            )}
            {!isPackageImage && (
              <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                <span>+</span>
                <span>€ 6,00</span>
              </div>
            )}
          </>
        )}
        
        {/* Download-Symbol nur bei Normal-Variante */}
        {variant === 'normal' && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
            <Download className="w-4 h-4 text-gray-700" />
          </div>
        )}

        {/* Notiz-Badge (immer sichtbar wenn Notiz vorhanden) */}
        {hasNote && (
          <div className="absolute bottom-2 left-2 bg-amber-500 text-white rounded-full p-1.5 shadow-lg">
            <StickyNote className="w-3 h-3" />
          </div>
        )}
      </div>
      
      {/* Dateiname */}
      <div className="mt-2 text-gray-600 text-sm truncate" data-testid={`text-filename-${filename}`}>
        {filename}
      </div>
      
      {/* Alt-Text */}
      <div className="mt-1 text-gray-500 text-xs line-clamp-2" data-testid={`text-alt-${filename}`}>
        {alt}
      </div>
    </div>
  );
}
