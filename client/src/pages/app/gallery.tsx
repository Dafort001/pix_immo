import { useState } from 'react';
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
  color: string;
  selected: boolean;
  roomType?: string;
  status: 'ok' | 'warning';
  isHDR?: boolean;
  bracketCount?: number;
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
  const [photos, setPhotos] = useState<Photo[]>([
    { id: 1, color: '#E8F4F8', selected: false, status: 'ok', isHDR: true, bracketCount: 3 },
    { id: 2, color: '#FFE8E8', selected: false, status: 'warning' },
    { id: 3, color: '#E8FFE8', selected: false, status: 'ok', isHDR: true, bracketCount: 5 },
    { id: 4, color: '#FFF4E8', selected: false, status: 'ok' },
    { id: 5, color: '#F8E8FF', selected: false, status: 'ok', isHDR: true, bracketCount: 3 },
    { id: 6, color: '#E8F8FF', selected: false, status: 'warning' },
    { id: 7, color: '#FFE8F4', selected: false, status: 'ok' },
    { id: 8, color: '#F4FFE8', selected: false, status: 'ok', isHDR: true, bracketCount: 3 },
    { id: 9, color: '#E8E8FF', selected: false, status: 'ok' },
  ]);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { trigger } = useHaptic();

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
      setPhotos(photos.map(p => 
        p.id === selectedPhoto.id ? { ...p, roomType } : p
      ));
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
              {/* Photo Thumbnail */}
              <div 
                className="w-full h-full flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: photo.color }}
              >
                {/* Image Placeholder */}
                <ImageIcon className="w-12 h-12 text-gray-400" strokeWidth={1} />
                
                {/* Gradient Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
              </div>

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

              {/* Room Type Badge (wenn zugeordnet) */}
              {!selectionMode && photo.roomType && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs truncate" style={{ fontSize: '11px' }} data-testid={`photo-roomtype-${photo.id}`}>
                    {photo.roomType}
                  </p>
                </div>
              )}

              {/* Status Indicator (small dot) */}
              {!selectionMode && photo.status === 'warning' && (
                <div className="absolute top-2 left-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-md" />
                </div>
              )}

              {/* HDR Bracketing Badge - Apple Photos Style */}
              {!selectionMode && photo.isHDR && (
                <div className="absolute top-2 left-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded px-1.5 py-0.5 shadow-md flex items-center gap-0.5" data-testid={`photo-hdr-badge-${photo.id}`}>
                    <Layers className="w-3 h-3 text-gray-700" strokeWidth={2} />
                    <span className="text-gray-700" style={{ fontSize: '10px', fontWeight: '600' }}>
                      {photo.bracketCount}×
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Action Button - Apple Style */}
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
                              setPhotos(photos.map(p => 
                                p.selected ? { ...p, roomType: room } : p
                              ));
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
