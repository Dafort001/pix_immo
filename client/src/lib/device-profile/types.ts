/**
 * Device Profile Types
 * Tracks device capabilities for feature gating
 */

export interface DeviceProfile {
  /**
   * Whether device supports RAW/DNG capture
   * Detected via MediaDevices API capability check
   */
  cap_proraw: boolean;
  
  /**
   * Last detection timestamp
   */
  lastDetected: number | null;
}

export const DEFAULT_DEVICE_PROFILE: DeviceProfile = {
  cap_proraw: false,
  lastDetected: null,
};
