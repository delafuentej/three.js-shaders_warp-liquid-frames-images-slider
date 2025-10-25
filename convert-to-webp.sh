#!/bin/bash
set -e  # Detener el script si ocurre un error

# === CONFIGURACIÓN ===
SRC_DIR="./public/images"      # Carpeta de origen
DEST_DIR="$SRC_DIR/webp"       # Carpeta destino
QUALITY=80                     # Calidad WebP (0-100)
THREADS=4                      # Número de conversiones simultáneas (ajústalo según tu CPU)

# Crear carpeta de destino si no existe
mkdir -p "$DEST_DIR"

echo "🚀 Iniciando conversión de imágenes JPG/JPEG a WebP..."
echo "Origen: $SRC_DIR"
echo "Destino: $DEST_DIR"
echo "Calidad: $QUALITY"
echo

# Buscar todas las imágenes JPG/JPEG recursivamente
find "$SRC_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | while IFS= read -r img; do
    # Calcular ruta relativa y destino
    rel_path="${img#$SRC_DIR/}"
    dest_path="$DEST_DIR/${rel_path%.*}.webp"
    dest_dir=$(dirname "$dest_path")

    # Crear subcarpeta destino si no existe
    mkdir -p "$dest_dir"

    # Evitar reconvertir si ya existe
    if [ -f "$dest_path" ]; then
        echo "⏩ Ya convertido: $rel_path"
        continue
    fi

    echo "🛠️  Convirtiendo: $rel_path"

    # Usar ImageMagick con parámetros de compresión eficientes
    magick "$img" -strip -interlace Plane -sampling-factor 4:2:0 -quality "$QUALITY" -define webp:method=6 "$dest_path" &

    # Control de paralelización
    ((i=i%THREADS)); ((i++==0)) && wait
    echo "✅ Convertido: $rel_path -> ${dest_path#$SRC_DIR/}"
done

wait  # Esperar a que terminen todos los procesos

echo
echo "🎉 Conversión completada correctamente."
