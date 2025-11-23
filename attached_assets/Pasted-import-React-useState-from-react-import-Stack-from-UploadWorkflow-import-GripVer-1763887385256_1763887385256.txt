import React, { useState } from 'react';
import { Stack } from '../UploadWorkflow';
import { GripVertical, Film, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

interface StepStacksProps {
  stacks: Stack[];
  setStacks: (stacks: Stack[]) => void;
}

const ROOM_TYPES = {
  'Wohnräume': [
    'Wohnzimmer',
    'Esszimmer',
    'Offener Wohn-/Essbereich',
    'Kaminzimmer',
    'Familienzimmer',
    'TV-/Medienzimmer',
    'Hobbyraum',
  ],
  'Schlafräume': [
    'Schlafzimmer',
    'Kinderzimmer',
    'Gästezimmer',
    'Master Bedroom',
    'Ankleidezimmer',
  ],
  'Küche': [
    'Küche',
    'Pantryküche',
    'Wohnküche',
  ],
  'Bäder & Sanitär': [
    'Bad',
    'Gäste-WC',
    'Masterbad',
    'Duschbad',
    'Wannenbad',
    'WC separat',
    'Hauswirtschaftsraum / Laundry',
  ],
  'Flure & Zugang': [
    'Flur',
    'Diele',
    'Eingangsbereich / Entrée',
    'Treppenhaus',
    'Galerie / Luftraum',
  ],
  'Arbeits- & Funktionsräume': [
    'Büro / Arbeitszimmer',
    'Studio / Atelier',
    'Werkraum',
    'Technikraum',
    'Serverraum',
    'Abstellraum',
    'Vorratskammer / Speisekammer',
    'Kellerraum',
    'Waschküche',
    'Heizungsraum',
  ],
  'Außenräume (Bodenlevel)': [
    'Balkon',
    'Terrasse',
    'Garten',
    'Hof / Patio',
    'Carport',
    'Garage',
    'Einfahrt',
    'Vorgarten',
    'Grundstück / Außenbereich allgemein',
  ],
  'Sonderbereiche & Immobilienkategorien': [
    'Wintergarten',
    'Loggia',
    'Dachterrasse',
    'Dachboden',
    'Poolbereich',
    'Wellnessbereich / Sauna',
    'Fitnessraum',
    'Veranstaltungsraum',
    'Gemeinschaftsraum (Mehrfamilienhaus)',
    'Müllraum',
    'Fahrradkeller',
    'Lagerfläche',
    'Gewerbefläche / Showroom',
    'Verkaufsfläche',
    'Lagerhalle',
    'Produktionsfläche',
    'Treppenpodest / Zwischenebene',
    'Lobby / Empfang',
    'Konferenzraum',
  ],
  '360°-Spezifische Räume': [
    'Innenraum 360°',
    'Außenbereich 360°',
    'Drohne 360° (Bodenlevel / niedrig)',
    'Drohne 360° (hoch)',
    'Grundstück Panorama',
    'Straßenansicht Panorama',
    'Aussichtspunkt Panorama',
    'Sonstiger Raum (Freie Eingabe)',
  ],
};

export function StepStacks({ stacks, setStacks }: StepStacksProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleRoomTypeChange = (stackId: string, roomType: string) => {
    setStacks(
      stacks.map(stack =>
        stack.id === stackId ? { ...stack, roomType } : stack
      )
    );
  };

  const handleCommentChange = (stackId: string, comment: string) => {
    setStacks(
      stacks.map(stack =>
        stack.id === stackId ? { ...stack, comment } : stack
      )
    );
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newStacks = [...stacks];
    const draggedItem = newStacks[draggedIndex];
    newStacks.splice(draggedIndex, 1);
    newStacks.splice(dropIndex, 0, draggedItem);

    setStacks(newStacks);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="mb-2">Stapel & Raumtypen</h2>
        <p className="text-[#6F6F6F] mb-6">
          Ihre Aufnahmen wurden automatisch in Stapel gruppiert.
          Sie können den Raumtyp zuweisen und Kommentare hinzufügen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stacks.map((stack, index) => (
          <div
            key={stack.id}
            className="border border-[#C7C7C7] rounded-lg bg-white overflow-hidden flex flex-col"
          >
            {/* Thumbnail Preview */}
            <div className="relative h-48 bg-[#E6E6E6] flex items-center justify-center">
              {stack.files[0].type.includes('image') ? (
                <img
                  src={stack.files[0].url}
                  alt={stack.files[0].name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : stack.files[0].type.includes('video') ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black">
                  <Film className="size-12 text-white mb-2" />
                  <span className="text-white text-sm">Video</span>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="size-12 text-[#6F6F6F]" />
                </div>
              )}
              
              {/* Stack Badge */}
              <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded border border-[#C7C7C7] flex items-center gap-2">
                <GripVertical className="size-4 text-[#6F6F6F]" />
                <span>Stapel {index + 1}</span>
              </div>

              {/* Stack Type Badge */}
              <div className="absolute top-3 right-3 bg-black text-white px-3 py-1 rounded text-sm">
                {stack.stackType === 'single' && 'Einzelaufnahme'}
                {stack.stackType === 'bracket3' && '3er-Bracket'}
                {stack.stackType === 'bracket5' && '5er-Bracket'}
                {stack.stackType === 'video' && 'Video'}
                {stack.stackType === 'pano360' && (
                  <span className="flex items-center gap-1">
                    <Globe className="size-3" />
                    360°
                  </span>
                )}
              </div>

              {/* File Count */}
              {stack.files.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded border border-[#C7C7C7]">
                  {stack.files.length} Dateien
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="p-4 flex-1 flex flex-col gap-4">
              {/* Room Type Selection */}
              <div>
                <label className="block text-[#6F6F6F] mb-2 text-sm">
                  Raumtyp
                </label>
                <Select
                  value={stack.roomType}
                  onValueChange={value => handleRoomTypeChange(stack.id, value)}
                >
                  <SelectTrigger className="w-full border-[#C7C7C7]">
                    <SelectValue placeholder="Raumtyp wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROOM_TYPES).map(([category, rooms]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs text-[#6F6F6F] font-medium">
                          {category}
                        </div>
                        {rooms.map(room => (
                          <SelectItem key={room} value={room}>
                            {room}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                {!stack.roomType && (
                  <p className="text-[#D32F2F] mt-1 text-xs">
                    Bitte Raumtyp auswählen
                  </p>
                )}
              </div>

              {/* Comment Field */}
              <div className="flex-1">
                <label className="block text-[#6F6F6F] mb-2 text-sm">
                  Kommentar (optional)
                </label>
                <Textarea
                  placeholder="Interne Notizen zu diesem Stapel..."
                  value={(stack as any).comment || ''}
                  onChange={e => handleCommentChange(stack.id, e.target.value)}
                  className="min-h-[80px] border-[#C7C7C7] resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {stacks.length === 0 && (
        <div className="text-center py-12 text-[#6F6F6F]">
          <p>Keine Stapel vorhanden. Bitte laden Sie zuerst Dateien hoch.</p>
        </div>
      )}
    </div>
  );
}