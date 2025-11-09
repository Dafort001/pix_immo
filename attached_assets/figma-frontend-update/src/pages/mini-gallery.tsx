import { useState } from 'react';
import { Link } from 'wouter';
import {
  Check,
  MessageSquare,
  Pen,
  Send,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface GalleryImage {
  id: string;
  url: string;
  filename: string;
  approved: boolean;
  comment?: string;
}

export default function MiniGallery() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);
  const [comment, setComment] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const [images, setImages] = useState<GalleryImage[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', filename: 'living-room-01.jpg', approved: true },
    { id: '2', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', filename: 'kitchen-01.jpg', approved: false },
    { id: '3', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3', filename: 'bedroom-01.jpg', approved: false },
    { id: '4', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', filename: 'bathroom-01.jpg', approved: true },
    { id: '5', url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b', filename: 'exterior-01.jpg', approved: false },
    { id: '6', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea', filename: 'living-room-02.jpg', approved: true },
    { id: '7', url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc', filename: 'kitchen-02.jpg', approved: false },
    { id: '8', url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d', filename: 'bedroom-02.jpg', approved: false },
  ]);

  const toggleApproval = (imageId: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, approved: !img.approved } : img
      )
    );
  };

  const addComment = (imageId: string, commentText: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, comment: commentText } : img
      )
    );
    setComment('');
    setActiveImage(null);
    toast.success('Kommentar hinzugefügt');
  };

  const filteredImages = images.filter((img) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'approved') return img.approved;
    if (selectedFilter === 'pending') return !img.approved;
    return true;
  });

  const approvedCount = images.filter((img) => img.approved).length;
  const totalCount = images.length;

  const handleSendToRedaktion = () => {
    toast.success('An Redaktion gesendet', {
      description: `${approvedCount} von ${totalCount} Bildern wurden freigegeben.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
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
              <Link href="/dashboard">
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
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full justify-start">Abmelden</Button>
            </Link>
          </nav>
        </div>
      )}

      {/* Beta Badge & Title */}
      <div className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl">Mini Upload Gallery</h1>
              <Badge variant="outline" className="border-[#74A4EA] text-[#74A4EA]">
                BETA
              </Badge>
            </div>
            <div className="text-sm text-[#8E9094]">
              Schnelles Kundenfeedback-Tool
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              Alle ({totalCount})
            </Button>
            <Button
              variant={selectedFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('pending')}
              className={selectedFilter === 'pending' ? 'bg-[#C9B55A] hover:bg-[#C9B55A]/90' : ''}
            >
              Noch prüfen ({totalCount - approvedCount})
            </Button>
            <Button
              variant={selectedFilter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('approved')}
              className={selectedFilter === 'approved' ? 'bg-[#64BF49] hover:bg-[#64BF49]/90' : ''}
            >
              Freigegeben ({approvedCount})
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {filteredImages.map((image) => (
            <div key={image.id} className="bg-white rounded overflow-hidden group">
              <div className="aspect-[4/3] relative">
                <ImageWithFallback
                  src={image.url}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={image.approved}
                    onCheckedChange={() => toggleApproval(image.id)}
                    className="bg-white border-2 data-[state=checked]:bg-[#64BF49] data-[state=checked]:border-[#64BF49]"
                  />
                </div>
                {image.approved && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-[#64BF49] text-white hover:bg-[#64BF49]">
                      <Check className="h-3 w-3 mr-1" />
                      Freigegeben
                    </Badge>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white"
                    onClick={() => {
                      setActiveImage(image);
                      setComment(image.comment || '');
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white"
                    onClick={() => {
                      setIsDrawing(true);
                      setActiveImage(image);
                    }}
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="text-sm truncate mb-1">{image.filename}</div>
                {image.comment && (
                  <div className="text-xs text-[#8E9094] truncate">
                    💬 {image.comment}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="bg-white border-t border-[#E9E9E9] sticky bottom-0">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[#8E9094]">
              {approvedCount} von {totalCount} Bildern freigegeben
            </div>
            <Button
              className="w-full sm:w-auto bg-[#64BF49] hover:bg-[#64BF49]/90"
              onClick={handleSendToRedaktion}
              disabled={approvedCount === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              An Redaktion senden
            </Button>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      {activeImage && !isDrawing && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl">Kommentar</h3>
              <button onClick={() => setActiveImage(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-sm text-[#8E9094] mb-4">{activeImage.filename}</div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Kommentar hinzufügen..."
              className="mb-4 min-h-[120px]"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => addComment(activeImage.id, comment)}
                disabled={!comment.trim()}
              >
                Speichern
              </Button>
              <Button variant="outline" onClick={() => setActiveImage(null)}>
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Drawing Tool Modal (Placeholder) */}
      {isDrawing && activeImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsDrawing(false);
            setActiveImage(null);
          }}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#E9E9E9] flex items-center justify-between">
              <h3 className="text-2xl">Marker-Tool</h3>
              <button
                onClick={() => {
                  setIsDrawing(false);
                  setActiveImage(null);
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center bg-[#F8F9FA] p-8">
              <div className="relative">
                <img
                  src={activeImage.url}
                  alt={activeImage.filename}
                  className="max-w-full max-h-[60vh] object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Badge className="bg-[#74A4EA] text-white">
                    Zeichentool in Entwicklung
                  </Badge>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#E9E9E9] flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  toast.success('Marker gespeichert');
                  setIsDrawing(false);
                  setActiveImage(null);
                }}
              >
                Speichern
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDrawing(false);
                  setActiveImage(null);
                }}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}

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
