#!/bin/bash
set -e

TTF_DIR="public/fonts-ttf"
echo "📊 Corrigiendo el índice dinámico de fuentes..."

# Generar el JSON de forma limpia usando printf para evitar errores de comas
FILES=$(find "$TTF_DIR" -maxdepth 1 -type f \( -name "*.ttf" -o -name "*.otf" \) -exec basename {} \;)

echo "[" > "$TTF_DIR/fonts-index.json"
FIRST=true
for f in $FILES; do
    if [ "$FIRST" = true ]; then
        printf "  \"%s\"" "$f" >> "$TTF_DIR/fonts-index.json"
        FIRST=false
    else
        printf ",\n  \"%s\"" "$f" >> "$TTF_DIR/fonts-index.json"
    fi
done
echo -e "\n]" >> "$TTF_DIR/fonts-index.json"

echo "✅ Índice corregido en $TTF_DIR/fonts-index.json"
cat "$TTF_DIR/fonts-index.json" | head -n 5
echo "..."
tail -n 3 "$TTF_DIR/fonts-index.json"
