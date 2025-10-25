import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Layers, Wifi, Smartphone, Info } from 'lucide-react';
import { HapticButton } from '../HapticButton';
import { StatusBar } from '../StatusBar';
import { useHaptic } from '../../hooks/useHaptic';
import type { Screen } from '../../App';

interface UploadScreenProps {
  photos?: Photo[];
  onNavigate: (screen: Screen) => void;
}

interface Photo {
  id: number;
  color: string;
  selected: boolean;
  roomType?: string;
  status: 'ok' | 'warning';
  isHDR?: boolean;
  bracketCount?: number;
}

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

export function UploadScreen({ photos = MOCK_PHOTOS, onNavigate }: UploadScreenProps) {
  const [uploadSelection, setUploadSelection] = useState<number[]>(
    photos.map(p => p.id) // Alle pre-selected
  );
  const [wifiOnly, setWifiOnly] = useState(true);
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
    trigger('success');
    if (uploadSelection.length === 0) {
      return;
    }
    // Upload logic here
    console.log('Uploading:', uploadSelection);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Status Bar */}
      <StatusBar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900" style={{ fontSize: '28px' }}>
              Upload
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600"
              style={{ fontSize: '14px', marginTop: '2px' }}
            >
              {uploadSelection.length} von {photos.length} Fotos ausgewählt
            </motion.p>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-scroll help-scrollbar pb-20">
        <div className="max-w-md mx-auto p-4 space-y-4">
          
          {/* Select All Toggle */}
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
            >
              {uploadSelection.length === photos.length ? 'Keine auswählen' : 'Alle auswählen'}
            </HapticButton>
          </div>

          {/* Photo Grid - 2 Spalten */}
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
                        <span className="text-gray-700" style={{ fontSize: '9px' }}>
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

                  {/* Warning Indicator - unten rechts, wenn HDR vorhanden */}
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
              className={wifiOnly ? 'border-gray-300' : 'bg-[#4A5849] text-white'}
              style={{ fontSize: '14px' }}
            >
              {wifiOnly ? 'Ändern' : 'Nur WLAN'}
            </HapticButton>
          </div>

          {/* Security Info */}
          <div className="flex items-start gap-3 bg-gray-50 border border-gray-300 rounded-lg p-4">
            <div className="w-5 h-5 rounded-full bg-[#4A5849] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-3 h-3 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontSize: '14px' }} className="text-gray-700">
                Ihre Fotos werden sicher verschlüsselt zum pix.immo Web-Portal übertragen.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <HapticButton
              onClick={handleUpload}
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
          </div>
        </div>
      </div>
    </div>
  );
}