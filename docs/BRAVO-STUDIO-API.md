# Bravo Studio API Integration Guide

## 🎯 Quick Start

Ihre pix.immo Mobile App (iPhone + Android) ist **fast bereit** für Bravo Studio. Die meisten API-Endpoints existieren bereits - wir müssen nur **Mobile Authentication** hinzufügen (siehe unten).

---

## ⚠️ **KRITISCH: Backend NICHT bereit für Bravo Studio!**

### **Problem**: Komplette API ist Cookie-Only

Die **gesamte** pix.immo API verwendet aktuell **nur HTTP-only Session Cookies**. Bravo Studio kann diese Cookies **nicht** speichern oder weiterleiten.

### **Was fehlt:**

1. ✅ Bearer Token System existiert (`server/bearer-auth.ts`)
2. 🔴 **Login/Signup geben KEINEN Token zurück**
3. 🔴 **Alle geschützten Endpoints akzeptieren KEINE Bearer Tokens**
4. 🔴 **Middleware ist NICHT integriert**

### **Was gebaut werden muss:**

**Phase 1: Auth Endpoints (2-3 Stunden)**
```
POST /api/auth/mobile-login   → Gibt Bearer Token zurück
POST /api/auth/mobile-signup  → Gibt Bearer Token zurück
```

**Phase 2: Storage Helpers (1-2 Stunden)**
- `createPersonalAccessToken()` in `server/storage.ts`
- `getPersonalAccessTokenByToken()` für Validation
- Drizzle Schema Update (`personalAccessTokens` table)

**Phase 3: Middleware Integration (4-6 Stunden)**
- `requireAuth` Middleware erweitern (Cookie ODER Bearer Token)
- Alle geschützten Endpoints aktualisieren (30+ Endpoints)
- Workers `/api/auth/*` Endpoints (Hono) aktualisieren

**Phase 4: Testing (2 Stunden)**
- E2E Tests für Mobile Auth
- Bearer Token Validation Tests
- Cookie/Token Compatibility Tests

**Geschätzte Zeit: 9-13 Stunden Backend-Arbeit**

---

## **AKTUELLER STATUS:**

🔴 **NICHT PRODUKTIONSBEREIT FÜR BRAVO STUDIO**

**Was funktioniert:**
- ✅ Web-App (Cookie-based Auth)
- ✅ PWA (Cookie-based Auth)

**Was NICHT funktioniert:**
- 🔴 Bravo Studio Mobile Apps (brauchen Bearer Tokens)

---

---

## 🔗 Base URL

```
Production: https://pix-immo-edge.YOUR-DOMAIN.workers.dev
Development: http://localhost:5000
```

---

## 🔐 Authentication (Mobile Apps)

### **Geplante Implementation:**

#### POST `/api/auth/mobile-login` 🚧 **TODO**
Mobile Login mit Bearer Token Response.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "client"
  },
  "token": "pat_abc123def456...xyz789",
  "expiresAt": 1735689600000
}
```

**Bravo Studio Setup:**
- **Request Type**: POST
- **Bind Variables**: `${email}`, `${password}`
- **Set Access Token**: Response → `token`
- **Output Variables**: `userId`, `userEmail`, `userRole`, `tokenExpiry`

---

#### POST `/api/auth/mobile-signup` 🚧 **TODO**
Neuen Benutzer registrieren mit Bearer Token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "client"
  },
  "token": "pat_abc123def456...xyz789",
  "expiresAt": 1735689600000
}
```

---

#### GET `/api/auth/me` 🔴 **COOKIE-ONLY** (funktioniert NICHT mit Bearer Token)
Aktuellen Benutzer abrufen.

**Headers:**
```
Authorization: Bearer pat_abc123def456...xyz789
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "client"
  }
}
```

**Bravo Studio Setup:**
- **Request Type**: GET
- **Authentication**: Bearer Token (auto-injected)
- **Output Variables**: `userId`, `userEmail`, `userRole`

---

## 📱 Mobile App Endpoints

### 🚨 **WARNUNG: Alle Endpoints unten sind COOKIE-ONLY!**

Bis Bearer Auth implementiert ist, funktionieren diese Endpoints **NICHT** mit Bravo Studio!

