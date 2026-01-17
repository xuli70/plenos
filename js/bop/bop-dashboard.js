/**
 * BOP Dashboard - Renderizado del dashboard BOP
 *
 * @module BopDashboard
 * @description Genera el HTML del dashboard interactivo con datos del BOP
 * @version 1.0.0
 * @date 2026-01-17
 */

const BopDashboard = {
    // =========================================================================
    // ESTADO INTERNO
    // =========================================================================

    /** @private Indica si el dashboard ya fue renderizado */
    _rendered: false,

    /** @private Contenedor del dashboard */
    _container: null,

    // =========================================================================
    // METODOS PUBLICOS
    // =========================================================================

    /**
     * Renderiza el dashboard completo
     * @async
     * @param {HTMLElement} container - Contenedor donde renderizar
     * @returns {Promise<void>}
     */
    async render(container) {
        if (!container) {
            console.error('[BopDashboard] Contenedor no proporcionado');
            return;
        }

        this._container = container;

        // Mostrar estado de carga
        this._showLoading();

        try {
            // Cargar datos
            const data = await BopLoader.load();

            // Generar HTML
            const html = this._generateDashboardHtml(data);
            container.innerHTML = html;

            // Marcar como renderizado
            this._rendered = true;
            console.log('[BopDashboard] Dashboard renderizado correctamente');

        } catch (error) {
            console.error('[BopDashboard] Error:', error);
            this._showError(error.message);
        }
    },

    /**
     * Verifica si el dashboard ya fue renderizado
     * @returns {boolean}
     */
    isRendered() {
        return this._rendered;
    },

    /**
     * Fuerza re-renderizado del dashboard
     * @async
     */
    async refresh() {
        if (!this._container) return;
        this._rendered = false;
        await BopLoader.reload();
        await this.render(this._container);
    },

    // =========================================================================
    // GENERACION DE HTML - PRINCIPAL
    // =========================================================================

    /**
     * Genera el HTML completo del dashboard
     * @private
     * @param {Object} data - Datos procesados del BOP
     * @returns {string} HTML del dashboard
     */
    _generateDashboardHtml(data) {
        return `
            <div class="bop-dashboard">
                ${this._renderHeader(data.metadata)}
                ${this._renderResumen(data)}
                ${this._renderCategorias(data.estadisticas)}
                ${this._renderDistribucionMensual(data.estadisticas)}
                ${this._renderTablaPublicaciones(data.publicaciones)}
                ${this._renderNotas(data.notas)}
                ${this._renderFooter(data.urlsReferencia)}
            </div>
        `;
    },

    // =========================================================================
    // GENERACION DE HTML - SECCIONES
    // =========================================================================

    /**
     * Renderiza cabecera con metadata
     * @private
     */
    _renderHeader(metadata) {
        const rango = metadata.rango_busqueda || {};
        return `
            <div class="bop-header">
                <div class="bop-header-icon">
                    <span class="material-icons-round">newspaper</span>
                </div>
                <div class="bop-header-content">
                    <h1 class="bop-title">Boletin Oficial de la Provincia</h1>
                    <p class="bop-subtitle">
                        Publicaciones de ${BopUtils.escapeHtml(metadata.municipio || 'La Zarza')}
                        (${BopUtils.escapeHtml(metadata.provincia || 'Badajoz')})
                    </p>
                    <p class="bop-period">
                        Periodo: ${BopUtils.formatDate(rango.desde)} - ${BopUtils.formatDate(rango.hasta)}
                        (${BopUtils.escapeHtml(rango.periodo || '12 meses')})
                    </p>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza resumen ejecutivo con cards
     * @private
     */
    _renderResumen(data) {
        const stats = data.estadisticas || {};
        const meta = data.metadata || {};
        const porCategoria = stats.publicaciones_por_categoria || {};
        const porOrganismo = stats.publicaciones_por_organismo || {};

        // Encontrar categoria principal
        const topCategoria = Object.entries(porCategoria)
            .sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

        // Contar organismos
        const numOrganismos = Object.keys(porOrganismo).length;

        return `
            <div class="bop-section">
                <h2 class="bop-section-title">
                    <span class="material-icons-round">analytics</span>
                    Resumen Ejecutivo
                </h2>
                <div class="bop-cards">
                    <div class="bop-card bop-card-primary">
                        <span class="bop-card-icon">
                            <span class="material-icons-round">description</span>
                        </span>
                        <span class="bop-card-value">${BopUtils.formatNumber(data.totalPublicaciones)}</span>
                        <span class="bop-card-label">Publicaciones Totales</span>
                    </div>
                    <div class="bop-card">
                        <span class="bop-card-icon">
                            <span class="material-icons-round">date_range</span>
                        </span>
                        <span class="bop-card-value">${BopUtils.escapeHtml(meta.rango_busqueda?.periodo || '12 meses')}</span>
                        <span class="bop-card-label">Periodo Analizado</span>
                    </div>
                    <div class="bop-card">
                        <span class="bop-card-icon">
                            <span class="material-icons-round">${BopUtils.getCategoriaConfig(topCategoria[0]).icon}</span>
                        </span>
                        <span class="bop-card-value">${topCategoria[1]}</span>
                        <span class="bop-card-label">${BopUtils.escapeHtml(topCategoria[0])}</span>
                    </div>
                    <div class="bop-card">
                        <span class="bop-card-icon">
                            <span class="material-icons-round">corporate_fare</span>
                        </span>
                        <span class="bop-card-value">${numOrganismos}</span>
                        <span class="bop-card-label">Organismos Emisores</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza distribucion por categorias
     * @private
     */
    _renderCategorias(estadisticas) {
        const porCategoria = estadisticas.publicaciones_por_categoria || {};
        const total = Object.values(porCategoria).reduce((sum, v) => sum + v, 0);

        if (total === 0) return '';

        const items = Object.entries(porCategoria)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => {
                const config = BopUtils.getCategoriaConfig(cat);
                const percent = ((count / total) * 100).toFixed(1);
                return `
                    <div class="bop-categoria-item">
                        <div class="bop-categoria-info">
                            <span class="material-icons-round" style="color: ${config.color}">${config.icon}</span>
                            <span class="bop-categoria-name">${BopUtils.escapeHtml(cat)}</span>
                        </div>
                        <div class="bop-categoria-stats">
                            <span class="bop-categoria-count">${count}</span>
                            <span class="bop-categoria-percent">(${percent}%)</span>
                        </div>
                        <div class="bop-categoria-bar-container">
                            <div class="bop-categoria-bar" style="width: ${percent}%; background-color: ${config.color}"></div>
                        </div>
                    </div>
                `;
            }).join('');

        return `
            <div class="bop-section">
                <h2 class="bop-section-title">
                    <span class="material-icons-round">category</span>
                    Distribucion por Categoria
                </h2>
                <div class="bop-categorias-list">
                    ${items}
                </div>
            </div>
        `;
    },

    /**
     * Renderiza distribucion mensual
     * @private
     */
    _renderDistribucionMensual(estadisticas) {
        const porMes = estadisticas.publicaciones_por_mes || {};
        const meses = Object.entries(porMes).sort((a, b) => a[0].localeCompare(b[0]));

        if (meses.length === 0) return '';

        const maxCount = Math.max(...meses.map(m => m[1]));
        const nombresMeses = {
            '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
            '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
            '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
        };

        const barras = meses.map(([mes, count]) => {
            const [year, month] = mes.split('-');
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const nombreMes = nombresMeses[month] || month;
            return `
                <div class="bop-mes-item">
                    <div class="bop-mes-bar-container">
                        <div class="bop-mes-bar" style="height: ${height}%">
                            <span class="bop-mes-count">${count}</span>
                        </div>
                    </div>
                    <span class="bop-mes-label">${nombreMes}<br>${year.slice(2)}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="bop-section">
                <h2 class="bop-section-title">
                    <span class="material-icons-round">bar_chart</span>
                    Distribucion Mensual
                </h2>
                <div class="bop-meses-chart">
                    ${barras}
                </div>
            </div>
        `;
    },

    /**
     * Renderiza tabla de publicaciones
     * @private
     */
    _renderTablaPublicaciones(publicaciones) {
        if (!publicaciones || publicaciones.length === 0) {
            return `
                <div class="bop-section">
                    <p class="bop-no-data">${BOP_CONFIG.mensajes.sinDatos}</p>
                </div>
            `;
        }

        const rows = publicaciones.map(pub => {
            const catConfig = BopUtils.getCategoriaConfig(pub.categoria);
            const enlaceHtml = BopUtils.createExternalLink(
                pub.enlace,
                pub.titulo,
                `${pub.titulo} - BOP ${pub.boletin}`
            );

            return `
                <tr>
                    <td class="bop-col-fecha">${BopUtils.formatDate(pub.fecha)}</td>
                    <td class="bop-col-boletin">N${BopUtils.escapeHtml(pub.boletin)}</td>
                    <td class="bop-col-titulo">${enlaceHtml}</td>
                    <td class="bop-col-categoria">
                        <span class="bop-cat-badge-small" style="background-color: ${catConfig.bgColor}; color: ${catConfig.color}">
                            ${BopUtils.escapeHtml(pub.categoria)}
                        </span>
                    </td>
                    <td class="bop-col-organismo">${BopUtils.escapeHtml(BopUtils.getOrganismoShort(pub.organismo))}</td>
                </tr>
            `;
        }).join('');

        return `
            <div class="bop-section bop-section-tabla">
                <h2 class="bop-section-title">
                    <span class="material-icons-round">list_alt</span>
                    Publicaciones (${publicaciones.length})
                </h2>
                <div class="bop-table-container">
                    <table class="bop-table">
                        <thead>
                            <tr>
                                <th class="bop-col-fecha">Fecha</th>
                                <th class="bop-col-boletin">Boletin</th>
                                <th class="bop-col-titulo">Titulo</th>
                                <th class="bop-col-categoria">Categoria</th>
                                <th class="bop-col-organismo">Organismo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza notas metodologicas
     * @private
     */
    _renderNotas(notas) {
        if (!notas || notas.length === 0) return '';

        const items = notas.map((nota, i) => `
            <li><span class="bop-nota-num">${i + 1}.</span> ${BopUtils.escapeHtml(nota)}</li>
        `).join('');

        return `
            <div class="bop-section bop-section-notas">
                <h2 class="bop-section-title">
                    <span class="material-icons-round">info</span>
                    Notas Metodologicas
                </h2>
                <ul class="bop-notas-list">
                    ${items}
                </ul>
            </div>
        `;
    },

    /**
     * Renderiza footer con enlaces de referencia
     * @private
     */
    _renderFooter(urls) {
        if (!urls || Object.keys(urls).length === 0) return '';

        const enlaces = [
            { key: 'bop_principal', label: 'BOP Badajoz', icon: 'web' },
            { key: 'buscador_bop', label: 'Buscador', icon: 'search' },
            { key: 'ficha_municipio', label: 'Ficha Municipal', icon: 'location_city' },
            { key: 'canal_rss', label: 'RSS', icon: 'rss_feed' }
        ].filter(e => urls[e.key]).map(e => `
            <a href="${BopUtils.escapeHtml(urls[e.key])}" target="_blank" rel="noopener noreferrer" class="bop-footer-link">
                <span class="material-icons-round">${e.icon}</span>
                ${e.label}
            </a>
        `).join('');

        return `
            <div class="bop-footer">
                <div class="bop-footer-links">
                    ${enlaces}
                </div>
                <p class="bop-footer-credit">
                    Generado automaticamente con Claude Code + MCP
                </p>
            </div>
        `;
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
                    <p>${BOP_CONFIG.mensajes.cargando}</p>
                </div>
            `;
        }
    },

    /**
     * Muestra mensaje de error
     * @private
     */
    _showError(message) {
        if (this._container) {
            this._container.innerHTML = `
                <div class="bop-error">
                    <span class="material-icons-round">error_outline</span>
                    <p>${BopUtils.escapeHtml(message)}</p>
                    <button onclick="BopDashboard.refresh()" class="bop-retry-btn">
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
    window.BopDashboard = BopDashboard;
}
