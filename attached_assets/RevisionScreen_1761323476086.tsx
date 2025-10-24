import { useState } from 'react';
import { ArrowLeft, AlertCircle, Check, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';

interface RevisionPhoto {
  id: string;
  url: string;
  roomType: string;
  selected: boolean;
  comment: string;
}

const mockPhotos: RevisionPhoto[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    roomType: 'Wohnzimmer',
    selected: false,
    comment: '',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
    roomType: 'Küche',
    selected: false,
    comment: '',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400',
    roomType: 'Schlafzimmer',
    selected: false,
    comment: '',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400',
    roomType: 'Badezimmer',
    selected: false,
    comment: '',
  },
];

const revisionOptions = [
  { id: 'brightness', label: 'Helligkeit anpassen' },
  { id: 'color', label: 'Farbkorrektur' },
  { id: 'crop', label: 'Zuschnitt ändern' },
  { id: 'perspective', label: 'Perspektive korrigieren' },
  { id: 'remove', label: 'Objekte entfernen' },
  { id: 'enhance', label: 'Details verstärken' },
];

export function RevisionScreen() {
  const [photos, setPhotos] = useState<RevisionPhoto[]>(mockPhotos);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [generalComment, setGeneralComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePhotoSelection = (id: string) => {
    setPhotos(photos.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const updatePhotoComment = (id: string, comment: string) => {
    setPhotos(photos.map(p => 
      p.id === id ? { ...p, comment } : p
    ));
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const selectedPhotos = photos.filter(p => p.selected);
  const hasComments = selectedPhotos.some(p => p.comment) || generalComment;
  const canSubmit = selectedPhotos.length > 0 && (selectedOptions.length > 0 || hasComments);

  const handleSubmit = () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`Revision-Anfrage gesendet!\n\n${selectedPhotos.length} Fotos ausgewählt\n${selectedOptions.length} Optionen gewählt`);
    }, 1500);
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
                  Revision anfordern
                </h1>
                <p style={{ fontSize: '14px' }} className="text-gray-600">
                  Einfamilienhaus Musterstraße 12
                </p>
              </div>
            </div>
            <Badge className="bg-amber-50 text-amber-600 border-amber-200" style={{ fontSize: '14px' }}>
              <AlertCircle strokeWidth={1.5} className="w-4 h-4 mr-1" />
              Kostenlos bis 30.10.2025
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Photo Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <AlertCircle strokeWidth={1.5} className="w-5 h-5 text-[#4A5849] mt-0.5 flex-shrink-0" />
                <div>
                  <h2 style={{ fontSize: '16px' }} className="text-gray-900 mb-1">
                    So funktioniert's
                  </h2>
                  <ol style={{ fontSize: '14px' }} className="text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Wähle die Fotos aus, die überarbeitet werden sollen</li>
                    <li>Beschreibe deine gewünschten Änderungen</li>
                    <li>Wir bearbeiten die Fotos innerhalb von 24 Stunden</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 style={{ fontSize: '18px' }} className="text-gray-900 mb-4">
                Welche Fotos sollen überarbeitet werden?
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id}>
                    <div
                      className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
                        photo.selected
                          ? 'border-[#4A5849] ring-2 ring-[#4A5849]/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => togglePhotoSelection(photo.id)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.roomType}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Selection Checkbox */}
                      <div
                        className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          photo.selected
                            ? 'bg-[#4A5849] border-[#4A5849]'
                            : 'bg-white/90 border-gray-300'
                        }`}
                      >
                        {photo.selected && <Check strokeWidth={2} className="w-4 h-4 text-white" />}
                      </div>

                      {/* Room Badge */}
                      <Badge
                        className="absolute bottom-2 left-2 bg-white/90 text-gray-700 border-gray-200"
                        style={{ fontSize: '12px' }}
                      >
                        {photo.roomType}
                      </Badge>

                      {/* Comment Indicator */}
                      {photo.comment && (
                        <div className="absolute bottom-2 right-2 bg-white/90 rounded-full p-1.5">
                          <MessageSquare strokeWidth={1.5} className="w-3 h-3 text-[#4A5849]" />
                        </div>
                      )}
                    </div>

                    {/* Photo-specific Comment */}
                    {photo.selected && (
                      <div className="mt-3">
                        <Textarea
                          value={photo.comment}
                          onChange={(e) => updatePhotoComment(photo.id, e.target.value)}
                          placeholder="Spezifische Änderungen für dieses Foto..."
                          rows={2}
                          style={{ fontSize: '14px' }}
                          className="resize-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* General Comment */}
            {selectedPhotos.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 style={{ fontSize: '18px' }} className="text-gray-900 mb-4">
                  Allgemeine Anmerkungen
                </h2>
                <Textarea
                  value={generalComment}
                  onChange={(e) => setGeneralComment(e.target.value)}
                  placeholder="Beschreibe hier übergreifende Änderungswünsche, die für alle ausgewählten Fotos gelten..."
                  rows={4}
                  style={{ fontSize: '14px' }}
                  className="resize-none"
                />
              </div>
            )}
          </div>

          {/* Sidebar - Options & Submit */}
          <div className="lg:col-span-1 space-y-6">
            {/* Revision Options */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h2 style={{ fontSize: '18px' }} className="text-gray-900 mb-4">
                Gewünschte Änderungen
              </h2>

              <div className="space-y-3 mb-6">
                {revisionOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedOptions.includes(option.id)
                        ? 'border-[#4A5849] bg-[#4A5849]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <Checkbox
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={() => toggleOption(option.id)}
                    />
                    <label
                      htmlFor={option.id}
                      style={{ fontSize: '14px' }}
                      className="text-gray-700 cursor-pointer flex-1"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="pt-6 border-t border-gray-200 space-y-3 mb-6">
                <div className="flex justify-between">
                  <span style={{ fontSize: '14px' }} className="text-gray-600">
                    Fotos
                  </span>
                  <span style={{ fontSize: '14px' }} className="text-gray-900">
                    {selectedPhotos.length} ausgewählt
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '14px' }} className="text-gray-600">
                    Änderungen
                  </span>
                  <span style={{ fontSize: '14px' }} className="text-gray-900">
                    {selectedOptions.length} Optionen
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '14px' }} className="text-gray-600">
                    Kosten
                  </span>
                  <span style={{ fontSize: '16px' }} className="text-green-600">
                    Kostenlos
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                className="w-full bg-[#4A5849] hover:bg-[#3A4839] text-white"
                size="lg"
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                style={{ fontSize: '16px' }}
              >
                {isSubmitting ? (
                  'Wird gesendet...'
                ) : (
                  <>
                    <Check strokeWidth={1.5} className="w-4 h-4 mr-2" />
                    Revision anfragen
                  </>
                )}
              </Button>

              {!canSubmit && selectedPhotos.length > 0 && (
                <p style={{ fontSize: '12px' }} className="text-gray-500 text-center mt-3">
                  Bitte wähle mindestens eine Änderungsoption oder füge einen Kommentar hinzu
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-gray-100 rounded-lg p-5">
              <h3 style={{ fontSize: '14px' }} className="text-gray-900 mb-2">
                Revisionen inklusive
              </h3>
              <ul style={{ fontSize: '12px' }} className="text-gray-600 space-y-1">
                <li className="flex items-start">
                  <Check strokeWidth={1.5} className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Unbegrenzte Revisionen innerhalb 7 Tagen
                </li>
                <li className="flex items-start">
                  <Check strokeWidth={1.5} className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Bearbeitung innerhalb 24 Stunden
                </li>
                <li className="flex items-start">
                  <Check strokeWidth={1.5} className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Keine zusätzlichen Kosten
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}