**Aktueller Auth-Mechanismus**: Session Cookie (`auth_session`)  
**Bravo Studio braucht**: Bearer Token (`Authorization: Bearer pat_...`)

---

### 1. **Job Management**

#### POST `/api/jobs` 🔴 **COOKIE-ONLY**
Neuen Foto-Job erstellen.

**Headers:**
```
Authorization: Bearer pat_abc123def456...xyz789
Content-Type: application/json
```

**Request:**
```json
{
  "localId": "client-generated-ulid-01234567890",
  "customerName": "Max Mustermann",
  "propertyName": "Villa Hamburg",
  "propertyAddress": "Elbchaussee 123, 22765 Hamburg",
  "deadlineAt": 1704067200000,
  "deliverGallery": true,
  "deliverAlttext": true,
  "deliverExpose": false,
  "selectedUserId": null,
  "selectedUserInitials": null,
  "selectedUserCode": null
}
```

**Response (201):**
```json
{
  "id": "job-uuid-123",
  "displayId": "J-001234",
  "jobNumber": "J001234",
  "localId": "client-generated-ulid-01234567890",
  "status": "draft",
  "customerName": "Max Mustermann",
  "propertyName": "Villa Hamburg",
  "propertyAddress": "Elbchaussee 123, 22765 Hamburg",
  "createdAt": 1704000000000
}
```

**Bravo Studio Setup:**
- **Request Type**: POST
- **Authentication**: Bearer Token (required)
- **Bind Variables**: `${customerName}`, `${propertyName}`, `${propertyAddress}`, `${deadlineAt}`
- **Output Variables**: `jobId`, `jobDisplayId`, `jobNumber`, `jobStatus`

**Offline Deduplication:**
- Client generiert `localId` (ULID)
- Server prüft bei jedem POST, ob `localId` bereits existiert
- Falls ja: **409 Conflict** + existierender Job zurück
- Verhindert doppelte Job-Erstellung bei Netzwerkfehlern/Retries

---

#### GET `/api/jobs` 🔴 **COOKIE-ONLY**
Alle Jobs des Benutzers abrufen.

**Headers:**
```
Authorization: Bearer pat_abc123def456...xyz789
```

**Response (200):**
```json
[
  {
    "id": "job-uuid-123",
    "displayId": "J-001234",
    "status": "in_progress",
    "customerName": "Max Mustermann",
    "propertyName": "Villa Hamburg",
    "createdAt": 1704000000000
  }
]
```

**Bravo Studio Setup:**
- **Request Type**: GET
- **Authentication**: Bearer Token (required)
- **List Binding**: Bind entire array to Job List component
- **Output Variables**: `jobId`, `jobDisplayId`, `jobStatus`, `customerName`, `propertyName`

---

#### GET `/api/jobs/:id` 🔴 **COOKIE-ONLY**
Einzelnen Job abrufen.

**Headers:**
```
Authorization: Bearer pat_abc123def456...xyz789
```

**Response (200):**
```json
{
  "id": "job-uuid-123",
  "displayId": "J-001234",
  "status": "in_progress",
  "customerName": "Max Mustermann",
  "propertyName": "Villa Hamburg",
  "propertyAddress": "Elbchaussee 123, 22765 Hamburg",
  "deadlineAt": 1704067200000,
  "createdAt": 1704000000000
}
```

**Bravo Studio Setup:**
- **Request Type**: GET
- **URL Variables**: `/api/jobs/${jobId}`
- **Authentication**: Bearer Token (required)
- **Output Variables**: `jobId`, `jobDisplayId`, `jobStatus`, `customerName`, `propertyName`

---

### 2. **Photo Upload (Mobile)**

#### POST `/api/mobile-uploads` 🔴 **COOKIE-ONLY**
Foto mit Metadaten hochladen (Multipart Form Data).

**Headers:**
```
Authorization: Bearer pat_abc123def456...xyz789
Content-Type: multipart/form-data
```

**Request (Multipart Form Data):**
```
photo: <binary file>
metadata: <object_meta.json file> (optional)
alt_text: <alt_text.txt file> (optional)
jobId: "job-uuid-123"
roomType: "wohnzimmer"
orientation: "landscape"
capturedAt: 1704000000000
stackId: "stack-001" (optional, for HDR)
stackIndex: 0 (optional, for HDR)
evCompensation: -2.0 (optional, for HDR)
isManualMode: true (optional)
```

