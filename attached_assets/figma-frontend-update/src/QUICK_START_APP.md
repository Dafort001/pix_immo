# 🚀 QUICK START - PIX.IMMO iPhone App

## ⚡ Sofort starten in 3 Sekunden:

### 1️⃣ Direkter Weg zum Splash Screen:

```
Gib in die URL-Leiste ein:  /app
```

**DAS IST ALLES!** 🎉

---

## 📱 Was passiert dann?

```
/app → Splash Screen erscheint
     ↓
     Session-Check (1.2 Sekunden)
     ↓
     Auto-Redirect zu:
     - /app/jobs (wenn Token vorhanden) ✅
     - /app/login (wenn kein Token) 🔐
```

---

## 🗺️ Alternative Wege:

### Weg 1: Von Development Hub
1. Gehe zu `/dev`
2. Klicke auf die große blaue Karte: **"📱 iPhone App"**

### Weg 2: Von App-Übersicht
1. Gehe zu `/app-overview`
2. Klicke: **"🚀 Zur App"**

### Weg 3: Von Admin Dashboard
1. Gehe zu `/admin-dashboard`
2. Klicke oben rechts: **"📱 iPhone App"**

### Weg 4: Wenn du eine andere Seite siehst
- **Banner oben** (blau-grün) ist sichtbar
- Klicke auf: **"🚀 Zur App (/app)"**

---

## ❌ Häufige Fehler:

### "Ich sehe nur Login, nicht den Splash Screen"
- ❌ **FALSCH:** Du bist auf `/app/login`
- ✅ **RICHTIG:** Gehe zu `/app` (ohne "/login")

### "Ich sehe eine andere App (pixcapture.app)"
- ❌ **FALSCH:** Du bist auf `/pixcapture`
- ✅ **RICHTIG:** Klicke oben auf den Banner oder gehe zu `/app`

### "Splash Screen ist zu schnell"
- ✅ Der Splash Screen dauert **1.2 Sekunden**
- ✅ Achte auf das **Debug-Banner** oben: "📱 Splash Screen · Session-Check läuft…"
- ✅ Achte auf die **Progress Bar** (0 → 100%)
- ✅ Achte auf den **Status-Text**, der sich 3x ändert

---

## 🎯 Die 4 Haupt-URLs:

| URL | Was du siehst |
|-----|---------------|
| `/app` | **Splash Screen** (Session-Check → Auto-Redirect) |
| `/app/login` | Login-Formular (E-Mail + Passwort) |
| `/app/jobs` | Jobs-Liste (Protected, braucht Token) |
| `/app/settings` | Einstellungen (Protected, braucht Token) |

---

## 💡 Pro-Tipps:

### Token simulieren (Auto-Login testen)
1. Gehe zu `/app/login`
2. Klicke: **"Demo starten (ohne Login)"**
3. Token wird gespeichert (2 Stunden gültig)
4. Gehe zurück zu `/app`
5. **Splash Screen → Auto-Login → Jobs!** 🎉

### Token löschen (Login erzwingen)
Öffne Browser DevTools Console:
```javascript
localStorage.removeItem('pix_session_token')
localStorage.removeItem('pix_token_expiry')
```

### Token-Status überprüfen
```javascript
// Token anzeigen
localStorage.getItem('pix_session_token')

// Ablaufdatum anzeigen
localStorage.getItem('pix_token_expiry')
```

---

## 📚 Weitere Dokumentation:

- 📱 **Splash Screen Guide:** `/SPLASH_SCREEN_GUIDE.md`
- 📖 **Session-Handling:** `/IPHONE_APP_SESSION.md`
- 🎨 **Design-System:** `/IPHONE_APP_DESIGN.md`
- 📋 **Alle Seiten:** `/COMPLETE_PAGES_OVERVIEW.md`

---

## 🆘 Notfall-Zugriff:

Wenn gar nichts funktioniert:

1. **Browser komplett neu laden:** `Cmd + Shift + R` (Mac) / `Ctrl + F5` (Windows)
2. **Cache leeren:** DevTools → Network → "Disable cache"
3. **Gehe zur Dev Hub:** `/dev` → Große blaue Karte klicken

---

**Erstellt:** 5. November 2025  
**Version:** 1.0.0  
**Autor:** PIX.IMMO Dev Team

---

## 🎬 Video-Anleitung (Text):

```
1. Öffne Browser
2. Gib ein: localhost:5173/app (oder deine Domain + /app)
3. ENTER drücken
4. Splash Screen erscheint (1.2 Sekunden)
   - Debug-Banner: "📱 Splash Screen · Session-Check läuft…"
   - Progress Bar animiert 0 → 100%
   - Status: "App wird geladen…" → "Session wird geprüft…" → "Anmeldung erforderlich"
5. Auto-Redirect zu Login oder Jobs
6. FERTIG! ✅
```

---

**DU BRAUCHST NUR:** `/app` **IN DIE URL EINGEBEN!** 🚀
