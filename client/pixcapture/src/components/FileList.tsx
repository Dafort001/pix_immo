import { useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { type OrderFile, useBulkMarkFiles } from "../hooks/useOrderFiles";

interface FileListProps {
  files: OrderFile[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onFileClick?: (file: OrderFile) => void;
}

export function FileList({
  files,
  selectedIds,
  onSelectionChange,
  onFileClick,
}: FileListProps) {
  const { t } = useTranslation();
  const markMutation = useBulkMarkFiles();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(files.map((f) => f.id)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectFile = (fileId: string, checked: boolean) => {
    const newSelection = new Set(selectedIds);
    if (checked) {
      newSelection.add(fileId);
    } else {
      newSelection.delete(fileId);
    }
    onSelectionChange(newSelection);
  };

  const handleToggleMark = async (file: OrderFile) => {
    await markMutation.mutateAsync({
      ids: [file.id],
      marked: !file.marked,
    });
  };

  const getStatusBadgeVariant = (
    status: OrderFile["status"]
  ): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "approved":
        return "default";
      case "in_progress":
      case "processing":
        return "secondary";
      case "revision":
      case "deleted":
        return "destructive";
      default:
        return "outline";
    }
  };

  const allSelected =
    files.length > 0 && selectedIds.size === files.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  return (
    <div className="flex flex-col h-full">
      {/* Header with bulk select */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Checkbox
          checked={allSelected}
          data-state={someSelected ? "indeterminate" : undefined}
          onCheckedChange={handleSelectAll}
          data-testid="checkbox-select-all"
        />
        <span className="text-sm text-muted-foreground">
          {selectedIds.size > 0
            ? `${selectedIds.size} / ${files.length}`
            : `${files.length} ${t("label.filename", { count: files.length })}`}
        </span>
      </div>

      {/* Virtualized list */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
        style={{ contain: "strict" }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const file = files[virtualRow.index];
            const isSelected = selectedIds.has(file.id);
            const isHovered = hoveredId === file.id;

            return (
              <div
                key={file.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onMouseEnter={() => setHoveredId(file.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  className={`flex items-center gap-3 p-3 border-b hover-elevate ${
                    isSelected ? "bg-accent/50" : ""
                  }`}
                  data-testid={`file-row-${file.id}`}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleSelectFile(file.id, checked as boolean)
                    }
                    data-testid={`checkbox-file-${file.id}`}
                  />

                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {file.thumbnailUrl ? (
                      <img
                        src={file.thumbnailUrl}
                        alt={file.filename}
                        className="w-full h-full object-cover"
                        data-testid={`img-thumbnail-${file.id}`}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {file.mimeType.split("/")[1]?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* File info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onFileClick?.(file)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-medium text-sm truncate"
                        data-testid={`text-filename-${file.id}`}
                      >
                        {file.filename}
                      </span>
                      {file.marked && (
                        <Badge variant="default" className="text-xs">
                          <Check className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {file.roomType && (
                        <span>{t(`rooms.${file.roomType}`)}</span>
                      )}
                      <span>
                        #{file.index.toString().padStart(3, "0")}
                      </span>
                      <span>v{file.ver}</span>
                      <span>
                        {(file.sizeBytes / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <Badge
                    variant={getStatusBadgeVariant(file.status)}
                    className="text-xs"
                    data-testid={`badge-status-${file.id}`}
                  >
                    {t(`status.${file.status}`)}
                  </Badge>

                  {/* Warning badge */}
                  {file.warnings && file.warnings.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {file.warnings.length}
                    </Badge>
                  )}

                  {/* Mark/Unmark button (visible on hover) */}
                  {(isHovered || file.marked) && (
                    <Button
                      size="sm"
                      variant={file.marked ? "default" : "outline"}
                      onClick={() => handleToggleMark(file)}
                      disabled={markMutation.isPending}
                      data-testid={`button-mark-${file.id}`}
                    >
                      {file.marked ? (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          {t("button.unmark")}
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          {t("button.mark")}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
