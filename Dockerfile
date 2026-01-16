# ===========================================
# Dockerfile - Plenos La Zarza
# ===========================================
# Multi-stage build: Node.js (build) + Nginx (produccion)
# ===========================================

# ===========================================
# Stage 1: Build con Node.js
# ===========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y instalar dependencias
COPY package.json package-lock.json* ./
RUN npm install

# Copiar codigo fuente
COPY . .

# Ejecutar build (genera plenos.json - password se procesa en RUNTIME)
RUN npm run build

# ===========================================
# Stage 2: Produccion con Nginx
# ===========================================
FROM nginx:alpine

# Copiar configuracion de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos del builder (con config.js modificado)
COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/login.html /usr/share/nginx/html/
COPY --from=builder /app/aviso-legal.html /usr/share/nginx/html/
COPY --from=builder /app/css/ /usr/share/nginx/html/css/
COPY --from=builder /app/js/ /usr/share/nginx/html/js/
COPY --from=builder /app/data/ /usr/share/nginx/html/data/
COPY --from=builder /app/informes/ /usr/share/nginx/html/informes/
COPY --from=builder /app/pdfActas/ /usr/share/nginx/html/pdfActas/

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
