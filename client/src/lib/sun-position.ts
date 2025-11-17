import * as SunCalc from 'suncalc';

export interface SunPosition {
  altitude: number; // Sun's altitude in degrees (0 = horizon, 90 = zenith)
  azimuth: number; // Sun's azimuth in degrees (0 = north, 90 = east, 180 = south, 270 = west)
  phase: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'night';
  quality: 'optimal' | 'good' | 'fair' | 'poor';
  description: string;
}

export function calculateSunPosition(
  lat: number,
  lng: number,
  date: Date
): SunPosition {
  const position = SunCalc.getPosition(date, lat, lng);
  
  // Convert radians to degrees
  const altitudeDeg = (position.altitude * 180) / Math.PI;
  let azimuthDeg = (position.azimuth * 180) / Math.PI + 180; // Normalize to 0-360
  
  // Determine time of day phase
  const times = SunCalc.getTimes(date, lat, lng);
  const now = date.getTime();
  
  let phase: SunPosition['phase'];
  let quality: SunPosition['quality'];
  let description: string;
  
  if (now < times.dawn.getTime() || now > times.dusk.getTime()) {
    phase = 'night';
    quality = 'poor';
    description = 'Zu dunkel für Außenaufnahmen';
  } else if (now < times.sunriseEnd.getTime()) {
    phase = 'dawn';
    quality = 'good';
    description = 'Weiches Morgenlicht, ideal für stimmungsvolle Aufnahmen';
  } else if (now < times.solarNoon.getTime() - 2 * 60 * 60 * 1000) {
    phase = 'morning';
    quality = 'optimal';
    description = 'Optimales Vormittagslicht für Innen- und Außenaufnahmen';
  } else if (now < times.solarNoon.getTime() + 2 * 60 * 60 * 1000) {
    phase = 'midday';
    quality = 'fair';
    description = 'Hartes Mittagslicht, besser für Innenaufnahmen';
  } else if (now < times.sunsetStart.getTime()) {
    phase = 'afternoon';
    quality = 'optimal';
    description = 'Optimales Nachmittagslicht für Innen- und Außenaufnahmen';
  } else {
    phase = 'dusk';
    quality = 'good';
    description = 'Weiches Abendlicht, ideal für stimmungsvolle Aufnahmen';
  }
  
  return {
    altitude: Math.round(altitudeDeg * 10) / 10,
    azimuth: Math.round(azimuthDeg * 10) / 10,
    phase,
    quality,
    description,
  };
}

export function formatSunPosition(position: SunPosition): string {
  const { altitude, azimuth, phase, quality } = position;
  
  const direction = getCardinalDirection(azimuth);
  
  return `${phase === 'midday' ? 'Mittag' : 
          phase === 'morning' ? 'Vormittag' : 
          phase === 'afternoon' ? 'Nachmittag' : 
          phase === 'dawn' ? 'Morgengrauen' : 
          phase === 'dusk' ? 'Abenddämmerung' : 'Nacht'} • Sonne ${altitude.toFixed(1)}° (${direction}) • ${quality === 'optimal' ? 'Optimale Lichtverhältnisse' : 
          quality === 'good' ? 'Gute Lichtverhältnisse' : 
          quality === 'fair' ? 'Ausreichende Lichtverhältnisse' : 'Schlechte Lichtverhältnisse'}`;
}

function getCardinalDirection(azimuth: number): string {
  const directions = [
    { min: 337.5, max: 360, label: 'N' },
    { min: 0, max: 22.5, label: 'N' },
    { min: 22.5, max: 67.5, label: 'NO' },
    { min: 67.5, max: 112.5, label: 'O' },
    { min: 112.5, max: 157.5, label: 'SO' },
    { min: 157.5, max: 202.5, label: 'S' },
    { min: 202.5, max: 247.5, label: 'SW' },
    { min: 247.5, max: 292.5, label: 'W' },
    { min: 292.5, max: 337.5, label: 'NW' },
  ];
  
  const direction = directions.find(d => azimuth >= d.min && azimuth < d.max);
  return direction?.label || 'N';
}
