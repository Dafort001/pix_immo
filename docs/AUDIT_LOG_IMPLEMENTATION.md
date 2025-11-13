# Audit Log Implementation (P1)

## Overview
The audit log system tracks all admin actions that affect package limits, kulanz settings, and file selection states. This provides a compliance-critical append-only record for security audits and customer support investigations.

## Database Schema
**Table**: `audit_logs` (defined in `shared/schema.ts`)

### Key Fields
- `id` (varchar, PK): UUID
- `timestamp` (bigint): Unix timestamp in milliseconds
- `adminUserId` (varchar, FK → users.id): Admin who performed the action
- `jobId` (varchar, FK → jobs.id): Affected job
- `affectedUploadedFileId` (varchar, FK → uploadedFiles.id, nullable): File-level changes
- `affectedLegacyImageId` (varchar, FK → images.id, nullable): Legacy DIY system
- `entityScope` (enum): 'job' | 'uploaded_file' | 'legacy_image'
- `actionType` (enum): See Action Types below
- `oldValue` (jsonb): Before state (structured JSON)
- `newValue` (jsonb): After state (structured JSON)
- `reason` (text, nullable): Admin explanation
- `reasonCode` (varchar, nullable): Category code (e.g., 'customer_complaint', 'technical_issue')
- `deletedAt` (bigint, nullable): Soft-delete for 24-month retention

### Action Types (enum `audit_action_type`)
- `update_included_images` - Package settings changed (includedImages, maxSelectable, etc.)
- `set_all_images_included` - allImagesIncluded toggled
- `change_selection_state_extra_free` - File marked as kulanz free
- `update_max_selectable` - Selectable limit changed
- `update_extra_price_per_image` - Extra image pricing changed
- `update_free_extra_quota` - Free extra quota changed
- `bulk_selection_change` - Batch selection state update
- `update_allow_free_extras` - Free extras toggle

---

## Implementation Details

### 1. Storage Layer (`server/storage.ts`)

**Method**: `createAuditLog(params)`
```typescript
async createAuditLog(params: {
  adminUserId: string;
  jobId: string;
  actionType: AuditActionType;
  entityScope: 'job' | 'uploaded_file' | 'legacy_image';
  affectedUploadedFileId?: string;
  affectedLegacyImageId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  reason?: string;
  reasonCode?: string;
}): Promise<AuditLog>
```

**Location**: Lines 3963-3994 in `server/storage.ts`

---

### 2. Admin Endpoints Writing Audit Logs

#### **PATCH /api/admin/jobs/:id/package**
**Purpose**: Update package settings (includedImages, maxSelectable, extraPricePerImage, allImagesIncluded, etc.)

**Location**: Lines 1319-1337 in `server/routes.ts`

**Audit Implementation**:
- Storage method: `updateJobPackageSettings(jobId, settings, adminUserId, reason, reasonCode)`
- Location: Lines 3700-3773 in `server/storage.ts`
- Action type: `'update_included_images'`
- Entity scope: `'job'`
- Tracks: All changed fields in aggregated oldValue/newValue

**Request Body**:
```json
{
  "includedImages": 30,
  "maxSelectable": 35,
  "allImagesIncluded": false,
  "reason": "Client requested more selections",
  "reasonCode": "customer_request"
}
```

