/**
 * BOP Debate - Renderizado de la vista Debate del BOP
 *
 * @module BopDebate
 * @description Renderiza el analisis cruzado BOP vs Plenos con contenido hibrido
 * @version 1.0.0
 * @date 2026-01-17
 */

const BopDebate = {
    // =========================================================================
    // ESTADO INTERNO
    // =========================================================================

    /** @private Indica si el debate ya fue renderizado */
    _rendered: false,

    /** @private Contenedor del debate */
    _container: null,

    /** @private Contenido Markdown cargado */
    _markdownContent: null,

    /** @private Datos del BOP */
    _bopData: null,

    // =========================================================================
    // METODOS PUBLICOS
    // =========================================================================

    /**
     * Renderiza el contenido de debate
     * @async
     * @param {HTMLElement} container - Contenedor donde renderizar
     * @returns {Promise<void>}
     */
    async render(container) {
        if (!container) {
            console.error('[BopDebate] Contenedor no proporcionado');
            return;
        }

        this._container = container;
        this._showLoading();

        try {
            // 1. Cargar datos BOP (reutiliza BopLoader)
            this._bopData = await BopLoader.load();

            // 2. Cargar contenido Markdown
            this._markdownContent = await this._loadMarkdown();

            // 3. Calcular estadisticas dinamicas
            const stats = this._calculateCrossStats();

            // 4. Renderizar contenido hibrido
            const html = this._renderHybridContent(stats);
            container.innerHTML = html;

            this._rendered = true;
            console.log('[BopDebate] Debate renderizado correctamente');

        } catch (error) {
            console.error('[BopDebate] Error:', error);
            this._showError(error.message);
        }
    },

    /**
     * Verifica si el debate ya fue renderizado
     * @returns {boolean}
     */
    isRendered() {
        return this._rendered;
    },

    /**
     * Fuerza re-renderizado del debate
     * @async
     */
    async refresh() {
        if (!this._container) return;
        this._rendered = false;
        this._markdownContent = null;
        await this.render(this._container);
    },

    // =========================================================================
    // CARGA DE DATOS
    // =========================================================================

    /**
     * Carga el archivo Markdown del debate
     * @private
     * @async
     * @returns {Promise<string>}
     */
    async _loadMarkdown() {
        const path = BOP_CONFIG.views.debate.dataFile;
        if (!path) {
            throw new Error('Ruta del archivo de debate no configurada');
        }

        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`No se pudo cargar el informe de debate (${response.status})`);
        }

        return await response.text();
    },

    // =========================================================================
    // CALCULO DE ESTADISTICAS
    // =========================================================================

    /**
     * Calcula estadisticas cruzadas BOP vs Plenos
     * @private
     * @returns {Object}
     */
    _calculateCrossStats() {
        const publicaciones = this._bopData.publicaciones || [];
        const debateConfig = BOP_CONFIG.debate || {};
        const plenos = debateConfig.plenos || [];
        const categoriasConPleno = debateConfig.categoriasConPleno || ['Hacienda', 'Seguridad', 'Patrimonio'];
        const categoriasTramite = debateConfig.categoriasTramite || ['Empleo', 'Urbanismo'];

        const stats = {
            totalPublicaciones: publicaciones.length,
            totalPlenos: plenos.length,
            conSeguimiento: 0,
            sinSeguimiento: 0,
            noRequiere: 0,
            porCategoria: {},
            porMes: this._bopData.estadisticas?.publicaciones_por_mes || {}
        };

        publicaciones.forEach(pub => {
            const cat = pub.categoria || 'Otros';

            if (!stats.porCategoria[cat]) {
                stats.porCategoria[cat] = { total: 0, trazados: 0, sinSeguimiento: 0, noRequiere: 0 };
            }
            stats.porCategoria[cat].total++;

            // Determinar estado de trazabilidad
            const estado = this._checkTrazabilidad(pub, plenos, categoriasConPleno, categoriasTramite);

            switch (estado) {
                case 'TRAZADO':
                    stats.conSeguimiento++;
                    stats.porCategoria[cat].trazados++;
                    break;
                case 'SIN_SEGUIMIENTO':
                    stats.sinSeguimiento++;
                    stats.porCategoria[cat].sinSeguimiento++;
                    break;
                case 'NO_REQUIERE':
                    stats.noRequiere++;
                    stats.porCategoria[cat].noRequiere++;
                    break;
            }
        });

        // Calcular porcentaje de trazabilidad (excluyendo las que no requieren)
        const requierenPleno = stats.totalPublicaciones - stats.noRequiere;
        stats.porcentajeTrazabilidad = requierenPleno > 0
            ? ((stats.conSeguimiento / requierenPleno) * 100).toFixed(0)
            : 100;

        stats.deficitTrazabilidad = requierenPleno > 0
            ? ((stats.sinSeguimiento / requierenPleno) * 100).toFixed(0)
            : 0;

        return stats;
    },

    /**
     * Verifica trazabilidad de una publicacion con plenos
     * @private
     * @param {Object} publicacion
     * @param {Array} plenos
     * @param {Array} categoriasConPleno
     * @param {Array} categoriasTramite
     * @returns {string} Estado: TRAZADO, SIN_SEGUIMIENTO, NO_REQUIERE
     */
    _checkTrazabilidad(publicacion, plenos, categoriasConPleno, categoriasTramite) {
        const cat = publicacion.categoria || '';

        // Categorias que no requieren aprobacion en pleno
        if (categoriasTramite.includes(cat)) {
            return 'NO_REQUIERE';
        }

        // Subvenciones recibidas (Diputacion) no requieren pleno municipal
        if (cat === 'Subvenciones' && publicacion.organismo &&
            publicacion.organismo.toLowerCase().includes('diputacion')) {
            // Aunque no requiere pleno, deberia informarse
            // Lo contamos como sin seguimiento si no hay mencion
            return 'SIN_SEGUIMIENTO';
        }

        // Categorias que deberian tener pleno
        if (categoriasConPleno.includes(cat)) {
            const fechaPub = new Date(publicacion.fecha);
            const margenDias = BOP_CONFIG.debate?.trazabilidad?.margenDias || 30;

            // Buscar pleno cercano
            const tieneFollowUp = plenos.some(pleno => {
                const fechaPleno = new Date(pleno.fecha);
                const diffDias = (fechaPub - fechaPleno) / (1000 * 60 * 60 * 24);
                // La publicacion debe ser posterior al pleno (aprobacion inicial)
                // o cercana (exposicion publica)
                return Math.abs(diffDias) <= margenDias;
            });

            // Casos especiales de trazabilidad conocida
            const titulo = (publicacion.titulo || '').toLowerCase();
            if (titulo.includes('presupuesto') ||
                titulo.includes('cuenta general') ||
                titulo.includes('suplemento de credito') ||
                titulo.includes('ordenanza') ||
                titulo.includes('reglamento')) {
                // Estos tramites importantes suelen estar trazados
                return tieneFollowUp ? 'TRAZADO' : 'SIN_SEGUIMIENTO';
            }

            // Patrimonio (enajenaciones) - verificar especificamente
            if (cat === 'Patrimonio') {
                // Las subastas de bienes deberian debatirse pero no siempre se hace
                return 'SIN_SEGUIMIENTO';
            }

            return tieneFollowUp ? 'TRAZADO' : 'SIN_SEGUIMIENTO';
        }

        // Igualdad - verificar si es Plan de Igualdad
        if (cat === 'Igualdad') {
            return 'TRAZADO'; // El Plan de Igualdad si fue a pleno
        }

        // Administracion electronica - depende del tipo
        if (cat === 'Administracion electronica') {
            return 'TRAZADO'; // Sede electronica fue a pleno
        }

        return 'NO_REQUIERE';
    },

    // =========================================================================
    // RENDERIZADO
    // =========================================================================

    /**
     * Renderiza contenido hibrido (Markdown + stats dinamicas)
     * @private
     * @param {Object} stats
     * @returns {string} HTML
     */
    _renderHybridContent(stats) {
        // Convertir Markdown a HTML
        let htmlContent = this._parseMarkdown(this._markdownContent);

        return `
            <div class="bop-debate-wrapper">
                ${this._renderStatsHeader(stats)}
                <div class="bop-debate-content markdown-content">
                    ${htmlContent}
                </div>
            </div>
        `;
    },

    /**
     * Renderiza cabecera con estadisticas dinamicas
     * @private
     * @param {Object} stats
     * @returns {string} HTML
     */
    _renderStatsHeader(stats) {
        const debateConfig = BOP_CONFIG.debate || {};

        return `
            <div class="bop-debate-header">
                <div class="bop-debate-title-row">
                    <span class="material-icons-round">compare_arrows</span>
                    <h2>Analisis Cruzado BOP vs Plenos</h2>
                </div>
                <div class="bop-debate-stats-grid">
                    <div class="bop-stat-card">
                        <span class="material-icons-round">description</span>
                        <span class="stat-value">${stats.totalPublicaciones}</span>
                        <span class="stat-label">Publicaciones BOP</span>
                    </div>
                    <div class="bop-stat-card">
                        <span class="material-icons-round">gavel</span>
                        <span class="stat-value">${stats.totalPlenos}</span>
                        <span class="stat-label">Plenos Analizados</span>
                    </div>
                    <div class="bop-stat-card bop-stat-positive">
                        <span class="material-icons-round">check_circle</span>
                        <span class="stat-value">${stats.conSeguimiento}</span>
                        <span class="stat-label">Con Seguimiento</span>
                    </div>
                    <div class="bop-stat-card bop-stat-warning">
                        <span class="material-icons-round">warning</span>
                        <span class="stat-value">${stats.sinSeguimiento}</span>
                        <span class="stat-label">Sin Seguimiento</span>
                    </div>
                    <div class="bop-stat-card bop-stat-neutral">
                        <span class="material-icons-round">remove_circle_outline</span>
                        <span class="stat-value">${stats.noRequiere}</span>
                        <span class="stat-label">No Requiere Pleno</span>
                    </div>
                    <div class="bop-stat-card bop-stat-primary">
                        <span class="material-icons-round">percent</span>
                        <span class="stat-value">${stats.porcentajeTrazabilidad}%</span>
                        <span class="stat-label">Trazabilidad</span>
                    </div>
                </div>
                <div class="bop-debate-actors">
                    <div class="bop-actor bop-actor-gobierno">
                        <span class="material-icons-round">groups</span>
                        <span class="actor-partido">${debateConfig.alcalde?.partido || 'PSOE'}</span>
                        <span class="actor-nombre">${debateConfig.alcalde?.nombre || 'Alcalde'}</span>
                        <span class="actor-concejales">${debateConfig.alcalde?.concejales || 7} concejales</span>
                    </div>
                    <div class="bop-actor bop-actor-oposicion">
                        <span class="material-icons-round">record_voice_over</span>
                        <span class="actor-partido">${debateConfig.portavozOposicion?.partido || 'PP'}</span>
                        <span class="actor-nombre">${debateConfig.portavozOposicion?.nombre || 'Portavoz'}</span>
                        <span class="actor-concejales">${debateConfig.portavozOposicion?.concejales || 4} concejales</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Parsea Markdown a HTML (version simplificada)
     * @private
     * @param {string} markdown
     * @returns {string} HTML
     */
    _parseMarkdown(markdown) {
        if (!markdown) return '';

        let html = markdown;

        // Escapar caracteres HTML peligrosos
        html = html.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');

        // Titulos
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Lineas horizontales
        html = html.replace(/^---$/gm, '<hr>');

        // Negrita
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Cursiva
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Tablas Markdown
        html = this._parseMarkdownTables(html);

        // Listas no ordenadas
        html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)\n(?=<li>)/g, '$1');
        html = html.replace(/(<li>.*<\/li>)(?:\n|$)/g, '<ul>$1</ul>');
        // Limpiar uls anidados
        html = html.replace(/<\/ul>\s*<ul>/g, '');

        // Listas ordenadas
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

        // Parrafos
        html = html.split('\n\n').map(block => {
            block = block.trim();
            if (!block) return '';
            if (block.startsWith('<')) return block;
            return `<p>${block.replace(/\n/g, '<br>')}</p>`;
        }).join('\n');

        // Limpiar parrafos vacios
        html = html.replace(/<p>\s*<\/p>/g, '');

        return html;
    },

    /**
     * Parsea tablas Markdown a HTML
     * @private
     * @param {string} html
     * @returns {string}
     */
    _parseMarkdownTables(html) {
        const tableRegex = /\|(.+)\|\n\|[-:\| ]+\|\n((?:\|.+\|\n?)+)/g;

        return html.replace(tableRegex, (match, headerRow, bodyRows) => {
            // Parsear cabecera
            const headers = headerRow.split('|').filter(h => h.trim());
            const headerHtml = headers.map(h => `<th>${h.trim()}</th>`).join('');

            // Parsear filas
            const rows = bodyRows.trim().split('\n');
            const rowsHtml = rows.map(row => {
                const cells = row.split('|').filter(c => c.trim() !== '');
                const cellsHtml = cells.map(c => `<td>${c.trim()}</td>`).join('');
                return `<tr>${cellsHtml}</tr>`;
            }).join('');

            return `<table class="bop-debate-table"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
        });
    },

    // =========================================================================
    // ESTADOS DE UI
    // =========================================================================

    /**
     * Muestra estado de carga
     * @private
     */
    _showLoading() {
        if (this._container) {
            this._container.innerHTML = `
                <div class="bop-loading">
                    <div class="bop-loading-spinner"></div>
                    <p>Cargando analisis cruzado BOP-Plenos...</p>
                </div>
            `;
        }
    },

    /**
     * Muestra mensaje de error
     * @private
     * @param {string} message
     */
    _showError(message) {
        if (this._container) {
            this._container.innerHTML = `
                <div class="bop-error">
                    <span class="material-icons-round">error_outline</span>
                    <p>${BopUtils.escapeHtml(message)}</p>
                    <button onclick="BopDebate.refresh()" class="bop-retry-btn">
                        <span class="material-icons-round">refresh</span>
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.BopDebate = BopDebate;
}
