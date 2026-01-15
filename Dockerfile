# ===========================================
# Dockerfile - Plenos La Zarza
# ===========================================
# Imagen de produccion con Nginx
# ===========================================

FROM nginx:alpine

# Copiar configuracion de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos estaticos
COPY index.html /usr/share/nginx/html/
COPY login.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY data/ /usr/share/nginx/html/data/
COPY informes/ /usr/share/nginx/html/informes/

# Exponer puerto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost/ || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
