import { Download, FileText, Image, Check, Star, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { useState } from 'react';

interface DeliveredPhoto {
  id: string;
  url: string;
  roomType: string;
  altText: string;
  fileSize: string;
  selected: boolean;
}

const mockPhotos: DeliveredPhoto[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    roomType: 'Wohnzimmer',
    altText: 'Modernes Wohnzimmer mit großen Fenstern und heller Einrichtung',
    fileSize: '4.2 MB',
    selected: false,
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
    roomType: 'Küche',
    altText: 'Offene Küche mit Kochinsel und modernen Geräten',
    fileSize: '3.8 MB',
    selected: false,
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400',
    roomType: 'Schlafzimmer',
    altText: 'Gemütliches Schlafzimmer mit Doppelbett und Parkettboden',
    fileSize: '3.5 MB',
    selected: false,
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400',
    roomType: 'Badezimmer',
    altText: 'Luxuriöses Badezimmer mit freistehender Badewanne',
    fileSize: '4.0 MB',
    selected: false,
  },
];

export function DeliveryScreen() {
  const [photos, setPhotos] = useState<DeliveredPhoto[]>(mockPhotos);
  const [showRating, setShowRating] = useState(true);

  const toggleSelection = (id: string) => {
    setPhotos(photos.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const toggleAll = () => {
    const allSelected = photos.every(p => p.selected);
    setPhotos(photos.map(p => ({ ...p, selected: !allSelected })));
  };

  const selectedCount = photos.filter(p => p.selected).length;
  const allSelected = photos.every(p => p.selected);
  const totalSize = photos
    .filter(p => p.selected)
    .reduce((sum, p) => sum + parseFloat(p.fileSize), 0);

  const downloadSelected = () => {
    alert(`Download gestartet: ${selectedCount} Fotos (${totalSize.toFixed(1)} MB)`);
  };

  const downloadAll = () => {
    alert('Download aller Fotos gestartet!');
  };

  const exportAltTexts = () => {
    const altTexts = photos.map(p => `${p.roomType}: ${p.altText}`).join('\n\n');
    const blob = new Blob([altTexts], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alt-texte.txt';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft strokeWidth={1.5} className="w-4 h-4 mr-2" />
                Zurück
              </Button>
              <div>
                <h1 style={{ fontSize: '24px' }} className="text-gray-900">
                  Ihre bearbeiteten Fotos
                </h1>
                <p style={{ fontSize: '14px' }} className="text-gray-600">
                  Einfamilienhaus Musterstraße 12
                </p>
              </div>
            </div>
            <Badge className="bg-green-50 text-green-600 border-green-200" style={{ fontSize: '14px' }}>
              <Check strokeWidth={1.5} className="w-4 h-4 mr-1" />
              Fertig
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message + Rating */}
        {showRating && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-green-500 rounded-full p-2">
                  <Check strokeWidth={2} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px' }} className="text-gray-900 mb-1">
                    Ihre Fotos sind bereit! 🎉
                  </h2>
                  <p style={{ fontSize: '14px' }} className="text-gray-600 mb-4">
                    Alle {photos.length} Fotos wurden professionell bearbeitet und stehen zum Download bereit.
                  </p>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '14px' }} className="text-gray-700">
                      Wie zufrieden sind Sie?
                    </span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className="text-gray-300 hover:text-yellow-400 transition-colors"
                      >
                        <Star strokeWidth={1.5} className="w-5 h-5" fill="currentColor" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowRating(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Photo Gallery */}
          <div className="lg:col-span-2 space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="select-all"
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                  />
                  <label
                    htmlFor="select-all"
                    style={{ fontSize: '14px' }}
                    className="text-gray-700 cursor-pointer"
                  >
                    Alle auswählen ({photos.length})
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportAltTexts}
                    style={{ fontSize: '14px' }}
                  >
                    <FileText strokeWidth={1.5} className="w-4 h-4 mr-2" />
                    Alt-Texte exportieren
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAll}
                    style={{ fontSize: '14px' }}
                  >
                    <Download strokeWidth={1.5} className="w-4 h-4 mr-2" />
                    Alle herunterladen
                  </Button>
                </div>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`bg-white rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
                    photo.selected
                      ? 'border-[#4A5849] ring-2 ring-[#4A5849]/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleSelection(photo.id)}
                >
                  <div className="aspect-video relative bg-gray-100">
                    <img
                      src={photo.url}
                      alt={photo.altText}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute top-3 left-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        photo.selected
                          ? 'bg-[#4A5849] border-[#4A5849]'
                          : 'bg-white/90 border-gray-300'
                      }`}
                    >
                      {photo.selected && <Check strokeWidth={2} className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" style={{ fontSize: '12px' }}>
                        {photo.roomType}
                      </Badge>
                      <span style={{ fontSize: '12px' }} className="text-gray-500">
                        {photo.fileSize}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px' }} className="text-gray-600 line-clamp-2">
                      {photo.altText}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Download & Invoice */}
          <div className="lg:col-span-1 space-y-6">
            {/* Download Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h2 style={{ fontSize: '18px' }} className="text-gray-900 mb-4">
                Download
              </h2>
              
              {selectedCount > 0 ? (
                <>
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between">
                      <span style={{ fontSize: '14px' }} className="text-gray-600">
                        Ausgewählt
                      </span>
                      <span style={{ fontSize: '14px' }} className="text-gray-900">
                        {selectedCount} Fotos
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ fontSize: '14px' }} className="text-gray-600">
                        Dateigröße
                      </span>
                      <span style={{ fontSize: '14px' }} className="text-gray-900">
                        {totalSize.toFixed(1)} MB
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-[#4A5849] hover:bg-[#3A4839] text-white"
                    size="lg"
                    onClick={downloadSelected}
                    style={{ fontSize: '16px' }}
                  >
                    <Download strokeWidth={1.5} className="w-4 h-4 mr-2" />
                    Auswahl herunterladen
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Image strokeWidth={1.5} className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p style={{ fontSize: '14px' }} className="text-gray-500">
                    Wähle Fotos aus, um sie herunterzuladen
                  </p>
                </div>
              )}
            </div>

            {/* Invoice */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 style={{ fontSize: '18px' }} className="text-gray-900 mb-4">
                Rechnung
              </h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span style={{ fontSize: '14px' }} className="text-gray-600">
                    Rechnungsnr.
                  </span>
                  <span style={{ fontSize: '14px' }} className="text-gray-900">
                    RE-2025-001234
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '14px' }} className="text-gray-600">
                    Datum
                  </span>
                  <span style={{ fontSize: '14px' }} className="text-gray-900">
                    23.10.2025
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span style={{ fontSize: '16px' }} className="text-gray-900">
                    Betrag
                  </span>
                  <span style={{ fontSize: '16px' }} className="text-gray-900">
                    84,00 €
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                style={{ fontSize: '14px' }}
              >
                <FileText strokeWidth={1.5} className="w-4 h-4 mr-2" />
                Rechnung herunterladen
              </Button>
            </div>

            {/* Support */}
            <div className="bg-gray-100 rounded-lg p-5">
              <h3 style={{ fontSize: '14px' }} className="text-gray-900 mb-2">
                Nicht zufrieden?
              </h3>
              <p style={{ fontSize: '12px' }} className="text-gray-600 mb-3">
                Fordern Sie kostenlose Revisionen innerhalb von 7 Tagen an.
              </p>
              <Button variant="outline" size="sm" className="w-full" style={{ fontSize: '14px' }}>
                Revision anfordern
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}