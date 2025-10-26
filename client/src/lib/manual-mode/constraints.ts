/**
 * MediaStream Constraints Builder for Manual Mode
 * Applies manual mode settings to camera constraints
 */

import type { ManualModeSettings } from './types';

/**
 * Extended MediaTrackConstraints with experimental camera properties
 * Note: Many of these are not yet in standard TypeScript types
 */
interface ExtendedConstraints extends MediaTrackConstraints {
  iso?: ConstrainULong;
  exposureTime?: ConstrainDouble;
  whiteBalanceMode?: ConstrainDOMString;
  colorTemperature?: ConstrainDouble;
  focusMode?: ConstrainDOMString;
  focusDistance?: ConstrainDouble;
  exposureCompensation?: ConstrainDouble;
  imageStabilization?: ConstrainDOMString;
  torch?: ConstrainBoolean;
}

/**
 * Build MediaStream constraints from manual mode settings
 */
export function buildCameraConstraints(
  settings: ManualModeSettings,
  facingMode: 'user' | 'environment'
): MediaStreamConstraints {
  const videoConstraints: MediaTrackConstraints = {
    facingMode,
    aspectRatio: { ideal: 2 / 3 }, // Portrait mode
  };

  // Only apply advanced constraints if manual mode is enabled
  if (!settings.enabled) {
    return { video: videoConstraints };
  }

  const advanced: ExtendedConstraints[] = [];

  // ISO (exposureCompensation in MediaStream API)
  if (settings.iso !== 'auto' && typeof settings.iso === 'number') {
    advanced.push({ iso: settings.iso });
  }

  // Shutter Speed (exposureTime in microseconds)
  if (settings.shutterSpeed !== 'auto' && typeof settings.shutterSpeed === 'number') {
    const exposureTimeMicroseconds = settings.shutterSpeed * 1_000_000;
    advanced.push({ exposureTime: exposureTimeMicroseconds });
  }

  // White Balance (whiteBalanceMode + colorTemperature)
  if (settings.whiteBalanceKelvin !== 5500) { // Default daylight is 5500K
    advanced.push({
      whiteBalanceMode: 'manual',
      colorTemperature: settings.whiteBalanceKelvin,
    });
  }

  // Focus Mode
  if (settings.focusMode === 'manual' && settings.focusDistance !== null) {
    advanced.push({
      focusMode: 'manual',
      focusDistance: settings.focusDistance,
    });
  } else {
    advanced.push({ focusMode: 'continuous' });
  }

  // Exposure Compensation
  if (settings.exposureCompensation !== 0) {
    advanced.push({ exposureCompensation: settings.exposureCompensation });
  }

  // Image Stabilization (OIS)
  if (settings.oisEnabled && !settings.tripodMode) {
    advanced.push({ imageStabilization: 'optical' });
  } else if (settings.tripodMode) {
    // Disable OIS in tripod mode
    advanced.push({ imageStabilization: 'off' });
  }

  // Night Mode (lowLightBoost)
  if (settings.nightModeEnabled) {
    advanced.push({ torch: false }); // No flash in night mode
  }

  if (advanced.length > 0) {
    videoConstraints.advanced = advanced;
  }

  return { video: videoConstraints };
}

/**
 * Apply settings to existing video track
 */
