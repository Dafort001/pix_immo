import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { SEOHead } from '../components/SEOHead';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner@2.0.3';
import {
  ArrowLeft,
  Sparkles,
  Undo2,
  Redo2,
  Download,
  Pencil,
  Eraser,
  Wand2,
  Image as ImageIcon,
  Lightbulb,
  Palette,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Hand,
} from 'lucide-react';

export default function AILab() {
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState('remove');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPanMode, setIsPanMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Extract image data from URL params
  const params = new URLSearchParams(window.location.search);
  const imageUrl = params.get('imageUrl');
  const filename = params.get('filename') || 'Unbenannt.jpg';
  const imageId = params.get('imageId');
  
  const hasImage = !!imageUrl;

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPanMode || zoom <= 100) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Reset pan when zoom changes
  useEffect(() => {
    if (zoom <= 100) {
      setPanOffset({ x: 0, y: 0 });
      setIsPanMode(false);
    }
  }, [zoom]);

  const handleProcess = (action: string) => {
    setIsProcessing(true);
    toast.info(`${action} wird angewendet...`);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`${action} erfolgreich angewendet!`);
    }, 2000);
  };

  const handleSave = () => {
    toast.success('Bild als neue Version gespeichert');
  };

  const handleDownload = () => {
    toast.success('Bearbeitetes Bild wird heruntergeladen...');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="KI-Bildbearbeitung"
        description="Professionelle KI-gestützte Bildbearbeitung für Immobilienfotos"
        path="/ai-lab"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-2xl cursor-pointer">PIX.IMMO</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href={imageId ? '/galerie' : '/dashboard'}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {imageId ? 'Zurück zur Galerie' : 'Dashboard'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {!hasImage ? (
          // No image selected state
          <div className="container mx-auto px-6 py-20 flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <ImageIcon className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
              <h1 className="text-2xl mb-4">KI-Bildbearbeitung</h1>
              <p className="text-muted-foreground mb-8">
                Wählen Sie ein Bild aus Ihrer Galerie aus, um es mit KI-gestützten Werkzeugen zu bearbeiten.
              </p>
              <Link href="/galerie">
                <Button className="bg-[#2E2E2E] text-white hover:opacity-90" style={{ borderRadius: '0px' }}>
                  Zur Galerie
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // Editor view
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="px-6 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium">{filename}</h2>
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    KI-Bearbeitung
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    style={{ borderRadius: '0px' }}
                    onClick={() => handleProcess('Rückgängig')}
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    style={{ borderRadius: '0px' }}
                    onClick={() => handleProcess('Wiederholen')}
                  >
                    <Redo2 className="w-4 h-4" />
                  </Button>
                  
                  <div className="h-6 w-px bg-border mx-2" />
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ borderRadius: '0px' }}
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground w-12 text-center">
                      {zoom}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ borderRadius: '0px' }}
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button
                    variant={isPanMode ? 'default' : 'outline'}
                    size="sm"
                    style={{ borderRadius: '0px' }}
                    onClick={() => setIsPanMode(!isPanMode)}
                    disabled={zoom <= 100}
                    className={isPanMode ? 'bg-[#2E2E2E] text-white' : ''}
                  >
                    <Hand className="w-4 h-4" />
                  </Button>
                  
                  <div className="h-6 w-px bg-border mx-2" />
                  
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    style={{ borderRadius: '0px', height: '32px' }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-[#2E2E2E] text-white hover:opacity-90"
                    style={{ borderRadius: '0px', height: '32px' }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Als v2 speichern
                  </Button>
                </div>
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Tools Sidebar */}
              <div className="w-80 border-r border-border bg-muted/30 overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <TabsList className="w-full grid grid-cols-3 sticky top-0 z-10 bg-background" style={{ borderRadius: '0px' }}>
                    <TabsTrigger value="remove" style={{ borderRadius: '0px' }}>
                      <Eraser className="w-4 h-4 mr-2" />
                      Entfernen
                    </TabsTrigger>
                    <TabsTrigger value="enhance" style={{ borderRadius: '0px' }}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Optimieren
                    </TabsTrigger>
                    <TabsTrigger value="lighting" style={{ borderRadius: '0px' }}>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Licht
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="p-6">
                    <TabsContent value="remove" className="mt-0 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-3">Objekte entfernen</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          Entfernen Sie unerwünschte Objekte automatisch mit KI.
                        </p>
                        <Button
                          className="w-full bg-[#2E2E2E] text-white hover:opacity-90"
                          style={{ borderRadius: '0px' }}
                          onClick={() => handleProcess('Objekt entfernen')}
                          disabled={isProcessing}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Objekt markieren & entfernen
                        </Button>
                      </div>
                      
                      <div className="h-px bg-border" />
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Pinsel-Einstellungen</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-muted-foreground mb-2 block">
                              Pinselgröße
                            </label>
                            <Slider
                              defaultValue={[50]}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-2 block">
                              Weichheit
                            </label>
                            <Slider
                              defaultValue={[75]}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="enhance" className="mt-0 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-3">Bildqualität verbessern</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          KI-basierte Bildoptimierung und Hochskalierung.
                        </p>
                        <div className="space-y-2">
                          <Button
                            className="w-full bg-[#2E2E2E] text-white hover:opacity-90"
                            style={{ borderRadius: '0px' }}
                            onClick={() => handleProcess('Auto-Optimierung')}
                            disabled={isProcessing}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Auto-Optimierung
                          </Button>
                          <Button
                            className="w-full"
                            variant="outline"
                            style={{ borderRadius: '0px' }}
                            onClick={() => handleProcess('Hochskalierung 2x')}
                            disabled={isProcessing}
                          >
                            Hochskalierung (2x)
                          </Button>
                          <Button
                            className="w-full"
                            variant="outline"
                            style={{ borderRadius: '0px' }}
                            onClick={() => handleProcess('Schärfe erhöhen')}
                            disabled={isProcessing}
                          >
                            Schärfe erhöhen
                          </Button>
                        </div>
                      </div>
                      
                      <div className="h-px bg-border" />
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Perspektive korrigieren</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          Automatische Korrektur stürzender Linien.
                        </p>
                        <Button
                          className="w-full"
                          variant="outline"
                          style={{ borderRadius: '0px' }}
                          onClick={() => handleProcess('Perspektive korrigieren')}
                          disabled={isProcessing}
                        >
                          <RotateCw className="w-4 h-4 mr-2" />
                          Perspektive korrigieren
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="lighting" className="mt-0 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-3">Belichtung anpassen</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-muted-foreground mb-2 block">
                              Helligkeit
                            </label>
                            <Slider
                              defaultValue={[50]}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-2 block">
                              Kontrast
                            </label>
                            <Slider
                              defaultValue={[50]}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-2 block">
                              Sättigung
                            </label>
                            <Slider
                              defaultValue={[50]}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-px bg-border" />
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">HDR & Himmel</h3>
                        <div className="space-y-2">
                          <Button
                            className="w-full bg-[#2E2E2E] text-white hover:opacity-90"
                            style={{ borderRadius: '0px' }}
                            onClick={() => handleProcess('HDR-Optimierung')}
                            disabled={isProcessing}
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            HDR-Optimierung
                          </Button>
                          <Button
                            className="w-full"
                            variant="outline"
                            style={{ borderRadius: '0px' }}
                            onClick={() => handleProcess('Himmel ersetzen')}
                            disabled={isProcessing}
                          >
                            <Palette className="w-4 h-4 mr-2" />
                            Himmel ersetzen
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Canvas Area */}
              <div 
                ref={canvasRef}
                className="flex-1 bg-black/5 overflow-hidden flex items-center justify-center p-8 relative"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ 
                  cursor: isPanMode ? (isPanning ? 'grabbing' : 'grab') : 'default',
                }}
              >
                <div 
                  className="relative" 
                  style={{ 
                    transform: `scale(${zoom / 100}) translate(${panOffset.x / (zoom / 100)}px, ${panOffset.y / (zoom / 100)}px)`,
                    transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={filename}
                    className="max-w-full h-auto shadow-2xl select-none"
                    style={{ maxHeight: 'calc(100vh - 300px)' }}
                    draggable={false}
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white px-6 py-4 shadow-lg flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-[#2E2E2E] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">KI wird angewendet...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="flex-grow"></div>
      <Footer />
    </div>
  );
}
