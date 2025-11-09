import { useState } from "react";
import { Link } from "wouter";
import Masonry from "react-responsive-masonry";

interface PortfolioImage {
  id: string;
  url: string;
  alt: string;
  aspectRatio: "3:2" | "2:3" | "16:9" | "9:16" | "1:1";
}

interface PortfolioMasonryProps {
  images: PortfolioImage[];
}

const accentColors = [
  "#64E649", // Green
  "#74A4EA", // Blue
  "#C94B38", // Red
  "#D8B95A", // Yellow
  "#D87098", // Pink
  "#CB8C48", // Orange
];

// Get a consistent color for each image based on its ID
const getColorForImage = (id: string): string => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return accentColors[hash % accentColors.length];
};

export function PortfolioMasonry({ images }: PortfolioMasonryProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  return (
    <Masonry columnsCountBreakPoints={{ 350: 1, 768: 2, 1024: 4 }} gutter="8px">
      {images.map((image) => (
        <Link key={image.id} href={`/portfolio/${image.id}`}>
          <div
            className="relative cursor-pointer overflow-hidden group"
            onMouseEnter={() => setHoveredId(image.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Placeholder with alt text and accent color */}
            {!loadedImages.has(image.id) && (
              <div
                className="absolute inset-0 flex items-center justify-center p-4 text-center"
                style={{ backgroundColor: getColorForImage(image.id) }}
              >
                <span className="text-white text-sm">{image.alt}</span>
              </div>
            )}

            {/* Image */}
            <img
              src={image.url}
              alt={image.alt}
              loading="lazy"
              onLoad={() => handleImageLoad(image.id)}
              className={`w-full h-auto block transition-opacity duration-300 ${
                loadedImages.has(image.id) ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Hover overlay with alt text */}
            {hoveredId === image.id && loadedImages.has(image.id) && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 text-center transition-opacity duration-300">
                <span className="text-white text-sm">{image.alt}</span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </Masonry>
  );
}
