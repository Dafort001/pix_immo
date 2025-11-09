# 🔄 Git Upload Guide - GitHub Repository Setup

**Projekt:** PIX.IMMO + pixcapture.app  
**Status:** Ready for GitHub Upload  
**Date:** 2025-11-06

---

## 🚀 Schnellstart (3 Schritte)

### 1. Repository auf GitHub erstellen

**Browser:**
1. Gehe zu https://github.com
2. Klicke auf **"New Repository"** (grüner Button)
3. Gebe diese Informationen ein:

```
Repository Name: pixcapture-app
Description: PIX.IMMO Professional Real Estate Photography Platform + pixcapture.app Self-Service Upload App
Visibility: ⚫ Private (empfohlen) oder ⚪ Public
Initialize: ❌ NICHT mit README, .gitignore oder License initialisieren
```

4. Klicke auf **"Create Repository"**
5. **Kopiere die URL** (wird so aussehen: `https://github.com/USERNAME/pixcapture-app.git`)

---

### 2. Lokales Git Repository initialisieren

**Terminal/Command Line:**

```bash
# Navigiere zum Projekt-Ordner
cd /pfad/zum/projekt

# Git initialisieren (falls noch nicht geschehen)
git init

# Alle Dateien zum Staging hinzufügen
git add .

# Ersten Commit erstellen
git commit -m "feat: pixcapture.app production ready for Bravo Studio

- Implemented 82 routes (pixcapture.app + pix.immo)
- Created 113 pages with full functionality
- Added CTA cards to pixcapture-home
- Extended navigation (desktop + mobile)
- Created PixCaptureNav component
- Comprehensive documentation (60+ docs)
- Bravo Studio deployment ready

CHECKPOINT: 2025-11-06
Status: PRODUCTION READY ✅
Routes: 82/82
Pages: 113/113
Components: 50+
Confidence: 98%
"

# Branch zu 'main' umbenennen (falls nötig)
git branch -M main

# Remote Repository verbinden (ERSETZE USERNAME mit deinem GitHub-Username)
git remote add origin https://github.com/USERNAME/pixcapture-app.git

# Code zu GitHub pushen
git push -u origin main
```

---

### 3. Upload verifizieren

**Browser:**
1. Gehe zu `https://github.com/USERNAME/pixcapture-app`
2. ✅ Prüfe dass alle Dateien hochgeladen wurden
3. ✅ Prüfe dass der Commit-Message korrekt ist
4. ✅ Fertig! Repository ist bereit für Bravo Studio

---

## 📋 Detaillierte Anleitung

### Schritt-für-Schritt mit Erklärungen

#### A. Git installieren (falls noch nicht vorhanden)

**macOS:**
```bash
# Prüfe ob Git installiert ist
git --version

# Falls nicht installiert, wird macOS dich automatisch fragen,
# ob du die Command Line Tools installieren möchtest
```

**Windows:**
```bash
# Download Git von: https://git-scm.com/download/win
# Installiere mit Standard-Einstellungen
# Öffne "Git Bash" für die folgenden Befehle
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install git

# Fedora
sudo dnf install git
```

---

#### B. Git konfigurieren (einmalig)

```bash
# Deinen Namen setzen
git config --global user.name "Dein Name"

# Deine E-Mail setzen (muss mit GitHub-E-Mail übereinstimmen)
git config --global user.email "deine-email@example.com"

# Prüfen
git config --list
```

---

#### C. .gitignore erstellen (empfohlen)

Erstelle eine Datei `.gitignore` im Projekt-Root:

```bash
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build
dist/
build/
.cache/

# Environment
.env
.env.local
.env.production

# Editor
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Coverage
coverage/

# Temporary
tmp/
temp/
*.tmp
```

**Hinzufügen:**
```bash
git add .gitignore
git commit -m "chore: add .gitignore"
```

---

#### D. Repository initialisieren

```bash
# Im Projekt-Ordner
cd /pfad/zum/projekt

# Git initialisieren
git init
# Output: "Initialized empty Git repository in /pfad/zum/projekt/.git/"

# Status prüfen
git status
# Output zeigt alle Dateien die noch nicht getrackt sind
```