**Response (201):**
```json
{
  "success": true,
  "uploadedFile": {
    "id": "file-uuid-789",
    "objectKey": "raw/shoot-456/2025-10-28-AB3KQ_wohnzimmer_001_v1.jpg",
    "originalFilename": "IMG_1234.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 2457600
  }
}
```

**Bravo Studio Setup:**
- **Request Type**: POST
- **Content-Type**: `multipart/form-data`
- **Authentication**: Bearer Token (required)
- **File Upload Field**: `photo` (Camera Capture Component)
- **Bind Variables**: `${jobId}`, `${roomType}`, `${orientation}`, `${capturedAt}`
- **Output Variables**: `uploadId`, `objectKey`, `fileSize`

**Supported File Formats:**
- **JPEG/PNG**: Standard mobile photos
- **HEIC**: iPhone native format
- **RAW Formats**: DNG, CR2, CR3, NEF, ARW, RAF (13 formats)

---

#### POST `/api/pixcapture/upload/intent` 🔴 **COOKIE-ONLY**
Presigned URL generieren (für direkte R2-Uploads).

**Headers:**
```
Authorization: Bearer pat_abc123def456...xyz789
Content-Type: application/json
```

**Request:**
```json
{
  "filename": "IMG_1234.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 2457600,
  "checksum": "sha256-abcdef123456",
  "orderId": "job-uuid-123",
  "roomType": "wohnzimmer",
  "stackId": "stack-001"
}
```

**Response (200):**
```json
{
  "objectKey": "pixcapture/user-123/1704000000-abc123-IMG_1234.jpg",
  "uploadUrl": "https://r2.cloudflarestorage.com/signed-url-123",
  "expiresIn": 300
}
```

**Bravo Studio Setup:**
- **Request Type**: POST
- **Authentication**: Bearer Token (required)
- **Bind Variables**: `${filename}`, `${mimeType}`, `${fileSize}`, `${orderId}`, `${roomType}`
- **Output Variables**: `objectKey`, `uploadUrl`, `expiresIn`

**Workflow:**
1. Client: POST `/api/pixcapture/upload/intent` → erhält `uploadUrl`
2. Client: PUT direkt zu `uploadUrl` (kein Server-Traffic, kein Token!)
3. Client: POST `/api/pixcapture/upload/finalize` → bestätigt Upload

---

#### POST `/api/pixcapture/upload/finalize` 🔴 **COOKIE-ONLY**
Upload-Bestätigung (nach direktem R2-Upload).

**Headers:**
```
Authorization: Bearer pat_abc123def456...xyz789
Content-Type: application/json
```

**Request:**
```json
{
  "objectKey": "pixcapture/user-123/1704000000-abc123-IMG_1234.jpg",
  "checksum": "sha256-abcdef123456",
  "exifMeta": {
    "make": "Apple",
    "model": "iPhone 14 Pro",
    "dateTime": "2024:01:01 12:00:00"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "fileId": "file-uuid-789",
  "objectKey": "pixcapture/user-123/1704000000-abc123-IMG_1234.jpg"
}
```

---

### 3. **Shoot Management**

#### POST `/api/uploads/init` 🔴 **COOKIE-ONLY**
Neuen Shoot für Upload initialisieren.

**Headers:**
```
Authorization: Bearer pat_abc123def456...xyz789
Content-Type: application/json
```

**Request:**
```json
{
  "jobId": "job-uuid-123"
}
```

**Response (201):**
```json
{
  "shoot": {
    "id": "shoot-uuid-456",
    "jobId": "job-uuid-123",
    "shootCode": "AB3KQ",
    "status": "draft",
    "createdAt": 1704000000000
  },
  "editorToken": "pat_editor_xyz123..."
}
```

**Bravo Studio Setup:**
- **Request Type**: POST
- **Authentication**: Bearer Token (required)
- **Bind Variables**: `${jobId}`
- **Output Variables**: `shootId`, `shootCode`, `editorToken`

---

#### GET `/api/shoots/:id/images` 🔴 **COOKIE-ONLY**
Alle Bilder eines Shoots abrufen.

