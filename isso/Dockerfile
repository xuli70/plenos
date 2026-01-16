FROM ghcr.io/isso-comments/isso:latest

# Instalar envsubst (gettext) para sustituir variables de entorno
USER root
RUN apk add --no-cache gettext
USER isso

# Copiar template de configuracion (NO el archivo final)
COPY isso/isso.conf.template /config/isso.conf.template

# Copiar entrypoint script
COPY isso/entrypoint.sh /entrypoint.sh

# Hacer ejecutable el entrypoint
USER root
RUN chmod +x /entrypoint.sh
USER isso

ENV ISSO_SETTINGS=/config/isso.conf

# Valor por defecto - DEBE ser sobreescrito en Coolify
ENV ISSO_ADMIN_PASSWORD=changeme

EXPOSE 8080

VOLUME ["/db"]

# Usar entrypoint que genera isso.conf dinamicamente
ENTRYPOINT ["/entrypoint.sh"]
