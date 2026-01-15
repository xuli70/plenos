/* ===========================================
   VIEW-TOGGLE.JS - Controlador Vista Toggle
   Alterna entre Vista Dashboard y Vista Informe
   =========================================== */

const ViewToggleController = {
    _renderedTabs: new Set(),

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
     * Cambia entre vistas Dashboard e Informe
     */
    _switchView(tabPanel, viewType) {
        const dashboardView = tabPanel.querySelector('.tab-view-dashboard');
        const informeView = tabPanel.querySelector('.tab-view-informe');

        if (viewType === 'dashboard') {
            dashboardView.classList.add('active');
            informeView.classList.remove('active');
        } else {
            dashboardView.classList.remove('active');
            informeView.classList.add('active');
            this._renderInforme(tabPanel);
        }
    },

    /**
     * Renderiza el contenido Markdown del informe
     */
    _renderInforme(tabPanel) {
        const tabId = tabPanel.id.replace('panel-', '');
        if (this._renderedTabs.has(tabId)) return;

        // Buscar el pleno en DataLoader
        const pleno = DataLoader.plenos.find(p => p.id === tabId);
        if (!pleno || !pleno.content) {
            console.warn(`No se encontro markdown para pleno: ${tabId}`);
            return;
        }

        const container = tabPanel.querySelector('.md-content');
        if (!container) {
            console.warn(`No se encontro contenedor .md-content para pleno: ${tabId}`);
            return;
        }

        // Renderizar markdown
        container.innerHTML = MarkdownParser.parse(pleno.content);
        this._renderedTabs.add(tabId);
    },

    /**
     * Resetea el estado de renderizado (para pruebas)
     */
    reset() {
        this._renderedTabs.clear();
    }
};