**Headers:**
```
Authorization: Bearer pat_abc123def456...xyz789
```

**Response (200):**
```json
[
  {
    "id": "img-uuid-111",
    "shootId": "shoot-uuid-456",
    "objectKey": "raw/shoot-456/2025-10-28-AB3KQ_wohnzimmer_001_v1.jpg",
    "roomType": "wohnzimmer",
    "orientation": "landscape",
    "fileSize": 2457600,
    "uploadedAt": 1704000000000
  }
]
```

**Bravo Studio Setup:**
- **Request Type**: GET
- **URL Variables**: `/api/shoots/${shootId}/images`
- **Authentication**: Bearer Token (required)
- **List Binding**: Bind array to Image Gallery component
- **Output Variables**: `imageId`, `objectKey`, `roomType`, `orientation`, `fileSize`

---

### 4. **Gallery (Public)**

#### GET `/api/media-library` ✅ **PUBLIC** (kein Auth nötig)
Alle öffentlichen Portfolio-Bilder.

**Headers:**
```
None (public endpoint)
```

**Response (200):**
```json
[
  {
    "id": "img-public-001",
    "imageUrl": "https://r2.cloudflarestorage.com/portfolio/villa-001.jpg",
    "caption": "Moderne Villa in Hamburg Elbchaussee",
    "page": "portfolio",
    "tags": ["villa", "modern", "hamburg"],
    "createdAt": 1704000000000
  }
]
```

**Bravo Studio Setup:**
- **Request Type**: GET
- **No Authentication Required**
- **List Binding**: Bind array to Gallery Grid component
- **Output Variables**: `imageId`, `imageUrl`, `caption`, `tags`

---

## 📊 Bravo Studio Collection Template

### ⚠️ HINWEIS: Erst nutzbar nach Mobile-Auth Implementation!

**Aktueller Status:**
- ✅ Alle Endpoints außer Auth sind fertig
- 🚧 `/api/auth/mobile-login` und `/api/auth/mobile-signup` müssen noch implementiert werden

**Sobald Mobile-Auth fertig ist:**

```json
{
  "name": "pix.immo Mobile API",
  "description": "Complete API collection for pix.immo native mobile apps",
  "baseUrl": "https://pix-immo-edge.YOUR-DOMAIN.workers.dev",
  "authentication": {
    "type": "bearer",
    "headerName": "Authorization",
    "headerValue": "Bearer ${accessToken}"
  },
  "requests": [
    {
      "name": "Mobile Login",
      "method": "POST",
      "endpoint": "/api/auth/mobile-login",
      "body": {
        "email": "${email}",
        "password": "${password}"
      },
      "outputVariables": {
        "userId": "user.id",
        "userEmail": "user.email",
        "userRole": "user.role",
        "accessToken": "token",
        "tokenExpiry": "expiresAt"
      },
      "setAccessToken": "token"
    },
    {
      "name": "Mobile Signup",
      "method": "POST",
      "endpoint": "/api/auth/mobile-signup",
      "body": {
        "email": "${email}",
        "password": "${password}"
      },
      "outputVariables": {
        "userId": "user.id",
        "userEmail": "user.email",
        "accessToken": "token",
        "tokenExpiry": "expiresAt"
      },
      "setAccessToken": "token"
    },
    {
      "name": "Get Current User",
      "method": "GET",
      "endpoint": "/api/auth/me",
      "requiresAuth": true,
      "outputVariables": {
        "userId": "user.id",
        "userEmail": "user.email",
        "userRole": "user.role"
      }
    },
    {
      "name": "Create Job",
      "method": "POST",
      "endpoint": "/api/jobs",
      "requiresAuth": true,
      "body": {
        "localId": "${localId}",
        "customerName": "${customerName}",
        "propertyName": "${propertyName}",
        "propertyAddress": "${propertyAddress}",
        "deadlineAt": "${deadlineAt}",
        "deliverGallery": true,
        "deliverAlttext": true,
        "deliverExpose": false
      },
      "outputVariables": {
        "jobId": "id",
        "jobDisplayId": "displayId",
        "jobNumber": "jobNumber",
        "jobStatus": "status"
      }
    },
    {
      "name": "Get My Jobs",
      "method": "GET",
      "endpoint": "/api/jobs",
      "requiresAuth": true,
      "outputVariables": {
        "jobs": "$"
      }
    },
    {
      "name": "Get Job Details",
      "method": "GET",
      "endpoint": "/api/jobs/${jobId}",
      "requiresAuth": true,
      "outputVariables": {
        "job": "$"
      }
    },
    {
      "name": "Initialize Upload",
      "method": "POST",
      "endpoint": "/api/uploads/init",
      "requiresAuth": true,
      "body": {
        "jobId": "${jobId}"
      },
      "outputVariables": {
        "shootId": "shoot.id",
        "shootCode": "shoot.shootCode",
        "editorToken": "editorToken"
      }
    },
    {
      "name": "Get Shoot Images",
      "method": "GET",
      "endpoint": "/api/shoots/${shootId}/images",
      "requiresAuth": true,
      "outputVariables": {
        "images": "$"
      }
    },
    {
      "name": "Get Portfolio Gallery",
      "method": "GET",
      "endpoint": "/api/media-library",
      "requiresAuth": false,
      "outputVariables": {
        "galleryImages": "$"
      }
    }
  ]
}
```

