# B2a - Workers KV Setup Guide

## Overview
Workers KV stores canary configuration for instant rollback without redeployment. The `CANARY_CONFIG` namespace controls percentage-based traffic sampling.

---

## 1. Create KV Namespaces

```bash
# Production namespace
wrangler kv:namespace create "CANARY_CONFIG"
# Output: { id: "abc123xyz", title: "pixcapture-api-CANARY_CONFIG" }

# Preview namespace
wrangler kv:namespace create "CANARY_CONFIG" --preview
# Output: { id: "def456uvw", title: "pixcapture-api-CANARY_CONFIG_preview" }
```

---

## 2. Update wrangler.toml

Replace placeholder IDs with actual namespace IDs:

```toml
[[kv_namespaces]]
binding = "CANARY_CONFIG"
id = "abc123xyz"           # Replace with production namespace ID
preview_id = "def456uvw"   # Replace with preview namespace ID
```

---

## 3. Seed Initial Configuration

### Production (10% Canary)
```bash
wrangler kv:key put --namespace-id=abc123xyz "config" \
  '{"canary_percent":10,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"2025-11-15T10:00:00Z"}'
```

### Preview (50% Canary for testing)
```bash
wrangler kv:key put --namespace-id=def456uvw "config" --preview \
  '{"canary_percent":50,"canary_tag":"B2a-preview","emergency_proxy":false,"last_updated":"2025-11-15T10:00:00Z"}'
```

---

## 4. Verify Configuration

```bash
# Check production config
wrangler kv:key get --namespace-id=abc123xyz "config"

# Check preview config
wrangler kv:key get --namespace-id=def456uvw "config" --preview
```

**Expected Output:**
```json
{
  "canary_percent": 10,
  "canary_tag": "B2a",
  "emergency_proxy": false,
  "last_updated": "2025-11-15T10:00:00Z"
}
```

---

## 5. Runtime Access (Code Example)

```typescript
// workers/edge.ts
import type { CanaryKVConfig } from './edge';

async function getCanaryConfig(env: Env): Promise<CanaryKVConfig> {
  if (!env.CANARY_CONFIG) {
    // KV not bound - use defaults
    return {
      canary_percent: 0,
      canary_tag: 'disabled',
      emergency_proxy: false,
    };
  }

  const raw = await env.CANARY_CONFIG.get('config', { type: 'json' });
  if (!raw) {
    // No config found - use safe defaults
    return {
      canary_percent: 0,
      canary_tag: 'missing',
      emergency_proxy: false,
    };
  }

  return raw as CanaryKVConfig;
}
```

---

## 6. Update Configuration (No Redeploy Required!)

### Increase Canary to 50% (B2b Ramp-Up)
```bash
wrangler kv:key put --namespace-id=abc123xyz "config" \
  '{"canary_percent":50,"canary_tag":"B2b","emergency_proxy":false,"last_updated":"2025-11-16T14:00:00Z"}'
```

### Emergency Rollback (100% Proxy)
```bash
wrangler kv:key put --namespace-id=abc123xyz "config" \
  '{"canary_percent":0,"canary_tag":"B2a","emergency_proxy":true,"last_updated":"2025-11-15T12:30:00Z"}'
```

### Disable Canary Completely
```bash
wrangler kv:key put --namespace-id=abc123xyz "config" \
  '{"canary_percent":0,"canary_tag":"disabled","emergency_proxy":false,"last_updated":"2025-11-15T15:00:00Z"}'
```

---

## 7. Monitoring KV Access

### List All Keys
```bash
wrangler kv:key list --namespace-id=abc123xyz
```

### Delete Config (Reset to Code Defaults)
```bash
wrangler kv:key delete --namespace-id=abc123xyz "config"
```

---

## 8. Cloudflare Dashboard (Alternative to CLI)

1. **Navigate:** Cloudflare Dashboard → Workers & Pages → KV
2. **Find Namespace:** `pixcapture-api-CANARY_CONFIG`
3. **Edit Key:** `config`
4. **Update JSON:** Change `canary_percent` or `emergency_proxy`
5. **Save:** Changes take effect immediately (< 60 seconds globally)

---

## 9. Rollback Speed Comparison

| **Method** | **Rollback Time** | **Requires Deploy?** |
|------------|------------------|---------------------|
| **wrangler.toml (B1)** | 2-5 minutes | ✅ Yes |
| **Workers KV (B2a)** | 10-60 seconds | ❌ No |
| **Dashboard Edit (B2a)** | 10-60 seconds | ❌ No |

---

## 10. Schema Validation

The Worker validates KV config at runtime:

```typescript
function validateCanaryConfig(config: any): CanaryKVConfig {
  return {
    canary_percent: Math.max(0, Math.min(100, Number(config?.canary_percent || 0))),
    canary_tag: String(config?.canary_tag || 'unknown'),
    emergency_proxy: Boolean(config?.emergency_proxy),
    last_updated: config?.last_updated || new Date().toISOString(),
  };
}
```

**Edge Cases:**
- Missing KV binding → 0% canary (safe default)
- Invalid JSON → 0% canary (safe default)
- `canary_percent > 100` → clamped to 100
- `canary_percent < 0` → clamped to 0

---

## 11. Best Practices

1. **Always Set last_updated:** Timestamp helps track config changes
2. **Use Gradual Ramp-Up:** 10% → 50% → 100% with monitoring
3. **Test in Preview First:** Validate config changes before production
4. **Monitor KV Access Logs:** Cloudflare Analytics → Workers KV Requests
5. **Document Changes:** Keep rollout log (who, when, why)

---

## 12. Troubleshooting

### Config Not Taking Effect
- **Check KV Namespace ID:** Ensure wrangler.toml IDs match actual namespaces
- **Verify Binding Name:** Must be exactly `CANARY_CONFIG` (case-sensitive)
- **Wait 60 Seconds:** Global KV propagation takes up to 1 minute
- **Check Worker Logs:** `console.log(await getCanaryConfig(env))`

### Emergency Proxy Not Working
- **Verify JSON:** `emergency_proxy` must be boolean `true` (not string `"true"`)
- **Check Worker Logic:** Ensure `emergency_proxy` is checked FIRST in decision hierarchy
- **Dashboard Verify:** Cloudflare KV → View Key `config` → Confirm value

---

**Setup Status:** ⏳ Pending - Run KV namespace creation commands  
**Next Step:** Replace placeholder IDs in wrangler.toml → Seed config → Deploy
