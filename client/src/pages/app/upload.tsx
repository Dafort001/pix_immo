import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Layers, Wifi, Smartphone, Upload as UploadIcon, ImageIcon } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { StatusBar } from '@/components/mobile/StatusBar';
import { BottomNav } from '@/components/mobile/BottomNav';
import { useHaptic } from '@/hooks/useHaptic';

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
}

interface PhotoStack {
  stackId: number;
  photos: Photo[];
  thumbnail: Photo;
  roomType?: string;
}

export default function UploadScreen() {
  const [stacks, setStacks] = useState<PhotoStack[]>([]);
  const [uploadSelection, setUploadSelection] = useState<number[]>([]);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { trigger } = useHaptic();
  const hasAutoSelectedRef = useRef(false);

  // Load photos from sessionStorage and group into stacks
  useEffect(() => {
    const loadPhotos = () => {
      const stored = sessionStorage.getItem('appPhotos');
      if (!stored) {
        // Clear stacks when sessionStorage is empty
        setStacks([]);
        setUploadSelection([]);
        hasAutoSelectedRef.current = false;
        return;
      }
      
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
              roomType: photos[0].roomType
            });
          });
          
          // Add single photos as 1-photo stacks
          singles.forEach(photo => {
            newStacks.push({
              stackId: photo.id,
              photos: [photo],
              thumbnail: photo,
              roomType: photo.roomType
            });
          });
          
          // Sort by timestamp (newest first)
          newStacks.sort((a, b) => 
            new Date(b.thumbnail.timestamp).getTime() - new Date(a.thumbnail.timestamp).getTime()
          );
          
          setStacks(newStacks);
          
          // Auto-select all stacks for upload (only once on first load)
          if (!hasAutoSelectedRef.current && newStacks.length > 0) {
            setUploadSelection(newStacks.map(s => s.stackId));
            hasAutoSelectedRef.current = true;
          }
        } catch (err) {
          console.error('Failed to load photos:', err);
        }
      }
    };
    
    loadPhotos();
    const interval = setInterval(loadPhotos, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleUploadPhoto = (id: number) => {
    trigger('light');
    setUploadSelection(prev =>
      prev.includes(id)
        ? prev.filter(photoId => photoId !== id)
        : [...prev, id]
    );
  };

  const toggleAllUploadPhotos = () => {
    trigger('medium');
    if (uploadSelection.length === stacks.length) {
      setUploadSelection([]);
    } else {
      setUploadSelection(stacks.map(s => s.stackId));
    }
  };

  const handleUpload = () => {
    if (uploadSelection.length === 0) return;
    
    trigger('success');
    setIsUploading(true);
    console.log('Uploading:', uploadSelection);
    
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <StatusBar />

      <div className="bg-white border-b border-gray-200/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900" style={{ fontSize: '28px', fontWeight: '700' }}>
              Upload
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600"
              style={{ fontSize: '14px', marginTop: '2px' }}
              data-testid="text-upload-count"
            >
              {uploadSelection.length} von {stacks.length} Stacks ausgewählt
            </motion.p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-scroll help-scrollbar pb-20">
        <div className="max-w-md mx-auto p-4 space-y-4">
          
          {stacks.length > 0 && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <span style={{ fontSize: '14px' }} className="text-gray-900">
                Alle {stacks.length} Stacks
              </span>
              <HapticButton
                variant="ghost"
                size="sm"
                onClick={toggleAllUploadPhotos}
                hapticStyle="light"
                className="text-[#4A5849] hover:bg-[#4A5849]/10 px-3 py-1 rounded-lg"
                style={{ fontSize: '14px' }}
                data-testid="button-toggle-all"
              >
                {uploadSelection.length === stacks.length ? 'Keine auswählen' : 'Alle auswählen'}
              </HapticButton>
            </div>
          )}

          {stacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ImageIcon className="w-20 h-20 text-gray-300 mb-4" strokeWidth={1} />
              <p className="text-gray-500 text-lg font-medium mb-2">Keine Fotos</p>
              <p className="text-gray-400 text-sm">Nutze die Kamera um Fotos aufzunehmen</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {stacks.map((stack) => {
                const isSelected = uploadSelection.includes(stack.stackId);
                return (
                  <motion.div
                    key={stack.stackId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all"
                    style={{ 
                      borderColor: isSelected ? '#4A5849' : 'transparent'
                    }}
                    onClick={() => toggleUploadPhoto(stack.stackId)}
                    data-testid={`photo-upload-${stack.stackId}`}
                  >
                    <img 
                      src={stack.thumbnail.imageData}
                      alt={`Stack ${stack.stackId}`}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-2 right-2">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#4A5849' }} data-testid={`photo-selected-${stack.stackId}`}>
                          <Check className="w-4 h-4 text-white" strokeWidth={1.5} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-white rounded-full bg-black/20 backdrop-blur-sm" />
                      )}
                    </div>

                    {stack.roomType && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-white truncate" style={{ fontSize: '10px' }}>
                          {stack.roomType}
                        </p>
                      </div>
                    )}

                    {stack.photos.length > 1 && (
                      <div className="absolute top-2 left-2">
                        <div className="bg-yellow-500 backdrop-blur-sm rounded px-1.5 py-0.5 shadow-md flex items-center gap-0.5">
                          <Layers className="w-3 h-3 text-black" strokeWidth={2} />
                          <span className="text-black" style={{ fontSize: '10px', fontWeight: '700' }}>
                            {stack.photos.length}×
                          </span>
                        </div>
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute inset-0 bg-[#4A5849]/10 pointer-events-none" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between" style={{ fontSize: '14px' }}>
              <span className="text-gray-600">Ausgewählte Dateien:</span>
              <span className="text-gray-900" data-testid="text-selected-count">{uploadSelection.length}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '14px' }}>
              <span className="text-gray-600">Gesamtgröße:</span>
              <span className="text-gray-900" data-testid="text-total-size">{(uploadSelection.length * 8.5).toFixed(1)} MB</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4A5849]/10 flex items-center justify-center">
                {wifiOnly ? (
                  <Wifi className="w-4 h-4 text-[#4A5849]" strokeWidth={1.5} />
                ) : (
                  <Smartphone className="w-4 h-4 text-[#4A5849]" strokeWidth={1.5} />
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
              className={wifiOnly 
                ? 'text-[#4A5849] border-[#4A5849]/30 hover:bg-[#4A5849]/10' 
                : 'text-white'
              }
              style={!wifiOnly ? { backgroundColor: '#4A5849' } : {}}
              data-testid="button-toggle-wifi"
            >
              {wifiOnly ? 'Ändern' : 'Ändern'}
            </HapticButton>
          </div>

          <HapticButton
            onClick={handleUpload}
            hapticStyle="success"
            disabled={uploadSelection.length === 0 || isUploading}
            className="w-full text-white rounded-xl py-4 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#4A5849', fontSize: '16px' }}
            data-testid="button-start-upload"
          >
            {isUploading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadIcon className="w-4 h-4" strokeWidth={1.5} />
                <span>{uploadSelection.length} {uploadSelection.length === 1 ? 'Foto' : 'Fotos'} hochladen</span>
              </>
            )}
          </HapticButton>

        </div>
      </div>

      <BottomNav photoCount={stacks.reduce((sum, s) => sum + s.photos.length, 0)} />
    </div>
  );
}
