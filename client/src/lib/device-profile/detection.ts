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
    
  } catch (error: any) {
    // Distinguish between permission denied and other errors
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      console.warn('[Device Profile] Camera permission denied - will retry on next attempt');
      // Re-throw permission errors so runDeviceDetection doesn't mark as completed
      throw new Error('PERMISSION_DENIED');
    }
    
    // Other errors (NotFoundError, etc.) - treat as non-Pro device
    console.error('[Device Profile] Detection failed:', error);
    return false;
    
  } finally {
    // Always cleanup camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
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
  
  try {
    const isCapable = await detectRawCapability();
    
    const store = useDeviceProfileStore.getState();
    store.setCapProRAW(isCapable);
    store.markDetectionComplete(); // Only mark complete on success
    
    console.log(`[Device Profile] Detection complete: cap_proraw=${isCapable}`);
  } catch (error: any) {
    // Don't mark as completed if permission was denied
    // This allows retry on next camera view mount after permission grant
    if (error.message === 'PERMISSION_DENIED') {
      console.warn('[Device Profile] Permission denied - detection will retry on next camera view');
    } else {
      console.error('[Device Profile] Unexpected detection error:', error);
    }
    // Don't mark as completed - allows retry
  }
}

/**
 * Register device as Office-Pro
 * Unlocks RAW/DNG features for Pro-capable devices
 * Also queues sync to backend
 */
export async function registerAsOfficePro(): Promise<void> {
  const store = useDeviceProfileStore.getState();
  
  if (!store.cap_proraw) {
    console.warn('[Device Profile] Cannot register non-Pro device');
    return;
  }
  
  // Set local flag
  store.setOfficePro(true);
  console.log('[Device Profile] Device registered as Office-Pro');
  
  // Queue sync to backend
  // Note: Sync queue integration will be handled by caller
  // This just sets the local state
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
  
  (window as any).REGISTER_OFFICE_PRO = async () => {
    await registerAsOfficePro();
  };
}
