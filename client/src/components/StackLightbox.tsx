import { JobStack } from "@/types/jobStacks";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface StackLightboxProps {
  stack: JobStack | null;
  onClose: () => void;
}

export function StackLightbox({ stack, onClose }: StackLightboxProps) {
  useEffect(() => {
    if (!stack) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [stack, onClose]);

  if (!stack) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-40 flex items-center justify-center p-8"
      onClick={onClose}
      data-testid="lightbox-overlay"
    >
      <div
        className="max-w-6xl w-full bg-card rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Stack {stack.id} - Detailansicht</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            data-testid="button-close-lightbox"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Main Image */}
        <div className="aspect-video bg-muted relative">
          <img
            src={stack.previewUrl}
            alt={`Stack ${stack.id}`}
            className="w-full h-full object-contain"
            data-testid="img-lightbox-main"
          />
        </div>

        {/* Exposure Thumbnails */}
        <div className="p-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Alle Belichtungen ({stack.imageCount})</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {stack.exposures.map((exposure, index) => (
              <div key={index} className="space-y-2">
                <div className="aspect-video bg-muted rounded overflow-hidden">
                  <img
                    src={exposure.url}
                    alt={exposure.ev}
                    className="w-full h-full object-cover"
                    data-testid={`img-exposure-${index}`}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {exposure.ev}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
