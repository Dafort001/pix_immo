import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Upload, Home, ChevronRight, Layers, ImageIcon } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { StatusBar } from '@/components/mobile/StatusBar';
import { BottomNav } from '@/components/mobile/BottomNav';
import { useHaptic } from '@/hooks/useHaptic';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useLocation } from 'wouter';

interface Photo {
  id: number;
  timestamp: string;
  imageData: string;
  width: number;
  height: number;
  selected?: boolean;
  roomType?: string;
}

const ROOM_TYPES = [
  // Wohnbereiche
  'Wohnzimmer',
  'Esszimmer',
  'Küche',
  'Offene Küche',
  'Essbereich',
  'Flur/Eingang',
  'Diele',
  'Galerie',
  'Wintergarten',
  
  // Schlafbereiche
  'Schlafzimmer',
  'Hauptschlafzimmer',
  'Kinderzimmer',
  'Gästezimmer',
  'Ankleidezimmer',
  
  // Sanitär
  'Badezimmer',
  'Gästebad',
  'Hauptbad',
  'En-Suite Bad',
  'WC',
  'Sauna',
  'Wellness',
  
  // Arbeit/Hobby
  'Arbeitszimmer',
  'Homeoffice',
  'Bibliothek',
  'Hobbyraum',
  'Atelier',
  
  // Außenbereiche
  'Balkon',
  'Terrasse',
  'Loggia',
  'Dachterrasse',
  'Garten',
  'Innenhof',
  'Pool',
  'Poolhaus',
  
  // Nebenräume
  'Abstellraum',
  'Hauswirtschaftsraum',
  'Waschküche',
  'Speisekammer',
  'Garderobe',
  
  // Keller/Dach
  'Keller',
  'Weinkeller',
  'Fitnessraum',
  'Partyraum',
  'Dachboden',
  
  // Außenansichten
  'Außenansicht Vorne',
  'Außenansicht Hinten',
  'Außenansicht Seitlich',
  'Fassade',
  'Eingangsbereich',
  'Carport',
  'Garage',
  
  // Sonstiges
  'Treppenhaus',
  'Gemeinschaftsraum',
  'Sonstiges'
];

