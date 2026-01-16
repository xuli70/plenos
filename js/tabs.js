/* ===========================================
   TABS.JS - Sistema de Navegación por Tabs
   =========================================== */

const TabsManager = {
    container: null,
    navContainer: null,
    currentTab: null,
    plenos: [],

    /**
     * Inicializa el sistema de tabs
     */
    init(plenos) {
        this.plenos = plenos;
        this.container = document.getElementById('tabsContent');
        this.navContainer = document.getElementById('tabsNav');

        if (!this.container || !this.navContainer) {
            console.error('Contenedores de tabs no encontrados');
            return;
        }

        this.render();
        this.setupKeyboardNavigation();
        this.setupHashNavigation();
        this.activateFromHash();
    },

    /**
     * Renderiza los tabs y su contenido
     */
    render() {
        // Generar navegación de tabs
        this.navContainer.innerHTML = this.plenos.map((pleno, index) => `
            <button
                class="tab-btn ${index === 0 ? 'active' : ''}"
                data-pleno-id="${pleno.id}"
                role="tab"
                aria-selected="${index === 0}"
                aria-controls="panel-${pleno.id}"
                id="tab-${pleno.id}"
            >
                <span class="tab-badge ${pleno.tipoInfo?.class || ''}">${this.getShortType(pleno.tipo)}</span>
                <span class="tab-fecha">${pleno.fechaCorta}</span>
            </button>
        `).join('');

        // Generar paneles de contenido con Vista Toggle
        this.container.innerHTML = this.plenos.map((pleno, index) => `
            <div
                class="tab-panel ${index === 0 ? 'active' : ''}"
                id="panel-${pleno.id}"
                role="tabpanel"
                aria-labelledby="tab-${pleno.id}"
                ${index !== 0 ? 'hidden' : ''}
            >
                <div class="pleno-header">
                    <div class="pleno-meta">
                        <span class="pleno-badge ${pleno.tipoInfo?.class || ''}">${pleno.tipo}</span>
                        <span class="pleno-fecha">${pleno.fechaFormateada}</span>
                        ${pleno.duracion ? `<span class="pleno-duracion"><span class="material-icons-round">schedule</span>${pleno.duracion}</span>` : ''}
                    </div>
                </div>

                <!-- Vista Toggle -->
                <div class="view-toggle-container">
                    <button class="view-toggle-btn active" data-view="dashboard">
                        <span class="material-icons-round">dashboard</span>
                        Vista Dashboard
                    </button>
                    <button class="view-toggle-btn" data-view="informe">
                        <span class="material-icons-round">article</span>
                        Vista Informe
                    </button>
                </div>

                <!-- Vista Dashboard -->
                <div class="tab-view tab-view-dashboard active">
                    <div class="pleno-content">
                        ${pleno.htmlContent}
                    </div>
                </div>

                <!-- Vista Informe (PDF del Acta Original) -->
                <div class="tab-view tab-view-informe">
                    <div class="pdf-viewer-container"></div>
                </div>

                ${this.renderCommentsSection(pleno)}
            </div>
        `).join('');

        // Añadir event listeners a los botones
        this.navContainer.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activate(btn.dataset.plenoId);
            });
        });
    },

    /**
     * Obtiene versión corta del tipo de pleno
     */
    getShortType(tipo) {
        const tipoLower = tipo.toLowerCase();
        if (tipoLower.includes('urgente') || tipoLower.includes('urgencia')) return 'URG';
        if (tipoLower.includes('extraordinari')) return 'EXT';
        return 'ORD';
    },

    /**
     * Renderiza la sección de comentarios (Isso)
     */
    renderCommentsSection(pleno) {
        if (!CONFIG.isso?.enabled) return '';

        return `
            <div class="comments-section">
                <div class="comments-header">
                    <h3 class="comments-title">
                        <span class="material-icons-round">forum</span>
                        Comentarios Ciudadanos
                    </h3>
                    <p class="comments-notice comments-notice--highlight">
                        Este espacio está pensado para el diálogo constructivo. Te invitamos a comentar con respeto, empatía y responsabilidad. Los comentarios serán moderados antes de publicarse.
                    </p>
                </div>
                <div id="comments-${pleno.id}" class="comments-container"></div>
            </div>
        `;
    },

    /**
     * Activa un tab específico
     */
    activate(plenoId) {
        if (this.currentTab === plenoId) return;

        // Desactivar tabs anteriores
        this.navContainer.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        this.container.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
            panel.setAttribute('hidden', '');
        });

        // Activar nuevo tab
        const tabBtn = this.navContainer.querySelector(`[data-pleno-id="${plenoId}"]`);
        const tabPanel = document.getElementById(`panel-${plenoId}`);

        if (tabBtn && tabPanel) {
            tabBtn.classList.add('active');
            tabBtn.setAttribute('aria-selected', 'true');
            tabPanel.classList.add('active');
            tabPanel.removeAttribute('hidden');

            // Actualizar URL sin recargar
            history.replaceState(null, '', `#${plenoId}`);

            // Scroll al inicio del contenido
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Cargar Isso para este pleno
            const pleno = this.plenos.find(p => p.id === plenoId);
            if (pleno && CONFIG.isso?.enabled) {
                IssoManager.load(plenoId, pleno.titulo);
            }

            this.currentTab = plenoId;
        }
    },

    /**
     * Activa el tab siguiente
     */
    activateNext() {
        const currentIndex = this.plenos.findIndex(p => p.id === this.currentTab);
        if (currentIndex < this.plenos.length - 1) {
            this.activate(this.plenos[currentIndex + 1].id);
        }
    },

    /**
     * Activa el tab anterior
     */
    activatePrev() {
        const currentIndex = this.plenos.findIndex(p => p.id === this.currentTab);
        if (currentIndex > 0) {
            this.activate(this.plenos[currentIndex - 1].id);
        }
    },

    /**
     * Configura navegación por teclado
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Solo si no estamos en un input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.activateNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.activatePrev();
            }
        });
    },

    /**
     * Configura navegación por hash
     */
    setupHashNavigation() {
        window.addEventListener('hashchange', () => {
            this.activateFromHash();
        });
    },

    /**
     * Activa tab basado en el hash de la URL
     */
    activateFromHash() {
        const hash = window.location.hash.slice(1);

        if (hash && this.plenos.find(p => p.id === hash)) {
            this.activate(hash);
        } else if (this.plenos.length > 0) {
            this.activate(this.plenos[0].id);
        }
    },

    /**
     * Obtiene el ID del tab activo
     */
    getCurrentTab() {
        return this.currentTab;
    }
};

