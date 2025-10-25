import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Paintbrush,
  Eraser,
  Undo,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GalleryFile } from "./GalleryGrid";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MaskEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: GalleryFile | null;
}

type DrawingMode = "draw" | "erase";

interface DrawingPath {
  points: { x: number; y: number }[];
  mode: DrawingMode;
  brushSize: number;
}

export function MaskEditor({ open, onOpenChange, file }: MaskEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<DrawingMode>("draw");
  const [brushSize, setBrushSize] = useState(20);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load image when file changes
  useEffect(() => {
    if (!file || !canvasRef.current || !overlayCanvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;
      overlayCanvasRef.current!.width = img.width;
      overlayCanvasRef.current!.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);
      setImageLoaded(true);
      setPaths([]);
    };

    img.onerror = () => {
      toast({
        title: "Failed to load image",
        description: "Could not load the image for annotation",
        variant: "destructive",
      });
    };

    img.src = file.thumbnailPath || file.r2Path;
  }, [file, toast]);

  // Redraw overlay whenever paths change
  useEffect(() => {
    if (!overlayCanvasRef.current || !imageLoaded) return;

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    paths.forEach((path) => {
      if (path.points.length < 2) return;

      ctx.strokeStyle = path.mode === "draw" ? "rgba(255, 0, 0, 0.7)" : "rgba(0, 0, 0, 1)";
      ctx.lineWidth = path.brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = path.mode === "draw" ? "source-over" : "destination-out";

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }

      ctx.stroke();
    });

    // Draw current path
    if (currentPath && currentPath.points.length > 1) {
      ctx.strokeStyle = currentPath.mode === "draw" ? "rgba(255, 0, 0, 0.7)" : "rgba(0, 0, 0, 1)";
      ctx.lineWidth = currentPath.brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = currentPath.mode === "draw" ? "source-over" : "destination-out";

      ctx.beginPath();
      ctx.moveTo(currentPath.points[0].x, currentPath.points[0].y);

      for (let i = 1; i < currentPath.points.length; i++) {
        ctx.lineTo(currentPath.points[i].x, currentPath.points[i].y);
      }

      ctx.stroke();
    }

    ctx.globalCompositeOperation = "source-over";
  }, [paths, currentPath, imageLoaded]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setCurrentPath({
      points: [coords],
      mode,
      brushSize,
    });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath) return;

    const coords = getCanvasCoordinates(e);
    setCurrentPath({
      ...currentPath,
      points: [...currentPath.points, coords],
    });
  };

  const stopDrawing = () => {
    if (currentPath && currentPath.points.length > 1) {
      setPaths([...paths, currentPath]);
    }
    setIsDrawing(false);
    setCurrentPath(null);
  };

  const undo = () => {
    if (paths.length > 0) {
      setPaths(paths.slice(0, -1));
    }
  };

  const clear = () => {
    setPaths([]);
    setCurrentPath(null);
  };

  const saveMask = async () => {
    if (!overlayCanvasRef.current || !file) return;

    setIsSaving(true);
    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        overlayCanvasRef.current!.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        }, "image/png");
      });

      // Create FormData
      const formData = new FormData();
      formData.append("mask", blob, "mask.png");

      // Upload mask
      const response = await fetch(`/api/gallery/file/${file.id}/mask-upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to upload mask");
      }

      toast({
        title: "Mask saved",
        description: "Your annotation has been saved successfully",
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/gallery", file.galleryId] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery/file", file.id, "annotations"] });

      // Close dialog
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to save mask",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!file) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>Draw Annotation / Mask</DialogTitle>
          <DialogDescription>
            Draw red annotations on the image to mark areas for editing or removal.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Canvas Area */}
          <div className="flex-1 relative">
            <div className="relative border rounded-lg overflow-hidden bg-muted">
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full object-contain cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                data-testid="canvas-mask-editor"
              />
              {!imageLoaded && (
                <div className="flex items-center justify-center min-h-[400px]">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Toolbar */}
          <Card className="lg:w-[250px] p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tool</Label>
              <div className="flex gap-2">
                <Button
                  variant={mode === "draw" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setMode("draw")}
                  data-testid="button-tool-draw"
                >
                  <Paintbrush className="w-4 h-4 mr-2" />
                  Draw
                </Button>
                <Button
                  variant={mode === "erase" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setMode("erase")}
                  data-testid="button-tool-erase"
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Erase
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Brush Size: {brushSize}px
              </Label>
              <Slider
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                min={5}
                max={100}
                step={5}
                data-testid="slider-brush-size"
              />
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={undo}
                disabled={paths.length === 0}
                data-testid="button-undo"
              >
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={clear}
                disabled={paths.length === 0 && !currentPath}
                data-testid="button-clear"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button
                className="w-full"
                onClick={saveMask}
                disabled={paths.length === 0 || isSaving}
                data-testid="button-save-mask"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Mask
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            data-testid="button-cancel-mask"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
