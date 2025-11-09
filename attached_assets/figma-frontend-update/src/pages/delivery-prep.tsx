import { useState } from 'react';
import { Link } from 'wouter';
import {
  Download,
  CheckCircle2,
  Package,
  FileText,
  Image,
  ArrowLeft,
  Menu,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

export default function DeliveryPrep() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeAltText, setIncludeAltText] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const jobId = 'JOB-2024-1105';
  const totalImages = 32;
  const approvedImages = 32;

  const previewImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
  ];

  const handleGeneratePackage = () => {
    setIsGenerating(true);
    setProgress(0);

    // Simulate package generation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setShowSuccess(true);
          toast.success('ZIP erstellt und an Kunden gesendet', {
            description: 'Das Delivery Package wurde erfolgreich erstellt.',
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin-dashboard">
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/">
                <span className="text-2xl tracking-tight">PIX.IMMO</span>
              </Link>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/admin-dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Abmelden</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E9E9E9] py-4 px-4">
          <nav className="flex flex-col gap-2">
            <Link href="/admin-dashboard">
              <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full justify-start">Abmelden</Button>
            </Link>
          </nav>
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl mb-1">Delivery Preparation</h1>
              <div className="text-sm text-[#8E9094]">Job-ID: {jobId}</div>
            </div>
            <Badge className="bg-[#64BF49] text-white hover:bg-[#64BF49]">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              All images approved
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-8 w-full">
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="w-full sm:w-auto mb-6">
            <TabsTrigger value="export" className="flex-1 sm:flex-none">
              <Package className="h-4 w-4 mr-2" />
              ZIP Export
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1 sm:flex-none">
              <Image className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* ZIP Export Tab */}
          <TabsContent value="export">
            <div className="bg-white rounded-lg p-6 lg:p-8">
              <h2 className="text-2xl mb-6">Export-Einstellungen</h2>

              <div className="space-y-6 mb-8">
                {/* Images Checkbox */}
                <div className="flex items-start gap-3 p-4 border border-[#E9E9E9] rounded-lg hover:border-[#8E9094] transition-colors">
                  <Checkbox
                    id="include-images"
                    checked={includeImages}
                    onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="include-images"
                      className="text-sm cursor-pointer block mb-1"
                    >
                      Bilder ({totalImages} JPG)
                    </label>
                    <div className="text-xs text-[#8E9094]">
                      Hochauflösende JPG-Dateien (ca. 180 MB)
                    </div>
                  </div>
                  <Image className="h-5 w-5 text-[#8E9094]" />
                </div>

                {/* Alt-Text Checkbox */}
                <div className="flex items-start gap-3 p-4 border border-[#E9E9E9] rounded-lg hover:border-[#8E9094] transition-colors">
                  <Checkbox
                    id="include-alttext"
                    checked={includeAltText}
                    onCheckedChange={(checked) => setIncludeAltText(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="include-alttext"
                      className="text-sm cursor-pointer block mb-1"
                    >
                      Alt-Text (.txt)
                    </label>
                    <div className="text-xs text-[#8E9094]">
                      Textdatei mit Bildbeschreibungen für SEO
                    </div>
                  </div>
                  <FileText className="h-5 w-5 text-[#8E9094]" />
                </div>

                {/* Metadata Checkbox */}
                <div className="flex items-start gap-3 p-4 border border-[#E9E9E9] rounded-lg hover:border-[#8E9094] transition-colors">
                  <Checkbox
                    id="include-metadata"
                    checked={includeMetadata}
                    onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="include-metadata"
                      className="text-sm cursor-pointer block mb-1"
                    >
                      JSON Metadaten
                    </label>
                    <div className="text-xs text-[#8E9094]">
                      Technische Daten (EXIF, Kamera-Einstellungen, GPS)
                    </div>
                  </div>
                  <FileText className="h-5 w-5 text-[#8E9094]" />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-[#F8F9FA] rounded-lg p-4 mb-6">
                <div className="text-sm text-[#8E9094] mb-2">Paket-Inhalt</div>
                <div className="text-sm space-y-1">
                  {includeImages && <div>✓ {totalImages} Bilder (ca. 180 MB)</div>}
                  {includeAltText && <div>✓ Alt-Text Datei</div>}
                  {includeMetadata && <div>✓ Metadaten (JSON)</div>}
                </div>
              </div>

              {/* Progress */}
              {isGenerating && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-[#8E9094]">Erstelle ZIP-Datei...</div>
                    <div className="text-sm">{progress}%</div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Success Message */}
              {showSuccess && (
                <div className="bg-[#F0FDF4] border border-[#64BF49]/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#64BF49]" />
                    <div>
                      <div className="text-sm mb-1">ZIP erstellt und versendet</div>
                      <div className="text-xs text-[#8E9094]">
                        Das Delivery Package wurde an den Kunden gesendet.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                className="w-full bg-[#64BF49] hover:bg-[#64BF49]/90"
                size="lg"
                onClick={handleGeneratePackage}
                disabled={isGenerating || (!includeImages && !includeAltText && !includeMetadata)}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Erstelle Paket...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Generate Delivery Package
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <div className="bg-white rounded-lg p-6 lg:p-8">
              <h2 className="text-2xl mb-6">Vorschau</h2>

              {/* Image Preview */}
              <div className="mb-8">
                <div className="text-sm text-[#8E9094] mb-4">
                  Beispielbilder (3 von {totalImages})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {previewImages.map((url, index) => (
                    <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Alt-Text Preview */}
              {includeAltText && (
                <div className="mb-8">
                  <div className="text-sm text-[#8E9094] mb-4">Alt-Text Beispiel</div>
                  <div className="bg-[#F8F9FA] rounded-lg p-4 font-mono text-xs">
                    <div className="mb-2">living-room-01.jpg</div>
                    <div className="text-[#8E9094] mb-4">
                      Moderne Wohnzimmer mit großen Fenstern, hellen Holzböden und
                      minimalistischer Einrichtung. Natürliches Licht flutet den Raum
                      und schafft eine warme, einladende Atmosphäre.
                    </div>
                    <div className="mb-2">kitchen-01.jpg</div>
                    <div className="text-[#8E9094] mb-4">
                      Geräumige Küche mit weißen Schränken, Edelstahl-Geräten und
                      Marmor-Arbeitsplatte. Moderne Beleuchtung und offenes Design.
                    </div>
                    <div className="mb-2">bedroom-01.jpg</div>
                    <div className="text-[#8E9094]">
                      Ruhiges Schlafzimmer in neutralen Tönen mit großem Fenster,
                      hochwertigem Bett und minimalistischer Dekoration.
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata Preview */}
              {includeMetadata && (
                <div>
                  <div className="text-sm text-[#8E9094] mb-4">Metadaten Beispiel</div>
                  <div className="bg-[#F8F9FA] rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <pre>{`{
  "filename": "living-room-01.jpg",
  "camera": "Canon EOS R5",
  "lens": "Canon RF 15-35mm f/2.8",
  "focal_length": "24mm",
  "aperture": "f/8",
  "shutter_speed": "1/60s",
  "iso": 400,
  "white_balance": "Auto",
  "dimensions": "8192x5464px",
  "file_size": "5.8 MB",
  "gps": {
    "latitude": 53.5511,
    "longitude": 9.9937
  }
}`}</pre>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E9E9E9] mt-auto">
        <div className="h-32"></div>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[#8E9094]">
            <div>© 2024 PIX.IMMO. Alle Rechte vorbehalten.</div>
            <div className="flex gap-6">
              <Link href="/impressum" className="hover:text-[#1A1A1C]">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-[#1A1A1C]">Datenschutz</Link>
              <Link href="/agb" className="hover:text-[#1A1A1C]">AGB</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
