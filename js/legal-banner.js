/* ===========================================
   LEGAL-BANNER.JS - Banner de Aviso Legal
   Muestra al primer acceso, guarda aceptacion en localStorage
   =========================================== */

const LegalBanner = {
    STORAGE_KEY: 'plenos_legal_accepted',
    overlay: null,

    /**
     * Inicializa el banner de aviso legal
     */
    init() {
        // Verificar si ya acepto el aviso legal
        if (this.hasAccepted()) {
            return;
        }

        // Crear y mostrar el banner
        this.createBanner();
        this.show();
    },

    /**
     * Verifica si el usuario ya acepto el aviso legal
     */
    hasAccepted() {
        try {
            return localStorage.getItem(this.STORAGE_KEY) === 'true';
        } catch (e) {
            // Si localStorage no esta disponible, mostrar siempre
            return false;
        }
    },

    /**
     * Guarda la aceptacion en localStorage
     */
    saveAcceptance() {
        try {
            localStorage.setItem(this.STORAGE_KEY, 'true');
        } catch (e) {
            console.warn('No se pudo guardar la aceptacion del aviso legal');
        }
    },

    /**
     * Crea el HTML del banner
     */
    createBanner() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'legal-banner-overlay';
        this.overlay.innerHTML = `
            <div class="legal-banner-modal">
                <div class="legal-banner-header">
                    <span class="material-icons-round icon">gavel</span>
                    <h2>Aviso Legal</h2>
                </div>
                <div class="legal-banner-content">
                    <p><strong>Esta aplicacion tiene caracter experimental</strong> y se ofrece unicamente con fines informativos y de prueba.</p>
                    <p>Los datos mostrados pueden contener errores, estar incompletos o no estar actualizados, por lo que <strong>no deben considerarse en ningun caso como informacion veraz, oficial o definitiva</strong>.</p>
                    <p>El usuario es el unico responsable del uso que haga de la informacion y debe realizar sus propias comprobaciones y verificaciones antes de tomar cualquier decision.</p>
                    <p>El desarrollador no asume responsabilidad alguna por el uso, interpretacion o consecuencias derivadas del uso de esta aplicacion.</p>
                </div>
                <div class="legal-banner-footer">
                    <a href="aviso-legal.html" target="_blank" class="legal-banner-link">
                        <span class="material-icons-round">description</span>
                        Leer Aviso Legal completo
                    </a>
                    <button type="button" class="legal-banner-accept" id="acceptLegalBtn">
                        <span class="material-icons-round">check_circle</span>
                        He leido y acepto
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Event listener para el boton de aceptar
        const acceptBtn = document.getElementById('acceptLegalBtn');
        acceptBtn.addEventListener('click', () => this.accept());
    },

    /**
     * Muestra el banner
     */
    show() {
        // Forzar reflow para que la animacion funcione
        this.overlay.offsetHeight;
        this.overlay.classList.add('visible');

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
    },

    /**
     * Acepta el aviso legal y oculta el banner
     */
    accept() {
        this.saveAcceptance();
        this.hide();
    },

    /**
     * Oculta el banner
     */
    hide() {
        this.overlay.classList.remove('visible');
        document.body.style.overflow = '';

        // Eliminar del DOM despues de la animacion
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
        }, 300);
    },

    /**
     * Resetea la aceptacion (para testing)
     */
    reset() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('Aceptacion del aviso legal reseteada');
        } catch (e) {
            console.warn('No se pudo resetear la aceptacion');
        }
    }
};

// Inicializar cuando el DOM este listo
document.addEventListener('DOMContentLoaded', () => {
    LegalBanner.init();
});
