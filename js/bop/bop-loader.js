/**
 * BOP Loader - Cargador de datos BOP
 *
 * @module BopLoader
 * @description Gestiona la carga y cache de datos JSON del BOP
 * @version 1.0.0
 * @date 2026-01-17
 */

const BopLoader = {
    // =========================================================================
    // ESTADO INTERNO
    // =========================================================================

    /** @private Cache de datos cargados */
    _cache: null,

    /** @private Estado de carga */
    _loading: false,

    /** @private Promesa de carga en curso */
    _loadPromise: null,

    // =========================================================================
    // METODOS PUBLICOS
    // =========================================================================

    /**
     * Carga los datos del BOP desde JSON
     * @async
     * @returns {Promise<Object>} Datos del BOP procesados
     * @throws {Error} Si hay error en la carga
     */
    async load() {
        // Devolver cache si existe
        if (this._cache) {
            console.log('[BopLoader] Devolviendo datos desde cache');
            return this._cache;
        }

        // Si ya hay una carga en curso, esperar a que termine
        if (this._loadPromise) {
            console.log('[BopLoader] Esperando carga en curso...');
            return this._loadPromise;
        }

        // Iniciar nueva carga
        this._loadPromise = this._loadData();
        return this._loadPromise;
    },

    /**
     * Fuerza recarga de datos (ignora cache)
     * @async
     * @returns {Promise<Object>} Datos del BOP procesados
     */
    async reload() {
        console.log('[BopLoader] Forzando recarga...');
        this._cache = null;
        this._loadPromise = null;
        return this.load();
    },

    /**
     * Verifica si hay datos en cache
     * @returns {boolean} True si hay datos cacheados
     */
    hasCache() {
        return this._cache !== null;
    },

    /**
     * Limpia la cache
     */
    clearCache() {
        this._cache = null;
        this._loadPromise = null;
        console.log('[BopLoader] Cache limpiada');
    },

    /**
     * Obtiene todas las publicaciones combinadas y ordenadas
     * @async
     * @returns {Promise<Array>} Array de publicaciones ordenadas por fecha desc
     */
    async getPublicaciones() {
        const data = await this.load();
        return this._combineAndSortPublicaciones(data);
    },

    /**
     * Obtiene estadisticas de las publicaciones
     * @async
     * @returns {Promise<Object>} Estadisticas
     */
    async getEstadisticas() {
        const data = await this.load();
        return data.estadisticas || BopUtils.calculateStats(await this.getPublicaciones());
    },

    /**
     * Obtiene metadata de la busqueda
     * @async
     * @returns {Promise<Object>} Metadata
     */
    async getMetadata() {
        const data = await this.load();
        return data.metadata || {};
    },

    // =========================================================================
    // METODOS PRIVADOS
    // =========================================================================

    /**
     * Carga datos desde el archivo JSON
     * @private
     * @async
     * @returns {Promise<Object>} Datos crudos
     */
    async _loadData() {
        const path = BOP_CONFIG.paths.dataFile;
        console.log(`[BopLoader] Cargando datos desde: ${path}`);

        try {
            this._loading = true;

            const response = await fetch(path);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Validar estructura minima
            this._validateData(data);

            // Procesar y cachear
            this._cache = this._processData(data);
            console.log(`[BopLoader] Datos cargados: ${this._cache.totalPublicaciones} publicaciones`);

            return this._cache;

        } catch (error) {
            console.error('[BopLoader] Error cargando datos:', error);
            throw new Error(`${BOP_CONFIG.mensajes.error}: ${error.message}`);

        } finally {
            this._loading = false;
            this._loadPromise = null;
        }
    },

    /**
     * Valida la estructura de los datos
     * @private
     * @param {Object} data - Datos a validar
     * @throws {Error} Si la estructura es invalida
     */
    _validateData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Formato de datos invalido');
        }

        // Al menos debe tener publicaciones
        const hasPubs = (data.publicaciones_bop_interno && data.publicaciones_bop_interno.length > 0) ||
                        (data.publicaciones_firecrawl && data.publicaciones_firecrawl.length > 0);

        if (!hasPubs) {
            console.warn('[BopLoader] No se encontraron publicaciones en los datos');
        }
    },

    /**
     * Procesa los datos crudos
     * @private
     * @param {Object} rawData - Datos crudos del JSON
     * @returns {Object} Datos procesados
     */
    _processData(rawData) {
        const publicacionesBop = rawData.publicaciones_bop_interno || [];
        const publicacionesFirecrawl = rawData.publicaciones_firecrawl || [];

        // Normalizar y combinar publicaciones
        const allPublicaciones = [
            ...publicacionesBop.map(p => this._normalizePublicacion(p, 'bop')),
            ...publicacionesFirecrawl.map(p => this._normalizePublicacion(p, 'firecrawl'))
        ];

        return {
            metadata: rawData.metadata || {},
            publicaciones: BopUtils.sortByDate(allPublicaciones, 'desc'),
            totalPublicaciones: allPublicaciones.length,
            estadisticas: rawData.estadisticas || BopUtils.calculateStats(allPublicaciones),
            urlsReferencia: rawData.urls_referencia || {},
            notas: rawData.notas || []
        };
    },

    /**
     * Normaliza una publicacion a formato estandar
     * @private
     * @param {Object} pub - Publicacion cruda
     * @param {string} source - Fuente ('bop' o 'firecrawl')
     * @returns {Object} Publicacion normalizada
     */
    _normalizePublicacion(pub, source) {
        return {
            id: pub.id,
            fecha: pub.fecha_publicacion,
            boletin: pub.numero_boletin,
            anuncio: pub.numero_anuncio || null,
            titulo: pub.titulo,
            organismo: pub.organismo_emisor,
            categoria: pub.categoria_tematica,
            subcategoria: pub.subcategoria || null,
            enlace: pub.enlace_edicto || pub.enlace_pdf || null,
            importe: pub.importe || null,
            verificado: pub.verificado || false,
            fuente: source,
            // Campos originales para referencia
            _raw: pub
        };
    },

    /**
     * Combina y ordena todas las publicaciones
     * @private
     * @param {Object} data - Datos procesados
     * @returns {Array} Publicaciones ordenadas
     */
    _combineAndSortPublicaciones(data) {
        return data.publicaciones || [];
    }
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.BopLoader = BopLoader;
}
