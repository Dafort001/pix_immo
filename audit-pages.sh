#!/bin/bash
# Page Inventory Audit Script
# Wrapper for tools/page-inventory.ts

echo "🔍 Running Page Inventory Audit..."
echo ""

tsx tools/page-inventory.ts

echo ""
echo "📋 Quick View - Top 10 Routes:"
echo ""
head -20 docs/page_inventory.md | tail -10

echo ""
echo "💡 Tip: To add as NPM script, edit package.json manually:"
echo "   \"audit:pages\": \"tsx tools/page-inventory.ts\""
echo ""
echo "   Then run: npm run audit:pages"
