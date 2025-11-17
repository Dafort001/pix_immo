#!/bin/bash
# Media Library Seed Script
# Importiert Homepage-, PixCapture- und Gallery-Bilder in die Datenbank
# Usage: ./seed-media.sh

set -e

echo "📸 Media Library Seed Script"
echo "=============================="
echo ""
echo "Importiere Bilder aus:"
echo "  - Homepage (home-001 bis home-009)"
echo "  - PixCapture (pixcap-001 bis pixcap-008)"
echo "  - Gallery/Portfolio (gallery-001 bis gallery-008)"
echo ""
echo "Starte Seed-Prozess..."
echo ""

tsx server/seed-media-library.ts

echo ""
echo "✨ Fertig! Besuche /admin/media-library um die Bilder zu sehen."
