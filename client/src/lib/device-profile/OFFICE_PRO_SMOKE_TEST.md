# Office-Pro Registrierung - Smoke Test

## Test 1: Non-Pro Device (cap_proraw=false)

**Setup:**
```javascript
// In browser console
FORCE_PRO_CAPABLE(false)
```

**Steps:**
1. Navigate to `/app/camera`
2. Enable Expert Mode in Manual Controls
3. Click on "Format" control

**Expected:**
- ✅ No "Dieses Gerät als Office-Pro registrieren" button
- ✅ Only JPEG and HEIC options shown
- ✅ RAW option NOT visible
- ✅ Info message: "RAW nur auf Pro-Geräten verfügbar"

---

## Test 2: Pro Device, Not Registered (cap_proraw=true, office_pro=false)

**Setup:**
```javascript
// In browser console
FORCE_PRO_CAPABLE(true)
localStorage.removeItem('pix-immo-device-profile') // Reset state
// Reload page
```

**Steps:**
1. Navigate to `/app/camera`
2. Enable Expert Mode in Manual Controls
3. Click on "Format" control

**Expected:**
- ✅ "ProRAW-fähiges Gerät erkannt!" message visible
- ✅ Button "Dieses Gerät als Office-Pro registrieren" visible (Copper background)
- ✅ Only JPEG and HEIC options shown
- ✅ RAW option NOT visible yet

---

## Test 3: Office-Pro Registration

**Setup:** Continue from Test 2

**Steps:**
1. Click "Dieses Gerät als Office-Pro registrieren" button
2. Check localStorage:
```javascript
JSON.parse(localStorage.getItem('pix-immo-device-profile'))
```

**Expected:**
- ✅ Button disappears after click
- ✅ RAW (DNG) option appears immediately
- ✅ localStorage shows:
```json
{
  "state": {
    "cap_proraw": true,
    "office_pro": true,
    "lastDetected": <timestamp>
  }
}
```
- ✅ Console log: "[Device Profile] Device registered as Office-Pro"

---

## Test 4: Persistence After Reload

**Setup:** Continue from Test 3

**Steps:**
1. Reload page (F5)
2. Navigate to `/app/camera`
3. Enable Expert Mode → Click "Format"

**Expected:**
- ✅ office_pro=true persists
- ✅ RAW (DNG) option still visible
- ✅ No registration button shown
- ✅ Can select RAW format

---

## Test 5: RAW Format Selection

**Setup:** Continue from Test 4 (registered)

**Steps:**
1. In Format panel, click "RAW (DNG)"
2. Check settings store:
```javascript
useManualModeStore.getState().fileFormat
```

**Expected:**
- ✅ RAW option becomes selected (Sage Dark background)
- ✅ Warning message appears: "RAW-Dateien benötigen ~25 MB pro Foto"
- ✅ fileFormat set to 'raw'

---

## Test 6: RAW Gating Logic

**Test Cases:**

| cap_proraw | office_pro | RAW Visible? | Button Shown? | Info Message |
|-----------|-----------|-------------|--------------|--------------|
| false | false | ❌ | ❌ | "RAW nur auf Pro-Geräten verfügbar" |
| false | true | ❌ | ❌ | "RAW nur auf Pro-Geräten verfügbar" |
| true | false | ❌ | ✅ | "ProRAW-fähiges Gerät erkannt!" |
| true | true | ✅ | ❌ | - |

---

## Test 7: Debug Helpers

**In Development Mode (browser console):**

```javascript
// Force Pro capability
FORCE_PRO_CAPABLE(true)

// Check state
JSON.parse(localStorage.getItem('pix-immo-device-profile'))

// Register as Office-Pro
REGISTER_OFFICE_PRO()

// Reset detection
RESET_PRO_DETECTION()
```

**Expected:**
- ✅ All debug commands work
- ✅ Console logs confirm actions
- ✅ localStorage updates accordingly

---

## Summary

✅ Non-Pro devices see JPEG/HEIC only
✅ Pro devices see registration button
✅ Registration unlocks RAW option
✅ State persists across reloads
✅ Feature gating works correctly
✅ Debug helpers available

## Notes

- Sync queue integration for backend sync pending (next task)
- RAW option only appears after registration
- Info chips provide clear feedback
