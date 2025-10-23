import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, HardDrive } from 'lucide-react';
import { HapticButton } from '@/components/mobile/HapticButton';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHaptic } from '@/hooks/useHaptic';
import { useLocation } from 'wouter';

interface UploadFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
}

export default function UploadScreen() {
  const [, setLocation] = useLocation();
  const [wifiOnly, setWifiOnly] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [lowStorage, setLowStorage] = useState(false);
  const { trigger } = useHaptic();
  const [files, setFiles] = useState<UploadFile[]>([
    { id: '1', name: 'IMG_001.dng', size: 25.4, progress: 100, status: 'complete' },
    { id: '2', name: 'IMG_002.dng', size: 26.1, progress: 65, status: 'uploading' },
    { id: '3', name: 'IMG_003.dng', size: 24.8, progress: 0, status: 'pending' },
  ]);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0).toFixed(1);
  const totalProgress = files.reduce((sum, f) => sum + f.progress, 0) / files.length;

  const toggleWifi = () => {
    trigger('light');
    setWifiOnly(!wifiOnly);
  };

  // Simuliere Upload
  useEffect(() => {
    const interval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.status === 'uploading' && file.progress < 100) {
          const newProgress = Math.min(file.progress + Math.random() * 10, 100);
          if (newProgress === 100) {
            trigger('success');
          }
          return {
            ...file,
            progress: newProgress,
            status: newProgress === 100 ? 'complete' : 'uploading'
          };
        }
        if (file.status === 'pending') {
          const previousComplete = prev.find(f => 
            f.id === String(Number(file.id) - 1)
          )?.status === 'complete';
          if (previousComplete) {
            return { ...file, status: 'uploading' };
          }
        }
        return file;
      }));
    }, 500);

    return () => clearInterval(interval);
  }, [trigger]);

  return (
    <div className="h-full flex flex-col bg-white pb-16 safe-area-bottom">
      {/* Header - Landscape kompakt */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: '24px' }} className="text-gray-900 font-semibold">
              Upload
            </h1>
            <p style={{ fontSize: '14px' }} className="text-gray-600" data-testid="text-upload-stats">
              {files.length} Fotos · {totalSize} MB
            </p>
          </div>
          
          {/* WiFi Toggle - Landscape optimiert */}
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '14px' }} className="text-gray-600" data-testid="text-wifi-status">
              {wifiOnly ? 'Nur WLAN' : 'Mobil erlaubt'}
            </span>
            <HapticButton
              variant={wifiOnly ? 'outline' : 'default'}
              size="sm"
              onClick={toggleWifi}
              hapticStyle="light"
              className={wifiOnly ? 'border-gray-300' : 'bg-blue-500'}
              style={{ fontSize: '13px' }}
              data-testid="button-toggle-wifi"
            >
              {wifiOnly ? 'Mobil aktivieren' : 'Nur WLAN'}
            </HapticButton>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status Banners */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive">
                <WifiOff className="h-4 w-4" strokeWidth={1.5} />
                <AlertDescription style={{ fontSize: '14px' }}>
                  Keine Internetverbindung. Upload pausiert.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {lowStorage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert>
                <HardDrive className="h-4 w-4" strokeWidth={1.5} />
                <AlertDescription style={{ fontSize: '14px' }}>
                  Speicherplatz wird knapp. Bitte räumen Sie Speicher frei.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-50 rounded-lg p-4 space-y-3 shadow-sm"
        >
          <div className="flex justify-between" style={{ fontSize: '14px' }}>
            <span className="text-gray-600">Dateien:</span>
            <span className="text-gray-900" data-testid="text-file-count">{files.length}</span>
          </div>
          <div className="flex justify-between" style={{ fontSize: '14px' }}>
            <span className="text-gray-600">Gesamtgröße:</span>
            <span className="text-gray-900" data-testid="text-total-size">{totalSize} MB</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between" style={{ fontSize: '14px' }}>
              <span className="text-gray-600">Gesamtfortschritt:</span>
              <span className="text-blue-500" data-testid="text-total-progress">{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>
        </motion.div>

        {/* Individual Files */}
        <div className="space-y-3">
          <h3 className="text-gray-900" style={{ fontSize: '16px' }}>Dateien</h3>
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-2 shadow-sm"
              data-testid={`upload-file-${file.id}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-900" style={{ fontSize: '14px' }} data-testid={`file-name-${file.id}`}>{file.name}</p>
                  <p className="text-gray-500" style={{ fontSize: '12px' }} data-testid={`file-size-${file.id}`}>{file.size.toFixed(1)} MB</p>
                </div>
                <div className="text-gray-500" style={{ fontSize: '12px' }} data-testid={`file-status-${file.id}`}>
                  {file.status === 'complete' && '✓ Fertig'}
                  {file.status === 'uploading' && `${Math.round(file.progress)}%`}
                  {file.status === 'pending' && 'Wartend...'}
                  {file.status === 'error' && 'Fehler'}
                </div>
              </div>
              {file.status !== 'complete' && (
                <Progress 
                  value={file.progress} 
                  className="h-1.5"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {totalProgress === 100 ? (
          <HapticButton
            onClick={() => setLocation('/app/gallery')}
            hapticStyle="success"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-6 shadow-md"
            style={{ fontSize: '16px' }}
            data-testid="button-upload-complete"
          >
            Upload abgeschlossen
          </HapticButton>
        ) : (
          <HapticButton
            variant="outline"
            hapticStyle="warning"
            className="w-full py-6"
            style={{ fontSize: '16px' }}
            data-testid="button-cancel-upload"
          >
            Upload abbrechen
          </HapticButton>
        )}
      </div>
    </div>
  );
}