---

#### E. Dateien hinzufügen

```bash
# Alle Dateien hinzufügen
git add .

# Oder spezifische Dateien
git add App.tsx
git add pages/
git add components/

# Status prüfen
git status
# Output zeigt alle Dateien im Staging-Bereich (grün)
```

---

#### F. Commit erstellen

**Kurzer Commit:**
```bash
git commit -m "feat: initial commit - pixcapture.app ready for Bravo Studio"
```

**Detaillierter Commit (empfohlen):**
```bash
git commit -m "feat: pixcapture.app production ready for Bravo Studio

Complete implementation of PIX.IMMO professional workflow and 
pixcapture.app self-service platform.

Features:
- 82 routes fully functional
- 113 pages implemented
- 50+ reusable components
- Dual pipeline system (App vs Pro)
- iPhone camera UI with HDR bracketing
- Editor/QC workflow complete
- Push notification templates
- Room-based gallery system

Documentation:
- 60+ comprehensive docs
- Bravo Studio deployment guides
- Complete route map
- API integration specs

Tech Stack:
- React 18.3.1 + TypeScript
- Wouter 3.3.5 (SPA routing)
- Tailwind CSS v4.0
- Vite build system

Status: PRODUCTION READY ✅
Checkpoint: 2025-11-06
Confidence: 98%

Ready for:
- Bravo Studio import
- TestFlight beta testing
- App Store submission
"
```

---

#### G. Remote Repository verbinden

```bash
# Remote hinzufügen (ERSETZE USERNAME)
git remote add origin https://github.com/USERNAME/pixcapture-app.git

# Remote prüfen
git remote -v
# Output:
# origin  https://github.com/USERNAME/pixcapture-app.git (fetch)
# origin  https://github.com/USERNAME/pixcapture-app.git (push)
```

---

#### H. Code zu GitHub pushen

```bash
# Branch zu 'main' umbenennen (falls nötig)
git branch -M main

# Ersten Push mit Upstream setzen
git push -u origin main

# Bei Authentifizierungs-Aufforderung:
# - Username: Dein GitHub Username
# - Password: Personal Access Token (NICHT dein Passwort!)
```

**Authentifizierung:**

GitHub benötigt seit 2021 ein **Personal Access Token** statt Passwort:

1. Gehe zu: https://github.com/settings/tokens
2. Klicke: **"Generate new token"** → **"Generate new token (classic)"**
3. Name: `pixcapture-app-deploy`
4. Expiration: `90 days` oder `No expiration`
5. Scopes auswählen:
   - ✅ `repo` (alle Unter-Checkboxen)
   - ✅ `workflow`
6. Klicke: **"Generate token"**
7. **Kopiere das Token** (wird nur einmal angezeigt!)
8. Verwende das Token als Passwort beim `git push`

---

#### I. Upload verifizieren

**Browser:**
```
1. Öffne: https://github.com/USERNAME/pixcapture-app
2. Prüfe:
   ✅ Alle Dateien sind sichtbar
   ✅ README.md wird angezeigt
   ✅ Commit-History ist vorhanden
   ✅ Branch "main" existiert
```

---

## 🔐 SSH Setup (Optional, aber empfohlen)

Für einfacheres Arbeiten ohne Token-Eingabe:

### SSH Key generieren

```bash
# SSH Key erstellen
ssh-keygen -t ed25519 -C "deine-email@example.com"

# Enter drücken für Standard-Speicherort
# Optional: Passphrase eingeben (empfohlen)

# Public Key anzeigen
cat ~/.ssh/id_ed25519.pub
# Kopiere den gesamten Output
```

### SSH Key zu GitHub hinzufügen

1. Gehe zu: https://github.com/settings/keys
2. Klicke: **"New SSH key"**
3. Title: `pixcapture-laptop` (oder dein Computer-Name)
4. Key type: `Authentication Key`
5. Key: Füge den kopierten Public Key ein
6. Klicke: **"Add SSH key"**

