/**
 * Manual Mode Settings Store
 * Persistent storage using localStorage with React integration
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ManualModeSettings } from './types';
import { DEFAULT_MANUAL_SETTINGS } from './types';

const STORAGE_KEY = 'pix-immo-manual-settings';
const EXPERT_MODE_KEY = 'pix-immo-expert-mode';

interface ManualModeStore extends ManualModeSettings {
  // Expert Mode State
  expertMode: boolean;
  
  // Actions
  setExpertMode: (enabled: boolean) => void;
  setEnabled: (enabled: boolean) => void;
  setISO: (iso: number | 'auto') => void;
  setShutterSpeed: (speed: number | 'auto') => void;
  setWhiteBalanceKelvin: (kelvin: number) => void;
  setWhiteBalancePreset: (preset: ManualModeSettings['whiteBalancePreset']) => void;
  setFocusMode: (mode: ManualModeSettings['focusMode']) => void;
  setFocusDistance: (distance: number | null) => void;
  setFocusPeaking: (enabled: boolean) => void;
  setExposureComp: (ev: number) => void;
  setFileFormat: (format: ManualModeSettings['fileFormat']) => void;
  setOIS: (enabled: boolean) => void;
  setTripodMode: (enabled: boolean) => void;
  setNightMode: (enabled: boolean) => void;
  setGridType: (type: ManualModeSettings['gridType']) => void;
  setHorizonLevel: (enabled: boolean) => void;
  setLevelIndicator: (enabled: boolean) => void;
  setLevelDegrees: (enabled: boolean) => void;
  setLevelSensitivity: (sensitivity: ManualModeSettings['levelSensitivity']) => void;
  setCaptureThumb: (enabled: boolean) => void;
  setAutoHideThumb: (enabled: boolean) => void;
  setThumbProgress: (enabled: boolean) => void;
  setMeteringMode: (mode: ManualModeSettings['meteringMode']) => void;
  setHistogram: (enabled: boolean) => void;
  setHdrBrackets: (brackets: ManualModeSettings['hdrBrackets']) => void;
  setZoomLevel: (zoom: ManualModeSettings['zoomLevel']) => void;
  setTripodCheck: (enabled: boolean) => void;
  setCongruencyCheck: (enabled: boolean) => void;
  setLongShutterTip: (enabled: boolean) => void;
  setLiveRecommendations: (enabled: boolean) => void;
  resetToAuto: () => void;
  updateSettings: (partial: Partial<ManualModeSettings>) => void;
}

/**
 * Zustand Store with localStorage persistence
 */
