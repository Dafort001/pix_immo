import { MapPin } from "lucide-react";

interface StaticMapThumbnailProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: number;
  height?: number;
  className?: string;
}

export function StaticMapThumbnail({
  latitude,
  longitude,
  zoom = 15,
  width = 600,
  height = 400,
  className = "",
}: StaticMapThumbnailProps) {
  // Using OpenStreetMap static map tile service
  // Alternative: Use Mapbox, Google Maps Static API, or other providers
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className={`relative bg-muted rounded-lg overflow-hidden ${className}`}>
      <iframe
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={mapUrl}
        title="Karte der Immobilie"
        className="w-full h-full"
      />
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md shadow-md flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Standort</span>
      </div>
    </div>
  );
}
