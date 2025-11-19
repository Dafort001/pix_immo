import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RoomTypeDropdown } from "./RoomTypeDropdown";
import { Separator } from "@/components/ui/separator";
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
      setSelectedRoomType("");
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
    <div className="w-80 bg-card border-l p-6 flex flex-col gap-6 overflow-y-auto">
      {/* Section A: Room Type Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Raumtyp auswählen</h3>
        
        <RoomTypeDropdown
          value={selectedRoomType}
          onValueChange={setSelectedRoomType}
        />
        
        <Button
          onClick={handleApplyRoomType}
          disabled={!selectedRoomType || selectedCount === 0}
          className="w-full mt-3"
          data-testid="button-apply-roomtype"
        >
          Auf ausgewählte Stacks anwenden
        </Button>
        
        {selectedCount > 0 && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {selectedCount} Stack{selectedCount !== 1 ? "s" : ""} ausgewählt
          </p>
        )}
      </div>

      <Separator />

      {/* Section B: Markings */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Markierungen</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="mark-deletion"
              checked={markDeletion}
              onCheckedChange={handleMarkDeletionChange}
              disabled={selectedCount === 0}
              data-testid="checkbox-mark-deletion"
            />
            <label
              htmlFor="mark-deletion"
              className="flex-1 text-sm cursor-pointer"
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
              data-testid="checkbox-mark-uncertain"
            />
            <label
              htmlFor="mark-uncertain"
              className="flex-1 text-sm cursor-pointer"
            >
              Unsicher
            </label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Section C: Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Aktionen</h3>
        
        <div className="space-y-2">
          <Button
            onClick={onShowFilenamePreview}
            variant="outline"
            className="w-full"
            data-testid="button-filename-preview"
          >
            Dateinamen-Vorschau anzeigen
          </Button>
          
          <Button
            onClick={onApplyRenaming}
            className="w-full"
            data-testid="button-apply-renaming"
          >
            Umbenennung anwenden
          </Button>
          
          <Button
            onClick={onResetSelection}
            variant="ghost"
            className="w-full"
            disabled={selectedCount === 0}
            data-testid="button-reset-selection"
          >
            Reset Auswahl
          </Button>
        </div>
      </div>

      <Separator />

      {/* Section D: Info */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3 flex gap-2">
        <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900 dark:text-blue-100">
          Änderungen werden erst nach "Umbenennung anwenden" gespeichert.
        </p>
      </div>
    </div>
  );
}
