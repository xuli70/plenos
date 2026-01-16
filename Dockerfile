# ===========================================
# Dockerfile - Plenos La Zarza
# ===========================================
# Single-stage build: Nginx con archivos estaticos
# NOTA: plenos.json ya está en el repositorio, no se regenera
# ===========================================

FROM nginx:alpine

# Copiar configuracion de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos estaticos directamente (sin build stage)
COPY index.html /usr/share/nginx/html/
COPY login.html /usr/share/nginx/html/
COPY aviso-legal.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY data/ /usr/share/nginx/html/data/
COPY informes/ /usr/share/nginx/html/informes/
COPY pdfActas/ /usr/share/nginx/html/pdfActas/

# Copiar entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exponer puerto
EXPOSE 80

# Healthcheck - usar 127.0.0.1 y mas tiempo de inicio
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/ || exit 1

# Entrypoint procesa password y arranca nginx
ENTRYPOINT ["/entrypoint.sh"]
