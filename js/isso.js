/* ===========================================
   ISSO.JS - Integración con Isso Comments
   Sistema de comentarios self-hosted
   =========================================== */

const IssoManager = {
    issoUrl: 'https://isso.axcsol.com',
    loaded: false,
    currentIdentifier: null,
    scriptLoaded: false,

    /**
     * Carga Isso para un pleno específico
     */
    load(plenoId, plenoTitle) {
        if (!CONFIG.isso?.enabled) return;

        // Si ya está cargado el mismo pleno, no hacer nada
        if (this.currentIdentifier === plenoId) return;

        this.currentIdentifier = plenoId;

        // Cargar script de Isso si no está cargado
        if (!this.scriptLoaded) {
            this.loadScript();
        } else {
            this.renderThread(plenoId, plenoTitle);
        }
    },

    /**
     * Carga el script de Isso
     */
    loadScript() {
        const script = document.createElement('script');
        script.src = `${this.issoUrl}/js/embed.min.js`;
        script.setAttribute('data-isso', `${this.issoUrl}/`);
        script.setAttribute('data-isso-css', 'true');
        script.setAttribute('data-isso-lang', 'es');
        script.setAttribute('data-isso-reply-to-self', 'false');
        script.setAttribute('data-isso-require-author', 'true');
        script.setAttribute('data-isso-require-email', 'false');
        script.setAttribute('data-isso-max-comments-top', '10');
        script.setAttribute('data-isso-max-comments-nested', '5');
        script.setAttribute('data-isso-avatar', 'true');
        script.setAttribute('data-isso-vote', 'true');
        script.setAttribute('data-isso-vote-levels', '');
        script.async = true;

        script.onload = () => {
            this.scriptLoaded = true;
            this.loaded = true;
            // Renderizar el thread actual
            if (this.currentIdentifier) {
                this.renderThread(this.currentIdentifier);
            }
        };

        script.onerror = () => {
            console.error('Error cargando Isso');
            this.showError();
        };

        document.head.appendChild(script);
    },

    /**
     * Renderiza el thread de comentarios
     */
    renderThread(plenoId, plenoTitle) {
        const container = document.getElementById(`comments-${plenoId}`);
        if (!container) return;

        // Limpiar contenedor
        container.innerHTML = '';

        // Crear elemento section para Isso
        const section = document.createElement('section');
        section.id = `isso-thread-${plenoId}`;
        section.setAttribute('data-isso-id', `/pleno/${plenoId}/`);
        if (plenoTitle) {
            section.setAttribute('data-title', plenoTitle);
        }
        container.appendChild(section);

        // Forzar re-render si Isso ya está cargado
        if (window.Isso) {
            // Esperar un tick para que el DOM se actualice
            setTimeout(() => {
                window.Isso.fetchComments();
            }, 100);
        }
    },

    /**
     * Muestra error de carga
     */
    showError() {
        const container = document.getElementById(`comments-${this.currentIdentifier}`);
        if (!container) return;

        container.innerHTML = `
            <div class="isso-error">
                <span class="material-icons-round">error_outline</span>
                <p>No se pudieron cargar los comentarios.</p>
                <button class="btn-secondary" onclick="IssoManager.retry()">Reintentar</button>
            </div>
        `;
    },

    /**
     * Reintenta cargar Isso
     */
    retry() {
        if (this.currentIdentifier) {
            this.scriptLoaded = false;
            this.loaded = false;
            // Eliminar script anterior si existe
            const oldScript = document.querySelector('script[data-isso]');
            if (oldScript) {
                oldScript.remove();
            }
            this.loadScript();
        }
    },

    /**
     * Resetea el manager
     */
    reset() {
        this.currentIdentifier = null;
    }
};
