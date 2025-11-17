import { useState, useRef } from "react";

interface ScrollingImageStripProps {
  images: Array<{
    url: string;
    alt: string;
    id: string;
  }>;
  duration?: number; // Duration in seconds for one complete loop
  onImageClick?: (id: string, url: string) => void;
  clickable?: boolean;
}

export function ScrollingImageStrip({
  images,
  duration = 120,
  onImageClick,
  clickable = false,
}: ScrollingImageStripProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  const handleImageClick = (id: string, url: string) => {
    if (clickable && onImageClick) {
      onImageClick(id, url);
    }
  };

  const handleMouseEnter = () => {
    if (clickable && containerRef.current) {
      containerRef.current.style.animationPlayState = 'paused';
    }
  };

  const handleMouseLeave = () => {
    if (clickable && containerRef.current) {
      containerRef.current.style.animationPlayState = 'running';
    }
  };

  // Dynamic values as CSS custom properties (best practice for runtime-calculated values)
  const scrollStyles = {
    '--scroll-width': `${duplicatedImages.length * 242}px`,
    '--scroll-duration': `${duration}s`,
  } as React.CSSProperties;

  return (
    <div className="relative w-full overflow-hidden bg-white">
      <div
        ref={containerRef}
        className="flex gap-2 animate-scroll-left"
        style={scrollStyles}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {duplicatedImages.map((image, index) => (
          <div
            key={`${image.id}-${index}`}
            className={`flex-shrink-0 w-[240px] h-[180px] relative overflow-hidden ${
              clickable ? 'cursor-pointer' : ''
            }`}
            onClick={() => handleImageClick(image.id, image.url)}
            onMouseEnter={() => setHoveredId(`${image.id}-${index}`)}
            onMouseLeave={() => setHoveredId(null)}
            data-testid={`image-strip-${index}`}
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
        ))}
      </div>
    </div>
  );
}
