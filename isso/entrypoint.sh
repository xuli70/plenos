#!/bin/bash
# entrypoint.sh - Genera isso.conf desde template con variables de entorno

set -e

echo "=== ISSO Entrypoint ==="

# Verificar que la variable de entorno existe
if [ -z "$ISSO_ADMIN_PASSWORD" ]; then
    echo "ERROR: ISSO_ADMIN_PASSWORD no esta definida"
    exit 1
fi

echo "Generando configuracion desde template..."

# Generar isso.conf desde template reemplazando variables de entorno
envsubst '${ISSO_ADMIN_PASSWORD}' < /config/isso.conf.template > /config/isso.conf

echo "Configuracion generada en /config/isso.conf"
echo "Admin password configurada desde variable de entorno"

# Verificar que isso esta instalado
which isso || echo "AVISO: comando isso no encontrado en PATH"

echo "Iniciando servidor ISSO en 0.0.0.0:8080..."

# Iniciar Isso en foreground (exec reemplaza el shell)
exec isso -c /config/isso.conf
