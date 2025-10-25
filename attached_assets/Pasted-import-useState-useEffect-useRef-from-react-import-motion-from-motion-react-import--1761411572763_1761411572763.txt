import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Grid3x3, Timer, HelpCircle, Camera as CameraIcon, X, Check } from 'lucide-react';
import { HapticButton } from '../HapticButton';
import { StatusBar } from '../StatusBar';
import { Histogram } from '../Histogram';
import { useHaptic } from '../../hooks/useHaptic';
import type { Screen } from '../../App';

interface CameraScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function CameraScreen({ onNavigate }: CameraScreenProps) {
  const [showGrid, setShowGrid] = useState(true);
  const [showHorizon, setShowHorizon] = useState(true);
  const [showHistogram, setShowHistogram] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [timer, setTimer] = useState<0 | 3 | 10>(0);
  const [currentRoom, setCurrentRoom] = useState('Wohnzimmer');
  const [perspectiveIndex, setPerspectiveIndex] = useState(1);
  const [horizonTilt, setHorizonTilt] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [cameraLoading, setCameraLoading] = useState(true);
  const [helpVisible, setHelpVisible] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { trigger } = useHaptic();

  const zoomLevels = [0.5, 1, 1.5, 2];
  
  const roomTypes = [
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

  // Kamera-Stream initialisieren
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      setCameraLoading(true);
      try {
        // Prüfe ob MediaDevices API verfügbar ist
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        
        if (mounted && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setCameraError('');
        }
      } catch (err: any) {
        console.log('Kamera-Initialisierung:', err.name, err.message);
        
        // Setze benutzerfreundliche Fehlermeldung
        if (err.name === 'NotAllowedError') {
          setCameraError('demo'); // Demo-Modus statt Fehler
        } else if (err.name === 'NotFoundError') {
          setCameraError('demo');
        } else if (err.message === 'Camera API not supported') {
          setCameraError('demo');
        } else {
          setCameraError('demo');
        }
      } finally {
        setCameraLoading(false);
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Simuliere Horizont-Neigung (in echter App: DeviceOrientation API)
  useEffect(() => {
    const interval = setInterval(() => {
      setHorizonTilt(Math.sin(Date.now() / 1000) * 2);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleCapture = () => {
    trigger('heavy');
    // Capture Animation
    const flash = document.getElementById('capture-flash');
    if (flash) {
      flash.classList.remove('hidden');
      setTimeout(() => {
        flash.classList.add('hidden');
        // Nach dem Flash → Raumtyp-Auswahl öffnen
        setShowRoomSelector(true);
      }, 150);
    }
  };

  const cycleTimer = () => {
    trigger('light');
    const timers: Array<0 | 3 | 10> = [0, 3, 10];
    const currentIndex = timers.indexOf(timer);
    setTimer(timers[(currentIndex + 1) % timers.length]);
  };

  const handleZoomChange = (level: number) => {
    trigger('light');
    setZoom(level);
  };

  const toggleGrid = () => {
    trigger('light');
    setShowGrid(!showGrid);
  };

  const toggleHistogram = () => {
    trigger('light');
    setShowHistogram(!showHistogram);
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Status Bar */}
      <StatusBar variant="light" />

      {/* Hilfe-Overlay */}
      {helpVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => {
            trigger('light');
            setHelpVisible(false);
          }}
        >
          {/* Hilfe-Box */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-lg shadow-2xl mx-6 flex flex-col relative"
            style={{ maxWidth: '320px', width: '100%', maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header mit X-Button - STICKY */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h3 style={{ fontSize: '18px' }} className="text-gray-900">
                Kamera-Hilfe
              </h3>
              <button
                onClick={() => {
                  trigger('light');
                  setHelpVisible(false);
                }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
              </button>
            </div>

            {/* Content - SCROLLABLE mit sichtbarer Scrollbar */}
            <div 
              className="p-4 space-y-4 overflow-y-auto flex-1 help-scrollbar"
              style={{ minHeight: '300px', maxHeight: 'calc(80vh - 120px)' }}
            >
              <div>
                <h4 style={{ fontSize: '14px' }} className="text-gray-900 mb-1">
                  Zoom
                </h4>
                <p style={{ fontSize: '14px' }} className="text-gray-600">
                  Wähle zwischen 0.5×, 1×, 1.5× und 2× Zoom für die perfekte Perspektive.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px' }} className="text-gray-900 mb-1">
                  Gitter
                </h4>
                <p style={{ fontSize: '14px' }} className="text-gray-600">
                  Das 3×3 Gitter hilft dir bei der Bildkomposition nach der Drittel-Regel.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px' }} className="text-gray-900 mb-1">
                  Timer
                </h4>
                <p style={{ fontSize: '14px' }} className="text-gray-600">
                  Verzögere die Aufnahme um 3 oder 10 Sekunden für verwacklungsfreie Fotos.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px' }} className="text-gray-900 mb-1">
                  Histogramm
                </h4>
                <p style={{ fontSize: '14px' }} className="text-gray-600">
                  Zeigt die Belichtungsverteilung in Echtzeit. Tippe darauf zum Ein-/Ausblenden.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px' }} className="text-gray-900 mb-1">
                  Raumtyp
                </h4>
                <p style={{ fontSize: '14px' }} className="text-gray-600">
                  Wähle den Raum aus, um Fotos automatisch zu organisieren. Nach jedem Foto kannst du den Raumtyp zuordnen.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px' }} className="text-gray-900 mb-1">
                  Horizont-Linie
                </h4>
                <p style={{ fontSize: '14px' }} className="text-gray-600">
                  Die grüne Linie zeigt die horizontale Ausrichtung der Kamera. Nutze sie für perfekt gerade Aufnahmen.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px' }} className="text-gray-900 mb-1">
                  Auslöser
                </h4>
                <p style={{ fontSize: '14px' }} className="text-gray-600">
                  Der große weiße Button nimmt das Foto auf. Nach der Aufnahme wirst du automatisch zur Raumtyp-Auswahl geleitet.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px' }} className="text-gray-900 mb-1">
                  Perspektiven
                </h4>
                <p style={{ fontSize: '14px' }} className="text-gray-600">
                  Für jeden Raum kannst du mehrere Perspektiven aufnehmen (#1, #2, #3...). Der Index erhöht sich automatisch.
                </p>
              </div>
            </div>

            {/* Fade-Gradient am unteren Rand - zeigt "mehr Content verfügbar" */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none rounded-b-lg"
              style={{
                background: 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)'
              }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Camera Viewfinder - Portrait */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* Live-Kamera-Vorschau oder Fallback */}
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: `scale(${zoom})` }}
          />
        ) : cameraLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-600 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <CameraIcon className="w-16 h-16 mb-4 mx-auto text-[#4A5849]" strokeWidth={1} />
              </motion.div>
              <p className="text-white" style={{ fontSize: '14px' }}>
                Kamera wird geladen...
              </p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1E293B] to-gray-900">
            <div className="text-center px-6 max-w-sm">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(74, 88, 73, 0.2)' }}>
                <CameraIcon className="w-10 h-10 text-[#4A5849]" strokeWidth={1.5} />
              </div>
              <p className="text-white mb-2" style={{ fontSize: '16px' }}>
                Demo-Modus
              </p>
              <p className="text-gray-400 mb-4" style={{ fontSize: '14px' }}>
                Live-Kamera nur auf echten Geräten mit HTTPS verfügbar
              </p>
              <p className="text-xs text-gray-500" style={{ fontSize: '12px' }}>
                Alle Funktionen sind testbar. Die Kamera wird automatisch aktiviert, wenn die App auf einem iPhone über HTTPS läuft.
              </p>
            </div>
          </div>
        )}

        {/* Grid Overlay */}
        {showGrid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="h-full w-full grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </motion.div>
        )}

        {/* Horizont-Linie mit Animation */}
        {showHorizon && (
          <motion.div
            animate={{ rotate: horizonTilt }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-none"
          >
            <div className="relative w-full h-px bg-[#4A5849]">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-[#4A5849] rounded-full" />
            </div>
          </motion.div>
        )}

        {/* ===== IM BILD: NUR Zoom-Feld + Histogramm ===== */}

        {/* Zoom-Feld - Unten mittig im Bild */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
            {zoomLevels.map((level) => (
              <motion.button
                key={level}
                onClick={() => handleZoomChange(level)}
                whileTap={{ scale: 0.9 }}
                className={`min-w-10 px-3 py-1.5 rounded-full transition-all ${
                  zoom === level
                    ? 'bg-[#4A5849] text-white shadow-md'
                    : 'text-white hover:bg-white/20'
                }`}
                style={{ fontSize: '14px' }}
              >
                {level}×
              </motion.button>
            ))}
          </div>
        </div>

        {/* Histogramm - Unten rechts im Bild */}
        {showHistogram && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-20 right-4 z-10"
            onClick={toggleHistogram}
          >
            <div className="rounded p-1 cursor-pointer" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
              <Histogram
                videoElement={videoRef.current}
                width={80}
                height={40}
                className="rounded"
              />
            </div>
          </motion.div>
        )}

        {/* Capture Flash Overlay */}
        <div id="capture-flash" className="absolute inset-0 bg-white hidden pointer-events-none z-50" />
      </div>

      {/* ===== AUSSERHALB DES BILDES: Alle Bedienelemente ===== */}
      
      {/* Bottom Controls - AUSSERHALB der Aufnahmefläche */}
      <div className="bg-black py-4 px-6 pb-20">
        {/* Raumindikator (unten links) + Hilfe (unten rechts) */}
        <div className="flex items-center justify-between mb-4">
          {/* Raumindikator - Unten links */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              trigger('light');
              // Raumtyp-Auswahl öffnen
              setShowRoomSelector(true);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
          >
            <span className="text-white" style={{ fontSize: '14px' }}>
              {currentRoom}
            </span>
            <span className="text-white/60" style={{ fontSize: '12px' }}>
              #{perspectiveIndex}
            </span>
          </motion.button>

          {/* Hilfe-Button - Unten rechts */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              trigger('light');
              setHelpVisible(!helpVisible);
            }}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-white" strokeWidth={1.5} />
          </motion.button>
        </div>

        {/* Hauptsteuerung: Timer | Auslöser | Grid */}
        <div className="flex items-center justify-center gap-6">
          {/* Timer-Button - Links neben Auslöser (36 pt) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={cycleTimer}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            {timer === 0 ? (
              <Timer className="w-4 h-4 text-white/60" strokeWidth={1.5} />
            ) : (
              <span className="text-white" style={{ fontSize: '14px' }}>{timer}</span>
            )}
          </motion.button>

          {/* Auslöser - Center (72 pt Ø, 16 pt Abstand zur Tab Bar) */}
          <motion.button
            onClick={handleCapture}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center transition-transform"
            style={{ width: '72px', height: '72px' }}
          >
            <div className="w-16 h-16 bg-white rounded-full" />
          </motion.button>

          {/* Grid-Button - Rechts neben Auslöser (36 pt) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleGrid}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Grid3x3 className={`w-4 h-4 transition-colors ${showGrid ? 'text-white' : 'text-white/60'}`} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      {/* Raumtyp-Auswahl */}
      {showRoomSelector && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => {
            trigger('light');
            setShowRoomSelector(false);
          }}
        >
          {/* Raumtyp-Box */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-lg shadow-2xl mx-6 flex flex-col relative"
            style={{ maxWidth: '320px', width: '100%', maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header mit X-Button - STICKY */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h3 style={{ fontSize: '18px' }} className="text-gray-900">
                Raumtyp wählen
              </h3>
              <button
                onClick={() => {
                  trigger('light');
                  setShowRoomSelector(false);
                }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
              </button>
            </div>

            {/* Content - SCROLLABLE mit sichtbarer Scrollbar */}
            <div 
              className="p-4 space-y-2 overflow-y-auto help-scrollbar"
              style={{ minHeight: '300px', maxHeight: 'calc(80vh - 120px)' }}
            >
              {roomTypes.map((room) => (
                <motion.button
                  key={room}
                  onClick={() => {
                    trigger('medium');
                    setCurrentRoom(room);
                    setPerspectiveIndex(1); // Reset auf #1 bei neuem Raumtyp
                    setShowRoomSelector(false);
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full px-4 py-3 rounded-lg border transition-all flex items-center justify-between ${
                    currentRoom === room
                      ? 'bg-[#4A5849] border-[#4A5849] text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span style={{ fontSize: '16px' }}>
                    {room}
                  </span>
                  {currentRoom === room && (
                    <Check className="w-5 h-5 text-white flex-shrink-0 ml-2" strokeWidth={2} />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Fade-Gradient am unteren Rand - zeigt "mehr Content verfügbar" */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none rounded-b-lg"
              style={{
                background: 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)'
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}