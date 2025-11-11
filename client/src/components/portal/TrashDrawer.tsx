import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderFile } from '@/hooks/useOrderFiles';

interface TrashDrawerProps {
  trashFiles: OrderFile[];
  isLoading?: boolean;
  onRestore: (ids: string[]) => void;
  onPermanentDelete?: (ids: string[]) => void;
  isPending?: boolean;
  children?: React.ReactNode;
}

export function TrashDrawer({
  trashFiles,
  isLoading = false,
  onRestore,
  onPermanentDelete,
  isPending = false,
  children,
}: TrashDrawerProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === trashFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(trashFiles.map((f) => f.id));
    }
  };

  const handleRestore = () => {
    if (selectedIds.length > 0) {
      onRestore(selectedIds);
      setSelectedIds([]);
    }
  };

  const handlePermanentDelete = () => {
    if (selectedIds.length > 0 && onPermanentDelete) {
      onPermanentDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" data-testid="button-open-trash">
            <Trash2 className="w-4 h-4 mr-2" />
            Trash {trashFiles.length > 0 && `(${trashFiles.length})`}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle data-testid="text-trash-title">Trash</SheetTitle>
          <SheetDescription>
            Deleted files are kept here for 30 days before permanent deletion.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" data-testid={`skeleton-trash-${i}`} />
              ))}
            </div>
          )}

          {!isLoading && trashFiles.length === 0 && (
            <Card className="p-8 text-center">
              <Trash2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground" data-testid="text-trash-empty">
                Trash is empty
              </p>
            </Card>
          )}

          {!isLoading && trashFiles.length > 0 && (
            <>
              {/* Select All Header */}
              <Card className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={
                      selectedIds.length === trashFiles.length && trashFiles.length > 0
                    }
                    onCheckedChange={selectAll}
                    data-testid="checkbox-select-all-trash"
                  />
                  <span className="text-sm font-medium">
                    {selectedIds.length > 0
                      ? `${selectedIds.length} selected`
                      : `${trashFiles.length} files`}
                  </span>
                </div>
                {selectedIds.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                    data-testid="button-clear-trash-selection"
                  >
                    Clear
                  </Button>
                )}
              </Card>

              {/* Trash File List */}
              <div className="space-y-2">
                {trashFiles.map((file) => {
                  const isSelected = selectedIds.includes(file.id);

                  return (
                    <Card
                      key={file.id}
                      className={cn(
                        'p-3 hover-elevate transition-all',
                        isSelected && 'ring-2 ring-primary'
                      )}
                      data-testid={`trash-item-${file.id}`}
                    >
                      <div className="flex gap-3">
                        {/* Checkbox */}
                        <div className="flex items-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelection(file.id)}
                            data-testid={`checkbox-trash-${file.id}`}
                          />
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          {file.thumbnail_url ? (
                            <img
                              src={file.thumbnail_url}
                              alt={file.filename}
                              className="w-full h-full object-cover opacity-60"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground opacity-60">
                              <span className="text-xs">
                                {file.filename.split('.').pop()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-sm font-medium truncate" data-testid={`trash-filename-${file.id}`}>
                            {file.filename}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            {file.room_type && (
                              <Badge variant="outline" className="text-xs">
                                {file.room_type}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              Deleted {new Date(file.updated_at || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Action Buttons */}
              {selectedIds.length > 0 && (
                <Card className="p-3 flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleRestore}
                    disabled={isPending}
                    className="flex-1"
                    data-testid="button-restore"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restore {selectedIds.length > 1 && `(${selectedIds.length})`}
                  </Button>
                  {onPermanentDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePermanentDelete}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive"
                      data-testid="button-permanent-delete"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Forever
                    </Button>
                  )}
                </Card>
              )}

              {/* Warning Message */}
              <Card className="p-3 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    Files will be permanently deleted after 30 days
                  </p>
                </div>
              </Card>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
