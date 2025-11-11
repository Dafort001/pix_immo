import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  StarOff,
  ThumbsUp,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderFile } from '@/hooks/useOrderFiles';

interface FileListProps {
  files: OrderFile[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onFileClick?: (file: OrderFile) => void;
  onToggleFavorite?: (fileId: string, currentMarked: boolean) => void;
  onDelete?: (fileId: string) => void;
  onApprove?: (fileId: string) => void;
  onRevision?: (fileId: string, note: string) => void;
  showApproveControls?: boolean;
  estimatedItemHeight?: number;
}

export function FileList({
  files,
  isLoading = false,
  selectedIds,
  onSelectionChange,
  onFileClick,
  onToggleFavorite,
  onDelete,
  onApprove,
  onRevision,
  showApproveControls = false,
  estimatedItemHeight = 120,
}: FileListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [revisionNote, setRevisionNote] = useState<{ id: string; note: string } | null>(null);

  const virtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan: 5,
  });

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === files.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(files.map((f) => f.id));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="w-3 h-3" />;
      case 'in_progress':
        return <Clock className="w-3 h-3 animate-pulse" />;
      case 'done':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'approved':
        return <ThumbsUp className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'done':
      case 'approved':
        return 'default';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" data-testid={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground" data-testid="text-empty-state">
          No files found
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Select All Header */}
      <Card className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selectedIds.length === files.length && files.length > 0}
            onCheckedChange={selectAll}
            data-testid="checkbox-select-all"
          />
          <span className="text-sm font-medium">
            {selectedIds.length > 0
              ? `${selectedIds.length} selected`
              : `${files.length} files`}
          </span>
        </div>
        {selectedIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange([])}
            data-testid="button-clear-selection"
          >
            Clear
          </Button>
        )}
      </Card>

      {/* Virtualized List */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto"
        data-testid="file-list-container"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const file = files[virtualItem.index];
            const isSelected = selectedIds.includes(file.id);

            return (
              <div
                key={file.id}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <Card
                  className={cn(
                    'p-3 hover-elevate transition-all',
                    isSelected && 'ring-2 ring-primary'
                  )}
                  data-testid={`file-item-${file.id}`}
                >
                  <div className="flex gap-3">
                    {/* Checkbox */}
                    <div className="flex items-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelection(file.id)}
                        data-testid={`checkbox-file-${file.id}`}
                      />
                    </div>

                    {/* Thumbnail */}
                    <div
                      className="relative w-20 h-20 bg-muted rounded overflow-hidden cursor-pointer"
                      onClick={() => onFileClick?.(file)}
                      data-testid={`thumbnail-${file.id}`}
                    >
                      {file.thumbnail_url ? (
                        <img
                          src={file.thumbnail_url}
                          alt={file.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <span className="text-xs">{file.filename.split('.').pop()}</span>
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className="text-sm font-medium truncate cursor-pointer hover:underline"
                          onClick={() => onFileClick?.(file)}
                          data-testid={`filename-${file.id}`}
                        >
                          {file.filename}
                        </h4>
                        
                        {/* Favorite Toggle */}
                        {onToggleFavorite && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => onToggleFavorite(file.id, !!file.marked)}
                            data-testid={`button-toggle-favorite-${file.id}`}
                          >
                            {file.marked ? (
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff className="w-3 h-3 text-muted-foreground" />
                            )}
                          </Button>
                        )}
                        
                        {/* Delete Button */}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => onDelete(file.id)}
                            data-testid={`button-delete-${file.id}`}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getStatusVariant(file.status)} className="flex items-center gap-1">
                          {getStatusIcon(file.status)}
                          <span className="capitalize">{file.status.replace('_', ' ')}</span>
                        </Badge>

                        {file.room_type && (
                          <Badge variant="outline" className="text-xs">
                            {file.room_type}
                          </Badge>
                        )}

                        {file.warnings && file.warnings.length > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="w-3 h-3" />
                            {file.warnings.length}
                          </Badge>
                        )}
                      </div>

                      {/* Approve/Revision Controls */}
                      {showApproveControls && file.status === 'done' && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onApprove?.(file.id)}
                            data-testid={`button-approve-${file.id}`}
                          >
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRevisionNote({ id: file.id, note: '' })}
                            data-testid={`button-revision-${file.id}`}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Revision
                          </Button>
                        </div>
                      )}

                      {/* Revision Note Input */}
                      {revisionNote?.id === file.id && (
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Enter revision note..."
                            value={revisionNote.note}
                            onChange={(e) =>
                              setRevisionNote({ id: file.id, note: e.target.value })
                            }
                            className="flex-1 text-sm border rounded px-2 py-1"
                            data-testid={`input-revision-note-${file.id}`}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              if (revisionNote.note) {
                                onRevision?.(file.id, revisionNote.note);
                                setRevisionNote(null);
                              }
                            }}
                            disabled={!revisionNote.note}
                            data-testid={`button-submit-revision-${file.id}`}
                          >
                            Submit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRevisionNote(null)}
                            data-testid={`button-cancel-revision-${file.id}`}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
