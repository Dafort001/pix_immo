# 🔐 Admin-Account Setup

## Schnellstart

**Für sofortigen Admin-Zugang (Development)**:

```bash
tsx server/seed-admin.ts
```

**Login-Daten** (Default):
- Email: `admin@piximmo.de`
- Passwort: `Admin123!`

---

## ENV-basierte Konfiguration (Production)

### 1. Umgebungsvariablen setzen

Füge zu deinen Secrets hinzu (Replit: Tools → Secrets):

```bash
ADMIN_EMAIL=deine-email@piximmo.de
ADMIN_PASSWORD=DeinSicheresPasswort123!
```

---

### 2. Seed-Script ausführen

```bash
# Mit ENV-Variables
tsx server/seed-admin.ts
```

**Ausgabe** (erfolgreich):
```
🌱 Admin Seed Script (ENV-basiert)
===================================

🆕 Erstelle neuen Admin-Account: deine-email@piximmo.de

✅ Admin-Account erfolgreich erstellt!
   Email:   deine-email@piximmo.de
   Rolle:   admin
   User-ID: 01J...

🔐 Login-Daten:
   Email:    deine-email@piximmo.de
   Password: DeinSicheresPasswort123!
```

---

### 3. Login testen

1. Gehe zu `/login`
2. Verwende die Credentials aus ENV
3. Nach erfolgreichem Login: Zugriff auf `/admin/*` Pages

---

## Features

### ✅ Idempotent (wiederholbare Ausführung)

Das Script kann mehrfach ausgeführt werden:

1. **Admin existiert bereits** → Passwort wird auf ENV synchronisiert
2. **User existiert als Client** → Wird zu Admin promoted + Passwort aktualisiert
3. **User existiert nicht** → Neuer Admin-Account wird erstellt

**Beispiel** (bereits existierender Admin):

```bash
$ tsx server/seed-admin.ts

🌱 Admin Seed Script (ENV-basiert)
===================================

✅ Admin-Account existiert bereits: admin@piximmo.de
   Rolle: admin
   User-ID: 01J...

🔄 Passwort auf ENV-Variable synchronisiert
```

---

### 🔒 Sicherheit

**Default-Passwort-Warnung**:

Wenn `ADMIN_EMAIL` oder `ADMIN_PASSWORD` nicht gesetzt sind:

```
⚠️  Warnung: ADMIN_EMAIL oder ADMIN_PASSWORD nicht in ENV gesetzt
   Verwende Default-Werte (NICHT für Production!):

   Email:    admin@piximmo.de
   Password: Admin123!
```

**Production-Best-Practice**:
- ✅ Immer ENV-Variables setzen
- ✅ Starke Passwörter verwenden (min. 12 Zeichen, Sonderzeichen)
- ✅ Passwort nach erstem Login ändern (via `/account` page)

---

## Alternativen

### Option A: Manuelle DB-Promotion (schnellste Lösung)

```bash
# 1. Registriere User via UI (/register)
# 2. Promote via SQL
psql $DATABASE_URL -c "UPDATE users SET role = 'admin' WHERE email = 'deine-email@example.com';"
```

---

### Option B: Existierende Scripts (hardcoded)

```bash
# Erstellt admin@pix.immo / Admin2025!
tsx server/create-admin.ts

# Erstellt admin@example.com / admin123 (nur für Tests)
tsx server/create-test-admin.ts
```

**Nachteil**: Hardcoded Credentials (nicht ENV-konfigurierbar)

---

## Troubleshooting

### Error: "Database connection failed"

```bash
# Prüfe DATABASE_URL
echo $DATABASE_URL

# Teste Verbindung
psql $DATABASE_URL -c "SELECT 1;"
```

---

### Error: "User already exists"

Das ist **kein Fehler** – das Script ist idempotent. Es:
- Synchronisiert das Passwort
- Promoted zu Admin (falls nötig)

---

### Error: "Cannot find module './db'"

```bash
# Stelle sicher dass du im Root-Verzeichnis bist
cd /path/to/pix-immo
tsx server/seed-admin.ts
```

---

## ENV-Variables Referenz

| Variable | Required | Default | Beschreibung |
|----------|----------|---------|--------------|
| `ADMIN_EMAIL` | ❌ | `admin@piximmo.de` | Admin Email-Adresse |
| `ADMIN_PASSWORD` | ❌ | `Admin123!` | Admin Passwort (min. 8 Zeichen) |

**Production**: Beide Variables setzen!  
**Development**: Defaults sind OK für lokale Tests.

---

## Integration in Deployment

### Automatisches Seeding bei Deploy

Füge zum Deployment-Script hinzu:

```bash
# .replit oder Deployment-Hook
npm run db:push
tsx server/seed-admin.ts
npm start
```

**Idempotent**: Kann bei jedem Deploy laufen ohne Fehler.

---

### Docker/Container

```dockerfile
# Dockerfile
FROM node:20

WORKDIR /app
COPY . .

RUN npm install

# Seed admin on container start
CMD npm run db:push && tsx server/seed-admin.ts && npm start
```

---

## Zusammenfassung

| Szenario | Lösung |
|----------|--------|
| **Lokale Entwicklung** | `tsx server/seed-admin.ts` (Default-Credentials) |
| **Production/Staging** | `ADMIN_EMAIL=... ADMIN_PASSWORD=... tsx server/seed-admin.ts` |
| **CI/CD Pipeline** | ENV-Variables in GitHub Secrets + automatisches Seeding |
| **Manueller Einmal-Setup** | Option A (SQL UPDATE nach Registration) |

---

**Last Updated**: 2025-01-14
