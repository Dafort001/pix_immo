import { X, Download, ChevronLeft, ChevronRight, Check, Info, Image as ImageIcon, ZoomIn, ZoomOut, Maximize, Minimize, StickyNote, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState, useRef, useEffect } from 'react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  filename: string;
  onRequestEdit?: () => void;
  // Navigation
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  currentIndex?: number;
  totalImages?: number;
  // Auswahl
  isSelected?: boolean;
  onToggleSelection?: () => void;
  isPackageImage?: boolean;
  // Zusätzliche Bildinfos
  alt?: string;
  // Notizen
  note?: string;
  onNoteChange?: (note: string) => void;
  // Media Type
  mediaType?: 'image' | 'video';
}

export function ImagePreviewModal({ 
  isOpen, 
  onClose, 
  image, 
  filename,
  onRequestEdit,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  currentIndex,
  totalImages,
  isSelected = false,
  onToggleSelection,
  isPackageImage = false,
  alt,
  note = '',
  onNoteChange,
  mediaType = 'image'
}: ImagePreviewModalProps) {
  const [showImageInfo, setShowImageInfo] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [localNote, setLocalNote] = useState(note);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Video-spezifische States
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // Update local note when prop changes
  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' && hasNext && onNext) {
      onNext();
    } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
      onPrevious();
    } else if (e.key === 'Escape') {
      if (isFullscreen) {
        exitFullscreen();
      } else {
        onClose();
      }
    } else if (e.key === '+' || e.key === '=') {
      handleZoomIn();
    } else if (e.key === '-') {
      handleZoomOut();
    }
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  // Fullscreen functions
  const enterFullscreen = async () => {
    try {
      if (imageContainerRef.current?.requestFullscreen) {
        await imageContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (err) {
      console.error('Exit fullscreen error:', err);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Save note
  const handleSaveNote = () => {
    if (onNoteChange) {
      onNoteChange(localNote);
    }
    setShowNotes(false);
  };

  // Reset zoom when image changes
  useEffect(() => {
    setZoomLevel(100);
    // Reset video when switching
    if (mediaType === 'video') {
      setIsPlaying(false);
      setVideoProgress(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [image, mediaType]);

  // Video control functions
  const togglePlayPause = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          await videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Video play error:', error);
        // Silently fail for mock/invalid video URLs
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress || 0);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleVideoSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setVideoProgress(parseFloat(e.target.value));
    }
  };

  const formatVideoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] sm:max-w-[85vw] lg:max-w-[80vw] max-h-[95vh] sm:max-h-[90vh] p-0 bg-white"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">{filename}</DialogTitle>
        <DialogDescription className="sr-only">
          Bildvorschau mit Download-Optionen und Bearbeitungsmöglichkeiten
        </DialogDescription>
        <div className="flex flex-col h-full">
          {/* Header mit Dateiname, Navigation und Info */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h2 className="text-gray-800 text-sm sm:text-base truncate">{filename}</h2>
              {currentIndex !== undefined && totalImages !== undefined && (
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {currentIndex + 1} / {totalImages}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Zoom Controls - nur für Bilder */}
              {mediaType === 'image' && (
                <div className="hidden sm:flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 50}
                    className="p-2 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    title="Herauszoomen (-)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded min-w-[3.5rem] text-center"
                    title="Zoom zurücksetzen"
                  >
                    {zoomLevel}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 300}
                    className="p-2 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    title="Hineinzoomen (+)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title={isFullscreen ? "Vollbild verlassen" : "Vollbild"}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>

              {/* Notes Button */}
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`p-2 rounded transition-colors ${
                  showNotes || localNote
                    ? 'bg-amber-100 text-amber-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Notizen"
              >
                <StickyNote className="w-4 h-4" />
              </button>

              {/* Info Button */}
              {alt && (
                <button
                  onClick={() => setShowImageInfo(!showImageInfo)}
                  className={`p-2 rounded transition-colors ${
                    showImageInfo 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Bildinformationen anzeigen"
                >
                  <Info className="w-4 h-4" />
                </button>
              )}
              
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Bild Container mit Navigation */}
          <div 
            ref={imageContainerRef}
            className={`flex-1 flex flex-col p-4 sm:p-8 bg-gray-50 relative min-h-0 ${
              isFullscreen ? 'bg-black' : ''
            }`}
          >
            {/* Previous Button */}
            {hasPrevious && onPrevious && (
              <button
                onClick={onPrevious}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 sm:p-3 transition-all hover:scale-110"
                title="Vorheriges Bild (←)"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
            )}

            {/* Info/Notes Cards oben */}
            {(showImageInfo || showNotes) && !isFullscreen && (
              <div className="flex flex-col gap-3 mb-4 max-w-2xl mx-auto w-full">
                {/* Media Info Card */}
                {showImageInfo && alt && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2">
                      {mediaType === 'video' ? (
                        <Play className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="text-sm text-blue-900 mb-1">
                          {mediaType === 'video' ? 'Videobeschreibung' : 'Bildbeschreibung'}
                        </h4>
                        <p className="text-sm text-blue-700">{alt}</p>
                        {mediaType === 'video' && (
                          <p className="text-xs text-blue-600 mt-2">
                            💡 Tipp: Klicken Sie auf das Video zum Abspielen/Pausieren
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Card */}
                {showNotes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm text-amber-900 flex items-center gap-2">
                          <StickyNote className="w-4 h-4" />
                          Notizen zu diesem Bild
                        </h4>
                        <Button
                          size="sm"
                          onClick={handleSaveNote}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          Speichern
                        </Button>
                      </div>
                      <Textarea
                        value={localNote}
                        onChange={(e) => setLocalNote(e.target.value)}
                        placeholder="Notizen hier eingeben... (z.B. 'Zu dunkel', 'Perfekt für Exposé', 'Möbel retuschieren')"
                        className="min-h-[100px] border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                      />
                      {localNote && (
                        <p className="text-xs text-amber-600">
                          ✓ Notiz wird automatisch gespeichert
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bild oder Video - VOLLSTÄNDIG SICHTBAR - VOLLE GRÖSSE */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              {mediaType === 'image' ? (
                <img 
                  src={image} 
                  alt={alt || filename}
                  className="object-contain rounded shadow-lg transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'center center',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto'
                  }}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={image}
                  className="rounded shadow-lg"
                  controls
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                />
              )}
            </div>

            {/* Mobile Zoom Controls - nur für Bilder */}
              {mediaType === 'image' && (
                <div className="sm:hidden flex items-center gap-2 bg-white/90 rounded-full px-3 py-2 shadow-lg">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 50}
                    className="p-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Herauszoomen"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-600 min-w-[3rem] text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 300}
                    className="p-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Hineinzoomen"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Selection Status Badge */}
              {isSelected && !isFullscreen && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                  isPackageImage 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {isPackageImage ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Im Paket enthalten</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs">€</span>
                      <span>Zusatzbild (+ € 6,00)</span>
                    </>
                  )}
                </div>
              )}

            {/* Next Button */}
            {hasNext && onNext && (
              <button
                onClick={onNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 sm:p-3 transition-all hover:scale-110"
                title="Nächstes Bild (→)"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
            )}

            {/* Fullscreen overlay controls - nur für Bilder */}
            {isFullscreen && mediaType === 'image' && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-4">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 50}
                  className="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white text-sm min-w-[3.5rem] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 300}
                  className="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-white/30"></div>
                <button
                  onClick={exitFullscreen}
                  className="p-2 rounded-full text-white hover:bg-white/20"
                >
                  <Minimize className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          
          {/* Footer mit Buttons */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 space-y-3">
            {/* Selection Toggle */}
            {onToggleSelection && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected 
                      ? isPackageImage 
                        ? 'bg-green-500 text-white' 
                        : 'bg-amber-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">
                      {isSelected ? 'Ausgewählt' : 'Nicht ausgewählt'}
                    </div>
                    {isSelected && !isPackageImage && (
                      <div className="text-xs text-amber-600">+ € 6,00 Zusatzkosten</div>
                    )}
                    {isSelected && isPackageImage && (
                      <div className="text-xs text-green-600">Im Paket enthalten</div>
                    )}
                    {!isSelected && (
                      <div className="text-xs text-gray-500">Zum Warenkorb hinzufügen</div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={onToggleSelection}
                  className={`${
                    isSelected
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isSelected ? 'Abwählen' : 'Auswählen'}
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  variant="outline"
                  className="border-gray-300 text-xs sm:text-sm"
                  data-testid="button-download-standard"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Standard (3000 px)</span>
                  <span className="sm:hidden">Standard</span>
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-300 text-xs sm:text-sm"
                  data-testid="button-download-fullres"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Full-Res
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  variant="outline"
                  onClick={onRequestEdit}
                  className="border-gray-300 text-xs sm:text-sm"
                  data-testid="button-request-edit"
                >
                  <span className="hidden sm:inline">Bearbeitung anfordern</span>
                  <span className="sm:hidden">Bearbeiten</span>
                </Button>
                <Button 
                  onClick={onClose}
                  className="bg-[#2d2d2d] text-white text-xs sm:text-sm"
                  data-testid="button-close-preview"
                >
                  Schließen
                </Button>
              </div>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
              <span className="hidden sm:inline">
                Tastatur: ← Zurück | → Weiter | + Zoom In | - Zoom Out | ESC Schließen
              </span>
              <span className="sm:hidden">
                ← → | + - Zoom | ESC
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
