import { useState } from "react";

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

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  const handleImageClick = (id: string, url: string) => {
    if (clickable && onImageClick) {
      onImageClick(id, url);
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-[var(--color-white)]">
      <div
        className="flex gap-2"
        style={{
          animation: `scroll-left ${duration}s linear infinite`,
          width: `${duplicatedImages.length * 482}px`,
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
        {duplicatedImages.map((image, index) => (
          <div
            key={`${image.id}-${index}`}
            className={`flex-shrink-0 w-[480px] h-[360px] relative overflow-hidden scrolling-strip ${
              clickable ? 'cursor-pointer' : ''
            }`}
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
                    className="text-[var(--color-black)]"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${images.length * 482}px);
          }
        }
      `}</style>
    </div>
  );
}
