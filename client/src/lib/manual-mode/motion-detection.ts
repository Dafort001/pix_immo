/**
 * Motion Detection & Stability Analysis
 * Uses DeviceMotionEvent API for gyroscope and accelerometer data
 */

export interface MotionReading {
  timestamp: number;
  rotationRate: {
    alpha: number;
    beta: number;
    gamma: number;
  } | null;
  acceleration: {
    x: number;
    y: number;
    z: number;
  } | null;
}

export interface StabilityResult {
  isStable: boolean;
  score: number; // 0-1, higher = more stable
  readings: MotionReading[];
  message?: string;
}

/**
 * Stability thresholds
 */
const STABILITY_THRESHOLDS = {
  // Rotation rate (deg/s) - hand movement detection
  ROTATION_RATE_THRESHOLD: 2.0, // Higher than 2°/s = unstable
  
  // Acceleration (m/s²) - device movement detection
  ACCELERATION_THRESHOLD: 0.5, // Higher than 0.5 m/s² = unstable
  
  // Minimum stable score for HDR/Night mode
  MIN_STABLE_SCORE_HDR3: 0.70, // 70% stable readings required for HDR3
  MIN_STABLE_SCORE_HDR5: 0.80, // 80% stable readings required for HDR5
  MIN_STABLE_SCORE_NIGHT: 0.75, // 75% stable readings required for night mode
};

/**
 * Check device motion stability over a period of time
 * @param durationMs - How long to sample motion (default: 700ms)
 * @param samplingRate - How often to sample (default: 50ms)
 */
export async function checkMotionStability(
  durationMs: number = 700,
  samplingRate: number = 50
): Promise<StabilityResult> {
  // Check if DeviceMotionEvent is supported
  if (typeof DeviceMotionEvent === 'undefined') {
    return {
      isStable: true,
      score: 1.0,
      readings: [],
      message: 'DeviceMotionEvent not supported',
    };
  }

  const readings: MotionReading[] = [];
  const startTime = Date.now();
  const endTime = startTime + durationMs;
  
  return new Promise((resolve) => {
    const handleMotion = (event: DeviceMotionEvent) => {
      const reading: MotionReading = {
        timestamp: Date.now(),
        rotationRate: event.rotationRate
          ? {
              alpha: event.rotationRate.alpha ?? 0,
              beta: event.rotationRate.beta ?? 0,
              gamma: event.rotationRate.gamma ?? 0,
            }
          : null,
        acceleration: event.acceleration
          ? {
              x: event.acceleration.x ?? 0,
              y: event.acceleration.y ?? 0,
              z: event.acceleration.z ?? 0,
            }
          : null,
      };
      
      readings.push(reading);
    };

    // Add event listener
    window.addEventListener('devicemotion', handleMotion);

    // Wait for duration
    setTimeout(() => {
      window.removeEventListener('devicemotion', handleMotion);

      // Analyze readings
      if (readings.length === 0) {
        resolve({
          isStable: true,
          score: 1.0,
          readings: [],
          message: 'No motion data available',
        });
        return;
      }

      // Calculate stability score
      const stableReadings = readings.filter((reading) => {
        // Check rotation rate
        if (reading.rotationRate) {
          const rotationMagnitude = Math.sqrt(
            Math.pow(reading.rotationRate.alpha, 2) +
            Math.pow(reading.rotationRate.beta, 2) +
            Math.pow(reading.rotationRate.gamma, 2)
          );
          
          if (rotationMagnitude > STABILITY_THRESHOLDS.ROTATION_RATE_THRESHOLD) {
            return false;
          }
        }

        // Check acceleration
        if (reading.acceleration) {
          const accelMagnitude = Math.sqrt(
            Math.pow(reading.acceleration.x, 2) +
            Math.pow(reading.acceleration.y, 2) +
            Math.pow(reading.acceleration.z, 2)
          );
          
          if (accelMagnitude > STABILITY_THRESHOLDS.ACCELERATION_THRESHOLD) {
            return false;
          }
        }

        return true;
      });

      const score = stableReadings.length / readings.length;
      
      resolve({
        isStable: score >= 0.7, // Default threshold
        score,
        readings,
      });
    }, durationMs);
  });
}

/**
 * Calculate bracket alignment score for post-capture validation
 * Compares motion between HDR bracket captures
 */
export function calculateBracketAlignmentScore(
  readings: MotionReading[],
  brackets: 3 | 5
): number {
  if (readings.length === 0) {
    return 1.0; // No data = assume perfect
  }

  // Split readings into bracket groups
  const readingsPerBracket = Math.floor(readings.length / brackets);
  const bracketGroups: MotionReading[][] = [];
  
  for (let i = 0; i < brackets; i++) {
    const start = i * readingsPerBracket;
    const end = start + readingsPerBracket;
    bracketGroups.push(readings.slice(start, end));
  }

  // Calculate variance between brackets
  let totalVariance = 0;
  
  for (let i = 1; i < bracketGroups.length; i++) {
    const prevGroup = bracketGroups[i - 1];
    const currGroup = bracketGroups[i];
    
    // Calculate average rotation/acceleration for each group
    const prevAvg = calculateAverageMotion(prevGroup);
    const currAvg = calculateAverageMotion(currGroup);
    
    // Calculate difference
    const rotationDiff = Math.abs(prevAvg.rotation - currAvg.rotation);
    const accelDiff = Math.abs(prevAvg.acceleration - currAvg.acceleration);
    
    totalVariance += rotationDiff + accelDiff;
  }

  // Convert variance to score (0-1, lower variance = higher score)
  const score = Math.max(0, 1 - (totalVariance / brackets));
  
  return score;
}

/**
 * Helper: Calculate average motion from readings
 */
function calculateAverageMotion(readings: MotionReading[]): {
  rotation: number;
  acceleration: number;
} {
  if (readings.length === 0) {
    return { rotation: 0, acceleration: 0 };
  }

  let totalRotation = 0;
  let totalAccel = 0;
  
  readings.forEach((reading) => {
    if (reading.rotationRate) {
      totalRotation += Math.sqrt(
        Math.pow(reading.rotationRate.alpha, 2) +
        Math.pow(reading.rotationRate.beta, 2) +
        Math.pow(reading.rotationRate.gamma, 2)
      );
    }
    
    if (reading.acceleration) {
      totalAccel += Math.sqrt(
        Math.pow(reading.acceleration.x, 2) +
        Math.pow(reading.acceleration.y, 2) +
        Math.pow(reading.acceleration.z, 2)
      );
    }
  });

  return {
    rotation: totalRotation / readings.length,
    acceleration: totalAccel / readings.length,
  };
}

/**
 * Estimate shutter speed based on lighting conditions
 * Returns estimated exposure time in seconds
 */
export function estimateShutterSpeed(
  iso: number | 'auto',
  exposureComp: number,
  nightMode: boolean
): number {
  // Default shutter speeds based on mode
  if (nightMode) {
    return 1.0; // 1 second for night mode
  }

  // For auto ISO, assume moderate conditions
  if (iso === 'auto') {
    return 1 / 60; // 1/60s default
  }

  // Estimate based on ISO (lower ISO = longer exposure)
  if (iso <= 100) {
    return 1 / 30;
  } else if (iso <= 400) {
    return 1 / 60;
  } else if (iso <= 1600) {
    return 1 / 125;
  } else {
    return 1 / 250;
  }
}

/**
 * Stability thresholds export
 */
export { STABILITY_THRESHOLDS };
