#!/bin/bash
# Wireframe Export Script
# Wrapper for tools/wireframe-export.ts

echo "🎨 Running Wireframe Export..."
echo ""

tsx tools/wireframe-export.ts

echo ""
echo "📁 Generated Files:"
echo ""
ls -lh export/wireframes/ | head -5
echo "   ... (more files in export/wireframes/)"
echo ""
ls -lh export/skeletons/ | head -5
echo "   ... (more files in export/skeletons/)"
echo ""
ls -lh export/site_map.svg 2>/dev/null || echo "   (sitemap pending)"

echo ""
echo "💡 Tip: To add as NPM script, edit package.json manually:"
echo "   \"export:wireframes\": \"tsx tools/wireframe-export.ts\""
echo ""
echo "   Then run: npm run export:wireframes"
