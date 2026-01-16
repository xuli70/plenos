#!/bin/sh
# ===========================================
# entrypoint.sh - Plenos La Zarza
# ===========================================
# Genera hash de password en RUNTIME y lo inserta en config.js
# Esto permite cambiar el password sin rebuild de la imagen
# ===========================================

set -e

echo "=== Plenos Entrypoint ==="
echo "Fecha: $(date)"

# Verificar variable de entorno
if [ -z "$PLENOS_PASSWORD" ]; then
    echo "ERROR: PLENOS_PASSWORD no esta definida"
    echo "Configure la variable de entorno en Coolify"
    exit 1
fi

echo "Generando hash de contrasena..."

# Generar hash SHA-256 usando sha256sum (disponible en nginx:alpine via busybox)
PASSWORD_HASH=$(echo -n "$PLENOS_PASSWORD" | sha256sum | cut -d' ' -f1)

echo "Hash generado: ${PASSWORD_HASH:0:16}..."

# Reemplazar hash en config.js
CONFIG_FILE="/usr/share/nginx/html/js/config.js"
if [ -f "$CONFIG_FILE" ]; then
    # Primero intentar reemplazar el placeholder
    if grep -q '%%PASSWORD_HASH%%' "$CONFIG_FILE"; then
        sed -i "s/%%PASSWORD_HASH%%/$PASSWORD_HASH/g" "$CONFIG_FILE"
        echo "Hash insertado desde placeholder"
    else
        # Si no hay placeholder, reemplazar cualquier hash existente (64 caracteres hex)
        # Busca el patrón: passwordHash: 'xxxxxxx...'
        if grep -q "passwordHash: '[a-f0-9]\{64\}'" "$CONFIG_FILE"; then
            sed -i "s/passwordHash: '[a-f0-9]\{64\}'/passwordHash: '$PASSWORD_HASH'/g" "$CONFIG_FILE"
            echo "Hash existente reemplazado con nuevo hash"
        else
            echo "ADVERTENCIA: No se encontro placeholder ni hash existente en config.js"
        fi
    fi
    echo "Hash final: $(grep passwordHash "$CONFIG_FILE" | head -1)"
else
    echo "ERROR: config.js no encontrado en $CONFIG_FILE"
    exit 1
fi

echo "Iniciando nginx..."
exec nginx -g "daemon off;"