---

## 🎨 Bravo Tags für Figma

### Screen-Mapping (Beispiele):

#### 1. **Splash Screen**
```
Frame: @screen splash
Logo: @image (static asset)
Button "Start": @button → Navigate to Login
```

#### 2. **Login Screen**
```
Frame: @screen login
Email Input: @input → Bind to ${email}
Password Input: @input → Bind to ${password}
Login Button: @button → API Request "Mobile Login" → Navigate to Jobs List
Signup Link: @button → Navigate to Signup Screen
```

#### 3. **Jobs List**
```
Frame: @screen jobs_list
Job Card List: @list → API Request "Get My Jobs"
  - Job Name: @text → Bind to ${propertyName}
  - Job ID: @text → Bind to ${jobDisplayId}
  - Status Badge: @tag → Bind to ${jobStatus}
  - Card Tap: @button → Navigate to Job Detail (pass ${jobId})
Create Job Button: @button → Navigate to Create Job Form
```

#### 4. **Create Job Form**
```
Frame: @screen create_job
Customer Name: @input → Bind to ${customerName}
Property Name: @input → Bind to ${propertyName}
Property Address: @input → Bind to ${propertyAddress}
Submit Button: @button → API Request "Create Job" → Navigate to Job Detail
```

#### 5. **Camera Screen**
```
Frame: @screen camera
Camera Preview: @camera → Capture to ${photo}
Room Type Picker: @picker → Bind to ${roomType}
  - Options: ["wohnzimmer", "schlafzimmer", "kueche", "bad", "fassade"]
Capture Button: @button → Upload Photo → API Request "Mobile Upload"
Gallery Button: @button → Navigate to Gallery
```

#### 6. **Gallery Screen**
```
Frame: @screen gallery
Photo Grid: @list → API Request "Get Shoot Images"
  - Photo Thumbnail: @image → Bind to ${imageUrl}
  - Room Type Label: @text → Bind to ${roomType}
  - Photo Tap: @button → Navigate to Photo Detail
Upload Button: @button → Navigate to Upload Screen
```

---

## 🚧 **NEXT STEPS - Backend Implementation**

### **Was wir noch bauen müssen:**

#### 1. **Mobile Auth Endpoints** (Priorität: HOCH)

**Datei**: `server/routes.ts`

```typescript
// POST /api/auth/mobile-login
app.post("/api/auth/mobile-login", authLimiter, validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Verify credentials
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const isValid = await verifyPassword(password, user.hashedPassword);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Generate Personal Access Token
    const { token, hashedToken } = generateBearerToken();
    const expiresAt = Date.now() + (1000 * 60 * 60 * 24 * 30); // 30 days
    
    // Store token in database
    await storage.createPersonalAccessToken({
      userId: user.id,
      token: hashedToken,
      scopes: "upload:raw,view:gallery,ai:run,order:read,order:write",
      expiresAt,
    });
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
      expiresAt,
    });
  } catch (error) {
    console.error("Mobile login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/mobile-signup
app.post("/api/auth/mobile-signup", authLimiter, validateBody(signupSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }
    
    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser(email, hashedPassword, "client");
    
    // Generate Personal Access Token
    const { token, hashedToken } = generateBearerToken();
    const expiresAt = Date.now() + (1000 * 60 * 60 * 24 * 30); // 30 days
    
    // Store token
    await storage.createPersonalAccessToken({
      userId: user.id,
      token: hashedToken,
      scopes: "upload:raw,view:gallery,ai:run,order:read,order:write",
      expiresAt,
    });
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
      expiresAt,
    });
  } catch (error) {
    console.error("Mobile signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});
```

