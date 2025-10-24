import { useState } from 'react';
import { Check, MessageSquare, Sparkles, ArrowLeft } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Photo {
  id: string;
  url: string;
  selected: boolean;
  style: 'Standard' | 'HDR' | 'Natürlich' | 'Professionell';
  comment: string;
}

const mockPhotos: Photo[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    selected: true,
    style: 'HDR',
    comment: '',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
    selected: true,
    style: 'Professionell',
    comment: '',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400',
    selected: true,
    style: 'HDR',
    comment: '',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400',
    selected: false,
    style: 'Standard',
    comment: '',
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=400',
    selected: true,
    style: 'Natürlich',
    comment: '',
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400',
    selected: false,
    style: 'Standard',
    comment: '',
  },
];

export function GallerySelectionScreen() {
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const selectedCount = photos.filter(p => p.selected).length;
  const basePrice = 3.5; // € per photo
  const totalPrice = selectedCount * basePrice;

  const toggleSelection = (id: string) => {
    setPhotos(photos.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const updateStyle = (id: string, style: Photo['style']) => {
    setPhotos(photos.map(p => 
      p.id === id ? { ...p, style } : p
    ));
  };

  const updateComment = (id: string, comment: string) => {
    setPhotos(photos.map(p => 
      p.id === id ? { ...p, comment } : p
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft strokeWidth={1.5} className="w-4 h-4 mr-2" />
                Zurück
              </Button>
              <div>
                <h1 style={{ fontSize: '24px' }} className="text-gray-900">
                  Foto-Auswahl
                </h1>
                <p style={{ fontSize: '14px' }} className="text-gray-600">
                  Einfamilienhaus Musterstraße 12
                </p>
              </div>
            </div>
            <Badge className="bg-[#4A5849]/10 text-[#4A5849] border-[#4A5849]/30" style={{ fontSize: '14px' }}>
              {selectedCount} von {photos.length} ausgewählt
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Photo Grid */}
        <main className="flex-1 p-6 lg:pr-0">
          <div className="max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                    photo.selected
                      ? 'ring-4 ring-[#4A5849] ring-offset-2'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  onClick={() => {
                    toggleSelection(photo.id);
                    setSelectedPhoto(photo);
                  }}
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${photo.id}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Selection Checkbox */}
                  <div
                    className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      photo.selected
                        ? 'bg-[#4A5849] border-[#4A5849]'
                        : 'bg-white/80 border-gray-300'
                    }`}
                  >
                    {photo.selected && <Check strokeWidth={2} className="w-4 h-4 text-white" />}
                  </div>

                  {/* Style Badge */}
                  <Badge
                    className="absolute bottom-2 left-2 bg-white/90 text-gray-700 border-gray-200"
                    style={{ fontSize: '12px' }}
                  >
                    {photo.style}
                  </Badge>

                  {/* Comment Indicator */}
                  {photo.comment && (
                    <div className="absolute bottom-2 right-2 bg-white/90 rounded-full p-1.5">
                      <MessageSquare strokeWidth={1.5} className="w-3 h-3 text-[#4A5849]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Live Price Panel (Sticky) */}
        <aside className="w-96 border-l border-gray-200 bg-gray-50 p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto hidden lg:block">
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontSize: '14px' }} className="text-gray-600">
                  Ausgewählte Fotos
                </span>
                <span style={{ fontSize: '24px' }} className="text-gray-900">
                  {selectedCount}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <span style={{ fontSize: '14px' }} className="text-gray-600">
                  Preis pro Foto
                </span>
                <span style={{ fontSize: '16px' }} className="text-gray-900">
                  {basePrice.toFixed(2)} €
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '16px' }} className="text-gray-900">
                  Gesamtpreis
                </span>
                <span style={{ fontSize: '28px' }} className="text-[#4A5849]">
                  {totalPrice.toFixed(2)} €
                </span>
              </div>
            </div>

            {/* Photo Details (if selected) */}
            {selectedPhoto && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 style={{ fontSize: '16px' }} className="text-gray-900 mb-4 flex items-center">
                  <Sparkles strokeWidth={1.5} className="w-4 h-4 mr-2 text-[#4A5849]" />
                  Bearbeitungsstil
                </h3>
                <Select
                  value={selectedPhoto.style}
                  onValueChange={(value) => updateStyle(selectedPhoto.id, value as Photo['style'])}
                >
                  <SelectTrigger style={{ fontSize: '14px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="HDR">HDR (High Dynamic Range)</SelectItem>
                    <SelectItem value="Natürlich">Natürlich</SelectItem>
                    <SelectItem value="Professionell">Professionell</SelectItem>
                  </SelectContent>
                </Select>

                <div className="mt-4">
                  <label style={{ fontSize: '14px' }} className="text-gray-700 mb-2 block">
                    Kommentar (optional)
                  </label>
                  <Textarea
                    value={selectedPhoto.comment}
                    onChange={(e) => updateComment(selectedPhoto.id, e.target.value)}
                    placeholder="Besondere Wünsche für dieses Foto..."
                    rows={3}
                    style={{ fontSize: '14px' }}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              className="w-full bg-[#4A5849] hover:bg-[#3A4839] text-white"
              size="lg"
              disabled={selectedCount === 0}
              style={{ fontSize: '16px' }}
            >
              Weiter zur Zahlung
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}