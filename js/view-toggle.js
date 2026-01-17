/* ===========================================
   VIEW-TOGGLE.JS - Controlador Vista Toggle
   Alterna entre Vista Economico, Politico, Debate y Acta PDF
   Incluye soporte para vistas BOP (Resultado / Debate)
   =========================================== */

const ViewToggleController = {
    _renderedTabs: new Set(),
    _bopRendered: false,
    _bopDebateRendered: false,

    // Tipos de vista disponibles (incluyendo BOP)
    VIEW_TYPES: ['dashboard', 'political', 'debate', 'informe', 'bop-resultado', 'bop-debate'],

    /**
     * Inicializa el controlador de Vista Toggle
     */
    init() {
        document.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this._handleToggle(e));
        });
    },

    /**
     * Maneja el click en un boton de toggle
     */
    _handleToggle(event) {
        const btn = event.currentTarget;
        const tabPanel = btn.closest('.tab-panel');
        const viewType = btn.getAttribute('data-view');

        this._updateActiveButton(tabPanel, btn);
        this._switchView(tabPanel, viewType);
    },

    /**
     * Actualiza el estado activo de los botones
     */
    _updateActiveButton(tabPanel, activeBtn) {
        tabPanel.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    },

    /**
     * Cambia entre vistas: dashboard, political, debate, informe (PDF), bop-resultado, bop-debate
     */
    _switchView(tabPanel, viewType) {
        // Ocultar todas las vistas
        this.VIEW_TYPES.forEach(type => {
            const view = tabPanel.querySelector(`.tab-view-${type}`);
            if (view) {
                view.classList.remove('active');
            }
        });

        // Mostrar la vista seleccionada
        const selectedView = tabPanel.querySelector(`.tab-view-${viewType}`);
        if (selectedView) {
            selectedView.classList.add('active');
        }

        // Lazy loading segun tipo de vista
        if (viewType === 'informe') {
            this._renderInforme(tabPanel);
        } else if (viewType === 'bop-resultado') {
            this._renderBopDashboard(tabPanel);
        } else if (viewType === 'bop-debate') {
            this._renderBopDebate(tabPanel);
        }
    },

    /**
     * Renderiza el dashboard BOP
     * @private
     */
    _renderBopDashboard(tabPanel) {
        // Evitar renderizado multiple
        if (this._bopRendered) return;

        // Verificar que BopDashboard existe
        if (typeof BopDashboard === 'undefined') {
            console.warn('[ViewToggle] BopDashboard no disponible');
            return;
        }

        const container = tabPanel.querySelector('.bop-dashboard-container');
        if (!container) {
            console.warn('[ViewToggle] No se encontro .bop-dashboard-container');
            return;
        }

        // Solo renderizar si no se ha hecho
        if (!BopDashboard.isRendered()) {
            BopDashboard.render(container);
        }

        this._bopRendered = true;
    },

    /**
     * Renderiza el debate BOP (analisis cruzado BOP vs Plenos)
     * @private
     */
    _renderBopDebate(tabPanel) {
        // Evitar renderizado multiple
        if (this._bopDebateRendered) return;

        // Verificar que BopDebate existe
        if (typeof BopDebate === 'undefined') {
            console.warn('[ViewToggle] BopDebate no disponible');
            return;
        }

        const container = tabPanel.querySelector('.bop-debate-container');
        if (!container) {
            console.warn('[ViewToggle] No se encontro .bop-debate-container');
            return;
        }

        // Solo renderizar si no se ha hecho
        if (!BopDebate.isRendered()) {
            BopDebate.render(container);
        }

        this._bopDebateRendered = true;
    },

    /**
     * Renderiza el visor de PDF del acta original
     */
    _renderInforme(tabPanel) {
        const tabId = tabPanel.id.replace('panel-', '');
        if (this._renderedTabs.has(tabId)) return;

        // Buscar el pleno en DataLoader
        const pleno = DataLoader.plenos.find(p => p.id === tabId);
        if (!pleno || !pleno.pdfFile) {
            console.warn(`No se encontro PDF para pleno: ${tabId}`);
            this._renderPdfError(tabPanel, 'No se encontro el archivo PDF para este pleno.');
            return;
        }

        const container = tabPanel.querySelector('.pdf-viewer-container');
        if (!container) {
            console.warn(`No se encontro contenedor .pdf-viewer-container para pleno: ${tabId}`);
            return;
        }

        // Construir URL del PDF
        const pdfUrl = `${CONFIG.paths.pdfActas}${pleno.pdfFile}`;

        // Crear visor de PDF con barra de herramientas
        container.innerHTML = `
            <div class="pdf-toolbar">
                <div class="pdf-toolbar-title">
                    <span class="material-icons-round">picture_as_pdf</span>
                    <span>Acta Original del Pleno</span>
                </div>
                <div class="pdf-toolbar-actions">
                    <a href="${pdfUrl}" target="_blank" class="pdf-btn pdf-btn-open">
                        <span class="material-icons-round">open_in_new</span>
                        <span class="pdf-btn-text">Abrir en nueva pestaña</span>
                    </a>
                    <a href="${pdfUrl}" download="${pleno.pdfFile}" class="pdf-btn pdf-btn-download">
                        <span class="material-icons-round">download</span>
                        <span class="pdf-btn-text">Descargar PDF</span>
                    </a>
                </div>
            </div>
            <iframe
                src="${pdfUrl}"
                class="pdf-iframe"
                title="Acta del Pleno ${pleno.fechaFormateada}"
                loading="lazy"
            ></iframe>
        `;

        this._renderedTabs.add(tabId);
    },

    /**
     * Muestra un mensaje de error cuando no se encuentra el PDF
     */
    _renderPdfError(tabPanel, message) {
        const container = tabPanel.querySelector('.pdf-viewer-container');
        if (!container) return;

        container.innerHTML = `
            <div class="pdf-error">
                <span class="material-icons-round">error_outline</span>
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Resetea el estado de renderizado (para pruebas)
     */
    reset() {
        this._renderedTabs.clear();
    }
};