#### 2. **Storage Methods** (Priorität: HOCH)

**Datei**: `server/storage.ts`

```typescript
interface IStorage {
  // ... existing methods ...
  
  // Personal Access Token methods
  createPersonalAccessToken(data: {
    userId: string;
    token: string;
    scopes: string;
    expiresAt: number;
  }): Promise<PersonalAccessToken>;
}
```

#### 3. **Bearer Auth Middleware Integration** (Priorität: MITTEL)

**Datei**: `server/routes.ts`

Alle geschützten Endpoints müssen Bearer Token akzeptieren:

```typescript
// Middleware für Express, das sowohl Cookie als auch Bearer Token akzeptiert
function requireAuthOrBearer(req: Request, res: Response, next: any) {
  // Check session cookie first
  const user = (req as any).user;
  if (user) {
    return next();
  }
  
  // Check Bearer Token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = await validateBearerToken(token);
    if (payload) {
      (req as any).user = {
        id: payload.userId,
        role: payload.userRole,
      };
      return next();
    }
  }
  
  return res.status(401).json({ error: "Authentication required" });
}
```

---

## 🚀 Deployment Checklist

### Phase 1: Backend Implementation (MUSS GEMACHT WERDEN)
- [ ] Mobile-Login Endpoint (`/api/auth/mobile-login`)
- [ ] Mobile-Signup Endpoint (`/api/auth/mobile-signup`)
- [ ] `createPersonalAccessToken()` Storage Method
- [ ] Bearer Auth Middleware Integration
- [ ] E2E Tests für Mobile Auth

### Phase 2: Figma Vorbereitung (SIE)
- [ ] Mobile Screens öffnen (375px width)
- [ ] Bravo Studio Figma Plugin installieren
- [ ] Bravo Tags zu allen Layern hinzufügen
- [ ] Screen-Flow testen

### Phase 3: Bravo Studio Setup (WIR ZUSAMMEN)
- [ ] Figma Design importieren
- [ ] API Collection einfügen
- [ ] Base URL setzen
- [ ] API Requests testen

### Phase 4: Data Binding (WIR ZUSAMMEN)
- [ ] Login Screen → API binden
- [ ] Jobs List → API binden
- [ ] Camera → Upload binden
- [ ] Gallery → Images binden

### Phase 5: Testing (SIE)
- [ ] Bravo Vision App installieren
- [ ] App Preview testen
- [ ] Upload-Flow testen
- [ ] Authentication testen

### Phase 6: Publish (SIE)
- [ ] App Icons hochladen
- [ ] App Name & Description
- [ ] Privacy Policy & Terms
- [ ] iOS/Android Deploy

---

## 📞 Support

### Bravo Studio:
- **Docs**: https://docs.bravostudio.app
- **Figma Plugin**: https://www.figma.com/community/plugin/1149380850484102424

### pix.immo API:
- **Backend Code**: `server/routes.ts`
- **Schema**: `shared/schema.ts`

---

## ✅ Summary

**Aktueller Status:**
- ✅ 95% der API ist fertig (Jobs, Uploads, Shoots, Gallery)
- 🚧 5% fehlt noch (Mobile Auth Endpoints)

**Nächste Schritte:**
1. Mobile-Auth Endpoints implementieren (2-3 Stunden Arbeit)
2. Tests schreiben
3. Bravo Studio Setup starten

**Timeline:**
- Backend-Arbeit: 1 Tag
- Bravo Studio Setup: 0.5 Tage
- Testing & Polish: 1 Tag
- **Total: 2.5 Tage bis zur ersten Testversion!** 🎉
