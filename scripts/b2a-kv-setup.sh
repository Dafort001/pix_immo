#!/bin/bash
# ==========================================================
# B2a.1 — KV-Setup + wrangler.toml (Design v2, manuell)
# Ziel: Sticky Cohorts + sofortiger Rollback ohne Redeploy
# Voraussetzung: wrangler eingeloggt (wrangler login)
# ==========================================================

set -e  # Exit on error

# 1) Grundvariablen (bitte anpassen)
export CF_ACCOUNT_ID="${CF_ACCOUNT_ID:-DEIN_CLOUDFLARE_ACCOUNT_ID}"   # <- eintragen oder via env var
export KV_BINDING="KV_CANARY_CONFIG"
export KV_NAMESPACE_NAME="canary-config"
export CANARY_TAG="B2a"
export CANARY_PERCENT=10

echo "==================================================="
echo "B2a.1 - KV Namespace Setup für Canary Rollout"
echo "==================================================="
echo ""

# 2) Prüfe wrangler login
if ! npx wrangler whoami &>/dev/null; then
  echo "❌ ERROR: wrangler nicht eingeloggt!"
  echo "Führe aus: npx wrangler login"
  exit 1
fi

echo "✅ wrangler authentifiziert"
echo ""

# 3) wrangler.toml: account_id sicherstellen
if ! grep -q "account_id" wrangler.toml; then
  echo "⚠️  account_id fehlt in wrangler.toml"
  read -p "Account ID eingeben (oder Enter zum Überspringen): " INPUT_ACCOUNT_ID
  if [ -n "$INPUT_ACCOUNT_ID" ]; then
    printf '\naccount_id = "%s"\n' "$INPUT_ACCOUNT_ID" >> wrangler.toml
    echo "✅ account_id in wrangler.toml ergänzt."
  else
    echo "⏭️  Übersprungen - bitte manuell ergänzen"
  fi
else
  echo "✅ account_id bereits vorhanden"
fi
echo ""

# 4) KV Namespaces anlegen (Preview + Prod)
echo "📦 Erstelle KV Namespaces..."
echo ""

echo "▶ PREVIEW Namespace:"
PREVIEW_OUTPUT=$(npx wrangler kv:namespace create "$KV_NAMESPACE_NAME" --preview 2>&1)
echo "$PREVIEW_OUTPUT"
# Portable ID extraction (works on GNU + BSD grep)
PREVIEW_ID=$(echo "$PREVIEW_OUTPUT" | sed -n 's/.*id = "\([^"]*\)".*/\1/p')

echo ""
echo "▶ PRODUCTION Namespace:"
PROD_OUTPUT=$(npx wrangler kv:namespace create "$KV_NAMESPACE_NAME" 2>&1)
echo "$PROD_OUTPUT"
# Portable ID extraction (works on GNU + BSD grep)
PROD_ID=$(echo "$PROD_OUTPUT" | sed -n 's/.*id = "\([^"]*\)".*/\1/p')

echo ""
if [ -z "$PREVIEW_ID" ] || [ -z "$PROD_ID" ]; then
  echo "⚠️  Konnte IDs nicht automatisch extrahieren."
  echo "Bitte notieren Sie die IDs aus der Ausgabe oben:"
  read -p "Preview ID: " PREVIEW_ID
  read -p "Production ID: " PROD_ID
fi

echo ""
echo "📝 Notierte IDs:"
echo "   Preview:    $PREVIEW_ID"
echo "   Production: $PROD_ID"
echo ""

# 5) wrangler.toml aktualisieren
echo "📄 Aktualisiere wrangler.toml mit KV Namespace IDs..."

# Backup erstellen
cp wrangler.toml wrangler.toml.backup

# IDs ersetzen (portable sed für Linux + macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS requires empty string after -i
  sed -i '' "s/id = \"placeholder_replace_after_creation\"/id = \"$PROD_ID\"/" wrangler.toml
  sed -i '' "s/preview_id = \"placeholder_replace_after_creation\"/preview_id = \"$PREVIEW_ID\"/" wrangler.toml
