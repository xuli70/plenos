/* ===========================================
   MAIN.JS - Inicialización de la Aplicación
   =========================================== */

const App = {
    /**
     * Inicializa la aplicación
     */
    async init() {
        console.log('Iniciando aplicación Plenos La Zarza...');

        // Verificar autenticación
        if (!Auth.requireAuth()) {
            return;
        }

        // Configurar botón de logout
        this.setupLogout();

        // Mostrar estado de carga
        this.showLoading();

        try {
            // Cargar datos de plenos
            const plenos = await DataLoader.loadAll();

            if (plenos.length === 0) {
                this.showError('No se encontraron plenos para mostrar.');
                return;
            }

            // Actualizar contador en header
            this.updatePlenosCount(plenos.length);

            // Inicializar sistema de tabs
            TabsManager.init(plenos);

            // Inicializar Vista Toggle
            ViewToggleController.init();

            // Mostrar contenido
            this.showContent();

            console.log(`Aplicación iniciada: ${plenos.length} plenos cargados`);

        } catch (error) {
            console.error('Error iniciando aplicación:', error);
            this.showError('Error al cargar los plenos. Por favor, recarga la página.');
        }
    },

    /**
     * Configura el botón de logout
     */
    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('¿Deseas cerrar sesión?')) {
                    Auth.logout();
                }
            });
        }
    },

    /**
     * Muestra el estado de carga
     */
    showLoading() {
        const loading = document.getElementById('loadingState');
        const error = document.getElementById('errorState');
        const tabs = document.getElementById('tabsContainer');

        if (loading) loading.classList.remove('hidden');
        if (error) error.classList.add('hidden');
        if (tabs) tabs.classList.add('hidden');
    },

    /**
     * Muestra el contenido
     */
    showContent() {
        const loading = document.getElementById('loadingState');
        const error = document.getElementById('errorState');
        const tabs = document.getElementById('tabsContainer');

        if (loading) loading.classList.add('hidden');
        if (error) error.classList.add('hidden');
        if (tabs) tabs.classList.remove('hidden');
    },

    /**
     * Muestra un error
     */
    showError(message) {
        const loading = document.getElementById('loadingState');
        const error = document.getElementById('errorState');
        const errorMsg = document.getElementById('errorMessage');
        const tabs = document.getElementById('tabsContainer');

        if (loading) loading.classList.add('hidden');
        if (tabs) tabs.classList.add('hidden');
        if (error) error.classList.remove('hidden');
        if (errorMsg) errorMsg.textContent = message;
    },

    /**
     * Actualiza el contador de plenos en el header
     */
    updatePlenosCount(count) {
        const counter = document.getElementById('totalPlenos');
        if (counter) {
            counter.textContent = count;
        }
    }
};

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
