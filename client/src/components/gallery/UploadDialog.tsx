import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, 
  X, 
  FileImage, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UploadFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  galleryId: number;
  onUploadComplete?: () => void;
  globalSettings?: {
    stylePreset?: string;
    windowPreset?: string;
    skyPreset?: string;
    verticalCorrection?: boolean;
    deNoiseFloor?: boolean;
    deNoiseWall?: boolean;
    deNoiseCeiling?: boolean;
    removePowerCables?: boolean;
    removePlumbing?: boolean;
  };
}

const STYLE_PRESETS = ["natural", "warm", "bright", "dramatic", "minimal"];
const WINDOW_PRESETS = ["clear", "enhance", "dramatic", "remove-glare"];
const SKY_PRESETS = ["natural", "blue-sky", "sunset", "cloudy", "replace"];

const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/heic": [".heic"],
  "image/x-adobe-dng": [".dng"],
  "image/x-canon-cr2": [".cr2"],
  "image/x-nikon-nef": [".nef"],
  "image/x-sony-arw": [".arw"],
};

export function UploadDialog({
  open,
  onOpenChange,
  galleryId,
  onUploadComplete,
  globalSettings = {},
}: UploadDialogProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Global settings state
  const [stylePreset, setStylePreset] = useState(globalSettings.stylePreset || "natural");
  const [windowPreset, setWindowPreset] = useState(globalSettings.windowPreset || "clear");
  const [skyPreset, setSkyPreset] = useState(globalSettings.skyPreset || "natural");
  const [verticalCorrection, setVerticalCorrection] = useState(globalSettings.verticalCorrection ?? true);
  const [deNoiseFloor, setDeNoiseFloor] = useState(globalSettings.deNoiseFloor ?? false);
  const [deNoiseWall, setDeNoiseWall] = useState(globalSettings.deNoiseWall ?? false);
  const [deNoiseCeiling, setDeNoiseCeiling] = useState(globalSettings.deNoiseCeiling ?? false);
  const [removePowerCables, setRemovePowerCables] = useState(globalSettings.removePowerCables ?? false);
  const [removePlumbing, setRemovePlumbing] = useState(globalSettings.removePlumbing ?? false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: "pending",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("galleryId", galleryId.toString());

      // Add global settings
      formData.append("stylePreset", stylePreset);
      formData.append("windowPreset", windowPreset);
      formData.append("skyPreset", skyPreset);
      formData.append("verticalCorrection", verticalCorrection.toString());
      formData.append("deNoiseFloor", deNoiseFloor.toString());
      formData.append("deNoiseWall", deNoiseWall.toString());
      formData.append("deNoiseCeiling", deNoiseCeiling.toString());
      formData.append("removePowerCables", removePowerCables.toString());
      formData.append("removePlumbing", removePlumbing.toString());

      // Add files
      files.forEach((uploadFile) => {
        formData.append("files", uploadFile.file);
      });

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) => ({ ...f, status: "uploading" as const, progress: 0 }))
      );

      const response = await fetch(`/api/gallery/${galleryId}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Upload failed");
      }

      // Mark all as success
      setFiles((prev) =>
        prev.map((f) => ({ ...f, status: "success" as const, progress: 100 }))
      );

      toast({
        title: "Upload successful",
        description: `${files.length} file(s) uploaded successfully`,
      });

      // Invalidate gallery query
      queryClient.invalidateQueries({ queryKey: ["/api/gallery", galleryId] });

      if (onUploadComplete) {
        onUploadComplete();
      }

      // Close dialog after 1 second
      setTimeout(() => {
        onOpenChange(false);
        setFiles([]);
      }, 1000);
    } catch (error: any) {
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "error" as const,
          error: error.message || "Upload failed",
        }))
      );

      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const totalFiles = files.length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload images to this gallery. Supports JPG, PNG, HEIC, and RAW formats (DNG, CR2, NEF, ARW).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag-Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging ? "border-accent bg-accent/10" : "border-muted",
              !isUploading && "cursor-pointer hover-elevate"
            )}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            data-testid="dropzone-upload"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {isDragging ? "Drop files here" : "Drag & drop files or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, HEIC, DNG, CR2, NEF, ARW (max 50 files)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={Object.values(ACCEPTED_TYPES).flat().join(",")}
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
              data-testid="input-file-upload"
            />
          </div>

          {/* Global Settings */}
          {files.length > 0 && !isUploading && (
            <Card className="p-4">
              <h3 className="text-sm font-medium mb-3">Global Settings (Applied to all files)</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="space-y-1">
                  <Label className="text-xs">Style Preset</Label>
                  <Select value={stylePreset} onValueChange={setStylePreset}>
                    <SelectTrigger data-testid="select-style-preset">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLE_PRESETS.map((preset) => (
                        <SelectItem key={preset} value={preset}>
                          {preset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Window Preset</Label>
                  <Select value={windowPreset} onValueChange={setWindowPreset}>
                    <SelectTrigger data-testid="select-window-preset">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WINDOW_PRESETS.map((preset) => (
                        <SelectItem key={preset} value={preset}>
                          {preset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Sky Preset</Label>
                  <Select value={skyPreset} onValueChange={setSkyPreset}>
                    <SelectTrigger data-testid="select-sky-preset">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SKY_PRESETS.map((preset) => (
                        <SelectItem key={preset} value={preset}>
                          {preset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox
                    checked={verticalCorrection}
                    onCheckedChange={(checked) => setVerticalCorrection(checked as boolean)}
                    data-testid="checkbox-vertical-correction"
                  />
                  Vertical Correction
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox
                    checked={deNoiseFloor}
                    onCheckedChange={(checked) => setDeNoiseFloor(checked as boolean)}
                    data-testid="checkbox-denoise-floor"
                  />
                  De-Noise Floor
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox
                    checked={deNoiseWall}
                    onCheckedChange={(checked) => setDeNoiseWall(checked as boolean)}
                    data-testid="checkbox-denoise-wall"
                  />
                  De-Noise Wall
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox
                    checked={deNoiseCeiling}
                    onCheckedChange={(checked) => setDeNoiseCeiling(checked as boolean)}
                    data-testid="checkbox-denoise-ceiling"
                  />
                  De-Noise Ceiling
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox
                    checked={removePowerCables}
                    onCheckedChange={(checked) => setRemovePowerCables(checked as boolean)}
                    data-testid="checkbox-remove-cables"
                  />
                  Remove Power Cables
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox
                    checked={removePlumbing}
                    onCheckedChange={(checked) => setRemovePlumbing(checked as boolean)}
                    data-testid="checkbox-remove-plumbing"
                  />
                  Remove Plumbing
                </label>
              </div>
            </Card>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {files.map((uploadFile) => (
                <Card key={uploadFile.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <FileImage className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-sm font-medium truncate"
                        data-testid={`text-upload-filename-${uploadFile.id}`}
                      >
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {uploadFile.status === "uploading" && (
                        <Progress value={uploadFile.progress} className="h-1 mt-1" />
                      )}
                      {uploadFile.status === "error" && uploadFile.error && (
                        <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {uploadFile.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(uploadFile.id)}
                          data-testid={`button-remove-file-${uploadFile.id}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      {uploadFile.status === "uploading" && (
                        <Loader2 className="w-5 h-5 animate-spin text-accent" />
                      )}
                      {uploadFile.status === "success" && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                      {uploadFile.status === "error" && (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Upload Summary */}
          {isUploading && (
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                Uploading {successCount + errorCount} / {totalFiles} files...
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
            data-testid="button-cancel-upload"
          >
            Cancel
          </Button>
          <Button
            onClick={uploadFiles}
            disabled={files.length === 0 || isUploading}
            data-testid="button-start-upload"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.length} file{files.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