export async function applySettingsToTrack(
  track: MediaStreamTrack,
  settings: ManualModeSettings
): Promise<void> {
  if (!settings.enabled) {
    // Reset to auto mode (use any to bypass TypeScript for experimental properties)
    try {
      await track.applyConstraints({
        focusMode: 'continuous',
      } as any);
      console.log('[Manual Mode] Reset to auto mode');
    } catch (e) {
      console.warn('[Manual Mode] Failed to reset constraints:', e);
    }
    return;
  }

  // Check capabilities first (use any to bypass TypeScript for experimental properties)
  const capabilities = track.getCapabilities() as any;
  
  // Build constraints selectively - only add supported constraints
  const constraints: ExtendedConstraints = {};
  const appliedSettings: string[] = [];
  const unsupportedSettings: string[] = [];

  // ISO
  if (settings.iso !== 'auto') {
    if (capabilities.iso) {
      constraints.iso = settings.iso as any;
      appliedSettings.push(`ISO: ${settings.iso}`);
    } else {
      unsupportedSettings.push('ISO');
    }
  }

  // Shutter Speed (exposureTime)
  if (settings.shutterSpeed !== 'auto') {
    if (capabilities.exposureTime) {
      const exposureTimeMicroseconds = settings.shutterSpeed * 1_000_000;
      constraints.exposureTime = exposureTimeMicroseconds as any;
      appliedSettings.push(`Shutter: ${settings.shutterSpeed}s`);
    } else {
      unsupportedSettings.push('Shutter Speed');
    }
  }

  // White Balance
  if (settings.whiteBalanceKelvin !== 5500) {
    if (capabilities.whiteBalanceMode && capabilities.colorTemperature) {
      constraints.whiteBalanceMode = 'manual' as any;
      constraints.colorTemperature = settings.whiteBalanceKelvin as any;
      appliedSettings.push(`WB: ${settings.whiteBalanceKelvin}K`);
    } else {
      unsupportedSettings.push('White Balance');
    }
  }

  // Focus
  if (capabilities.focusMode) {
    if (settings.focusMode === 'manual' && settings.focusDistance !== null) {
      if (capabilities.focusDistance) {
        constraints.focusMode = 'manual' as any;
        constraints.focusDistance = settings.focusDistance as any;
        appliedSettings.push(`Focus: Manual (${settings.focusDistance.toFixed(2)})`);
      } else {
        constraints.focusMode = 'manual' as any;
        appliedSettings.push('Focus: Manual (distance not supported)');
      }
    } else {
      constraints.focusMode = 'continuous' as any;
      appliedSettings.push('Focus: Auto');
    }
  } else {
    if (settings.focusMode === 'manual') {
      unsupportedSettings.push('Manual Focus');
    }
  }

  // Exposure Compensation
  if (settings.exposureCompensation !== 0) {
    if (capabilities.exposureCompensation) {
      constraints.exposureCompensation = settings.exposureCompensation as any;
      appliedSettings.push(`EV: ${settings.exposureCompensation > 0 ? '+' : ''}${settings.exposureCompensation}`);
    } else {
      unsupportedSettings.push('Exposure Compensation');
    }
  }

  // Image Stabilization
  if (capabilities.imageStabilization) {
    if (settings.oisEnabled && !settings.tripodMode) {
      constraints.imageStabilization = 'optical' as any;
      appliedSettings.push('OIS: ON');
    } else {
      constraints.imageStabilization = 'off' as any;
      if (settings.tripodMode) appliedSettings.push('Tripod Mode: ON');
    }
  } else {
    if (settings.oisEnabled) unsupportedSettings.push('OIS');
  }

  // Apply constraints with robust error handling
  try {
    await track.applyConstraints(constraints as any);
    
    if (appliedSettings.length > 0) {
      console.log(`[Manual Mode] ✓ Applied: ${appliedSettings.join(', ')}`);
    }
    if (unsupportedSettings.length > 0) {
      console.warn(`[Manual Mode] ⚠ Unsupported: ${unsupportedSettings.join(', ')}`);
    }
  } catch (error: any) {
    console.error('[Manual Mode] ✗ Failed to apply constraints:', {
      error: error.message || error,
      constraint: error.constraint,
      attemptedSettings: appliedSettings,
    });
    
    // Try to recover by applying constraints one by one
    console.log('[Manual Mode] Attempting individual constraint application...');
    let recoveredCount = 0;
    
    for (const [key, value] of Object.entries(constraints)) {
      try {
        await track.applyConstraints({ [key]: value } as any);
        recoveredCount++;
      } catch (e: any) {
        console.warn(`[Manual Mode] Failed to apply ${key}:`, e.message);
      }
    }
    
    if (recoveredCount > 0) {
      console.log(`[Manual Mode] ✓ Recovered ${recoveredCount}/${Object.keys(constraints).length} settings`);
    }
  }
}

/**
 * Get supported manual mode features from track capabilities
 */
export function getSupportedFeatures(track: MediaStreamTrack): {
  iso: boolean;
  exposureTime: boolean;
  whiteBalance: boolean;
  focusDistance: boolean;
  exposureCompensation: boolean;
  imageStabilization: boolean;
} {
  const capabilities = track.getCapabilities() as any;

  return {
    iso: !!capabilities.iso,
    exposureTime: !!capabilities.exposureTime,
    whiteBalance: !!capabilities.whiteBalanceMode && !!capabilities.colorTemperature,
    focusDistance: !!capabilities.focusMode && !!capabilities.focusDistance,
    exposureCompensation: !!capabilities.exposureCompensation,
    imageStabilization: !!capabilities.imageStabilization,
  };
}

/**
 * Log capability information for debugging
 */
export function logCapabilities(track: MediaStreamTrack): void {
  const capabilities = track.getCapabilities() as any;
  const supported = getSupportedFeatures(track);

  console.group('[Manual Mode] Camera Capabilities');
  console.log('Supported Features:', supported);
  console.log('ISO Range:', capabilities.iso);
  console.log('Exposure Time Range:', capabilities.exposureTime);
  console.log('Color Temperature Range:', capabilities.colorTemperature);
  console.log('Focus Distance Range:', capabilities.focusDistance);
  console.log('Exposure Compensation Range:', capabilities.exposureCompensation);
  console.log('Full Capabilities:', capabilities);
  console.groupEnd();
}
