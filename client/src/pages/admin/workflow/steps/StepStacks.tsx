import { useState } from 'react';
import { GripVertical, Film, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Stack } from '../UploadWorkflow';

interface StepStacksProps {
  stacks: Stack[];
  setStacks: (stacks: Stack[]) => void;
}

const ROOM_TYPES = [
  'Wohnzimmer', 'Küche', 'Schlafzimmer', 'Badezimmer', 'Flur', 'Arbeitszimmer/Büro',
  'Abstellraum', 'Kellerraum', 'Hauswirtschaftsraum', 'Balkon', 'Terrasse', 'Garten',
  'Dachterrasse', 'Dachboden', 'Wintergarten', 'Außenbereich', 'Hobbyraum',
  'Garage/Carport', 'Poolbereich', 'Wellness/Sauna', 'Fitnessraum',
  'Gemeinschaftsraum/Lobby', 'Konferenzraum', 'Gewerbefläche', 'Sonstiger Raum'
];

export function StepStacks({ stacks, setStacks }: StepStacksProps) {
  const handleRoomTypeChange = (stackId: string, roomType: string) => {
    setStacks(
      stacks.map((stack) =>
        stack.id === stackId ? { ...stack, roomType } : stack
      )
    );
  };

  const handleCommentChange = (stackId: string, comment: string) => {
    setStacks(
      stacks.map((stack) =>
        stack.id === stackId ? { ...stack, comment } : stack
      )
    );
  };

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Stapel & Raumtypen</h2>
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
            data-testid={`stack-${stack.id}`}
          >
            <div className="relative h-48 bg-[#E6E6E6] flex items-center justify-center">
              {stack.files[0]?.url && (
                <img
                  src={stack.files[0].url}
                  alt={stack.files[0].name}
                  className="max-w-full max-h-full object-contain"
                />
              )}
              
              <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded border border-[#C7C7C7] flex items-center gap-2">
                <GripVertical className="size-4 text-[#6F6F6F]" />
                <span className="text-sm">Stapel {index + 1}</span>
              </div>

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

              {stack.files.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded border border-[#C7C7C7] text-sm">
                  {stack.files.length} Dateien
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col gap-4">
              <div>
                <label className="block text-[#6F6F6F] mb-2 text-sm">
                  Raumtyp
                </label>
                <Select
                  value={stack.roomType}
                  onValueChange={(value) => handleRoomTypeChange(stack.id, value)}
                >
                  <SelectTrigger className="w-full border-[#C7C7C7]" data-testid={`select-roomtype-${stack.id}`}>
                    <SelectValue placeholder="Raumtyp wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((room) => (
                      <SelectItem key={room} value={room}>
                        {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!stack.roomType && (
                  <p className="text-[#D32F2F] mt-1 text-xs">
                    Bitte Raumtyp auswählen
                  </p>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-[#6F6F6F] mb-2 text-sm">
                  Kommentar (optional)
                </label>
                <Textarea
                  placeholder="Interne Notizen zu diesem Stapel..."
                  value={stack.comment || ''}
                  onChange={(e) => handleCommentChange(stack.id, e.target.value)}
                  className="min-h-[80px] border-[#C7C7C7] resize-none"
                  data-testid={`textarea-comment-${stack.id}`}
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