export default function GalleryScreen() {
  const [, setLocation] = useLocation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { trigger } = useHaptic();

  // Load photos from sessionStorage
  useEffect(() => {
    const loadPhotos = () => {
      const stored = sessionStorage.getItem('appPhotos');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPhotos(parsed.map((p: any) => ({ ...p, selected: false })));
        } catch (err) {
          console.error('Failed to load photos:', err);
        }
      }
    };
    
    loadPhotos();
    
    // Reload when returning to page
    const interval = setInterval(loadPhotos, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedCount = photos.filter(p => p.selected).length;

  const toggleSelection = (id: number) => {
    trigger('light');
    setPhotos(photos.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const toggleSelectionMode = () => {
    trigger('medium');
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setPhotos(photos.map(p => ({ ...p, selected: false })));
    }
  };

  const handlePhotoClick = (photo: Photo) => {
    if (selectionMode) {
      toggleSelection(photo.id);
    } else {
      trigger('light');
      setSelectedPhoto(photo);
    }
  };

  const updateRoomType = (roomType: string) => {
    if (selectedPhoto) {
      const updated = photos.map(p => 
        p.id === selectedPhoto.id ? { ...p, roomType } : p
      );
      setPhotos(updated);
      sessionStorage.setItem('appPhotos', JSON.stringify(updated));
      setSelectedPhoto(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Status Bar */}
      <StatusBar />

      {/* Header - Apple Style */}
      <div className="bg-white border-b border-gray-200/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900" style={{ fontSize: '28px', fontWeight: '700' }}>
              Galerie
            </h1>
            {selectionMode && selectedCount > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#4A5849]"
                style={{ fontSize: '14px', fontWeight: '400', marginTop: '2px' }}
                data-testid="text-selection-count"
              >
                {selectedCount} {selectedCount === 1 ? 'Foto' : 'Fotos'} ausgewählt
              </motion.p>
            )}
          </div>
          
          <HapticButton
            variant="ghost"
            onClick={toggleSelectionMode}
            hapticStyle="medium"
            className="text-[#4A5849] hover:bg-[#4A5849]/10 rounded-lg px-3 py-1.5"
            style={{ fontSize: '16px' }}
            data-testid="button-toggle-selection-mode"
          >
            {selectionMode ? 'Fertig' : 'Auswählen'}
          </HapticButton>
        </div>
      </div>

      {/* Photo Grid - Apple Photos Style */}
      <div className="flex-1 overflow-auto pb-20">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <ImageIcon className="w-20 h-20 text-gray-300 mb-4" strokeWidth={1} />
            <p className="text-gray-500 text-lg font-medium mb-2">Keine Fotos</p>
            <p className="text-gray-400 text-sm">Nutze die Kamera um Fotos aufzunehmen</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-white">
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-square cursor-pointer"
                onClick={() => handlePhotoClick(photo)}
                data-testid={`photo-thumbnail-${photo.id}`}
              >
                {/* Photo Image */}
                <img 
                  src={photo.imageData}
                  alt={`Photo ${photo.id}`}
                  className="w-full h-full object-cover"
                />

                {/* Selection Indicator */}
                {selectionMode && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    {photo.selected ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#4A5849' }} data-testid={`photo-selected-${photo.id}`}>
                        <Check className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-white rounded-full bg-black/20 backdrop-blur-sm" />
                    )}
                  </motion.div>
                )}

                {/* Room Type Badge */}
                {!selectionMode && photo.roomType && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs truncate" style={{ fontSize: '11px' }} data-testid={`photo-roomtype-${photo.id}`}>
                      {photo.roomType}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <AnimatePresence>
        {!selectionMode && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute bottom-24 right-6 z-20"
          >
            <HapticButton
              onClick={() => {
                trigger('medium');
                setLocation('/app/upload');
              }}
              hapticStyle="medium"
              className="w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center"
              style={{ backgroundColor: '#4A5849' }}
              data-testid="button-goto-upload"
            >
              <Upload className="w-4 h-4" strokeWidth={1.5} />
            </HapticButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Mode Toolbar */}
      <AnimatePresence>
        {selectionMode && selectedCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 z-20 px-4"
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 p-4">
              <div className="flex items-center gap-3">
                <Drawer>
                  <DrawerTrigger asChild>
                    <HapticButton
                      variant="default"
                      hapticStyle="medium"
                      className="flex-1 text-white rounded-xl py-3"
                      style={{ backgroundColor: '#4A5849', gap: '8px' }}
                      data-testid="button-assign-roomtype"
                    >
                      <Home className="w-4 h-4" strokeWidth={1.5} />
                      Raumtyp zuweisen
                    </HapticButton>
                  </DrawerTrigger>
                  <DrawerContent className="max-h-[80vh]">
                    <div className="mx-auto w-full max-w-md p-4">
                      <DrawerHeader className="p-0 mb-4">
                        <DrawerTitle>Raumtyp auswählen</DrawerTitle>
                        <DrawerDescription>
                          Wählen Sie den Raumtyp für die ausgewählten Fotos aus.
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="space-y-2 overflow-y-scroll help-scrollbar pr-2" style={{ maxHeight: '50vh' }}>
                        {ROOM_TYPES.map((room) => (
                          <button
                            key={room}
                            onClick={() => {
                              const updated = photos.map(p => 
                                p.selected ? { ...p, roomType: room } : p
                              );
                              setPhotos(updated);
                              sessionStorage.setItem('appPhotos', JSON.stringify(updated));
                              trigger('success');
                            }}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
                            data-testid={`roomtype-option-${room}`}
                          >
                            <span style={{ fontSize: '16px' }}>{room}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
                
                <HapticButton
                  variant="default"
                  hapticStyle="medium"
                  onClick={() => {
                    trigger('medium');
                    setLocation('/app/upload');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3"
                  data-testid="button-upload-selected"
                >
                  <Upload className="w-4 h-4" strokeWidth={1.5} />
                </HapticButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Type Assignment Drawer (Single Photo) */}
      <Drawer open={selectedPhoto !== null} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DrawerContent className="max-h-[80vh]">
          <div className="mx-auto w-full max-w-md p-4">
            <DrawerHeader className="p-0 mb-4">
              <DrawerTitle>Raumtyp zuweisen</DrawerTitle>
              <DrawerDescription>
                Wählen Sie den Raumtyp für das ausgewählte Foto aus.
              </DrawerDescription>
            </DrawerHeader>
            <div className="space-y-2 overflow-y-scroll help-scrollbar pr-2" style={{ maxHeight: '50vh' }}>
              {ROOM_TYPES.map((room) => (
                <button
                  key={room}
                  onClick={() => {
                    updateRoomType(room);
                    trigger('success');
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
                  data-testid={`single-roomtype-option-${room}`}
                >
                  <span style={{ fontSize: '16px' }}>{room}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <BottomNav photoCount={photos.length} />
    </div>
  );
}
