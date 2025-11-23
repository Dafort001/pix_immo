import React, { useState, useRef, useEffect } from 'react';
import { UploadFile, Panorama } from '../UploadWorkflow';
import { Button } from '../ui/button';
import { Upload, ZoomIn, ZoomOut, Link2, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface PanoramaSectionProps {
  files: UploadFile[];
  panoramas: Panorama[];
  setPanoramas: (panoramas: Panorama[]) => void;
  floorplan: string | null;
  setFloorplan: (floorplan: string | null) => void;
  startPanorama: string | null;
  setStartPanorama: (id: string | null) => void;
}

const PANO_CATEGORIES = [
  'Innenraum 360°',
  'Außenbereich 360°',
  'Drohne 360° (Bodenlevel / niedrig)',
  'Drohne 360° (hoch)',
  'Grundstück Panorama',
  'Straßenansicht Panorama',
  'Aussichtspunkt Panorama',
  'Sonstiger Raum (Freie Eingabe)',
];

const FLOORS = ['EG', 'OG', 'DG', 'Keller', 'Außen', 'Drohne'];

export function PanoramaSection({
  files,
  panoramas,
  setPanoramas,
  floorplan,
  setFloorplan,
  startPanorama,
  setStartPanorama,
}: PanoramaSectionProps) {
  const [selectedFloor, setSelectedFloor] = useState('EG');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [showAutoSuggestions, setShowAutoSuggestions] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Detect 360 panoramas from uploaded files
  useEffect(() => {
    const pano360Files = files.filter(f => f.is360);
    
    if (pano360Files.length > 0 && panoramas.length === 0) {
      const detectedPanos: Panorama[] = pano360Files.map((file, idx) => ({
        id: `pano-${file.id}`,
        fileId: file.id,
        name: file.name,
        category: 'Innenraum 360°',
        floor: 'EG',
        connections: [],
      }));
      setPanoramas(detectedPanos);
    }
  }, [files, panoramas.length, setPanoramas]);

  const handleFloorplanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setFloorplan(url);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 1) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - panStart.x,
        y: touch.clientY - panStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  const handlePanoClick = (panoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (connectMode) {
      if (connectFrom === null) {
        setConnectFrom(panoId);
      } else if (connectFrom !== panoId) {
        // Create connection
        setPanoramas(
          panoramas.map(p => {
            if (p.id === connectFrom) {
              return {
                ...p,
                connections: [...p.connections, panoId],
              };
            }
            if (p.id === panoId) {
              return {
                ...p,
                connections: [...p.connections, connectFrom],
              };
            }
            return p;
          })
        );
        setConnectFrom(null);
        setConnectMode(false);
      }
    }
  };

  const handleCategoryChange = (panoId: string, category: string) => {
    setPanoramas(
      panoramas.map(p => (p.id === panoId ? { ...p, category } : p))
    );
  };

  const handleFloorChange = (panoId: string, floor: string) => {
    setPanoramas(
      panoramas.map(p => (p.id === panoId ? { ...p, floor } : p))
    );
  };

  const handleAutoSuggest = () => {
    setShowAutoSuggestions(true);
    
    // Create mock connections between panoramas on same floor
    const floorPanos = panoramas.filter(p => p.floor === selectedFloor);
    const newPanoramas = [...panoramas];
    
    floorPanos.forEach((pano, idx) => {
      if (idx < floorPanos.length - 1) {
        const nextPano = floorPanos[idx + 1];
        const panoIndex = newPanoramas.findIndex(p => p.id === pano.id);
        if (panoIndex !== -1 && !newPanoramas[panoIndex].connections.includes(nextPano.id)) {
          newPanoramas[panoIndex].connections.push(nextPano.id);
        }
      }
    });
    
    setPanoramas(newPanoramas);
  };

  const floorPanoramas = panoramas.filter(p => p.floor === selectedFloor);

  return (
    <div className="space-y-6">
      {/* Detected Panoramas List */}
      {panoramas.length > 0 ? (
        <div>
          <h4 className="mb-3">Erkannte Panoramen ({panoramas.length})</h4>
          
          <div className="space-y-3">
            {panoramas.map(pano => {
              const file = files.find(f => f.id === pano.fileId);
              return (
                <div
                  key={pano.id}
                  className="border border-[#E6E6E6] rounded p-3 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#F7F7F7]"
                >
                  <div className="w-16 h-16 bg-[#E6E6E6] rounded border border-[#C7C7C7] overflow-hidden flex-shrink-0 relative">
                    {file && (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-1 right-1 bg-black text-white p-1 rounded">
                      <Globe className="size-3" />
                    </div>
                  </div>

                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#6F6F6F] block mb-1 text-sm">
                        Panorama-Kategorie
                      </label>
                      <Select
                        value={pano.category}
                        onValueChange={value => handleCategoryChange(pano.id, value)}
                      >
                        <SelectTrigger className="border-[#C7C7C7] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PANO_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[#6F6F6F] block mb-1 text-sm">
                        Etage
                      </label>
                      <Select
                        value={pano.floor}
                        onValueChange={value => handleFloorChange(pano.id, value)}
                      >
                        <SelectTrigger className="border-[#C7C7C7] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FLOORS.map(floor => (
                            <SelectItem key={floor} value={floor}>
                              {floor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border border-[#E6E6E6] rounded-lg bg-[#F7F7F7]">
          <Globe className="size-10 mx-auto mb-3 text-[#6F6F6F]" />
          <p className="text-[#6F6F6F]">
            Keine 360°-Panoramen erkannt. Laden Sie Panoramen im Upload-Schritt hoch.
          </p>
        </div>
      )}

      {/* Floorplan Upload */}
      {panoramas.length > 0 && (
        <>
          <div>
            <h4 className="mb-3">Grundriss hochladen (optional)</h4>
            <p className="text-[#6F6F6F] mb-3 text-sm">
              Laden Sie einen Grundriss hoch, um Panoramen visuell zu platzieren.
            </p>

            {!floorplan ? (
              <label className="border-2 border-dashed border-[#C7C7C7] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors bg-[#F7F7F7]">
                <Upload className="size-8 text-[#6F6F6F] mb-2" />
                <span className="text-black underline text-sm">Grundriss hochladen</span>
                <span className="text-[#6F6F6F] text-sm mt-1">PDF, JPG oder PNG</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFloorplanUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between bg-[#F7F7F7] p-3 rounded border border-[#C7C7C7]">
                <span className="text-sm">Grundriss hochgeladen</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFloorplan(null)}
                  className="border-[#C7C7C7]"
                >
                  Entfernen
                </Button>
              </div>
            )}
          </div>

          {/* Floor Plan Canvas */}
          {floorplan && (
            <div>
              <h4 className="mb-3">Panorama-Platzierung</h4>
              <p className="text-[#6F6F6F] mb-3 text-sm">
                Ziehen Sie die Panoramen auf den Grundriss und verknüpfen Sie sie.
              </p>

              {/* Floor Tabs */}
              <Tabs value={selectedFloor} onValueChange={setSelectedFloor} className="mb-3">
                <TabsList className="bg-[#F7F7F7]">
                  {FLOORS.map(floor => (
                    <TabsTrigger key={floor} value={floor} className="data-[state=active]:bg-white">
                      {floor}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Canvas Controls */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  className="border-[#C7C7C7]"
                >
                  <ZoomIn className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  className="border-[#C7C7C7]"
                >
                  <ZoomOut className="size-4" />
                </Button>
                <div className="text-[#6F6F6F] text-sm">Zoom: {Math.round(zoom * 100)}%</div>
                
                <div className="w-full sm:w-auto sm:ml-auto flex flex-wrap gap-2">
                  <Button
                    variant={connectMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setConnectMode(!connectMode);
                      setConnectFrom(null);
                    }}
                    className={connectMode ? 'bg-black text-white' : 'border-[#C7C7C7]'}
                  >
                    <Link2 className="size-4 sm:mr-2" />
                    <span className="hidden sm:inline">Verbindungen setzen</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAutoSuggest}
                    className="border-[#C7C7C7]"
                  >
                    <span className="hidden sm:inline">Auto-Vorschläge</span>
                    <span className="sm:hidden">Auto</span>
                  </Button>
                </div>
              </div>

              {connectMode && (
                <div className="bg-[#FBC02D] text-black p-3 rounded mb-3 text-sm">
                  {connectFrom
                    ? 'Klicken Sie auf das zweite Panorama, um eine Verbindung zu erstellen.'
                    : 'Klicken Sie auf ein Panorama, um eine Verbindung zu beginnen.'}
                </div>
              )}

              {/* Canvas */}
              <div
                ref={canvasRef}
                className="relative w-full h-[500px] bg-[#F7F7F7] border-2 border-[#C7C7C7] rounded-lg overflow-hidden cursor-move touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  {floorplan && (
                    <img
                      src={floorplan}
                      alt="Grundriss"
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none pointer-events-none"
                      style={{ width: '80%', height: 'auto' }}
                      draggable={false}
                    />
                  )}

                  {/* Draw connections */}
                  <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 1 }}
                  >
                    {floorPanoramas.map(pano => {
                      const x1 = (pano.x || 300) + 20;
                      const y1 = (pano.y || 200) + 20;
                      
                      return pano.connections.map(connId => {
                        const connPano = panoramas.find(p => p.id === connId);
                        if (!connPano || connPano.floor !== selectedFloor) return null;
                        
                        const x2 = (connPano.x || 400) + 20;
                        const y2 = (connPano.y || 300) + 20;
                        
                        return (
                          <line
                            key={`${pano.id}-${connId}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#000000"
                            strokeWidth="2"
                            strokeDasharray={connPano.floor !== pano.floor ? "5,5" : "none"}
                          />
                        );
                      });
                    })}
                  </svg>

                  {/* Panorama markers */}
                  {floorPanoramas.map((pano, idx) => (
                    <div
                      key={pano.id}
                      onClick={(e) => handlePanoClick(pano.id, e)}
                      className={`absolute w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        connectFrom === pano.id
                          ? 'bg-[#FBC02D] border-2 border-black scale-110'
                          : startPanorama === pano.id
                          ? 'bg-[#388E3C] border-2 border-black'
                          : 'bg-white border-2 border-black hover:scale-110'
                      }`}
                      style={{
                        left: pano.x || (300 + idx * 100),
                        top: pano.y || (200 + idx * 80),
                        zIndex: 10,
                      }}
                      title={pano.name}
                    >
                      <Globe className="size-5" />
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[#6F6F6F] mt-2 text-sm">
                Klicken und ziehen Sie, um die Ansicht zu verschieben.
              </p>
            </div>
          )}

          {/* Start Point Selection */}
          <div>
            <h4 className="mb-3">Startpunkt der Tour</h4>
            <p className="text-[#6F6F6F] mb-3 text-sm">
              Wählen Sie das Panorama, mit dem die Tour beginnen soll.
            </p>

            <Select
              value={startPanorama || ''}
              onValueChange={setStartPanorama}
            >
              <SelectTrigger className="w-full max-w-md border-[#C7C7C7]">
                <SelectValue placeholder="Startpunkt wählen" />
              </SelectTrigger>
              <SelectContent>
                {panoramas.map(pano => (
                  <SelectItem key={pano.id} value={pano.id}>
                    {pano.name} ({pano.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}