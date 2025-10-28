#!/bin/bash
# Auto-Screenshots Script
# Wrapper for tools/page-screenshots.ts

echo "📸 Running Auto-Screenshots..."
echo ""
echo "⚠️  Note: Server must be running on port 5000"
echo ""

# Check if server is running
if ! curl -s http://localhost:5000 > /dev/null 2>&1; then
  echo "❌ Error: Server not running on port 5000"
  echo ""
  echo "Start the server first:"
  echo "  npm run dev"
  echo ""
  exit 1
fi

echo "✅ Server is running"
echo ""

tsx tools/page-screenshots.ts

echo ""
echo "📁 Generated Screenshots:"
echo ""
ls -lh export/screens/*.png 2>/dev/null | head -10
echo "   ... (more files in export/screens/)"

echo ""
echo "💡 Tip: To add as NPM script, edit package.json manually:"
echo "   \"export:screens\": \"tsx tools/page-screenshots.ts\""
