/**
 * Device Capability Detection
 * Detects RAW/DNG support via MediaDevices API
 */

import { useDeviceProfileStore, hasDetectionRunThisSession } from './store';

/**
 * Detects RAW/DNG capability via MediaDevices API
 * 
 * Detection Strategy:
 * 1. Check if getUserMedia is available
 * 2. Request camera with advanced constraints
 * 3. Check for RAW-related capabilities in MediaStreamTrack
 * 4. Look for DNG/RAW format support
 * 
 * @returns Promise<boolean> - true if device supports RAW/DNG capture
 */
export async function detectRawCapability(): Promise<boolean> {
  try {
    // Check if MediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('[Device Profile] MediaDevices API not available');
      return false;
    }

    // Request camera access to check capabilities
    let stream: MediaStream | null = null;
    
    try {
      // Request rear camera with high resolution
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 4032 },
          height: { ideal: 3024 },
        },
      });

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        console.log('[Device Profile] No video track available');
        return false;
      }

      // Get track capabilities
      const capabilities = videoTrack.getCapabilities?.();
      if (!capabilities) {
        console.log('[Device Profile] getCapabilities not supported');
        return false;
      }

      // Check for RAW-related capabilities
      // Note: Actual RAW detection varies by browser/device
      // This is a heuristic approach based on available constraints
      
      // Method 1: Check for advanced image capture capabilities
      const hasAdvancedCapture = 'imageHeight' in capabilities && 
                                 'imageWidth' in capabilities;
      
      // Method 2: Check for high resolution support (ProRAW devices typically support 4K+)
      const maxWidth = capabilities.width?.max || 0;
      const maxHeight = capabilities.height?.max || 0;
      const hasHighResolution = maxWidth >= 3000 && maxHeight >= 3000;
      
      // Method 3: Check for torch (flash) - Pro devices usually have this
      const hasTorch = 'torch' in capabilities;
      
      // Heuristic: If device has advanced capture + high resolution + torch,
      // it's likely a Pro device that supports RAW
      const likelyProDevice = hasAdvancedCapture && hasHighResolution && hasTorch;
      
      console.log('[Device Profile] Detection Results:', {
        hasAdvancedCapture,
        hasHighResolution,
        hasTorch,
        maxWidth,
        maxHeight,
        likelyProDevice,
        capabilities: Object.keys(capabilities),
      });
      
      return likelyProDevice;
      
    } finally {
      // Always cleanup camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    
  } catch (error) {
    console.error('[Device Profile] Detection failed:', error);
    return false;
  }
}

/**
 * Run device capability detection and update store
 * Only runs once per session (cached)
 * 
 * @param force - Force re-detection even if already run this session
 */
export async function runDeviceDetection(force = false): Promise<void> {
  // Skip if already detected this session (unless forced)
  if (!force && hasDetectionRunThisSession()) {
    console.log('[Device Profile] Detection already run this session, skipping');
    return;
  }

  console.log('[Device Profile] Running capability detection...');
  
  const isCapable = await detectRawCapability();
  
  const store = useDeviceProfileStore.getState();
  store.setCapProRAW(isCapable);
  store.markDetectionComplete();
  
  console.log(`[Device Profile] Detection complete: cap_proraw=${isCapable}`);
}

/**
 * Development-only debug override
 * Set FORCE_PRO_CAPABLE=true/false in browser console to override detection
 */
if (import.meta.env.DEV) {
  (window as any).FORCE_PRO_CAPABLE = (value: boolean) => {
    const store = useDeviceProfileStore.getState();
    store.setDebugOverride(value);
    console.log(`[Device Profile] Debug override set: ${value}`);
  };
  
  (window as any).RESET_PRO_DETECTION = () => {
    const store = useDeviceProfileStore.getState();
    store.setDebugOverride(null);
    console.log('[Device Profile] Debug override cleared');
  };
  
  (window as any).RUN_PRO_DETECTION = async () => {
    await runDeviceDetection(true);
  };
}
