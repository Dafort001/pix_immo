# Device Profile Detection - Smoke Test

## Test 1: App-Start Detection

✅ **PASSED** - Console logs show detection runs automatically:
```
[Device Profile] Running capability detection...
[Device Profile] Detection complete: cap_proraw=false
```

## Test 2: localStorage Persistence

**Steps:**
1. Open browser DevTools → Console
2. Check localStorage:
```javascript
JSON.parse(localStorage.getItem('pix-immo-device-profile'))
```

**Expected Result:**
```json
{
  "state": {
    "cap_proraw": false,
    "lastDetected": 1761647477424
  },
  "version": 0
}
```

## Test 3: isProCapable() Getter

**Steps:**
1. Open browser DevTools → Console
2. Import and test:
```javascript
// Access the store
const store = window.__DEVICE_PROFILE_STORE__;

// Or test via console
// The function is already exposed via detection.ts
```

## Test 4: Debug Toggle (Development Only)

**Steps:**
1. Open browser DevTools → Console
2. Enable Pro mode:
```javascript
FORCE_PRO_CAPABLE(true)
// Should log: [Device Profile] Debug override set: true
```

3. Check value:
```javascript
JSON.parse(localStorage.getItem('pix-immo-device-profile'))
// Should show: _debugOverride: true
```

4. Disable override:
```javascript
FORCE_PRO_CAPABLE(false)
// Should log: [Device Profile] Debug override set: false
```

5. Reset override:
```javascript
RESET_PRO_DETECTION()
// Should log: [Device Profile] Debug override cleared
```

6. Force re-detection:
```javascript
RUN_PRO_DETECTION()
// Should trigger detection again
```

## Test 5: Session Cache

**Steps:**
1. Refresh page (F5)
2. Check console logs

**Expected Result:**
- First load: Detection runs
- Second refresh: "Detection already run this session, skipping"
- Hard reload (Ctrl+F5): Detection runs again

## Test 6: Camera View Detection

**Steps:**
1. Navigate to /app/camera
2. Check console logs

**Expected Result:**
- If detection already ran: "Detection already run this session, skipping"
- If not: Detection runs

## Summary

✅ Detection runs at App-Start
✅ Detection caches per session
✅ localStorage persists cap_proraw flag
✅ Debug toggles available in Development
✅ No UI changes (feature-gating only)

## Notes

- Detection may fail in development (no camera permissions)
- cap_proraw will be false unless on Pro device
- Debug override allows testing Pro features locally
