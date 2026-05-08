#!/bin/bash
VERSION="v9.3.1-1"
ASSET_PATH="public/$VERSION"
echo "🔧 Arreglando rutas de ServiceWorker y activos..."

# Copiar el ServiceWorker a la raíz de la carpeta de activos si existe
if [ -f "$ASSET_PATH/web-apps/apps/api/documents/document_editor_service_worker.js" ]; then
    cp "$ASSET_PATH/web-apps/apps/api/documents/document_editor_service_worker.js" "$ASSET_PATH/"
    echo "✅ document_editor_service_worker.js copiado a la raíz de activos."
fi

# Intentar encontrar otros JSONs perdidos que OnlyOffice busca en rutas relativas extrañas
# (Esto es preventivo basado en los 404s)
mkdir -p "$ASSET_PATH/common/main/resources/alphabetletters"
# Nota: Aquí idealmente copiaríamos de sdkjs o web-apps si supiéramos la ubicación exacta
# pero por ahora aseguramos que el ServiceWorker, que es crítico para el 404 de registro, esté en su sitio.
