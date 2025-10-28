# Git Operations Guide

## ⚠️ Wichtig: Replit Git-Einschränkungen

Replit schränkt automatische Git-Operationen ein, um Konflikte zu vermeiden. **Sie müssen Git-Befehle selbst im Shell ausführen.**

---

## 🔖 Project Freeze - Manuelle Schritte

Führen Sie diese Befehle **im Replit Shell** aus:

### 1️⃣ Änderungen einchecken

```bash
git add -A
git commit -m "🔒 Freeze before layout phase – camera, sync, and security stable"
```

### 2️⃣ Projekt-Tags setzen

```bash
git tag app-proflow-checkpoint
git tag backend-security-checkpoint
git tag full-freeze-$(date +%Y-%m-%d)
```

### 3️⃣ Push zu GitHub (mit Tags)

```bash
git push origin main --tags
```

### 4️⃣ Status prüfen

```bash
git status
git log -3 --oneline
git tag -l
```

---

## 📋 Verifikation

Nach dem Push sollten Sie sehen:

```bash
$ git tag -l
app-proflow-checkpoint
backend-security-checkpoint
full-freeze-2025-10-28
```

```bash
$ git log -1 --oneline
abc1234 🔒 Freeze before layout phase – camera, sync, and security stable
```

---

## 🔄 Replit Automatic Checkpoints

Zusätzlich zu Git-Tags nutzt Replit automatische Checkpoints:

- **Automatisch erstellt**: Bei jeder größeren Änderung
- **Rollback-Funktion**: Über Replit UI verfügbar
- **Umfasst**: Code + Database + Chat-Historie

### Checkpoint erstellen (via UI)
1. Öffnen Sie das Replit-Menü
2. Klicken Sie auf "Checkpoints"
3. Erstellen Sie manuell einen Checkpoint mit Name "Project Freeze 2025-10-28"

---

## 🚨 Troubleshooting

### Fehler: "index.lock"
```bash
Avoid changing .git repository. When git operations are needed...
```

**Lösung**: Verwenden Sie das **Replit Shell** (nicht Agent-Tools) für Git-Operationen.

### Fehler: "Permission denied"
```bash
fatal: could not create work tree dir: Permission denied
```

**Lösung**: Stellen Sie sicher, dass Sie Git-Befehle im Workspace-Root ausführen:
```bash
cd /home/runner/workspace
git status
```

### Fehler: "Authentication failed"
```bash
fatal: Authentication failed for 'https://github.com/...'
```

**Lösung**: Verwenden Sie Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens
2. Erstellen Sie Token mit `repo` scope
3. Im Replit: Secrets → `GIT_URL` = `https://<username>:<token>@github.com/<user>/<repo>`
4. Push mit: `git push $GIT_URL`

---

## 📦 Backup-Strategie

### Option 1: Git Tags (empfohlen)
- Schnell zu bestimmten Versionen zurückkehren
- Remote backup auf GitHub
- Kollaborations-freundlich

### Option 2: Replit Checkpoints
- Automatisch + manuell
- Umfasst auch Database-State
- Nur in Replit verfügbar

### Option 3: Lokale Clone
```bash
# Auf Ihrem lokalen Computer:
git clone <your-repo-url> pix-immo-local
cd pix-immo-local
git checkout full-freeze-2025-10-28
```

---

## 🔍 Nützliche Git-Befehle

### Tags verwalten
```bash
# Alle Tags anzeigen
git tag -l

# Tag zu bestimmtem Commit
git tag <tag-name> <commit-hash>

# Tag löschen (lokal)
git tag -d <tag-name>

# Tag löschen (remote)
git push origin --delete <tag-name>
```

### Zu Tag zurückkehren
```bash
# Neuen Branch von Tag erstellen
git checkout -b hotfix-branch full-freeze-2025-10-28

# Oder: Direkt zu Tag wechseln (detached HEAD)
git checkout full-freeze-2025-10-28
```

### Remote Sync prüfen
```bash
# Lokale vs. Remote Tags
git ls-remote --tags origin

# Status mit Remote
git fetch --tags
git status
```

---

## 📚 Weitere Ressourcen

- [Replit Git Documentation](https://docs.replit.com/category/git)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Git Tagging Best Practices](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
