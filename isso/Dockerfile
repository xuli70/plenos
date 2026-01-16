FROM python:3.11-slim

# Instalar dependencias del sistema (incluye compilador para misaka)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gettext-base \
    sqlite3 \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar ISSO con todas sus dependencias
RUN pip install --no-cache-dir isso

# Limpiar compilador (ya no se necesita)
RUN apt-get purge -y gcc python3-dev && apt-get autoremove -y

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
