import { useState } from "react";

interface ScrollingImageStripProps {
  images: Array<{
    url: string;
    alt: string;
    id: string;
    aspectRatio?: "3:2" | "16:9" | "9:16" | "4:3";
  }>;
  duration?: number;
  onImageClick?: (id: string, url: string) => void;
  clickable?: boolean;
  height?: number; // Feste Höhe in px (Standard: 360)
}

export function ScrollingImageStrip({
  images,
  duration = 120,
  onImageClick,
  clickable = false,
  height = 360,
}: ScrollingImageStripProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Berechne Breite basierend auf Aspect Ratio bei fester Höhe
  const getWidth = (aspectRatio: string = "3:2"): number => {
    const ratios: Record<string, number> = {
      "3:2": 1.5,      // Standard: 540px bei h=360
      "16:9": 1.778,   // Breit: 640px bei h=360
      "9:16": 0.5625,  // Hochformat: 203px bei h=360
      "4:3": 1.333,    // Legacy: 480px bei h=360
    };
    return Math.round(height * ratios[aspectRatio]);
  };

  const duplicatedImages = [...images, ...images];
  
  // Berechne Gesamtbreite für Animation (Breite aller Bilder + Gap nach jedem Bild für seamless Loop)
  const gapPx = 8; // gap-2 = 0.5rem = 8px
  const totalWidth = images.reduce((sum, img) => {
    return sum + getWidth(img.aspectRatio) + gapPx;
  }, 0);

  const handleImageClick = (id: string, url: string) => {
    if (clickable && onImageClick) {
      onImageClick(id, url);
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-white" style={{ height: `${height}px` }}>
      <div
        className="flex gap-2"
        style={{
          animation: `scroll-left ${duration}s linear infinite`,
        }}
        onMouseEnter={() => {
          if (clickable) {
            const element = document.querySelector('.scrolling-strip') as HTMLElement;
            if (element) element.style.animationPlayState = 'paused';
          }
        }}
        onMouseLeave={() => {
          if (clickable) {
            const element = document.querySelector('.scrolling-strip') as HTMLElement;
            if (element) element.style.animationPlayState = 'running';
          }
        }}
      >
        {duplicatedImages.map((image, index) => {
          const imageWidth = getWidth(image.aspectRatio);
          return (
            <div
              key={`${image.id}-${index}`}
              className={`flex-shrink-0 relative overflow-hidden scrolling-strip ${
                clickable ? 'cursor-pointer' : ''
              }`}
              style={{
                width: `${imageWidth}px`,
                height: `${height}px`,
              }}
              onClick={() => handleImageClick(image.id, image.url)}
              onMouseEnter={() => setHoveredId(`${image.id}-${index}`)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <img
                src={image.url}
                alt={image.alt}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  hoveredId === `${image.id}-${index}` && clickable
                    ? 'scale-110'
                    : 'scale-100'
                }`}
              />
            {clickable && hoveredId === `${image.id}-${index}` && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-black"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${totalWidth}px);
          }
        }
      `}</style>
    </div>
  );
}
