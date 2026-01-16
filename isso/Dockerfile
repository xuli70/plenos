FROM python:3.11-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache gettext sqlite

# Instalar ISSO con todas sus dependencias
RUN pip install --no-cache-dir isso

# Crear directorio de configuracion
RUN mkdir -p /config /db

# Copiar template de configuracion
COPY isso/isso.conf.template /config/isso.conf.template

# Copiar entrypoint script y hacerlo ejecutable
COPY isso/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV ISSO_SETTINGS=/config/isso.conf

# Valor por defecto - DEBE ser sobreescrito en Coolify
ENV ISSO_ADMIN_PASSWORD=changeme

EXPOSE 8080

VOLUME ["/db"]

ENTRYPOINT ["/entrypoint.sh"]
