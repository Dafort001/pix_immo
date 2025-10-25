import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Save,
  Upload,
  MessageSquare,
  Image as ImageIcon,
  Loader2,
  Paintbrush,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GalleryFile } from "./GalleryGrid";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DetailSidebarProps {
  file: GalleryFile | null;
  onClose: () => void;
  onOpenMaskEditor?: (file: GalleryFile) => void;
}

const STYLE_PRESETS = ["natural", "warm", "bright", "dramatic", "minimal"];
const WINDOW_PRESETS = ["clear", "enhance", "dramatic", "remove-glare"];
const SKY_PRESETS = ["natural", "blue-sky", "sunset", "cloudy", "replace"];

export function DetailSidebar({ file, onClose, onOpenMaskEditor }: DetailSidebarProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Settings state
  const [stylePreset, setStylePreset] = useState(file?.stylePreset || "natural");
  const [windowPreset, setWindowPreset] = useState(file?.windowPreset || "clear");
  const [skyPreset, setSkyPreset] = useState(file?.skyPreset || "natural");
  const [verticalCorrection, setVerticalCorrection] = useState(file?.verticalCorrection ?? true);
  const [deNoiseFloor, setDeNoiseFloor] = useState(file?.deNoiseFloor ?? false);
  const [deNoiseWall, setDeNoiseWall] = useState(file?.deNoiseWall ?? false);
  const [deNoiseCeiling, setDeNoiseCeiling] = useState(file?.deNoiseCeiling ?? false);
  const [removePowerCables, setRemovePowerCables] = useState(file?.removePowerCables ?? false);
  const [removePlumbing, setRemovePlumbing] = useState(file?.removePlumbing ?? false);

  // Comment state
  const [commentText, setCommentText] = useState("");

  if (!file) {
    return null;
  }

  const hasChanges =
    stylePreset !== (file.stylePreset || "natural") ||
    windowPreset !== (file.windowPreset || "clear") ||
    skyPreset !== (file.skyPreset || "natural") ||
    verticalCorrection !== (file.verticalCorrection ?? true) ||
    deNoiseFloor !== (file.deNoiseFloor ?? false) ||
    deNoiseWall !== (file.deNoiseWall ?? false) ||
    deNoiseCeiling !== (file.deNoiseCeiling ?? false) ||
    removePowerCables !== (file.removePowerCables ?? false) ||
    removePlumbing !== (file.removePlumbing ?? false);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await apiRequest("PATCH", `/api/gallery/file/${file.id}/settings`, {
        stylePreset,
        windowPreset,
        skyPreset,
        verticalCorrection,
        deNoiseFloor,
        deNoiseWall,
        deNoiseCeiling,
        removePowerCables,
        removePlumbing,
      });

      toast({
        title: "Settings saved",
        description: "File settings updated successfully",
      });

      // Invalidate gallery query
      queryClient.invalidateQueries({ queryKey: ["/api/gallery", file.galleryId] });
    } catch (error: any) {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;

    setIsAddingComment(true);
    try {
      await apiRequest("POST", `/api/gallery/file/${file.id}/annotation`, {
        type: "comment",
        comment: commentText,
      });

      toast({
        title: "Comment added",
        description: "Your comment has been saved",
      });

      setCommentText("");

      // Invalidate annotations query
      queryClient.invalidateQueries({ queryKey: ["/api/gallery/file", file.id, "annotations"] });
    } catch (error: any) {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  return (
    <div className="w-full md:w-[400px] border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">File Details</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-close-sidebar"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* File Preview */}
        <Card className="overflow-hidden">
          <div className="aspect-square bg-muted flex items-center justify-center">
            {file.thumbnailPath ? (
              <img
                src={file.thumbnailPath}
                alt={file.originalFilename}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
        </Card>

        {/* File Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge data-testid="badge-file-status">{file.status}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Filename</span>
            <span 
              className="text-sm font-mono truncate max-w-[200px]" 
              title={file.originalFilename}
              data-testid="text-filename"
            >
              {file.originalFilename}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Type</span>
            <span className="text-sm uppercase">{file.fileType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Size</span>
            <span className="text-sm">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>

        <Separator />

        {/* Presets */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Style Presets</h3>
          
          <div className="space-y-2">
            <Label className="text-xs">Style</Label>
            <Select value={stylePreset} onValueChange={setStylePreset}>
              <SelectTrigger data-testid="select-detail-style">
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

          <div className="space-y-2">
            <Label className="text-xs">Window Treatment</Label>
            <Select value={windowPreset} onValueChange={setWindowPreset}>
              <SelectTrigger data-testid="select-detail-window">
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

          <div className="space-y-2">
            <Label className="text-xs">Sky Replacement</Label>
            <Select value={skyPreset} onValueChange={setSkyPreset}>
              <SelectTrigger data-testid="select-detail-sky">
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

        <Separator />

        {/* Processing Options */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Processing Options</h3>
          
          <label className="flex items-center gap-2 text-sm cursor-pointer hover-elevate p-2 rounded-md">
            <Checkbox
              checked={verticalCorrection}
              onCheckedChange={(checked) => setVerticalCorrection(checked as boolean)}
              data-testid="checkbox-detail-vertical"
            />
            Vertical Correction
          </label>

          <label className="flex items-center gap-2 text-sm cursor-pointer hover-elevate p-2 rounded-md">
            <Checkbox
              checked={deNoiseFloor}
              onCheckedChange={(checked) => setDeNoiseFloor(checked as boolean)}
              data-testid="checkbox-detail-floor"
            />
            De-Noise Floor
          </label>

          <label className="flex items-center gap-2 text-sm cursor-pointer hover-elevate p-2 rounded-md">
            <Checkbox
              checked={deNoiseWall}
              onCheckedChange={(checked) => setDeNoiseWall(checked as boolean)}
              data-testid="checkbox-detail-wall"
            />
            De-Noise Wall
          </label>

          <label className="flex items-center gap-2 text-sm cursor-pointer hover-elevate p-2 rounded-md">
            <Checkbox
              checked={deNoiseCeiling}
              onCheckedChange={(checked) => setDeNoiseCeiling(checked as boolean)}
              data-testid="checkbox-detail-ceiling"
            />
            De-Noise Ceiling
          </label>

          <label className="flex items-center gap-2 text-sm cursor-pointer hover-elevate p-2 rounded-md">
            <Checkbox
              checked={removePowerCables}
              onCheckedChange={(checked) => setRemovePowerCables(checked as boolean)}
              data-testid="checkbox-detail-cables"
            />
            Remove Power Cables
          </label>

          <label className="flex items-center gap-2 text-sm cursor-pointer hover-elevate p-2 rounded-md">
            <Checkbox
              checked={removePlumbing}
              onCheckedChange={(checked) => setRemovePlumbing(checked as boolean)}
              data-testid="checkbox-detail-plumbing"
            />
            Remove Plumbing
          </label>
        </div>

        <Separator />

        {/* Mask Editor */}
        {onOpenMaskEditor && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Annotations</h3>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onOpenMaskEditor(file)}
              data-testid="button-open-mask-editor"
            >
              <Paintbrush className="w-4 h-4 mr-2" />
              Draw Mask / Annotation
            </Button>
          </div>
        )}

        <Separator />

        {/* Comments */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Add Comment</h3>
          <Textarea
            placeholder="Add a comment or instruction..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[100px]"
            data-testid="textarea-comment"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addComment}
            disabled={!commentText.trim() || isAddingComment}
            data-testid="button-add-comment"
          >
            {isAddingComment ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Comment
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <Button
          className="w-full"
          onClick={saveSettings}
          disabled={!hasChanges || isSaving}
          data-testid="button-save-settings"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
              {hasChanges && " (Changes Detected)"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
