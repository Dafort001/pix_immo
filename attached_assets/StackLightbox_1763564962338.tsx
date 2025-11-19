import { Stack } from "../types";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface StackLightboxProps {
  stack: Stack | null;
  onClose: () => void;
}

export function StackLightbox({ stack, onClose }: StackLightboxProps) {
  if (!stack) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div
        className="max-w-6xl w-full bg-white rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2>Stack {stack.id} - Detailansicht</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Main Image */}
        <div className="aspect-video bg-muted relative">
          <ImageWithFallback
            src={stack.thumbnailUrl}
            alt={`Stack ${stack.id}`}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Exposure Thumbnails */}
        <div className="p-6 border-t">
          <h3 className="mb-4">Alle Belichtungen ({stack.imageCount})</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {stack.exposures.map((exposure, index) => (
              <div key={index} className="space-y-2">
                <div className="aspect-video bg-muted rounded overflow-hidden">
                  <ImageWithFallback
                    src={exposure.url}
                    alt={exposure.ev}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center text-muted-foreground">
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
