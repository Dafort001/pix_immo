import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Layers, Wifi, Smartphone, Upload as UploadIcon, ImageIcon, ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { StatusBar } from '@/components/mobile/StatusBar';
import { BottomNav } from '@/components/mobile/BottomNav';
import { useHaptic } from '@/hooks/useHaptic';
import { useQuery } from '@tanstack/react-query';
import type { Job } from '@shared/schema';

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
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const { trigger } = useHaptic();
  const hasAutoSelectedRef = useRef(false);

  // Fetch available jobs
  const { data: jobs, isLoading: jobsLoading, isError: jobsError } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch jobs');
      return res.json();
    }
  });

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

  // Helper: Upload single photo with retry logic
  const uploadPhotoWithRetry = async (
    blob: Blob, 
    photo: Photo, 
    maxRetries = 3
  ): Promise<void> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Create form data
        const formData = new FormData();
        formData.append('photo', blob, `photo_${photo.id}.jpg`);
        formData.append('jobId', selectedJobId!);
        formData.append('roomType', photo.roomType || 'general');
        formData.append('capturedAt', photo.timestamp);
        if (photo.stackId) formData.append('stackId', photo.stackId.toString());
        if (photo.stackIndex !== undefined) formData.append('stackIndex', photo.stackIndex.toString());
        if (photo.evCompensation !== undefined) formData.append('evCompensation', photo.evCompensation.toString());
        
        // Upload to server
        const response = await fetch('/api/mobile-uploads', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        // Success - exit retry loop
        return;
        
      } catch (error) {
        console.warn(`[Upload] Attempt ${attempt}/${maxRetries} failed for photo ${photo.id}:`, error);
        
        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          throw new Error(`Upload failed after ${maxRetries} attempts: ${error}`);
        }
        
        // Wait with exponential backoff (1s, 2s, 4s)
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`[Upload] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const handleUpload = async () => {
    if (uploadSelection.length === 0 || !selectedJobId) return;
    
    setIsUploading(true);
    trigger('success');
    
    // Calculate total photos to upload
    const totalPhotos = uploadSelection.reduce((sum, stackId) => {
      const stack = stacks.find(s => s.stackId === stackId);
      return sum + (stack?.photos.length || 0);
    }, 0);
    
    setUploadProgress({ current: 0, total: totalPhotos });
    
    const failedPhotos: { id: number; error: string }[] = [];
    
    try {
      let uploadedCount = 0;
      
      // Upload each selected stack
      for (let i = 0; i < uploadSelection.length; i++) {
        const stackId = uploadSelection[i];
        const stack = stacks.find(s => s.stackId === stackId);
        
        if (!stack) {
          console.warn(`Stack ${stackId} not found`);
          continue;
        }
        
        // Upload all photos in the stack
        for (const photo of stack.photos) {
          const photoData = sessionStorage.getItem(`photo_${photo.id}`);
          
          if (!photoData) {
            console.warn(`Photo ${photo.id} not found in sessionStorage`);
            failedPhotos.push({ id: photo.id, error: 'Not found in storage' });
            continue;
          }
          
          try {
            const parsed = JSON.parse(photoData);
            
            // Convert base64 to blob
            const base64Data = parsed.dataUrl.split(',')[1];
            const byteString = atob(base64Data);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let j = 0; j < byteString.length; j++) {
              ia[j] = byteString.charCodeAt(j);
            }
            const blob = new Blob([ab], { type: 'image/jpeg' });
            
            // Upload with retry logic
            await uploadPhotoWithRetry(blob, photo);
            
            // Update progress
            uploadedCount++;
            setUploadProgress({ current: uploadedCount, total: totalPhotos });
            
          } catch (error) {
            console.error(`Failed to upload photo ${photo.id}:`, error);
            failedPhotos.push({ 
              id: photo.id, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
            // Continue with next photo instead of stopping entire upload
          }
        }
      }
      
      setIsUploading(false);
      
      // Show results
      if (failedPhotos.length === 0) {
        // All uploads successful
        trigger('success');
        
        // Clear uploaded photos from sessionStorage
        uploadSelection.forEach(stackId => {
          const stack = stacks.find(s => s.stackId === stackId);
          if (stack) {
            stack.photos.forEach(photo => {
              sessionStorage.removeItem(`photo_${photo.id}`);
            });
          }
        });
        
        // Reload to show updated state
        window.location.reload();
      } else {
        // Some uploads failed
        trigger('error');
        
        // uploadedCount already tracks successful uploads only
        const successCount = uploadedCount;
        const failureCount = failedPhotos.length;
        
        const message = successCount > 0
          ? `${successCount} ${successCount === 1 ? 'Foto' : 'Fotos'} erfolgreich hochgeladen.\n${failureCount} ${failureCount === 1 ? 'Foto' : 'Fotos'} fehlgeschlagen.\n\nBitte versuchen Sie es erneut.`
          : `Upload fehlgeschlagen (${failureCount} ${failureCount === 1 ? 'Foto' : 'Fotos'}).\n\nBitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.`;
        
        alert(message);
        console.error('[Upload] Failed photos:', failedPhotos);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      trigger('error');
      alert('Upload fehlgeschlagen. Bitte versuchen Sie es erneut.');
    }
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
          
          {/* Job Selection */}
          <div className="space-y-3">
            <h3 className="text-gray-900" style={{ fontSize: '16px', fontWeight: '600' }}>
              Auftrag auswählen
            </h3>
            
            {jobsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : jobsError ? (
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-red-600" style={{ fontSize: '14px' }}>
                  Fehler beim Laden der Aufträge
                </p>
              </div>
            ) : !jobs || jobs.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-500" style={{ fontSize: '14px' }}>
                  Keine Aufträge verfügbar
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {(jobs || []).map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      trigger('light');
                      setSelectedJobId(job.id);
                    }}
                    className="bg-white rounded-lg p-3 border-2 transition-all cursor-pointer"
                    style={{
                      borderColor: selectedJobId === job.id ? '#4A5849' : '#E5E5E5'
                    }}
                    data-testid={`job-card-${job.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-900 font-medium truncate" style={{ fontSize: '14px' }}>
                            {job.propertyName || 'Unbenannt'}
                          </span>
                          <span className="text-gray-400 flex-shrink-0" style={{ fontSize: '12px' }}>
                            #{job.jobNumber}
                          </span>
                        </div>
                        {job.addressFormatted && (
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                            <p className="text-gray-500 text-xs line-clamp-2">
                              {job.addressFormatted}
                            </p>
                          </div>
                        )}
                      </div>
                      {selectedJobId === job.id && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#4A5849' }}>
                          <Check className="w-3 h-3 text-white" strokeWidth={2} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

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

          {isUploading && uploadProgress.total > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Upload läuft...</span>
                <span className="text-gray-900 font-medium">
                  {uploadProgress.current} / {uploadProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: '#4A5849' }}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%` 
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                {Math.round((uploadProgress.current / uploadProgress.total) * 100)}% abgeschlossen
              </p>
            </div>
          )}

          <HapticButton
            onClick={handleUpload}
            hapticStyle="success"
            disabled={uploadSelection.length === 0 || !selectedJobId || isUploading}
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
                <span>Wird hochgeladen...</span>
              </>
            ) : uploadSelection.length === 0 ? (
              <>
                <UploadIcon className="w-5 h-5" strokeWidth={1.5} />
                <span>Keine Fotos ausgewählt</span>
              </>
            ) : !selectedJobId ? (
              <>
                <UploadIcon className="w-5 h-5" strokeWidth={1.5} />
                <span>Auftrag auswählen</span>
              </>
            ) : (
              <>
                <UploadIcon className="w-5 h-5" strokeWidth={1.5} />
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
