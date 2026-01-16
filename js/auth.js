/* ===========================================
   AUTH.JS - Sistema de Autenticación
   =========================================== */

const Auth = {
    /**
     * Genera hash SHA-256 de un texto
     */
    async sha256(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    /**
     * Verifica si la contraseña es correcta
     */
    async verify(password) {
        const hash = await this.sha256(password);
        return hash === CONFIG.passwordHash;
    },

    /**
     * Guarda la sesión en sessionStorage
     * Incluye el hash del password para invalidar sesiones si cambia
     */
    setSession() {
        const sessionData = {
            timestamp: Date.now(),
            expires: Date.now() + CONFIG.session.duration,
            passwordHash: CONFIG.passwordHash  // Vincula sesión al password actual
        };
        sessionStorage.setItem(CONFIG.session.key, JSON.stringify(sessionData));
    },

    /**
     * Elimina la sesión
     */
    clearSession() {
        sessionStorage.removeItem(CONFIG.session.key);
    },

    /**
     * Comprueba si hay una sesión válida
     * Verifica tanto la expiración como que el hash del password no haya cambiado
     */
    isAuthenticated() {
        try {
            const sessionData = sessionStorage.getItem(CONFIG.session.key);
            if (!sessionData) return false;

            const { expires, passwordHash } = JSON.parse(sessionData);

            // Verificar si expiró
            if (Date.now() > expires) {
                this.clearSession();
                return false;
            }

            // Verificar si el password cambió o si es una sesión antigua sin passwordHash
            // - !passwordHash: sesiones creadas antes del fix (no tienen hash guardado)
            // - passwordHash !== CONFIG.passwordHash: el password fue cambiado en Coolify
            if (!passwordHash || passwordHash !== CONFIG.passwordHash) {
                console.log('Sesión invalidada: ' + (!passwordHash ? 'sesión antigua sin hash' : 'password actualizado'));
                this.clearSession();
                return false;
            }

            return true;
        } catch (e) {
            this.clearSession();
            return false;
        }
    },

    /**
     * Redirige a la página principal si está autenticado
     */
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = 'index.html';
        }
    },

    /**
     * Redirige al login si no está autenticado
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    /**
     * Cierra sesión
     */
    logout() {
        this.clearSession();
        window.location.href = 'login.html';
    }
};

// ===========================================
// Lógica de la página de Login
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    // Solo ejecutar en la página de login
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // Redirigir si ya está autenticado
    Auth.redirectIfAuthenticated();

    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Toggle visibilidad de contraseña
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        // Cambiar icono
        const iconShow = togglePassword.querySelector('.icon-show');
        const iconHide = togglePassword.querySelector('.icon-hide');
        iconShow.classList.toggle('hidden');
        iconHide.classList.toggle('hidden');
    });

    // Ocultar error al escribir
    passwordInput.addEventListener('input', () => {
        errorMessage.classList.add('hidden');
    });

    // Envío del formulario
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = passwordInput.value.trim();
        if (!password) return;

        // Mostrar loading
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        errorMessage.classList.add('hidden');

        try {
            // Pequeño delay para UX
            await new Promise(resolve => setTimeout(resolve, 500));

            const isValid = await Auth.verify(password);

            if (isValid) {
                Auth.setSession();
                window.location.href = 'index.html';
            } else {
                errorMessage.classList.remove('hidden');
                passwordInput.focus();
                passwordInput.select();
            }
        } catch (error) {
            console.error('Error de autenticación:', error);
            errorMessage.querySelector('span').textContent = 'Error de conexión';
            errorMessage.classList.remove('hidden');
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    });

    // Focus inicial
    passwordInput.focus();
});
