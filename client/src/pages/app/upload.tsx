import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Layers, Wifi, Smartphone, Upload as UploadIcon, ImageIcon } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { StatusBar } from '@/components/mobile/StatusBar';
import { useHaptic } from '@/hooks/useHaptic';

interface Photo {
  id: number;
  color: string;
  selected: boolean;
  roomType?: string;
  status: 'ok' | 'warning';
  isHDR?: boolean;
  bracketCount?: number;
}

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

export default function UploadScreen() {
  const [photos] = useState<Photo[]>(MOCK_PHOTOS);
  const [uploadSelection, setUploadSelection] = useState<number[]>(
    photos.map(p => p.id)
  );
  const [wifiOnly, setWifiOnly] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { trigger } = useHaptic();

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
    if (uploadSelection.length === photos.length) {
      setUploadSelection([]);
    } else {
      setUploadSelection(photos.map(p => p.id));
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
              {uploadSelection.length} von {photos.length} Fotos ausgewählt
            </motion.p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-scroll help-scrollbar pb-20">
        <div className="max-w-md mx-auto p-4 space-y-4">
          
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <span style={{ fontSize: '14px' }} className="text-gray-900">
              Alle {photos.length} Fotos
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
              {uploadSelection.length === photos.length ? 'Keine auswählen' : 'Alle auswählen'}
            </HapticButton>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo) => {
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
                  data-testid={`photo-upload-${photo.id}`}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" strokeWidth={1} />
                  </div>

                  <div className="absolute top-2 right-2">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#4A5849' }} data-testid={`photo-selected-${photo.id}`}>
                        <Check className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-white rounded-full bg-black/20 backdrop-blur-sm" />
                    )}
                  </div>

                  {photo.roomType && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white truncate" style={{ fontSize: '10px' }}>
                        {photo.roomType}
                      </p>
                    </div>
                  )}

                  {photo.isHDR && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-white/90 backdrop-blur-sm rounded flex items-center shadow-sm" style={{ padding: '1px 4px', gap: '2px' }}>
                        <Layers className="w-3 h-3 text-gray-700" strokeWidth={1.5} />
                        <span className="text-gray-700" style={{ fontSize: '9px' }}>
                          {photo.bracketCount}×
                        </span>
                      </div>
                    </div>
                  )}

                  {photo.status === 'warning' && !photo.isHDR && (
                    <div className="absolute top-2 left-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-md border border-white" />
                    </div>
                  )}

                  {photo.status === 'warning' && photo.isHDR && (
                    <div className="absolute bottom-8 right-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-md border border-white" />
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute inset-0 bg-[#4A5849]/10 pointer-events-none" />
                  )}
                </motion.div>
              );
            })}
          </div>

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
    </div>
  );
}
