#!/bin/bash

# 🚀 Git Backup Script - Pusht zu beiden Repositories
# Verwendung: ./git-backup.sh "Ihre Commit-Nachricht"

set -e  # Script stoppt bei Fehlern

# Farben für Output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔄 Git Backup Script gestartet${NC}"
echo -e "${BLUE}========================================${NC}"

# Commit-Nachricht (Standard: Datum)
COMMIT_MSG="${1:-Update: $(date '+%Y-%m-%d %H:%M')}"

echo -e "\n${YELLOW}📝 Commit-Nachricht:${NC} $COMMIT_MSG"

# Schritt 1: Änderungen hinzufügen
echo -e "\n${BLUE}➜ Schritt 1/4: Änderungen hinzufügen...${NC}"
git add -A
echo -e "${GREEN}✓ Alle Änderungen hinzugefügt${NC}"

# Schritt 2: Commit erstellen
echo -e "\n${BLUE}➜ Schritt 2/4: Commit erstellen...${NC}"
if git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠ Keine Änderungen zum Committen${NC}"
else
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✓ Commit erstellt${NC}"
fi

# Schritt 3: Zum primären Repository pushen (origin)
echo -e "\n${BLUE}➜ Schritt 3/4: Push zu primärem Repository (origin)...${NC}"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if git push origin "$BRANCH"; then
    echo -e "${GREEN}✓ Erfolgreich zu origin gepusht${NC}"
else
    echo -e "${RED}✗ Fehler beim Push zu origin${NC}"
    exit 1
fi

# Schritt 4: Zum Backup-Repository pushen (backup)
echo -e "\n${BLUE}➜ Schritt 4/4: Push zu Backup-Repository (backup)...${NC}"
if git remote | grep -q "^backup$"; then
    if git push backup "$BRANCH"; then
        echo -e "${GREEN}✓ Erfolgreich zu backup gepusht${NC}"
    else
        echo -e "${YELLOW}⚠ Warnung: Fehler beim Push zu backup${NC}"
        echo -e "${YELLOW}  Möglicherweise müssen Sie das Backup-Remote erst einrichten${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Backup-Remote nicht konfiguriert${NC}"
    echo -e "${YELLOW}  Führen Sie aus: git remote add backup https://github.com/USERNAME/REPO.git${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Backup abgeschlossen!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Branch: ${BLUE}$BRANCH${NC}"
echo -e "Commit: ${BLUE}$COMMIT_MSG${NC}"
echo -e ""
