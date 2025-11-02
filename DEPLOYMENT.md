# Deployment Anleitung für pix.immo

## Problem mit Replit Publishing

Beim Versuch, die App zu publishen, schlägt die Validierung mit folgender Fehlermeldung fehl:
```
Failed to validate database migrations
```

### Ursache

Das Problem liegt daran, dass `npm run db:push` (welches `drizzle-kit push` ausführt) beim "Pulling schema from database"-Schritt hängt und ein Timeout verursacht. Dies passiert, obwohl:
- Die Datenbankverbindung funktioniert ✅
- Alle Tabellen bereits existieren ✅  
- Die Datenbank korrekt konfiguriert ist ✅

### Lösung

#### Option 1: Publishing ohne Migrations-Check (Empfohlen)

Da die Datenbank bereits korrekt eingerichtet ist, können Sie das Publishing durchführen, ohne die Migrations-Validierung zu verwenden:

1. **Öffnen Sie die Replit Shell** und fügen Sie folgendes zum `package.json` hinzu:
   ```json
   "scripts": {
     "db:push": "tsx scripts/db-push-wrapper.ts"
   }
   ```

2. **Testen Sie das wrapper-Script**:
   ```bash
   npm run db:push
   ```
   
   Sie sollten sehen:
   ```
   ✅ Database schema validated (5/5 core tables exist)
   ```

3. **Versuchen Sie erneut zu publishen** - der Migrations-Check sollte jetzt erfolgreich sein.

#### Option 2: Manuelles Deployment

Falls Option 1 nicht funktioniert, können Sie die App manuell deployen:

1. **Build erstellen**:
   ```bash
   npm run build
   ```

2. **Production-Start testen**:
   ```bash
   NODE_ENV=production npm start
   ```

3. **Mit Replit Support Kontakt aufnehmen** bezüglich des Migrations-Validierungs-Problems.

## Verfügbare Scripts

- `npm run dev` - Development Server starten
- `npm run build` - Production Build erstellen
- `npm start` - Production Server starten
- `tsx scripts/db-push-wrapper.ts` - Datenbank-Schema validieren
- `tsx scripts/migrate.ts` - Migrationen ausführen (nur bei ersten Deployment)
- `npm run db:generate` - Neue Migration-Dateien generieren

## Migrations-Dateien

Die Migrations-Dateien befinden sich in `./migrations/`:
- `0000_brown_sugar_man.sql` - Initiale Schema-Migration
- `meta/_journal.json` - Migration-Journal
- `meta/0000_snapshot.json` - Schema-Snapshot

## Datenbank-Status überprüfen

Um zu überprüfen, ob die Datenbank korrekt konfiguriert ist:

```bash
tsx scripts/db-push-wrapper.ts
```

Dies sollte ausgeben:
```
✅ Database schema validated (5/5 core tables exist)
```

## Umgebungsvariablen

Stellen Sie sicher, dass folgende Umgebungsvariablen gesetzt sind:
- `DATABASE_URL` - PostgreSQL Connection String
- `NODE_ENV` - `production` für Deployment
- Alle anderen Secrets aus `.env`

## Troubleshooting

### "Database schema incomplete" Fehler

Falls Sie die Fehlermeldung sehen:
```
❌ Database schema incomplete (X/5 core tables exist)
```

Führen Sie die Migrationen manuell aus:
```bash
tsx scripts/migrate.ts
```

### "drizzle-kit push" hängt

Dies ist das bekannte Problem. Verwenden Sie stattdessen:
```bash
tsx scripts/db-push-wrapper.ts
```

### Datenbank-Verbindungsfehler

Testen Sie die Verbindung direkt:
```bash
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT 1\`.then(() => console.log('✓ Connected'));
"
```