### SSH Remote verwenden

```bash
# Ändere Remote URL von HTTPS zu SSH
git remote set-url origin git@github.com:USERNAME/pixcapture-app.git

# Teste Verbindung
ssh -T git@github.com
# Output: "Hi USERNAME! You've successfully authenticated..."

# Jetzt kannst du ohne Token pushen
git push
```

---

## 🔄 Weitere Commits

Nach dem ersten Upload, für zukünftige Änderungen:

```bash
# Änderungen vornehmen in deinen Dateien...

# Status prüfen
git status

# Geänderte Dateien hinzufügen
git add .

# Oder spezifische Dateien
git add pages/pixcapture-home.tsx
git add components/PixCaptureNav.tsx

# Commit erstellen
git commit -m "feat: add new feature X"

# Zu GitHub pushen
git push

# Oder falls upstream nicht gesetzt:
git push origin main
```

---

## 📦 Branch-Strategie (Empfohlen)

Für sauberes Arbeiten mit Features:

```bash
# Feature-Branch erstellen
git checkout -b feature/expert-call-backend

# Arbeite an dem Feature...
git add .
git commit -m "feat: implement expert call backend integration"

# Pushe Feature-Branch
git push -u origin feature/expert-call-backend

# Auf GitHub: Create Pull Request
# Nach Review: Merge in main

# Zurück zu main
git checkout main
git pull

# Feature-Branch löschen (lokal)
git branch -d feature/expert-call-backend
```

---

## 🏷️ Tags erstellen (Empfohlen für Releases)

```bash
# Tag für aktuellen Checkpoint
git tag -a v1.0.0-rc1 -m "Release Candidate 1: Bravo Studio Ready

Production ready version with all 82 routes, 113 pages,
and complete documentation. Ready for Bravo Studio deployment.

Checkpoint: 2025-11-06
"

# Tag zu GitHub pushen
git push origin v1.0.0-rc1

# Oder alle Tags pushen
git push --tags
```

**Semantic Versioning:**
```
v1.0.0-rc1    Release Candidate 1 (jetzt)
v1.0.0        Erste Production Version (nach App Store Launch)
v1.1.0        Neue Features (z.B. Expert Call)
v1.1.1        Bug Fixes
v2.0.0        Major Update (Breaking Changes)
```

---

## 🔍 Nützliche Git Commands

### Status & Info
```bash
git status                  # Zeige geänderte Dateien
git log                     # Zeige Commit-History
git log --oneline          # Kompakte History
git log --graph --oneline  # Visualisierte History
git diff                   # Zeige Änderungen (unstaged)
git diff --staged          # Zeige Änderungen (staged)
```

### Branches
```bash
git branch                 # Zeige alle Branches
git branch feature-name    # Erstelle neuen Branch
git checkout feature-name  # Wechsle zu Branch
git checkout -b new-branch # Erstelle und wechsle zu Branch
git branch -d feature-name # Lösche Branch (lokal)
git push origin --delete feature-name  # Lösche Branch (remote)
```

### Remote
```bash
git remote -v              # Zeige Remote URLs
git remote add name url    # Füge Remote hinzu
git remote remove name     # Entferne Remote
git fetch                  # Hole Änderungen (ohne merge)
git pull                   # Hole und merge Änderungen
git push                   # Pushe Commits
git push --force           # Force Push (VORSICHT!)
```

### Rückgängig machen
```bash
git restore file.txt       # Verwerfe Änderungen in Datei
git restore --staged file.txt  # Unstage Datei
git reset HEAD~1           # Letzten Commit rückgängig (behält Änderungen)
git reset --hard HEAD~1    # Letzten Commit löschen (VORSICHT!)
git revert commit-hash     # Erstelle neuen Commit der einen Commit rückgängig macht
```

---

## 🚨 Häufige Probleme & Lösungen

### Problem: "fatal: not a git repository"
```bash
# Lösung: Git initialisieren
git init
```

