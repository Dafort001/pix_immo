import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface StatusBarProps {
  selectedCount: number;
  unassignedCount: number;
  lastChangeTime: string | null;
  successMessage: string | null;
}

export function StatusBar({
  selectedCount,
  unassignedCount,
  lastChangeTime,
  successMessage,
}: StatusBarProps) {
  return (
    <div className="bg-card border-t px-8 py-3 flex items-center gap-6 text-sm text-muted-foreground">
      {selectedCount > 0 && (
        <div className="flex items-center gap-2" data-testid="status-selected">
          <Info className="size-4" />
          <span>{selectedCount} Stack{selectedCount !== 1 ? "s" : ""} ausgewählt</span>
        </div>
      )}
      
      {unassignedCount > 0 && (
        <div className="flex items-center gap-2" data-testid="status-unassigned">
          <AlertCircle className="size-4 text-yellow-600 dark:text-yellow-500" />
          <span>{unassignedCount} Stack{unassignedCount !== 1 ? "s" : ""} ohne Raumtyp</span>
        </div>
      )}
      
      {lastChangeTime && (
        <div className="flex items-center gap-2" data-testid="status-last-change">
          <span>Letzte Änderung: {lastChangeTime}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-500" data-testid="status-success">
          <CheckCircle2 className="size-4" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
