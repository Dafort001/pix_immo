import { useState } from 'react';
import { Link } from 'wouter';
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Menu,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface RejectedImage {
  id: string;
  url: string;
  filename: string;
  comment: string;
  replaced?: boolean;
  newFile?: File;
}

export default function EditorRevision() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const jobId = 'JOB-2024-1105';

  const [rejectedImages, setRejectedImages] = useState<RejectedImage[]>([
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      filename: 'bathroom-01.jpg',
      comment: 'Fensterreflexion zu stark - bitte mit Polarisationsfilter neu aufnehmen',
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
      filename: 'bedroom-02.jpg',
      comment: 'Weißabgleich inkorrekt - zu warm',
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
      filename: 'living-room-03.jpg',
      comment: 'Perspektivkorrektur fehlt - vertikale Linien kippen',
    },
  ]);

  const handleFileSelect = (imageId: string, file: File) => {
    setRejectedImages(prev =>
      prev.map(img =>
        img.id === imageId
          ? { ...img, replaced: true, newFile: file }
          : img
      )
    );
    toast.success(`${file.name} erfolgreich ausgewählt`);
  };

  const handleUpload = (imageId: string) => {
    const image = rejectedImages.find(img => img.id === imageId);
    if (!image?.newFile) return;

    // Simulate upload
    toast.success('Neues Bild erfolgreich hochgeladen', {
      description: 'Status wurde auf "qc-pending" gesetzt',
    });

    // Remove from list after successful upload
    setTimeout(() => {
      setRejectedImages(prev => prev.filter(img => img.id !== imageId));
    }, 1000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, imageId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      handleFileSelect(imageId, imageFile);
    }
  };

  const replacedCount = rejectedImages.filter(img => img.replaced).length;
  const remainingCount = rejectedImages.filter(img => !img.replaced).length;

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
              <h1 className="text-2xl mb-1">Editor Revision</h1>
              <div className="text-sm text-[#8E9094]">Job-ID: {jobId}</div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-[#C94B38] text-white hover:bg-[#C94B38]">
                {rejectedImages.length} {rejectedImages.length === 1 ? 'Bild' : 'Bilder'} rejected
              </Badge>
              {replacedCount > 0 && (
                <Badge className="bg-[#64BF49] text-white hover:bg-[#64BF49]">
                  {replacedCount} ersetzt
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-8 w-full">
        {rejectedImages.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-[#64BF49] mx-auto mb-4" />
            <h2 className="text-2xl mb-2">Alle Korrekturen abgeschlossen</h2>
            <p className="text-[#8E9094]">Es gibt keine abgelehnten Bilder mehr.</p>
            <Link href="/admin-dashboard">
              <Button className="mt-6">Zurück zum Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rejectedImages.map((image) => (
              <div key={image.id} className="bg-white rounded-lg overflow-hidden">
                <div className="aspect-[4/3] relative bg-[#F8F9FA]">
                  <ImageWithFallback
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[#C94B38] text-white hover:bg-[#C94B38]">
                      Rejected
                    </Badge>
                  </div>
                  {image.replaced && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-[#64BF49] text-white hover:bg-[#64BF49]">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Ersetzt
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-2xl mb-2">{image.filename}</h3>

                  {/* QC Comment */}
                  <div className="bg-[#FEF3F2] border border-[#C94B38]/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-[#C94B38] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm mb-1">QC Kommentar:</div>
                        <div className="text-sm text-[#8E9094]">{image.comment}</div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Area */}
                  {!image.replaced ? (
                    <div
                      className="border-2 border-dashed border-[#E9E9E9] rounded-lg p-8 text-center hover:border-[#8E9094] transition-colors cursor-pointer"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, image.id)}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleFileSelect(image.id, file);
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-10 w-10 text-[#8E9094] mx-auto mb-3" />
                      <div className="text-sm mb-1">Neues Bild hochladen</div>
                      <div className="text-xs text-[#8E9094]">
                        Klicken oder Drag & Drop
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-[#F0FDF4] border border-[#64BF49]/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-[#64BF49]" />
                            <div>
                              <div className="text-sm">{image.newFile?.name}</div>
                              <div className="text-xs text-[#8E9094]">
                                {(image.newFile?.size || 0) / 1024 / 1024 < 1
                                  ? `${((image.newFile?.size || 0) / 1024).toFixed(0)} KB`
                                  : `${((image.newFile?.size || 0) / 1024 / 1024).toFixed(1)} MB`}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setRejectedImages(prev =>
                                prev.map(img =>
                                  img.id === image.id
                                    ? { ...img, replaced: false, newFile: undefined }
                                    : img
                                )
                              );
                            }}
                          >
                            <X className="h-5 w-5 text-[#8E9094] hover:text-[#1A1A1C]" />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-[#64BF49] hover:bg-[#64BF49]/90"
                          onClick={() => handleUpload(image.id)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Hochladen
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleFileSelect(image.id, file);
                            };
                            input.click();
                          }}
                        >
                          Ändern
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
