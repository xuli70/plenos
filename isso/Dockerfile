FROM ghcr.io/isso-comments/isso:latest

# Instalar dependencias necesarias
USER root
RUN apk add --no-cache gettext && \
    pip install --no-cache-dir setuptools

# Copiar template de configuracion (NO el archivo final)
COPY isso/isso.conf.template /config/isso.conf.template

# Copiar entrypoint script y hacerlo ejecutable
COPY isso/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV ISSO_SETTINGS=/config/isso.conf

# Valor por defecto - DEBE ser sobreescrito en Coolify
ENV ISSO_ADMIN_PASSWORD=changeme

EXPOSE 8080

VOLUME ["/db"]

# Usar entrypoint que genera isso.conf dinamicamente
ENTRYPOINT ["/entrypoint.sh"]
