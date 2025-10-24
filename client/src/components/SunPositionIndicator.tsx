import { useState, useEffect } from "react";
import { Sun } from "lucide-react";
import { getTimes, getPosition } from "suncalc";

type SunPositionIndicatorProps = {
  lat: number;
  lng: number;
  initialDate?: Date;
};

export function SunPositionIndicator({ lat, lng, initialDate }: SunPositionIndicatorProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [sunData, setSunData] = useState<{
    azimuth: number;
    altitude: number;
    times: ReturnType<typeof getTimes>;
  } | null>(null);

  useEffect(() => {
    const position = getPosition(selectedDate, lat, lng);
    const times = getTimes(selectedDate, lat, lng);
    
    const azimuthDeg = ((position.azimuth * 180) / Math.PI + 180) % 360;
    const altitudeDeg = (position.altitude * 180) / Math.PI;
    
    setSunData({
      azimuth: azimuthDeg,
      altitude: altitudeDeg,
      times,
    });
  }, [selectedDate, lat, lng]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(e.target.value));
  };

  const toLocalInputValue = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const da = pad(d.getDate());
    const h = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${y}-${m}-${da}T${h}:${mi}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isNight = sunData ? sunData.altitude < 0 : false;
  const compassDirection = sunData ? Math.round(sunData.azimuth) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label htmlFor="sun-datetime" className="text-sm font-medium flex-shrink-0">
          Datum & Uhrzeit:
        </label>
        <input
          id="sun-datetime"
          type="datetime-local"
          value={toLocalInputValue(selectedDate)}
          onChange={handleDateChange}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          data-testid="input-sun-datetime"
        />
      </div>

      <div className="flex items-center gap-6">
        {/* Compass Visualization */}
        <div className="relative flex-shrink-0" style={{ width: "120px", height: "120px" }}>
          <svg viewBox="0 0 120 120" className="w-full h-full">
            {/* Outer circle */}
            <circle
              cx="60"
              cy="60"
              r="55"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground/20"
            />
            
            {/* Cardinal directions */}
            <text x="60" y="15" textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="10">N</text>
            <text x="105" y="63" textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="10">O</text>
            <text x="60" y="110" textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="10">S</text>
            <text x="15" y="63" textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="10">W</text>
            
            {/* Sun ray */}
            {sunData && (
              <>
                <line
                  x1="60"
                  y1="60"
                  x2={60 + 45 * Math.sin((compassDirection * Math.PI) / 180)}
                  y2={60 - 45 * Math.cos((compassDirection * Math.PI) / 180)}
                  stroke="#4A5849"
                  strokeWidth="3"
                  strokeOpacity={isNight ? 0.3 : 0.7}
                  strokeDasharray={isNight ? "4 4" : "none"}
                  data-testid="sun-ray"
                />
                {/* Sun icon at end of ray */}
                <circle
                  cx={60 + 45 * Math.sin((compassDirection * Math.PI) / 180)}
                  cy={60 - 45 * Math.cos((compassDirection * Math.PI) / 180)}
                  r="6"
                  fill="#4A5849"
                  opacity={isNight ? 0.3 : 0.7}
                />
              </>
            )}
          </svg>
        </div>

        {/* Sun data */}
        <div className="flex-1 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" style={{ color: '#4A5849' }} />
            <span className="font-medium">Sonnenstand</span>
          </div>
          
          {sunData && (
            <>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Richtung:</span>
                  <span className="ml-1 font-medium" data-testid="text-sun-azimuth">
                    {compassDirection}°
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Höhe:</span>
                  <span className="ml-1 font-medium" data-testid="text-sun-altitude">
                    {Math.round(sunData.altitude)}°
                  </span>
                </div>
              </div>
              
              <div className="pt-2 border-t text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sonnenaufgang:</span>
                  <span className="font-medium" data-testid="text-sunrise">
                    {formatTime(sunData.times.sunrise)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sonnenuntergang:</span>
                  <span className="font-medium" data-testid="text-sunset">
                    {formatTime(sunData.times.sunset)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goldene Stunde:</span>
                  <span className="font-medium" data-testid="text-golden-hour">
                    {formatTime(sunData.times.goldenHour)}
                  </span>
                </div>
              </div>

              {isNight && (
                <div className="text-xs text-muted-foreground italic pt-1">
                  Sonne unter dem Horizont
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
