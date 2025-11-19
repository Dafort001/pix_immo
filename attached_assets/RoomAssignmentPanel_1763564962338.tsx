import { useState } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { RoomTypeDropdown } from "./RoomTypeDropdown";
import { Separator } from "./ui/separator";
import { AlertCircle } from "lucide-react";

interface RoomAssignmentPanelProps {
  selectedCount: number;
  onApplyRoomType: (roomType: string) => void;
  onMarkForDeletion: (marked: boolean) => void;
  onMarkUncertain: (marked: boolean) => void;
  onShowFilenamePreview: () => void;
  onApplyRenaming: () => void;
  onResetSelection: () => void;
}

export function RoomAssignmentPanel({
  selectedCount,
  onApplyRoomType,
  onMarkForDeletion,
  onMarkUncertain,
  onShowFilenamePreview,
  onApplyRenaming,
  onResetSelection,
}: RoomAssignmentPanelProps) {
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [markDeletion, setMarkDeletion] = useState(false);
  const [markUncertain, setMarkUncertain] = useState(false);

  const handleApplyRoomType = () => {
    if (selectedRoomType) {
      onApplyRoomType(selectedRoomType);
    }
  };

  const handleMarkDeletionChange = (checked: boolean) => {
    setMarkDeletion(checked);
    onMarkForDeletion(checked);
  };

  const handleMarkUncertainChange = (checked: boolean) => {
    setMarkUncertain(checked);
    onMarkUncertain(checked);
  };

  return (
    <div className="w-80 bg-white border-l p-6 flex flex-col gap-6 overflow-y-auto">
      {/* Section A: Room Type Selection */}
      <div>
        <h3 className="mb-3">Raumtyp auswählen</h3>
        
        <RoomTypeDropdown
          value={selectedRoomType}
          onValueChange={setSelectedRoomType}
        />
        
        <Button
          onClick={handleApplyRoomType}
          disabled={!selectedRoomType || selectedCount === 0}
          className="w-full mt-3 bg-orange-500 hover:bg-orange-600"
        >
          Auf ausgewählte Stacks anwenden
        </Button>
        
        {selectedCount > 0 && (
          <p className="text-muted-foreground mt-2 text-center">
            {selectedCount} Stack{selectedCount !== 1 ? "s" : ""} ausgewählt
          </p>
        )}
      </div>

      <Separator />

      {/* Section B: Markings */}
      <div>
        <h3 className="mb-3">Markierungen</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="mark-deletion"
              checked={markDeletion}
              onCheckedChange={handleMarkDeletionChange}
              disabled={selectedCount === 0}
            />
            <label
              htmlFor="mark-deletion"
              className="flex-1 cursor-pointer"
            >
              Zur Löschung markieren
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <Checkbox
              id="mark-uncertain"
              checked={markUncertain}
              onCheckedChange={handleMarkUncertainChange}
              disabled={selectedCount === 0}
            />
            <label
              htmlFor="mark-uncertain"
              className="flex-1 cursor-pointer"
            >
              Unsicher
            </label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Section C: Actions */}
      <div>
        <h3 className="mb-3">Aktionen</h3>
        
        <div className="space-y-2">
          <Button
            onClick={onShowFilenamePreview}
            variant="outline"
            className="w-full"
          >
            Dateinamen-Vorschau anzeigen
          </Button>
          
          <Button
            onClick={onApplyRenaming}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Umbenennung anwenden
          </Button>
          
          <Button
            onClick={onResetSelection}
            variant="ghost"
            className="w-full"
            disabled={selectedCount === 0}
          >
            Reset Auswahl
          </Button>
        </div>
      </div>

      <Separator />

      {/* Section D: Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
        <AlertCircle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-blue-900">
          Änderungen werden erst nach "Umbenennung anwenden" gespeichert.
        </p>
      </div>
    </div>
  );
}
