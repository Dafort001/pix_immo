import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Upload, Home, ChevronRight, Layers, ImageIcon, Trash2, X, CheckCheck, XCircle } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface Photo {
  id: number;
  timestamp: string;
  imageData: string;
  width: number;
  height: number;
  selected?: boolean;
  roomType?: string;
  stackId?: number;
  stackIndex?: number;
  stackTotal?: number;
  evCompensation?: number;
  isManualMode?: boolean;
}

interface PhotoStack {
  stackId: number;
  photos: Photo[];
  thumbnail: Photo;
  selected?: boolean;
  roomType?: string;
}

const ROOM_TYPES = [
  'Wohnzimmer', 'Esszimmer', 'Küche', 'Offene Küche', 'Essbereich',
  'Flur/Eingang', 'Diele', 'Galerie', 'Wintergarten',
  'Schlafzimmer', 'Hauptschlafzimmer', 'Kinderzimmer', 'Gästezimmer', 'Ankleidezimmer',
  'Badezimmer', 'Gästebad', 'Hauptbad', 'En-Suite Bad', 'WC', 'Sauna', 'Wellness',
  'Arbeitszimmer', 'Homeoffice', 'Bibliothek', 'Hobbyraum', 'Atelier',
  'Balkon', 'Terrasse', 'Loggia', 'Dachterrasse', 'Garten', 'Innenhof', 'Pool', 'Poolhaus',
  'Abstellraum', 'Hauswirtschaftsraum', 'Waschküche', 'Speisekammer', 'Garderobe',
  'Keller', 'Weinkeller', 'Fitnessraum', 'Partyraum', 'Dachboden',
  'Außenansicht Vorne', 'Außenansicht Hinten', 'Außenansicht Seitlich', 
  'Fassade', 'Eingangsbereich', 'Carport', 'Garage',
  'Treppenhaus', 'Gemeinschaftsraum', 'Sonstiges'
];

