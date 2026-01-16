#!/bin/sh
# entrypoint.sh - Genera isso.conf desde template con variables de entorno
# Esto permite cambiar ISSO_ADMIN_PASSWORD en Coolify y que se aplique al reiniciar

set -e

# Verificar que la variable de entorno existe
if [ -z "$ISSO_ADMIN_PASSWORD" ]; then
    echo "ERROR: ISSO_ADMIN_PASSWORD no esta definida"
    exit 1
fi

# Generar isso.conf desde template reemplazando variables de entorno
envsubst < /config/isso.conf.template > /config/isso.conf

echo "Configuracion generada correctamente"
echo "Admin password configurada desde variable de entorno"

# Iniciar Isso usando el modulo Python (comando correcto en esta imagen)
exec python -m isso.run -c /config/isso.conf
