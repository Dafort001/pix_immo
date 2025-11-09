import { Sun, Sunrise, Sunset } from "lucide-react";
import { Card } from "./ui/card";

interface SunPositionIndicatorProps {
  date: string; // ISO date string
  latitude: number;
  longitude: number;
  className?: string;
}

// Simplified sun position calculation
function calculateSunTimes(date: Date, lat: number, lng: number) {
  // This is a simplified calculation
  // In production, use a library like suncalc for accurate results
  
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const latRad = (lat * Math.PI) / 180;
  
  // Simplified solar noon (12:00 + longitude offset)
  const solarNoon = 12 - (lng / 15);
  
  // Simplified day length calculation
  const declination = -23.44 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));
  const decRad = (declination * Math.PI) / 180;
  
  const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(decRad));
  const dayLength = (2 * hourAngle * 12) / Math.PI;
  
  const sunrise = solarNoon - dayLength / 2;
  const sunset = solarNoon + dayLength / 2;
  
  return {
    sunrise: formatTime(sunrise),
    sunset: formatTime(sunset),
    solarNoon: formatTime(solarNoon),
    dayLength: Math.round(dayLength * 60), // in minutes
  };
}

function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function SunPositionIndicator({
  date,
  latitude,
  longitude,
  className = "",
}: SunPositionIndicatorProps) {
  const sunDate = new Date(date);
  const { sunrise, sunset, solarNoon, dayLength } = calculateSunTimes(sunDate, latitude, longitude);
  
  const dayLengthHours = Math.floor(dayLength / 60);
  const dayLengthMinutes = dayLength % 60;

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Sun className="h-5 w-5 text-amber-500" />
          <h3 className="font-medium">Sonnenverlauf</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Sunrise className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-muted-foreground text-xs">Sonnenaufgang</p>
              <p className="font-medium">{sunrise} Uhr</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sunset className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-muted-foreground text-xs">Sonnenuntergang</p>
              <p className="font-medium">{sunset} Uhr</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tageslänge</span>
            <span className="font-medium text-foreground">
              {dayLengthHours}h {dayLengthMinutes}min
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Beste Fotozeit</span>
            <span className="font-medium text-foreground">{solarNoon} Uhr</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground italic">
          Optimale Lichtverhältnisse 1-2 Stunden vor Sonnenuntergang
        </div>
      </div>
    </Card>
  );
}
