import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Upload, Home, ChevronRight, Layers, X, Wifi, Smartphone, Info } from 'lucide-react';
import { HapticButton } from '../HapticButton';
import { StatusBar } from '../StatusBar';
import { useHaptic } from '../../hooks/useHaptic';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '../ui/drawer';
import type { Screen } from '../../App';

interface GalleryScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface Photo {
  id: number;
  color: string;
  selected: boolean;
  roomType?: string;
  status: 'ok' | 'warning';
  isHDR?: boolean;        // HDR Bracketing Indicator
  bracketCount?: number;  // Number of exposures (3, 5, etc.)\
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

// Mock data - in production würde das von der Galerie kommen
const MOCK_PHOTOS: Photo[] = [
  { id: 1, color: '#F5F5F5', selected: true, status: 'ok', isHDR: true, bracketCount: 3, roomType: 'Wohnzimmer' },
  { id: 2, color: '#E8E8E8', selected: true, status: 'warning', roomType: 'Küche' },
  { id: 3, color: '#F9F9F9', selected: true, status: 'ok', isHDR: true, bracketCount: 5, roomType: 'Schlafzimmer' },
  { id: 4, color: '#EEEEEE', selected: true, status: 'ok', roomType: 'Badezimmer' },
  { id: 5, color: '#F2F2F2', selected: true, status: 'ok', isHDR: true, bracketCount: 3, roomType: 'Balkon' },
  { id: 6, color: '#E5E5E5', selected: true, status: 'warning' },
  { id: 7, color: '#F7F7F7', selected: true, status: 'ok', roomType: 'Außenansicht Vorne' },
  { id: 8, color: '#ECECEC', selected: true, status: 'ok', isHDR: true, bracketCount: 3 },
  { id: 9, color: '#F0F0F0', selected: true, status: 'ok', roomType: 'Garten' },
];

export function GalleryScreen({ onNavigate }: GalleryScreenProps) {
  const [photos, setPhotos] = useState<Photo[]>([
    { id: 1, color: '#F5F5F5', selected: false, status: 'ok', isHDR: true, bracketCount: 3, roomType: 'Wohnzimmer' },
    { id: 2, color: '#E8E8E8', selected: false, status: 'warning', roomType: 'Küche' },
    { id: 3, color: '#F9F9F9', selected: false, status: 'ok', isHDR: true, bracketCount: 5, roomType: 'Schlafzimmer' },
    { id: 4, color: '#EEEEEE', selected: false, status: 'ok', roomType: 'Badezimmer' },
    { id: 5, color: '#F2F2F2', selected: false, status: 'ok', isHDR: true, bracketCount: 3, roomType: 'Balkon' },
    { id: 6, color: '#E5E5E5', selected: false, status: 'warning' },
    { id: 7, color: '#F7F7F7', selected: false, status: 'ok', roomType: 'Außenansicht Vorne' },
    { id: 8, color: '#ECECEC', selected: false, status: 'ok', isHDR: true, bracketCount: 3 },
    { id: 9, color: '#F0F0F0', selected: false, status: 'ok', roomType: 'Garten' },
  ]);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [bulkRoomDrawerOpen, setBulkRoomDrawerOpen] = useState(false);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [uploadSelection, setUploadSelection] = useState<number[]>([]); // Track upload selection
  const { trigger } = useHaptic();

  const selectedCount = photos.filter(p => p.selected).length;
  
  // Get photos to upload (either selected or all)
  const photosToUpload = photos.filter(p => 
    selectionMode && selectedCount > 0 ? p.selected : true
  );
  
  // Track which photos are selected for upload in the drawer
  const uploadSelectedPhotos = photos.filter(p => 
    uploadSelection.includes(p.id)
  );

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
      // Deselect all when exiting selection mode
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

  const assignBulkRoomType = (roomType: string) => {
    setPhotos(photos.map(p => 
      p.selected ? { ...p, roomType, selected: false } : p
    ));
    setSelectionMode(false);
    setBulkRoomDrawerOpen(false);
    trigger('success');
  };

  // Initialize upload selection when drawer opens
  const openUploadDrawer = () => {
    trigger('medium');
    // Pre-select photos based on current selection mode
    const initialSelection = selectionMode && selectedCount > 0
      ? photos.filter(p => p.selected).map(p => p.id)
      : photos.map(p => p.id); // All photos if no selection
    setUploadSelection(initialSelection);
    setUploadDrawerOpen(true);
  };

  // Toggle photo in upload drawer
  const toggleUploadPhoto = (id: number) => {
    trigger('light');
    setUploadSelection(prev =>
      prev.includes(id)
        ? prev.filter(photoId => photoId !== id)
        : [...prev, id]
    );
  };

  // Toggle all photos in upload drawer
  const toggleAllUploadPhotos = () => {
    trigger('medium');
    if (uploadSelection.length === photosToUpload.length) {
      setUploadSelection([]); // Deselect all
    } else {
      setUploadSelection(photosToUpload.map(p => p.id)); // Select all
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
            <h1 className="text-gray-900" style={{ fontSize: '28px' }}>
              Galerie
            </h1>
            {selectionMode && selectedCount > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#4A5849]"
                style={{ fontSize: '14px', marginTop: '2px' }}
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
            >
              {/* Photo Thumbnail */}
              <div 
                className="w-full h-full flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: photo.color }}
              >
                {/* Image Placeholder */}
                <div className="text-5xl opacity-30">🏠</div>
                
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
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#4A5849' }}>
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
                  <p className="text-white truncate" style={{ fontSize: '11px' }}>
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
                  <div className="bg-white/90 backdrop-blur-sm rounded flex items-center shadow-md" style={{ padding: '2px 6px', gap: '2px' }}>
                    <Layers className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
                    <span className="text-gray-700" style={{ fontSize: '10px' }}>
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
              onClick={openUploadDrawer}
              hapticStyle="medium"
              className="w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center"
              style={{ backgroundColor: '#4A5849' }}
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
                <HapticButton
                  variant="default"
                  hapticStyle="medium"
                  onClick={() => {
                    trigger('medium');
                    setBulkRoomDrawerOpen(true);
                  }}
                  className="flex-1 text-white rounded-xl py-3"
                  style={{ backgroundColor: '#4A5849', gap: '8px' }}
                >
                  <Home className="w-4 h-4" strokeWidth={1.5} />
                  Raumtyp zuweisen
                </HapticButton>
                
                <HapticButton
                  variant="default"
                  hapticStyle="medium"
                  onClick={openUploadDrawer}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3"
                >
                  <Upload className="w-4 h-4" strokeWidth={1.5} />
                </HapticButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Type Assignment Drawer (Bulk Selection) */}
      <Drawer open={bulkRoomDrawerOpen} onOpenChange={setBulkRoomDrawerOpen}>
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
                  onClick={() => assignBulkRoomType(room)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <span style={{ fontSize: '16px' }}>{room}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

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
                >
                  <span style={{ fontSize: '16px' }}>{room}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Upload Drawer - DIREKT IN DER GALERIE */}
      <Drawer open={uploadDrawerOpen} onOpenChange={setUploadDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <div className="mx-auto w-full max-w-md p-4 flex flex-col" style={{ maxHeight: '85vh' }}>
            <DrawerHeader className="p-0 mb-4">
              <DrawerTitle>Fotos hochladen</DrawerTitle>
              <DrawerDescription>
                {uploadSelection.length} von {photosToUpload.length} Fotos ausgewählt
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-scroll help-scrollbar pr-2 space-y-4">
              {/* Select All Toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span style={{ fontSize: '14px' }} className="text-gray-900">
                  Alle {photosToUpload.length} Fotos
                </span>
                <HapticButton
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllUploadPhotos}
                  hapticStyle="light"
                  className="text-[#4A5849] hover:bg-[#4A5849]/10 px-3 py-1 rounded-lg"
                  style={{ fontSize: '14px' }}
                >
                  {uploadSelection.length === photosToUpload.length ? 'Keine auswählen' : 'Alle auswählen'}
                </HapticButton>
              </div>

              {/* Photo Grid - 2 Spalten */}
              <div className="grid grid-cols-2 gap-2">
                {photosToUpload.map((photo) => {
                  const isSelected = uploadSelection.includes(photo.id);
                  return (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all"
                      style={{ 
                        borderColor: isSelected ? '#4A5849' : 'transparent',
                        backgroundColor: photo.color 
                      }}
                      onClick={() => toggleUploadPhoto(photo.id)}
                    >
                      {/* Photo Thumbnail */}
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-4xl opacity-40">🏠</div>
                      </div>

                      {/* Selection Indicator */}
                      <div className="absolute top-2 right-2">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#4A5849' }}>
                            <Check className="w-4 h-4 text-white" strokeWidth={1.5} />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-white rounded-full bg-black/20 backdrop-blur-sm" />
                        )}
                      </div>

                      {/* Room Type Badge */}
                      {photo.roomType && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white truncate" style={{ fontSize: '10px' }}>
                            {photo.roomType}
                          </p>
                        </div>
                      )}

                      {/* HDR Badge */}
                      {photo.isHDR && (
                        <div className="absolute top-2 left-2">
                          <div className="bg-white/90 backdrop-blur-sm rounded flex items-center shadow-sm" style={{ padding: '1px 4px', gap: '2px' }}>
                            <Layers className="w-3 h-3 text-gray-700" strokeWidth={1.5} />
                            <span className="text-gray-700" style={{ fontSize: '9px', fontWeight: '600' }}>
                              {photo.bracketCount}×
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Warning Indicator - oben links, nur wenn kein HDR Badge */}
                      {photo.status === 'warning' && !photo.isHDR && (
                        <div className="absolute top-2 left-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-md border border-white" />
                        </div>
                      )}

                      {/* Warning Indicator - unten rechts über Room Type Badge, wenn HDR vorhanden */}
                      {photo.status === 'warning' && photo.isHDR && (
                        <div className="absolute bottom-8 right-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-md border border-white" />
                        </div>
                      )}

                      {/* Selected Overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#4A5849]/10 pointer-events-none" />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Upload Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between" style={{ fontSize: '14px' }}>
                  <span className="text-gray-600">Ausgewählte Dateien:</span>
                  <span className="text-gray-900">{uploadSelection.length}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '14px' }}>
                  <span className="text-gray-600">Gesamtgröße:</span>
                  <span className="text-gray-900">{(uploadSelection.length * 8.5).toFixed(1)} MB</span>
                </div>
              </div>

              {/* WiFi Toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#4A5849]/10 flex items-center justify-center">
                    {wifiOnly ? (
                      <span className="text-lg">📶</span>
                    ) : (
                      <span className="text-lg">📡</span>
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px' }} className="text-gray-900">
                      {wifiOnly ? 'Nur WLAN' : 'Mobil erlaubt'}
                    </p>
                    <p style={{ fontSize: '12px' }} className="text-gray-500">
                      {wifiOnly ? 'Upload nur bei WLAN-Verbindung' : 'Upload auch über mobile Daten'}
                    </p>
                  </div>
                </div>
                <HapticButton
                  variant={wifiOnly ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => {
                    trigger('light');
                    setWifiOnly(!wifiOnly);
                  }}
                  hapticStyle="light"
                  className={wifiOnly ? 'border-gray-300' : 'bg-[#4A5849] text-white'}
                  style={{ fontSize: '13px' }}
                >
                  {wifiOnly ? 'Ändern' : 'Nur WLAN'}
                </HapticButton>
              </div>

              {/* Security Info */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">ℹ️</span>
                </div>
                <div>
                  <p style={{ fontSize: '14px' }} className="text-blue-900">
                    Ihre Fotos werden sicher verschlüsselt zum pix.immo Web-Portal übertragen.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons - Sticky Bottom */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <HapticButton
                onClick={() => {
                  trigger('success');
                  if (uploadSelection.length === 0) {
                    // Show error - no photos selected
                    return;
                  }
                  // Start upload logic here
                  setUploadDrawerOpen(false);
                }}
                hapticStyle="success"
                disabled={uploadSelection.length === 0}
                className="w-full bg-[#4A5849] hover:bg-[#3A4839] text-white py-3 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: '16px' }}
              >
                {uploadSelection.length > 0 
                  ? `${uploadSelection.length} ${uploadSelection.length === 1 ? 'Foto' : 'Fotos'} hochladen`
                  : 'Keine Fotos ausgewählt'
                }
              </HapticButton>
              <HapticButton
                variant="outline"
                onClick={() => {
                  trigger('light');
                  setUploadDrawerOpen(false);
                }}
                hapticStyle="light"
                className="w-full py-3 rounded-xl"
                style={{ fontSize: '16px' }}
              >
                Abbrechen
              </HapticButton>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}