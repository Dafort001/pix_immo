#!/bin/bash

# 🔧 Setup Script für Backup-Repository
# Hilft beim Einrichten des zweiten Git-Remotes

set -e

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔧 Backup-Repository Setup${NC}"
echo -e "${BLUE}========================================${NC}"

# Zeige aktuelle Remotes
echo -e "\n${YELLOW}📋 Aktuelle Git-Remotes:${NC}"
git remote -v

# Prüfe ob "backup" bereits existiert
if git remote | grep -q "^backup$"; then
    echo -e "\n${GREEN}✓ Backup-Remote bereits konfiguriert!${NC}"
    echo -e "\nBackup-URL:"
    git remote get-url backup
    echo -e "\n${YELLOW}Möchten Sie die URL ändern? Führen Sie aus:${NC}"
    echo -e "  git remote set-url backup https://github.com/USERNAME/NEUES-REPO.git"
else
    echo -e "\n${YELLOW}⚠ Backup-Remote noch nicht konfiguriert${NC}"
    echo -e "\n${BLUE}Schritte zum Einrichten:${NC}"
    echo -e "1. Erstellen Sie ein neues Repository auf GitHub.com"
    echo -e "2. Kopieren Sie die Repository-URL (z.B. https://github.com/username/pix-immo-backup.git)"
    echo -e "3. Führen Sie aus:"
    echo -e "   ${GREEN}git remote add backup https://github.com/USERNAME/REPO.git${NC}"
    echo -e "\n${YELLOW}Oder direkt hier eingeben (Enter für Abbruch):${NC}"
    read -p "Backup Repository URL: " BACKUP_URL
    
    if [ -n "$BACKUP_URL" ]; then
        git remote add backup "$BACKUP_URL"
        echo -e "\n${GREEN}✓ Backup-Remote hinzugefügt!${NC}"
        echo -e "\nNeue Remotes:"
        git remote -v
        
        # Ersten Push vorbereiten
        BRANCH=$(git rev-parse --abbrev-ref HEAD)
        echo -e "\n${YELLOW}Möchten Sie jetzt zum Backup-Repository pushen? (y/n)${NC}"
        read -p "Push ausführen? " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push -u backup "$BRANCH"
            echo -e "${GREEN}✓ Erfolgreich zum Backup gepusht!${NC}"
        fi
    else
        echo -e "\n${YELLOW}Setup abgebrochen. Sie können es später mit diesem Script erneut versuchen.${NC}"
    fi
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Setup abgeschlossen!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${BLUE}Nächster Schritt:${NC}"
echo -e "  Verwenden Sie ${GREEN}./git-backup.sh \"Nachricht\"${NC} zum Backup"
echo -e ""
