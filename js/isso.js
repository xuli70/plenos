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
        // CRÍTICO: Crear el elemento #isso-thread ANTES de cargar el script
        // El script embed.min.js busca #isso-thread al auto-ejecutarse
        if (this.currentIdentifier) {
            this.createThreadElement(this.currentIdentifier);
        }

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
            // El elemento ya existe, Isso se inicializó automáticamente
            // Personalizar el formulario después de que cargue
            this.customizeForm();
        };

        script.onerror = () => {
            console.error('Error cargando Isso');
            this.showError();
        };

        document.head.appendChild(script);
    },

    /**
     * Crea el elemento #isso-thread en el contenedor
     */
    createThreadElement(plenoId) {
        const container = document.getElementById(`comments-${plenoId}`);
        if (!container) return;

        // Limpiar contenedor
        container.innerHTML = '';

        // Crear elemento section para Isso
        const section = document.createElement('section');
        section.id = 'isso-thread';
        section.setAttribute('data-isso-id', `/pleno/${plenoId}/`);
        container.appendChild(section);
    },

    /**
     * Renderiza el thread de comentarios (para cambio de tabs)
     * IMPORTANTE: Usa Isso.init() porque createThreadElement() elimina el #isso-thread anterior
     * Docs: https://isso-comments.de/docs/guides/advanced-integration/
     */
    renderThread(plenoId, plenoTitle) {
        // Crear/actualizar el elemento (elimina el anterior)
        this.createThreadElement(plenoId);

        // Reinicializar Isso para el nuevo thread
        if (window.Isso) {
            // Esperar un tick para que el DOM se actualice
            setTimeout(() => {
                // init() es necesario cuando se elimina y recrea #isso-thread
                // fetchComments() solo funciona si el elemento NO fue eliminado
                window.Isso.init();
                // Personalizar el formulario después de reinicializar
                this.customizeForm();
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
    },

    /**
     * Personaliza el formulario de Isso añadiendo campos de apellidos
     */
    customizeForm() {
        // MutationObserver para detectar cuando Isso renderiza el formulario
        const observer = new MutationObserver((mutations, obs) => {
            const nameInput = document.querySelector('.isso-postbox input[name="author"]');
            if (nameInput && !document.getElementById('isso-primer-apellido')) {
                this.injectApellidoFields(nameInput);
                this.interceptSubmit();
                obs.disconnect();
            }
        });

        // Observar cambios en el DOM
        const container = document.getElementById(`comments-${this.currentIdentifier}`);
        if (container) {
            observer.observe(container, { childList: true, subtree: true });
        }

        // También intentar inmediatamente por si ya existe
        setTimeout(() => {
            const nameInput = document.querySelector('.isso-postbox input[name="author"]');
            if (nameInput && !document.getElementById('isso-primer-apellido')) {
                this.injectApellidoFields(nameInput);
                this.interceptSubmit();
                observer.disconnect();
            }
        }, 500);
    },

    /**
     * Inyecta los campos de apellidos después del campo nombre
     */
    injectApellidoFields(nameInput) {
        const wrapper = nameInput.closest('.isso-input-wrapper') || nameInput.parentElement;
        if (!wrapper) return;

        // Cambiar placeholder del nombre
        nameInput.placeholder = 'Nombre (obligatorio)';

        // Crear contenedores para apellidos
        const apellido1Wrapper = document.createElement('div');
        apellido1Wrapper.className = 'isso-input-wrapper isso-apellidos-wrapper';
        apellido1Wrapper.innerHTML = `
            <input type="text" id="isso-primer-apellido" name="primer_apellido"
                   placeholder="Primer Apellido (obligatorio)" required>
        `;

        const apellido2Wrapper = document.createElement('div');
        apellido2Wrapper.className = 'isso-input-wrapper isso-apellidos-wrapper';
        apellido2Wrapper.innerHTML = `
            <input type="text" id="isso-segundo-apellido" name="segundo_apellido"
                   placeholder="Segundo Apellido (obligatorio)" required>
        `;

        // Insertar después del wrapper del nombre
        wrapper.insertAdjacentElement('afterend', apellido2Wrapper);
        wrapper.insertAdjacentElement('afterend', apellido1Wrapper);
    },

    /**
     * Intercepta el envío del formulario para combinar nombre y apellidos
     */
    interceptSubmit() {
        const postbox = document.querySelector('.isso-postbox');
        if (!postbox) return;

        // Buscar el botón de submit
        const submitBtn = postbox.querySelector('input[type="submit"]');
        if (!submitBtn) return;

        // Interceptar click en el botón
        submitBtn.addEventListener('click', (e) => {
            const nombre = document.querySelector('.isso-postbox input[name="author"]');
            const apellido1 = document.getElementById('isso-primer-apellido');
            const apellido2 = document.getElementById('isso-segundo-apellido');

            if (!nombre || !apellido1 || !apellido2) return;

            // Validar que todos los campos están completos
            const nombreVal = nombre.value.trim();
            const apellido1Val = apellido1.value.trim();
            const apellido2Val = apellido2.value.trim();

            if (!nombreVal) {
                e.preventDefault();
                e.stopPropagation();
                nombre.focus();
                alert('El campo Nombre es obligatorio');
                return false;
            }

            if (!apellido1Val) {
                e.preventDefault();
                e.stopPropagation();
                apellido1.focus();
                alert('El campo Primer Apellido es obligatorio');
                return false;
            }

            if (!apellido2Val) {
                e.preventDefault();
                e.stopPropagation();
                apellido2.focus();
                alert('El campo Segundo Apellido es obligatorio');
                return false;
            }

            // Combinar nombre completo: "Nombre PrimerApellido SegundoApellido"
            nombre.value = `${nombreVal} ${apellido1Val} ${apellido2Val}`;

            // Limpiar campos de apellidos para la próxima vez
            setTimeout(() => {
                apellido1.value = '';
                apellido2.value = '';
            }, 100);

        }, true); // Usar capture para interceptar antes que Isso
    }
};