### Problem: "error: src refspec main does not match any"
```bash
# Lösung: Erst committen
git add .
git commit -m "initial commit"
git push -u origin main
```

### Problem: "Permission denied (publickey)"
```bash
# Lösung: SSH Key setup prüfen
ssh -T git@github.com

# Oder HTTPS verwenden statt SSH
git remote set-url origin https://github.com/USERNAME/pixcapture-app.git
```

### Problem: "Updates were rejected"
```bash
# Lösung 1: Pull first
git pull origin main
git push

# Lösung 2: Force push (VORSICHT! Überschreibt Remote)
git push --force
```

### Problem: "fatal: refusing to merge unrelated histories"
```bash
# Lösung: Allow unrelated histories
git pull origin main --allow-unrelated-histories
```

### Problem: ".DS_Store Dateien werden getrackt"
```bash
# Lösung: Aus Git entfernen
find . -name .DS_Store -print0 | xargs -0 git rm -f --ignore-unmatch

# In .gitignore hinzufügen
echo ".DS_Store" >> .gitignore

# Committen
git add .gitignore
git commit -m "chore: ignore .DS_Store files"
git push
```

---

## 📊 Repository Best Practices

### Commit Messages
```bash
# Format: <type>: <subject>

feat: add new feature
fix: fix bug in component
docs: update documentation
style: format code
refactor: refactor component
test: add tests
chore: update dependencies
```

### Branch Names
```bash
feature/expert-call-backend
bugfix/upload-error-handling
hotfix/critical-security-issue
release/v1.0.0
docs/update-readme
```

### .gitignore Patterns
```
# Ignore all .log files
*.log

# Ignore all files in logs/ directory
logs/

# Ignore all .env files
.env*

# But don't ignore .env.example
!.env.example

# Ignore node_modules in all directories
**/node_modules/
```

---

## ✅ Final Checklist

### Vor dem ersten Push
- [ ] Git installiert und konfiguriert
- [ ] GitHub Account erstellt
- [ ] Repository auf GitHub erstellt
- [ ] .gitignore erstellt
- [ ] Alle Dateien committet
- [ ] Remote origin korrekt gesetzt
- [ ] Authentifizierung funktioniert

### Nach dem Push
- [ ] Repository auf GitHub sichtbar
- [ ] Alle Dateien hochgeladen
- [ ] README.md wird korrekt angezeigt
- [ ] Commit-History vorhanden
- [ ] Branch "main" existiert

### Für Bravo Studio
- [ ] Repository URL kopiert
- [ ] Repository auf "Private" oder "Public" gesetzt
- [ ] Keine sensiblen Daten (API Keys, etc.) im Code
- [ ] Build funktioniert lokal (`npm run build`)
- [ ] README beschreibt Projekt

---

## 🎯 Nächste Schritte nach GitHub Upload

1. ✅ Repository URL kopieren
2. ✅ Zu Bravo Studio gehen
3. ✅ "Import from GitHub" wählen
4. ✅ Repository auswählen
5. ✅ Build starten

**Siehe:** [BRAVO_STUDIO_QUICK_START.md](./BRAVO_STUDIO_QUICK_START.md)

---

## 📞 Hilfe & Support

### Git Dokumentation
- Official Docs: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com/
- Git Book: https://git-scm.com/book/en/v2

### Video Tutorials
- GitHub Skills: https://skills.github.com/
- Git Tutorial (Deutsch): https://www.youtube.com/watch?v=0DGCnBZBoc0

### Bei Problemen
1. Prüfe GitHub Status: https://www.githubstatus.com/
2. Suche in Stack Overflow: https://stackoverflow.com/
3. Siehe Git FAQ: https://git-scm.com/docs/gitfaq

---

## 🎉 Geschafft!

Dein Code ist jetzt auf GitHub und bereit für Bravo Studio!

**Next Step:** [BRAVO_STUDIO_QUICK_START.md](./BRAVO_STUDIO_QUICK_START.md)

---

**Last Updated:** 2025-11-06  
**Status:** ✅ Ready for GitHub Upload
