/**
 * Device Profile Store
 * Persistent storage using localStorage with React integration
 * Stores device capability flags for feature gating
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeviceProfile } from './types';
import { DEFAULT_DEVICE_PROFILE } from './types';

const STORAGE_KEY = 'pix-immo-device-profile';

interface DeviceProfileStore extends DeviceProfile {
  // Session cache flag - prevents multiple detections per session
  _detectionRunThisSession: boolean;
  
  // Actions
  setCapProRAW: (capable: boolean) => void;
  setOfficePro: (enabled: boolean) => void;
  markDetectionComplete: () => void;
  
  // Debug override (development only)
  setDebugOverride: (override: boolean | null) => void;
  _debugOverride: boolean | null;
}

/**
 * Zustand Store with localStorage persistence
 */
export const useDeviceProfileStore = create<DeviceProfileStore>()(
  persist(
    (set) => ({
      // Initial state from defaults
      ...DEFAULT_DEVICE_PROFILE,
      _detectionRunThisSession: false,
      _debugOverride: null,

      // Actions
      setCapProRAW: (cap_proraw) =>
        set({
          cap_proraw,
          lastDetected: Date.now(),
        }),

      setOfficePro: (office_pro) =>
        set({ office_pro }),

      markDetectionComplete: () =>
        set({
          _detectionRunThisSession: true,
        }),
      
      setDebugOverride: (_debugOverride) =>
        set({ _debugOverride }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        // Only persist these fields
        cap_proraw: state.cap_proraw,
        office_pro: state.office_pro,
        lastDetected: state.lastDetected,
        _debugOverride: state._debugOverride,
        // _detectionRunThisSession is session-only, not persisted
      }),
    }
  )
);

/**
 * Read-only getter for Pro capability
 * Use this for UI/feature gating instead of direct store access
 */
export function isProCapable(): boolean {
  const state = useDeviceProfileStore.getState();
  
  // Debug override takes precedence (development only)
  if (import.meta.env.DEV && state._debugOverride !== null) {
    return state._debugOverride;
  }
  
  return state.cap_proraw;
}

/**
 * Check if detection has already run this session
 */
export function hasDetectionRunThisSession(): boolean {
  return useDeviceProfileStore.getState()._detectionRunThisSession;
}
