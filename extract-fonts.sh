#!/bin/bash
set -e

CONTAINER_NAME="oo_assets_extractor"
IMAGE="onlyoffice/documentserver:9.3.1"
DEST_DIR="public/v9.3.1-1"
TTF_DIR="public/fonts-ttf"

echo "🚀 Iniciando contenedor para extracción total..."
docker rm -f $CONTAINER_NAME 2>/dev/null || true
docker run -d --name $CONTAINER_NAME $IMAGE

echo "⏳ Esperando inicialización (15s)..."
sleep 15
docker exec $CONTAINER_NAME documentserver-generate-allfonts.sh false || true

echo "📂 Preparando carpetas..."
mkdir -p "$TTF_DIR"
mkdir -p "$DEST_DIR/fonts"

echo "📥 Extrayendo binarios y mapeos críticos..."
docker cp $CONTAINER_NAME:/var/www/onlyoffice/documentserver/fonts/. "$DEST_DIR/fonts/"
docker cp $CONTAINER_NAME:/var/www/onlyoffice/documentserver/server/FileConverter/bin/font_selection.bin "$DEST_DIR/fonts/font_selection.bin"

echo "📥 Extrayendo TODAS las fuentes TTF/OTF del sistema..."
# Usamos tar para preservar estructura y ser más rápidos
docker exec $CONTAINER_NAME bash -c "find /var/www/onlyoffice/documentserver/core-fonts -name '*.[to]tf' -exec cp {} /tmp/ \;" || true
docker cp $CONTAINER_NAME:/tmp/. "$TTF_DIR/" 2>/dev/null || true

# Añadimos tus fuentes personalizadas
cp assets/*.ttf "$TTF_DIR/" 2>/dev/null || true

echo "📊 Generando índice dinámico de fuentes..."
echo "[" > "$TTF_DIR/fonts-index.json"
find "$TTF_DIR" -maxdepth 1 -type f \( -name "*.ttf" -o -name "*.otf" \) -exec basename {} \; | sed 's/$/,/' | sed '$ s/,$//' | sed 's/^/"/;s/$/"/' >> "$TTF_DIR/fonts-index.json"
echo "]" >> "$TTF_DIR/fonts-index.json"

echo "🛑 Apagando servidor..."
docker rm -f $CONTAINER_NAME

echo "✨ LISTO. Fuentes extraídas: $(grep -c "," "$TTF_DIR/fonts-index.json")"
