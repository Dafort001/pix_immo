#!/bin/bash
# Component Map Script
# Wrapper for tools/component-map.ts

echo "🗺️  Running Component Map Analysis..."
echo ""

tsx tools/component-map.ts

echo ""
echo "📁 Generated Files:"
echo ""
ls -lh docs/component_map.json docs/component_map.md 2>/dev/null

echo ""
echo "💡 Tip: To add as NPM script, edit package.json manually:"
echo "   \"audit:components\": \"tsx tools/component-map.ts\""
