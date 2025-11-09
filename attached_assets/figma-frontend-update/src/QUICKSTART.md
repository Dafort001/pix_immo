# 🚀 Quick Start Guide - PIX.IMMO zu Bravostudio

## TL;DR - Die wichtigsten 5 Schritte

```bash
# 1. Git Repository erstellen
git init
git add .
git commit -m "PIX.IMMO Ready for Bravostudio"

# 2. Auf GitHub pushen
# Erstelle zuerst ein Repository auf GitHub.com
git remote add origin https://github.com/DEIN-USERNAME/pix-immo.git
git push -u origin main

# 3. Bravostudio Account
# Gehe zu https://www.bravostudio.app/ und erstelle Account

# 4. Import in Bravostudio
# New Project → Import from GitHub → Wähle pix-immo Repository

# 5. Build Settings
# Entry: App.tsx
# Build: npm run build
# Output: dist
```

## ✅ Checklist vor dem Upload

- [ ] Alle 47 Seiten getestet
- [ ] Navigation funktioniert
- [ ] Footer auf allen Seiten
- [ ] Responsive Design überprüft
- [ ] package.json vorhanden
- [ ] README.md erstellt
- [ ] .gitignore konfiguriert

## 📱 Bravostudio Einstellungen

### App Details:
```
App Name: PIX.IMMO
Bundle ID: com.piximmo.app (oder deine eigene)
Version: 1.0.0
```

### Build Command:
```
npm install && npm run build
```

### Entry Point:
```
App.tsx
```

### Output Directory:
```
dist
```

## 🎯 Nach dem Import

1. **Web Preview testen** - Klicke "Preview" in Bravostudio
2. **Mobile testen** - Scanne QR-Code mit Bravostudio App
3. **Navigation prüfen** - Teste alle Links
4. **Performance checken** - Lade-Zeiten überprüfen

## 💰 Kosten-Kalkulation

### Minimal Setup (nur Web):
- Bravostudio Free: **€0**
- Domain (optional): **€12/Jahr**
- **Total: €12/Jahr**

### Standard Setup (iOS + Android):
- Bravostudio Pro: **€19/Monat = €228/Jahr**
- Apple Developer: **€99/Jahr**
- Google Play: **€25 einmalig**
- Domain: **€12/Jahr**
- **Total Jahr 1: €364**
- **Total ab Jahr 2: €339/Jahr**

### Professional Setup (mit Backend):
- Bravostudio Business: **€49/Monat = €588/Jahr**
- Apple Developer: **€99/Jahr**
- Google Play: **€25 einmalig**
- Supabase Pro: **€25/Monat = €300/Jahr**
- Domain: **€12/Jahr**
- **Total Jahr 1: €1.024**
- **Total ab Jahr 2: €999/Jahr**

## 🆘 Häufige Probleme

### "Build failed"
```bash
# Lokal testen:
npm install
npm run build

# Falls Fehler: Dependencies prüfen
npm ci
```

### "Routes not found"
- Prüfe, dass Wouter korrekt importiert ist
- Stelle SPA Mode in Bravostudio ein

### "CSS not loading"
- Überprüfe globals.css Import in App.tsx
- Stelle sicher, dass Tailwind CSS v4.0 erkannt wird

## 📞 Support

- **Bravostudio Docs**: https://docs.bravostudio.app/
- **Community**: https://community.bravostudio.app/
- **Discord**: Bravostudio Discord Server

## 🎉 Du bist fertig!

Wenn alles funktioniert:
1. ✅ Web-Preview läuft
2. ✅ Mobile-Preview getestet
3. ✅ Alle Links funktionieren
4. ✅ Design sieht gut aus

→ **Ready for App Store Submission!**

---

**Nächster Schritt**: Siehe `BRAVOSTUDIO_DEPLOYMENT.md` für Details zum Publishing