**Example Audit Log Entry**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "timestamp": 1699900000000,
  "adminUserId": "admin-uuid-123",
  "jobId": "job-uuid-456",
  "affectedUploadedFileId": null,
  "entityScope": "job",
  "actionType": "update_included_images",
  "oldValue": {
    "includedImages": 25,
    "maxSelectable": 30
  },
  "newValue": {
    "includedImages": 30,
    "maxSelectable": 35
  },
  "reason": "Client requested more selections",
  "reasonCode": "customer_request"
}
```

---

#### **PATCH /api/admin/files/:id/kulanz**
**Purpose**: Mark a single file as kulanz free (selectionState = 'extra_free')

**Location**: Lines 1339-1367 in `server/routes.ts`

**Audit Implementation**:
- Storage method: `setFileKulanzFree(fileId, adminUserId, reason, reasonCode)`
- Location: Lines 3899-3927 in `server/storage.ts`
- Action type: `'change_selection_state_extra_free'`
- Entity scope: `'uploaded_file'`
- Tracks: selectionState before/after

**Request Body**:
```json
{
  "reason": "Photo quality issue, offering kulanz",
  "reasonCode": "quality_issue"
}
```

**Example Audit Log Entry**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440002",
  "timestamp": 1699910000000,
  "adminUserId": "admin-uuid-123",
  "jobId": "job-uuid-456",
  "affectedUploadedFileId": "file-uuid-789",
  "entityScope": "uploaded_file",
  "actionType": "change_selection_state_extra_free",
  "oldValue": {
    "selectionState": "extra_pending"
  },
  "newValue": {
    "selectionState": "extra_free"
  },
  "reason": "Photo quality issue, offering kulanz",
  "reasonCode": "quality_issue"
}
```

---

#### **PATCH /api/admin/jobs/:id/kulanz-all**
**Purpose**: Toggle allImagesIncluded flag (kulanz for entire job)

**Location**: Lines 1369-1397 in `server/routes.ts`

**Audit Implementation**:
- Storage method: `enableAllImagesKulanz(jobId, enabled, adminUserId, reason, reasonCode)`
- Location: Lines 3929-3959 in `server/storage.ts`
- Action type: `'set_all_images_included'`
- Entity scope: `'job'`
- Tracks: allImagesIncluded boolean before/after

**Request Body**:
```json
{
  "enabled": true,
  "reason": "Goodwill gesture for delayed delivery",
  "reasonCode": "service_recovery"
}
```

**Example Audit Log Entry**:
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440003",
  "timestamp": 1699920000000,
  "adminUserId": "admin-uuid-123",
  "jobId": "job-uuid-456",
  "affectedUploadedFileId": null,
  "entityScope": "job",
  "actionType": "set_all_images_included",
  "oldValue": {
    "allImagesIncluded": false
  },
  "newValue": {
    "allImagesIncluded": true
  },
  "reason": "Goodwill gesture for delayed delivery",
  "reasonCode": "service_recovery"
}
```

---

## Retention & Compliance

- **Retention Period**: 24 months online (soft-delete via `deletedAt` field)
- **Append-Only**: No UPDATE or DELETE operations on existing logs
- **Indexed Queries**:
  - Job-scoped: `audit_logs_job_id_timestamp_idx`
  - Admin activity: `audit_logs_admin_user_id_timestamp_idx`
  - File drill-down: `audit_logs_entity_scope_file_id_idx`
  - Kulanz abuse: `audit_logs_kulanz_action_idx` (partial index)

---

## Usage Examples

### Query all package changes for a job
```sql
SELECT * FROM audit_logs 
WHERE job_id = 'job-uuid-456' 
ORDER BY timestamp DESC;
```

### Find all kulanz grants by admin
```sql
SELECT * FROM audit_logs 
WHERE admin_user_id = 'admin-uuid-123' 
  AND action_type = 'change_selection_state_extra_free'
ORDER BY timestamp DESC;
```

### Track allImagesIncluded toggles
```sql
SELECT * FROM audit_logs 
WHERE action_type = 'set_all_images_included'
ORDER BY timestamp DESC;
```

---

## Security Notes

1. **Admin-Only**: All audit-triggering endpoints require `role = 'admin'`
2. **Immutable**: Logs cannot be edited or deleted (only soft-deleted after 24 months)
3. **Ownership Check**: File kulanz endpoints verify `file.isCandidate` and job ownership
4. **Reason Tracking**: Optional `reason`/`reasonCode` for compliance investigations

---

## Integration Points

- **Frontend**: Admin UI should display reason/reasonCode input fields
- **Reporting**: Analytics dashboards can query audit logs for kulanz usage trends
- **Customer Support**: CS team can review audit trail for dispute resolution
