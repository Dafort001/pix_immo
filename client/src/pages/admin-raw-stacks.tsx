import { useState, useCallback, useMemo } from "react";
import { useParams } from "wouter";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { JobHeader } from "@/components/JobHeader";
import { StackCard } from "@/components/StackCard";
import { StackLightbox } from "@/components/StackLightbox";
import { RoomAssignmentPanel } from "@/components/RoomAssignmentPanel";
import { StatusBar } from "@/components/StatusBar";
import { mockJobMeta, mockJobStacks } from "@/data/mockJobStacks";
import { JobStack, JobMeta } from "@/types/jobStacks";
import { getRoomLabelByValue } from "@/data/roomTypes";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AdminRawStacks() {
  const params = useParams();
  const { toast } = useToast();
  
  // State
  const [jobMeta, setJobMeta] = useState<JobMeta>(mockJobMeta);
  const [stacks, setStacks] = useState<JobStack[]>(
    mockJobStacks.sort((a, b) => a.orderIndex - b.orderIndex)
  );
  const [selectedStackIds, setSelectedStackIds] = useState<Set<string>>(new Set());
  const [lightboxStack, setLightboxStack] = useState<JobStack | null>(null);
  const [lastChangeTime, setLastChangeTime] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showFilenameDialog, setShowFilenameDialog] = useState(false);

  // Computed values
  const selectedCount = selectedStackIds.size;
  const unassignedCount = useMemo(
    () => stacks.filter((s) => !s.roomTypeKey).length,
    [stacks]
  );

  // Update timestamp helper
  const updateTimestamp = () => {
    const now = new Date();
    setLastChangeTime(now.toLocaleTimeString("de-DE"));
  };

  // Show success message temporarily
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle bracket size change
  const handleBracketSizeChange = (size: 3 | 5) => {
    setJobMeta({ ...jobMeta, bracketSize: size });
    toast({
      title: "Bracket-Größe geändert",
      description: `Bracket-Größe auf ${size} Belichtungen gesetzt.`,
    });
    updateTimestamp();
  };

  // Handle stack selection
  const handleStackSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedStackIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedStackIds(newSelected);
  };

  // Apply room type to selected stacks
  const handleApplyRoomType = (roomTypeKey: string) => {
    const roomTypeLabel = getRoomLabelByValue(roomTypeKey);
    
    setStacks((prev) =>
      prev.map((stack) =>
        selectedStackIds.has(stack.id)
          ? { ...stack, roomTypeKey, roomTypeLabel }
          : stack
      )
    );

    toast({
      title: "Raumtyp zugewiesen",
      description: `${selectedCount} Stack${selectedCount !== 1 ? "s" : ""} wurde "${roomTypeLabel}" zugewiesen.`,
    });
    
    updateTimestamp();
    showSuccess(`Raumtyp "${roomTypeLabel}" zugewiesen`);
  };

  // Mark selected stacks for deletion
  const handleMarkForDeletion = (marked: boolean) => {
    setStacks((prev) =>
      prev.map((stack) =>
        selectedStackIds.has(stack.id)
          ? { ...stack, markedForDeletion: marked }
          : stack
      )
    );

    toast({
      title: marked ? "Zur Löschung markiert" : "Löschmarkierung entfernt",
      description: `${selectedCount} Stack${selectedCount !== 1 ? "s" : ""} ${marked ? "zur Löschung markiert" : "Markierung entfernt"}.`,
      variant: marked ? "destructive" : "default",
    });
    
    updateTimestamp();
  };

  // Mark selected stacks as uncertain
  const handleMarkUncertain = (marked: boolean) => {
    setStacks((prev) =>
      prev.map((stack) =>
        selectedStackIds.has(stack.id)
          ? { ...stack, flaggedUncertain: marked }
          : stack
      )
    );

    toast({
      title: marked ? "Als unsicher markiert" : "Unsicher-Markierung entfernt",
      description: `${selectedCount} Stack${selectedCount !== 1 ? "s" : ""} ${marked ? "als unsicher markiert" : "Markierung entfernt"}.`,
    });
    
    updateTimestamp();
  };

  // Generate filename for a stack
  const generateFilename = (stack: JobStack, index: number): string => {
    const date = jobMeta.date.split(".").reverse().join("-"); // DD.MM.YYYY → YYYY-MM-DD
    const shootCode = jobMeta.shootCode.toLowerCase().replace(/ /g, "_");
    const roomType = stack.roomTypeKey || "unassigned";
    const stackNum = String(index + 1).padStart(2, "0");
    return `${date}-${shootCode}_${roomType}_${stackNum}_v1`;
  };

  // Show filename preview
  const handleShowFilenamePreview = () => {
    setShowFilenameDialog(true);
  };

  // Apply renaming (stub)
  const handleApplyRenaming = () => {
    console.log("=== UMBENENNUNG ANWENDEN (STUB) ===");
    console.log("Job:", jobMeta);
    console.log("Stacks:", stacks.length);
    stacks.forEach((stack, index) => {
      console.log(`${stack.id}: ${generateFilename(stack, index)}`);
    });
    
    toast({
      title: "Umbenennung simuliert",
      description: "Die Umbenennung wurde erfolgreich simuliert (siehe Console).",
    });
    
    updateTimestamp();
    showSuccess("Umbenennung erfolgreich simuliert");
  };

  // Reset selection
  const handleResetSelection = () => {
    setSelectedStackIds(new Set());
    toast({
      title: "Auswahl zurückgesetzt",
      description: "Alle Stacks wurden abgewählt.",
    });
  };

  // Drag & Drop: Move stack
  const moveStack = useCallback((dragIndex: number, hoverIndex: number) => {
    setStacks((prev) => {
      const newStacks = [...prev];
      const [removed] = newStacks.splice(dragIndex, 1);
      newStacks.splice(hoverIndex, 0, removed);
      
      // Update orderIndex
      return newStacks.map((stack, idx) => ({
        ...stack,
        orderIndex: idx,
      }));
    });
    
    updateTimestamp();
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen">
        {/* Job Header */}
        <JobHeader job={jobMeta} onBracketSizeChange={handleBracketSizeChange} />

        {/* Main Content: Gallery + Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Stack Gallery */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stacks.map((stack, index) => (
                <StackCard
                  key={stack.id}
                  stack={stack}
                  index={index}
                  isSelected={selectedStackIds.has(stack.id)}
                  onSelect={handleStackSelect}
                  onThumbnailClick={setLightboxStack}
                  moveStack={moveStack}
                />
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <RoomAssignmentPanel
            selectedCount={selectedCount}
            onApplyRoomType={handleApplyRoomType}
            onMarkForDeletion={handleMarkForDeletion}
            onMarkUncertain={handleMarkUncertain}
            onShowFilenamePreview={handleShowFilenamePreview}
            onApplyRenaming={handleApplyRenaming}
            onResetSelection={handleResetSelection}
          />
        </div>

        {/* Status Bar */}
        <StatusBar
          selectedCount={selectedCount}
          unassignedCount={unassignedCount}
          lastChangeTime={lastChangeTime}
          successMessage={successMessage}
        />

        {/* Lightbox */}
        <StackLightbox stack={lightboxStack} onClose={() => setLightboxStack(null)} />

        {/* Filename Preview Dialog */}
        <Dialog open={showFilenameDialog} onOpenChange={setShowFilenameDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dateinamen-Vorschau</DialogTitle>
              <DialogDescription>
                Geplante Dateinamen basierend auf aktueller Reihenfolge und Raumtypen
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <ul className="space-y-2 font-mono text-sm">
                {stacks.map((stack, index) => (
                  <li
                    key={stack.id}
                    className={`p-2 rounded ${
                      stack.markedForDeletion
                        ? "bg-destructive/10 text-destructive line-through"
                        : stack.flaggedUncertain
                        ? "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-900 dark:text-yellow-100"
                        : "bg-muted"
                    }`}
                  >
                    <span className="text-muted-foreground mr-2">
                      {String(index + 1).padStart(2, "0")}.
                    </span>
                    {generateFilename(stack, index)}
                    {stack.markedForDeletion && (
                      <span className="ml-2 text-xs">(zur Löschung markiert)</span>
                    )}
                    {stack.flaggedUncertain && !stack.markedForDeletion && (
                      <span className="ml-2 text-xs">(unsicher)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowFilenameDialog(false)} data-testid="button-close-preview">
                Schließen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}
