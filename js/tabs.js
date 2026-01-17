/* ===========================================
   TABS.JS - Sistema de Navegación por Tabs
   =========================================== */

const TabsManager = {
    container: null,
    navContainer: null,
    currentTab: null,
    plenos: [],
    bopEnabled: false,

    /**
     * Inicializa el sistema de tabs
     */
    init(plenos) {
        this.plenos = plenos;
        this.bopEnabled = CONFIG.bop?.enabled || false;
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
        // Determinar si BOP es el primer tab activo
        const bopIsFirst = this.bopEnabled;

        // Generar navegación de tabs (BOP primero si está habilitado)
        let tabsNav = '';

        // Tab BOP primero
        if (this.bopEnabled) {
            tabsNav += this._renderBopTab(bopIsFirst);
        }

        // Tabs de plenos
        tabsNav += this.plenos.map((pleno, index) => `
            <button
                class="tab-btn ${!bopIsFirst && index === 0 ? 'active' : ''}"
                data-pleno-id="${pleno.id}"
                role="tab"
                aria-selected="${!bopIsFirst && index === 0}"
                aria-controls="panel-${pleno.id}"
                id="tab-${pleno.id}"
            >
                <span class="tab-badge ${pleno.tipoInfo?.class || ''}">${this.getShortType(pleno.tipo)}</span>
                <span class="tab-fecha">${pleno.fechaCorta}</span>
            </button>
        `).join('');

        this.navContainer.innerHTML = tabsNav;

        // Generar paneles de contenido (BOP primero si está habilitado)
        let panelsHtml = '';

        // Panel BOP primero
        if (this.bopEnabled) {
            panelsHtml += this._renderBopPanel(bopIsFirst);
        }

        // Paneles de plenos
        panelsHtml += this.plenos.map((pleno, index) => `
            <div
                class="tab-panel ${!bopIsFirst && index === 0 ? 'active' : ''}"
                id="panel-${pleno.id}"
                role="tabpanel"
                aria-labelledby="tab-${pleno.id}"
                ${bopIsFirst || index !== 0 ? 'hidden' : ''}
            >
                <div class="pleno-header">
                    <div class="pleno-meta">
                        <span class="pleno-badge ${pleno.tipoInfo?.class || ''}">${pleno.tipo}</span>
                        <span class="pleno-fecha">${pleno.fechaFormateada}</span>
                        ${pleno.duracion ? `<span class="pleno-duracion"><span class="material-icons-round">schedule</span>${pleno.duracion}</span>` : ''}
                    </div>
                </div>

                <!-- Vista Toggle: Economico / Politico / Debate / Acta PDF -->
                <div class="view-toggle-container">
                    <button class="view-toggle-btn active" data-view="dashboard">
                        <span class="material-icons-round">payments</span>
                        <span class="btn-text">Económico</span>
                    </button>
                    <button class="view-toggle-btn" data-view="political">
                        <span class="material-icons-round">how_to_vote</span>
                        <span class="btn-text">Político</span>
                    </button>
                    <button class="view-toggle-btn" data-view="debate">
                        <span class="material-icons-round">forum</span>
                        <span class="btn-text">Debate</span>
                    </button>
                    <button class="view-toggle-btn" data-view="informe">
                        <span class="material-icons-round">picture_as_pdf</span>
                        <span class="btn-text">Acta PDF</span>
                    </button>
                </div>

                <!-- Vista Dashboard Economico -->
                <div class="tab-view tab-view-dashboard active">
                    <div class="pleno-content">
                        ${pleno.htmlContent}
                    </div>
                </div>

                <!-- Vista Dashboard Politico -->
                <div class="tab-view tab-view-political">
                    <div class="pleno-content political-content">
                        ${pleno.politicalHtmlContent || '<div class="no-political-data"><span class="material-icons-round">info</span><p>No hay informe político disponible para este pleno</p></div>'}
                    </div>
                </div>

                <!-- Vista Debate (Preguntas de Control) -->
                <div class="tab-view tab-view-debate">
                    <div class="pleno-content debate-content">
                        ${pleno.debateHtmlContent || '<div class="no-debate-data"><span class="material-icons-round">info</span><p>No hay informe de debate disponible para este pleno</p></div>'}
                    </div>
                </div>

                <!-- Vista Informe (PDF del Acta Original) -->
                <div class="tab-view tab-view-informe">
                    <div class="pdf-viewer-container"></div>
                </div>

                ${this.renderCommentsSection(pleno)}
            </div>
        `).join('');

        this.container.innerHTML = panelsHtml;

        // Añadir event listeners a los botones
        this.navContainer.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activate(btn.dataset.plenoId);
            });
        });
    },

    // =========================================================================
    // METODOS BOP
    // =========================================================================

    /**
     * Renderiza el botón de navegación BOP
     * @private
     */
    _renderBopTab(isActive) {
        const bop = CONFIG.bop;
        return `
            <button
                class="tab-btn ${isActive ? 'active' : ''}"
                data-pleno-id="bop"
                role="tab"
                aria-selected="${isActive}"
                aria-controls="panel-bop"
                id="tab-bop"
            >
                <span class="tab-badge bop">${bop.titulo}</span>
                <span class="tab-fecha">${bop.fechaCorta}</span>
            </button>
        `;
    },

    /**
     * Renderiza el panel de contenido BOP
     * @private
     */
    _renderBopPanel(isActive) {
        const bop = CONFIG.bop;
        return `
            <div
                class="tab-panel ${isActive ? 'active' : ''}"
                id="panel-bop"
                role="tabpanel"
                aria-labelledby="tab-bop"
                ${!isActive ? 'hidden' : ''}
            >
                <div class="pleno-header">
                    <div class="pleno-meta">
                        <span class="pleno-badge bop">Boletín Oficial</span>
                        <span class="pleno-fecha">${bop.fechaFormateada}</span>
                    </div>
                </div>

                <!-- Vista Toggle BOP: Resultado / Debate -->
                <div class="view-toggle-container">
                    <button class="view-toggle-btn active" data-view="bop-resultado">
                        <span class="material-icons-round">article</span>
                        <span class="btn-text">Resultado</span>
                    </button>
                    <button class="view-toggle-btn" data-view="bop-debate">
                        <span class="material-icons-round">forum</span>
                        <span class="btn-text">Debate</span>
                    </button>
                </div>

                <!-- Vista BOP Resultado -->
                <div class="tab-view tab-view-bop-resultado active">
                    <div class="bop-dashboard-container">
                        <div class="bop-loading">
                            <div class="bop-loading-spinner"></div>
                            <p>Cargando datos del BOP...</p>
                        </div>
                    </div>
                </div>

                <!-- Vista BOP Debate -->
                <div class="tab-view tab-view-bop-debate">
                    <div class="bop-debate-container">
                        <div class="bop-loading">
                            <div class="bop-loading-spinner"></div>
                            <p>Cargando analisis cruzado BOP-Plenos...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
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
                        Comentarios Ciudadanos (refresca la ventana para activar)
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

            // Manejar carga especifica del tab
            if (plenoId === 'bop') {
                // Cargar dashboard BOP si es primera vez
                this._loadBopDashboard(tabPanel);
            } else {
                // Cargar Isso para plenos normales
                const pleno = this.plenos.find(p => p.id === plenoId);
                if (pleno && CONFIG.isso?.enabled) {
                    IssoManager.load(plenoId, pleno.titulo);
                }
            }

            this.currentTab = plenoId;
        }
    },

    /**
     * Carga el dashboard BOP si está disponible
     * @private
     */
    _loadBopDashboard(tabPanel) {
        // Solo cargar si BopDashboard está disponible y no se ha cargado
        if (typeof BopDashboard !== 'undefined' && !BopDashboard.isRendered()) {
            const container = tabPanel.querySelector('.bop-dashboard-container');
            if (container) {
                BopDashboard.render(container);
            }
        }
    },

    /**
     * Obtiene lista de todos los IDs de tabs (incluyendo BOP)
     * @private
     */
    _getAllTabIds() {
        const ids = [];
        if (this.bopEnabled) {
            ids.push('bop');
        }
        ids.push(...this.plenos.map(p => p.id));
        return ids;
    },

    /**
     * Activa el tab siguiente
     */
    activateNext() {
        const allIds = this._getAllTabIds();
        const currentIndex = allIds.indexOf(this.currentTab);
        if (currentIndex < allIds.length - 1) {
            this.activate(allIds[currentIndex + 1]);
        }
    },

    /**
     * Activa el tab anterior
     */
    activatePrev() {
        const allIds = this._getAllTabIds();
        const currentIndex = allIds.indexOf(this.currentTab);
        if (currentIndex > 0) {
            this.activate(allIds[currentIndex - 1]);
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
        const allIds = this._getAllTabIds();

        if (hash && allIds.includes(hash)) {
            this.activate(hash);
        } else if (allIds.length > 0) {
            // Activar primer tab (BOP si está habilitado)
            this.activate(allIds[0]);
        }
    },

    /**
     * Obtiene el ID del tab activo
     */
    getCurrentTab() {
        return this.currentTab;
    }
};

