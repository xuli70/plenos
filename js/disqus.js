/* ===========================================
   DISQUS.JS - Integración con Disqus
   =========================================== */

const DisqusManager = {
    shortname: CONFIG.disqus.shortname,
    loaded: false,
    currentIdentifier: null,

    /**
     * Carga Disqus para un pleno específico
     */
    load(plenoId, plenoTitle) {
        if (!CONFIG.disqus.enabled) return;

        // Si ya está cargado el mismo pleno, no hacer nada
        if (this.currentIdentifier === plenoId) return;

        this.currentIdentifier = plenoId;

        // Configurar variables de Disqus
        window.disqus_config = function() {
            this.page.url = `${window.location.origin}${window.location.pathname}#${plenoId}`;
            this.page.identifier = `pleno-${plenoId}`;
            this.page.title = plenoTitle || `Pleno ${plenoId}`;
        };

        // Si Disqus ya está cargado, resetear
        if (window.DISQUS) {
            this.reset();
        } else {
            this.loadScript();
        }
    },

    /**
     * Carga el script de Disqus
     */
    loadScript() {
        const container = document.getElementById(`disqus-${this.currentIdentifier}`);
        if (!container) return;

        // Crear elemento para Disqus
        container.innerHTML = '<div id="disqus_thread"></div>';

        // Cargar script
        const script = document.createElement('script');
        script.src = `https://${this.shortname}.disqus.com/embed.js`;
        script.setAttribute('data-timestamp', +new Date());
        script.async = true;

        script.onload = () => {
            this.loaded = true;
        };

        script.onerror = () => {
            console.error('Error cargando Disqus');
            container.innerHTML = `
                <div class="disqus-error">
                    <span class="material-icons-round">error_outline</span>
                    <p>No se pudieron cargar los comentarios.</p>
                    <button class="btn-secondary" onclick="DisqusManager.retry()">Reintentar</button>
                </div>
            `;
        };

        document.body.appendChild(script);
    },

    /**
     * Resetea Disqus con nueva configuración
     */
    reset() {
        if (!window.DISQUS) return;

        // Mover el thread al nuevo contenedor
        const oldThread = document.getElementById('disqus_thread');
        const newContainer = document.getElementById(`disqus-${this.currentIdentifier}`);

        if (oldThread && newContainer) {
            // Eliminar thread antiguo
            if (oldThread.parentElement !== newContainer) {
                oldThread.remove();
                newContainer.innerHTML = '<div id="disqus_thread"></div>';
            }
        }

        // Resetear Disqus
        window.DISQUS.reset({
            reload: true,
            config: window.disqus_config
        });
    },

    /**
     * Reintenta cargar Disqus
     */
    retry() {
        if (this.currentIdentifier) {
            this.loaded = false;
            window.DISQUS = undefined;
            this.loadScript();
        }
    },

    /**
     * Obtiene el conteo de comentarios
     */
    getCommentCount(callback) {
        if (!CONFIG.disqus.enabled) {
            callback(0);
            return;
        }

        // Cargar script de conteo
        const script = document.createElement('script');
        script.src = `https://${this.shortname}.disqus.com/count.js`;
        script.async = true;
        document.body.appendChild(script);
    }
};

// Congelar para evitar modificaciones
Object.freeze(DisqusManager);
