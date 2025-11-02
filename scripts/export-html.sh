#!/bin/bash
# HTML Export für Figma Import

echo "📄 HTML Export Tool"
echo ""

# Check if server is running
if ! curl -s http://localhost:5000 > /dev/null; then
    echo "❌ Server is not running!"
    echo "Please start the server first:"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo "✅ Server is running"
echo ""

# Run export
tsx tools/export-html.ts

echo ""
echo "✅ Done! Check export/html/ directory"
echo ""
echo "Next steps:"
echo "1. Open export/html/00_index.html in browser"
echo "2. Import einzelne HTML-Dateien in Figma"
echo ""