export const useManualModeStore = create<ManualModeStore>()(
  persist(
    (set) => ({
      // Initial state from defaults
      ...DEFAULT_MANUAL_SETTINGS,
      expertMode: false,

      // Actions
      setExpertMode: (expertMode) => 
        set((state) => {
          // If disabling expert mode, reset expert-only values to defaults
          if (!expertMode) {
            return {
              expertMode,
              iso: 'auto',
              shutterSpeed: 'auto',
              whiteBalanceKelvin: DEFAULT_MANUAL_SETTINGS.whiteBalanceKelvin,
              whiteBalancePreset: DEFAULT_MANUAL_SETTINGS.whiteBalancePreset,
              histogramEnabled: false,
              fileFormat: 'jpg',
            };
          }
          return { expertMode };
        }),
      
      setEnabled: (enabled) => set({ enabled }),
      
      setISO: (iso) => set({ iso }),
      
      setShutterSpeed: (shutterSpeed) => set({ shutterSpeed }),
      
      setWhiteBalanceKelvin: (whiteBalanceKelvin) => 
        set({ whiteBalanceKelvin, whiteBalancePreset: 'custom' }),
      
      setWhiteBalancePreset: (whiteBalancePreset) => set({ whiteBalancePreset }),
      
      setFocusMode: (focusMode) => set({ focusMode }),
      
      setFocusDistance: (focusDistance) => set({ focusDistance }),
      
      setFocusPeaking: (focusPeakingEnabled) => set({ focusPeakingEnabled }),
      
      setExposureComp: (exposureCompensation) => set({ exposureCompensation }),
      
      setFileFormat: (fileFormat) => set({ fileFormat }),
      
      setOIS: (oisEnabled) => 
        set((state) => ({
          oisEnabled,
          // Disable tripod mode if OIS is enabled
          tripodMode: oisEnabled ? false : state.tripodMode,
        })),
      
      setTripodMode: (tripodMode) =>
        set((state) => ({
          tripodMode,
          // Disable OIS if tripod mode is enabled
          oisEnabled: tripodMode ? false : state.oisEnabled,
        })),
      
      setNightMode: (nightModeEnabled) => set({ nightModeEnabled }),
      
      setGridType: (gridType) => set({ gridType }),
      
      setHorizonLevel: (horizonLevelEnabled) => set({ horizonLevelEnabled }),
      
      setLevelIndicator: (showLevelIndicator) => set({ showLevelIndicator }),
      
      setLevelDegrees: (showLevelDegrees) => set({ showLevelDegrees }),
      
      setLevelSensitivity: (levelSensitivity) => set({ levelSensitivity }),
      
      setCaptureThumb: (showCaptureThumb) => set({ showCaptureThumb }),
      
      setAutoHideThumb: (autoHideThumb) => set({ autoHideThumb }),
      
      setThumbProgress: (showThumbProgress) => set({ showThumbProgress }),
      
      setMeteringMode: (meteringMode) => set({ meteringMode }),
      
      setHistogram: (histogramEnabled) => set({ histogramEnabled }),
      
      setHdrBrackets: (hdrBrackets) => set({ hdrBrackets }),
      
      setZoomLevel: (zoomLevel) => set({ zoomLevel }),
      
      setTripodCheck: (tripodCheck) => set({ tripodCheck }),
      
      setCongruencyCheck: (congruencyCheck) => set({ congruencyCheck }),
      
      setLongShutterTip: (longShutterTip) => set({ longShutterTip }),
      
      setLiveRecommendations: (liveRecommendations) => set({ liveRecommendations }),
      
      resetToAuto: () => set(DEFAULT_MANUAL_SETTINGS),
      
      updateSettings: (partial) => set((state) => ({ ...state, ...partial })),
    }),
    {
      name: STORAGE_KEY,
    }
  )
);

/**
 * Helper: Get current settings as object
 */
export function getManualSettings(): ManualModeSettings {
  const store = useManualModeStore.getState();
  return {
    enabled: store.enabled,
    iso: store.iso,
    shutterSpeed: store.shutterSpeed,
    whiteBalanceKelvin: store.whiteBalanceKelvin,
    whiteBalancePreset: store.whiteBalancePreset,
    focusMode: store.focusMode,
    focusDistance: store.focusDistance,
    focusPeakingEnabled: store.focusPeakingEnabled,
    exposureCompensation: store.exposureCompensation,
    fileFormat: store.fileFormat,
    oisEnabled: store.oisEnabled,
    tripodMode: store.tripodMode,
    nightModeEnabled: store.nightModeEnabled,
    gridType: store.gridType,
    horizonLevelEnabled: store.horizonLevelEnabled,
    showLevelIndicator: store.showLevelIndicator,
    showLevelDegrees: store.showLevelDegrees,
    levelSensitivity: store.levelSensitivity,
    showCaptureThumb: store.showCaptureThumb,
    autoHideThumb: store.autoHideThumb,
    showThumbProgress: store.showThumbProgress,
    meteringMode: store.meteringMode,
    histogramEnabled: store.histogramEnabled,
    hdrBrackets: store.hdrBrackets,
    zoomLevel: store.zoomLevel,
    tripodCheck: store.tripodCheck,
    congruencyCheck: store.congruencyCheck,
    longShutterTip: store.longShutterTip,
    liveRecommendations: store.liveRecommendations,
  };
}