export default function GalleryScreen() {
  const [, setLocation] = useLocation();
  
  // Route protection - redirect to login if not authenticated
  const { data: authData, isLoading: isAuthLoading } = useQuery<{ user?: { id: string; email: string } }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  useEffect(() => {
    if (!isAuthLoading && !authData?.user) {
      setLocation('/app');
    }
  }, [isAuthLoading, authData, setLocation]);

  // Show nothing while checking auth
  if (isAuthLoading || !authData?.user) {
    return null;
  }
  
  const [stacks, setStacks] = useState<PhotoStack[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedStack, setSelectedStack] = useState<PhotoStack | null>(null);
  const [lightboxStack, setLightboxStack] = useState<PhotoStack | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { trigger } = useHaptic();

  // Load and group photos into stacks
  useEffect(() => {
    const loadPhotos = () => {
      const stored = sessionStorage.getItem('appPhotos');
      if (stored) {
        try {
          const photos: Photo[] = JSON.parse(stored);
          
          // Group by stackId
          const stackMap = new Map<number, Photo[]>();
          const singles: Photo[] = [];
          
          photos.forEach(photo => {
            if (photo.stackId) {
              const existing = stackMap.get(photo.stackId) || [];
              existing.push(photo);
              stackMap.set(photo.stackId, existing);
            } else {
              singles.push(photo);
            }
          });
          
          // Create PhotoStacks
          const newStacks: PhotoStack[] = [];
          
          // Add HDR stacks
          stackMap.forEach((photos, stackId) => {
            photos.sort((a, b) => (a.stackIndex || 0) - (b.stackIndex || 0));
            const thumbnail = photos.find(p => p.evCompensation === 0) || photos[Math.floor(photos.length / 2)];
            newStacks.push({
              stackId,
              photos,
              thumbnail,
              selected: false,
              roomType: photos[0].roomType
            });
          });
          
          // Add single photos as 1-photo stacks
          singles.forEach(photo => {
            newStacks.push({
              stackId: photo.id,
              photos: [photo],
              thumbnail: photo,
              selected: false,
              roomType: photo.roomType
            });
          });
          
          // Sort by timestamp (newest first)
          newStacks.sort((a, b) => 
            new Date(b.thumbnail.timestamp).getTime() - new Date(a.thumbnail.timestamp).getTime()
          );
          
          setStacks(newStacks);
        } catch (err) {
          console.error('Failed to load photos:', err);
        }
      }
    };
    
    loadPhotos();
    const interval = setInterval(loadPhotos, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedCount = stacks.filter(s => s.selected).length;
  const totalPhotos = stacks.reduce((sum, s) => sum + s.photos.length, 0);

  const toggleSelection = (stackId: number) => {
    trigger('light');
    setStacks(stacks.map(s => 
      s.stackId === stackId ? { ...s, selected: !s.selected } : s
    ));
  };

  const toggleSelectionMode = () => {
    trigger('medium');
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setStacks(stacks.map(s => ({ ...s, selected: false })));
    }
  };

  const selectAll = () => {
    trigger('medium');
    setStacks(stacks.map(s => ({ ...s, selected: true })));
  };

  const deselectAll = () => {
    trigger('medium');
    setStacks(stacks.map(s => ({ ...s, selected: false })));
  };

  const handleStackClick = (stack: PhotoStack) => {
    if (selectionMode) {
      toggleSelection(stack.stackId);
    } else {
      trigger('light');
      setLightboxStack(stack);
      setLightboxIndex(0);
    }
  };

  const updateRoomType = (roomType: string) => {
    if (selectedStack) {
      const updatedStacks = stacks.map(s => 
        s.stackId === selectedStack.stackId ? { ...s, roomType } : s
      );
      setStacks(updatedStacks);
      
      // Update in sessionStorage
      const photos = JSON.parse(sessionStorage.getItem('appPhotos') || '[]');
      const updatedPhotos = photos.map((p: Photo) => 
        p.stackId === selectedStack.stackId || p.id === selectedStack.stackId
          ? { ...p, roomType }
          : p
      );
      sessionStorage.setItem('appPhotos', JSON.stringify(updatedPhotos));
      
      setSelectedStack(null);
    }
  };

  const handleDelete = () => {
    trigger('heavy');
    
    if (lightboxStack) {
      // Single stack delete (from lightbox)
      const photos = JSON.parse(sessionStorage.getItem('appPhotos') || '[]');
      const filteredPhotos = photos.filter((p: Photo) => {
        if (lightboxStack.photos.length > 1) {
          return p.stackId !== lightboxStack.stackId;
        } else {
          return p.id !== lightboxStack.stackId;
        }
      });
      sessionStorage.setItem('appPhotos', JSON.stringify(filteredPhotos));
      
      setLightboxStack(null);
    } else if (selectionMode) {
      // Bulk delete (from selection mode)
      const selectedStackIds = stacks.filter(s => s.selected).map(s => s.stackId);
      const photos = JSON.parse(sessionStorage.getItem('appPhotos') || '[]');
      const filteredPhotos = photos.filter((p: Photo) => {
        return !selectedStackIds.includes(p.stackId || 0) && !selectedStackIds.includes(p.id);
      });
      sessionStorage.setItem('appPhotos', JSON.stringify(filteredPhotos));
      
      setSelectionMode(false);
    }
    
    setDeleteDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <StatusBar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
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
                {selectedCount} {selectedCount === 1 ? 'Stack' : 'Stacks'} ausgewählt
              </motion.p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {selectionMode && stacks.length > 0 && (
              <HapticButton
                variant="ghost"
                onClick={selectedCount === stacks.length ? deselectAll : selectAll}
                hapticStyle="medium"
                className="text-[#4A5849] hover:bg-[#4A5849]/10 rounded-lg px-3 py-1.5"
                style={{ fontSize: '14px' }}
                data-testid="button-toggle-select-all"
              >
                {selectedCount === stacks.length ? 'Keine' : 'Alle'}
              </HapticButton>
            )}
            
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
      </div>

      {/* Photo Grid */}
      <div className="flex-1 overflow-auto pb-20">
        {stacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <ImageIcon className="w-20 h-20 text-gray-300 mb-4" strokeWidth={1} />
            <p className="text-gray-500 text-lg font-medium mb-2">Keine Fotos</p>
            <p className="text-gray-400 text-sm">Nutze die Kamera um Fotos aufzunehmen</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-white">
            {stacks.map((stack) => (
              <motion.div
                key={stack.stackId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-square cursor-pointer"
                onClick={() => handleStackClick(stack)}
                data-testid={`photo-thumbnail-${stack.stackId}`}
              >
                <img 
                  src={stack.thumbnail.imageData}
                  alt={`Photo ${stack.stackId}`}
                  className="w-full h-full object-cover"
                />

                {/* HDR Badge */}
                {stack.photos.length > 1 && !selectionMode && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-yellow-500 backdrop-blur-sm rounded px-1.5 py-0.5 shadow-md flex items-center gap-0.5" data-testid={`photo-hdr-badge-${stack.stackId}`}>
                      <Layers className="w-3 h-3 text-black" strokeWidth={2} />
                      <span className="text-black" style={{ fontSize: '10px', fontWeight: '700' }}>
                        {stack.photos.length}×
                      </span>
                    </div>
                  </div>
                )}

                {/* Selection */}
                {selectionMode && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    {stack.selected ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#4A5849' }} data-testid={`photo-selected-${stack.stackId}`}>
                        <Check className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-white rounded-full bg-black/20 backdrop-blur-sm" />
                    )}
                  </motion.div>
                )}

                {/* Room Type */}
                {!selectionMode && stack.roomType && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs truncate" style={{ fontSize: '11px' }} data-testid={`photo-roomtype-${stack.stackId}`}>
                      {stack.roomType}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxStack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col"
            onClick={() => setLightboxStack(null)}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-50 pt-14 px-4 pb-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {lightboxStack.photos.length > 1 && (
                    <div className="bg-yellow-500 px-3 py-1.5 rounded-full flex items-center gap-2">
                      <Layers className="w-4 h-4 text-black" strokeWidth={2} />
                      <span className="text-black text-sm font-bold">
                        {lightboxIndex + 1}/{lightboxStack.photos.length}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <HapticButton
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialogOpen(true);
                    }}
                    className="bg-white/20 backdrop-blur-md text-white rounded-full"
                    data-testid="button-delete-photo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </HapticButton>
                  
                  <HapticButton
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxStack(null);
                    }}
                    className="bg-white/20 backdrop-blur-md text-white rounded-full"
                    data-testid="button-close-lightbox"
                  >
                    <X className="w-6 h-6" />
                  </HapticButton>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={lightboxStack.photos[lightboxIndex].imageData}
                alt="Full size"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Navigation (for HDR stacks) */}
            {lightboxStack.photos.length > 1 && (
              <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 px-4">
                {lightboxStack.photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(i);
                      trigger('light');
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      i === lightboxIndex
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/20 backdrop-blur-md text-white'
                    }`}
                  >
                    {photo.evCompensation !== undefined 
                      ? `${photo.evCompensation > 0 ? '+' : ''}${photo.evCompensation} EV`
                      : `${i + 1}`
                    }
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectionMode && !lightboxStack
                ? `${selectedCount} ${selectedCount === 1 ? 'Stack' : 'Stacks'} löschen?`
                : 'Foto löschen?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectionMode && !lightboxStack
                ? `Diese Aktion löscht ${stacks.filter(s => s.selected).reduce((sum, s) => sum + s.photos.length, 0)} Fotos.`
                : lightboxStack && lightboxStack.photos.length > 1
                  ? `Diese Aktion löscht alle ${lightboxStack.photos.length} Fotos im HDR-Stack.`
                  : 'Diese Aktion kann nicht rückgängig gemacht werden.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FAB */}
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

      {/* Selection Toolbar */}
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
                      Raumtyp
                    </HapticButton>
                  </DrawerTrigger>
                  <DrawerContent className="max-h-[80vh]">
                    <div className="mx-auto w-full max-w-md p-4">
                      <DrawerHeader className="p-0 mb-4">
                        <DrawerTitle>Raumtyp auswählen</DrawerTitle>
                        <DrawerDescription>
                          Für {selectedCount} {selectedCount === 1 ? 'Stack' : 'Stacks'}
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="space-y-2 overflow-y-scroll help-scrollbar pr-2" style={{ maxHeight: '50vh' }}>
                        {ROOM_TYPES.map((room) => (
                          <button
                            key={room}
                            onClick={() => {
                              const updatedStacks = stacks.map(s => 
                                s.selected ? { ...s, roomType: room } : s
                              );
                              setStacks(updatedStacks);
                              
                              const photos = JSON.parse(sessionStorage.getItem('appPhotos') || '[]');
                              const selectedStackIds = stacks.filter(s => s.selected).map(s => s.stackId);
                              const updatedPhotos = photos.map((p: Photo) => 
                                (p.stackId && selectedStackIds.includes(p.stackId)) || selectedStackIds.includes(p.id)
                                  ? { ...p, roomType: room }
                                  : p
                              );
                              sessionStorage.setItem('appPhotos', JSON.stringify(updatedPhotos));
                              
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
                  hapticStyle="heavy"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-3"
                  data-testid="button-bulk-delete"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </HapticButton>
                
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

      <Drawer open={selectedStack !== null} onOpenChange={(open) => !open && setSelectedStack(null)}>
        <DrawerContent className="max-h-[80vh]">
          <div className="mx-auto w-full max-w-md p-4">
            <DrawerHeader className="p-0 mb-4">
              <DrawerTitle>Raumtyp zuweisen</DrawerTitle>
              <DrawerDescription>
                Für das ausgewählte Foto
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

      <BottomNav photoCount={totalPhotos} />
    </div>
  );
}
