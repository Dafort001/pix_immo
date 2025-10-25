import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  ImageIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Download,
  Trash2,
  Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface GalleryFile {
  id: number;
  galleryId: number;
  originalFilename: string;
  r2Path: string;
  thumbnailPath: string | null;
  fileType: string;
  fileSize: number;
  status: string;
  stylePreset: string | null;
  windowPreset: string | null;
  skyPreset: string | null;
  verticalCorrection: boolean;
  deNoiseFloor: boolean;
  deNoiseWall: boolean;
  deNoiseCeiling: boolean;
  removePowerCables: boolean;
  removePlumbing: boolean;
  createdAt: number;
  updatedAt: number;
}

interface GalleryGridProps {
  files: GalleryFile[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onFileClick: (file: GalleryFile) => void;
  showFilters?: boolean;
  showBulkActions?: boolean;
  onBulkDelete?: (ids: number[]) => void;
  onBulkDownload?: (ids: number[]) => void;
  onBulkSettings?: (ids: number[]) => void;
}

export function GalleryGrid({
  files,
  selectedIds,
  onSelectionChange,
  onFileClick,
  showFilters = true,
  showBulkActions = true,
  onBulkDelete,
  onBulkDownload,
  onBulkSettings,
}: GalleryGridProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFiles = files.filter((file) => {
    const matchesStatus = filterStatus === "all" || file.status === filterStatus;
    const matchesType = filterType === "all" || file.fileType.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch = file.originalFilename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === filteredFiles.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredFiles.map((f) => f.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; icon: JSX.Element }> = {
      pending: { variant: "secondary", icon: <Clock className="w-3 h-3" /> },
      processing: { variant: "outline", icon: <Clock className="w-3 h-3" /> },
      ready: { variant: "default", icon: <CheckCircle2 className="w-3 h-3" /> },
      failed: { variant: "outline", icon: <XCircle className="w-3 h-3" /> },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-files"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]" data-testid="select-filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]" data-testid="select-filter-type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="dng">RAW (DNG)</SelectItem>
                <SelectItem value="cr2">RAW (CR2)</SelectItem>
                <SelectItem value="nef">RAW (NEF)</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm"
              onClick={selectAll}
              data-testid="button-select-all"
            >
              <Filter className="w-4 h-4 mr-2" />
              {selectedIds.length === filteredFiles.length ? "Deselect All" : "Select All"}
            </Button>

            <div className="text-sm text-muted-foreground">
              {filteredFiles.length} files
              {selectedIds.length > 0 && ` · ${selectedIds.length} selected`}
            </div>
          </div>
        </Card>
      )}

      {showBulkActions && selectedIds.length > 0 && (
        <Card className="p-3 bg-accent/10 border-accent">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" data-testid="text-selection-count">
              {selectedIds.length} selected
            </span>
            <div className="flex-1" />
            {onBulkSettings && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onBulkSettings(selectedIds)}
                data-testid="button-bulk-settings"
              >
                <Settings2 className="w-4 h-4 mr-2" />
                Bulk Settings
              </Button>
            )}
            {onBulkDownload && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onBulkDownload(selectedIds)}
                data-testid="button-bulk-download"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            {onBulkDelete && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onBulkDelete(selectedIds)}
                data-testid="button-bulk-delete"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredFiles.map((file) => {
          const isSelected = selectedIds.includes(file.id);
          return (
            <Card
              key={file.id}
              className={cn(
                "relative overflow-hidden group cursor-pointer hover-elevate",
                isSelected && "ring-2 ring-accent"
              )}
              onClick={() => onFileClick(file)}
              data-testid={`card-gallery-file-${file.id}`}
            >
              <div className="absolute top-2 left-2 z-10">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelection(file.id);
                  }}
                  className="bg-background/90 rounded-md p-1 hover-elevate"
                  data-testid={`checkbox-select-file-${file.id}`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelection(file.id)}
                  />
                </div>
              </div>

              <div className="absolute top-2 right-2 z-10">
                {getStatusBadge(file.status)}
              </div>

              <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                {file.thumbnailPath ? (
                  <img
                    src={file.thumbnailPath}
                    alt={file.originalFilename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                )}
              </div>

              <div className="p-2 space-y-1">
                <p 
                  className="text-xs font-medium truncate" 
                  title={file.originalFilename}
                  data-testid={`text-filename-${file.id}`}
                >
                  {file.originalFilename}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="uppercase">{file.fileType}</span>
                  <span>{(file.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                {(file.stylePreset || file.windowPreset || file.skyPreset) && (
                  <div className="flex gap-1 flex-wrap">
                    {file.stylePreset && (
                      <Badge variant="outline" className="text-xs">
                        {file.stylePreset}
                      </Badge>
                    )}
                    {file.windowPreset && (
                      <Badge variant="outline" className="text-xs">
                        W:{file.windowPreset}
                      </Badge>
                    )}
                    {file.skyPreset && (
                      <Badge variant="outline" className="text-xs">
                        S:{file.skyPreset}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredFiles.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-2">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              No files found
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
