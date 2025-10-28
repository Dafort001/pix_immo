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
   * Whether device is registered as Office-Pro
   * Unlocks RAW/DNG features for Pro-capable devices
   */
  office_pro: boolean;
  
  /**
   * Last detection timestamp
   */
  lastDetected: number | null;
}

export const DEFAULT_DEVICE_PROFILE: DeviceProfile = {
  cap_proraw: false,
  office_pro: false,
  lastDetected: null,
};
