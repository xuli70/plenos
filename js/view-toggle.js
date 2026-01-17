/* ===========================================
   VIEW-TOGGLE.JS - Controlador Vista Toggle
   Alterna entre Vista Economico, Politico, Debate y Acta PDF
   =========================================== */

const ViewToggleController = {
    _renderedTabs: new Set(),

    // Tipos de vista disponibles
    VIEW_TYPES: ['dashboard', 'political', 'debate', 'informe'],

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
     * Cambia entre las 4 vistas: dashboard (economico), political, debate, informe (PDF)
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

        // Lazy loading solo para PDF (informe)
        if (viewType === 'informe') {
            this._renderInforme(tabPanel);
        }
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