else
  # Linux/GNU sed
  sed -i "s/id = \"placeholder_replace_after_creation\"/id = \"$PROD_ID\"/" wrangler.toml
  sed -i "s/preview_id = \"placeholder_replace_after_creation\"/preview_id = \"$PREVIEW_ID\"/" wrangler.toml
fi

echo "✅ wrangler.toml aktualisiert (Backup: wrangler.toml.backup)"
echo ""

# 6) KV-Config initial befüllen
echo "📤 Schreibe initiale KV-Konfiguration..."
STAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
CONFIG_JSON="{\"canary_percent\":$CANARY_PERCENT,\"canary_tag\":\"$CANARY_TAG\",\"emergency_proxy\":false,\"last_updated\":\"$STAMP\"}"

echo "$CONFIG_JSON" > kv_config.json
echo "   Datei: kv_config.json"
echo "   Inhalt: $CONFIG_JSON"
echo ""

echo "▶ PREVIEW Environment:"
npx wrangler kv:key put --binding="$KV_BINDING" config --preview --path kv_config.json
echo ""

echo "▶ PRODUCTION Environment:"
npx wrangler kv:key put --binding="$KV_BINDING" config --path kv_config.json
echo ""

# 7) Prüfen
echo "🔍 Prüfe KV-Konfiguration..."
echo ""

echo "▶ PREVIEW:"
npx wrangler kv:key get --binding="$KV_BINDING" config --preview
echo ""

echo "▶ PRODUCTION:"
npx wrangler kv:key get --binding="$KV_BINDING" config
echo ""

# 8) Deploy (optional)
read -p "Jetzt deployen? (y/N): " DEPLOY
if [[ "$DEPLOY" =~ ^[Yy]$ ]]; then
  echo "🚀 Deploying Workers..."
  npx wrangler deploy
  echo ""
fi

# 9) Rollback-Shortcuts anzeigen
echo ""
echo "==================================================="
echo "✅ B2a.1 Setup COMPLETE!"
echo "==================================================="
echo ""
echo "📋 Sofort-Rollback Kommandos (bei Bedarf):"
echo ""
echo "# 1. Sampling AUS (0%):"
echo "npx wrangler kv:key put --binding=$KV_BINDING config \\"
echo "  --value '{\"canary_percent\":0,\"canary_tag\":\"$CANARY_TAG\",\"emergency_proxy\":false,\"last_updated\":\"'\$(date -u +%Y-%m-%dT%H:%M:%SZ)'\"}'"
echo ""
echo "# 2. NOT-AUS (100% Proxy):"
echo "npx wrangler kv:key put --binding=$KV_BINDING config \\"
echo "  --value '{\"canary_percent\":0,\"canary_tag\":\"$CANARY_TAG\",\"emergency_proxy\":true,\"last_updated\":\"'\$(date -u +%Y-%m-%dT%H:%M:%SZ)'\"}'"
echo ""
echo "# 3. Prozent ändern (z.B. auf 5%):"
echo "npx wrangler kv:key put --binding=$KV_BINDING config \\"
echo "  --value '{\"canary_percent\":5,\"canary_tag\":\"$CANARY_TAG\",\"emergency_proxy\":false,\"last_updated\":\"'\$(date -u +%Y-%m-%dT%H:%M:%SZ)'\"}'"
echo ""
echo "==================================================="
echo "📋 Nächste Schritte:"
echo "   ☑ KV Namespaces: PREVIEW + PROD erstellt"
echo "   ☑ wrangler.toml: IDs eingefügt"
echo "   ☑ KV-Key 'config': Initialisiert (10%)"
echo "   → Weiter mit B2a.2: Sticky Middleware + Cookies"
echo "==================================================="

# Cleanup
rm -f kv_config.json
