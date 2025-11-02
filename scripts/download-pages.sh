#!/bin/bash
# Exportiert alle Seiten als HTML und erstellt ZIP zum Download

echo "📄 HTML Export für Figma"
echo ""

# Check if server is running
if ! curl -s http://localhost:5000 > /dev/null; then
    echo "❌ Server läuft nicht!"
    echo "Bitte starte zuerst: npm run dev"
    echo ""
    exit 1
fi

echo "✅ Server läuft"
echo ""

# Run export
tsx tools/fetch-html-export.ts

echo ""
echo "✅ Fertig!"
echo ""
echo "📦 ZIP-Datei: export/piximmo-pages.zip"
echo ""
