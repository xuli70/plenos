/**
 * BOP Utils - Funciones auxiliares del modulo BOP
 *
 * @module BopUtils
 * @description Utilidades para formateo, ordenacion y manipulacion de datos BOP
 * @version 1.0.0
 * @date 2026-01-17
 */

const BopUtils = {
    // =========================================================================
    // FORMATEO DE FECHAS
    // =========================================================================

    /**
     * Formatea fecha ISO a formato DD/MM/YYYY
     * @param {string} dateStr - Fecha en formato YYYY-MM-DD
     * @returns {string} Fecha formateada
     */
    formatDate(dateStr) {
        if (!dateStr) return '-';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    },

    /**
     * Formatea fecha ISO a formato largo (DD de mes de YYYY)
     * @param {string} dateStr - Fecha en formato YYYY-MM-DD
     * @returns {string} Fecha formateada
     */
    formatDateLong(dateStr) {
        if (!dateStr) return '-';
        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        const [year, month, day] = dateStr.split('-');
        const monthIndex = parseInt(month, 10) - 1;
        return `${parseInt(day, 10)} de ${meses[monthIndex]} de ${year}`;
    },

    /**
     * Extrae mes y año de una fecha ISO
     * @param {string} dateStr - Fecha en formato YYYY-MM-DD
     * @returns {string} Formato YYYY-MM
     */
    getMonthYear(dateStr) {
        if (!dateStr) return '';
        return dateStr.substring(0, 7);
    },

    // =========================================================================
    // FORMATEO DE NUMEROS
    // =========================================================================

    /**
     * Formatea numero como moneda EUR
     * @param {number} amount - Cantidad a formatear
     * @returns {string} Cantidad formateada con simbolo EUR
     */
    formatCurrency(amount) {
        if (amount === null || amount === undefined) return '-';
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    },

    /**
     * Formatea numero con separador de miles
     * @param {number} num - Numero a formatear
     * @returns {string} Numero formateado
     */
    formatNumber(num) {
        if (num === null || num === undefined) return '-';
        return new Intl.NumberFormat('es-ES').format(num);
    },

    // =========================================================================
    // OBTENCION DE CONFIGURACION
    // =========================================================================

    /**
     * Obtiene configuracion de categoria por nombre
     * @param {string} categoria - Nombre de la categoria
     * @returns {Object} Configuracion de la categoria (icon, color, bgColor)
     */
    getCategoriaConfig(categoria) {
        if (!categoria) return BOP_CONFIG.categorias.default;
        return BOP_CONFIG.categorias[categoria] || BOP_CONFIG.categorias.default;
    },

    /**
     * Obtiene nombre corto del organismo
     * @param {string} organismo - Nombre completo del organismo
     * @returns {string} Nombre corto
     */
    getOrganismoShort(organismo) {
        if (!organismo) return '-';
        const config = BOP_CONFIG.organismos[organismo];
        return config ? config.shortName : organismo;
    },

    // =========================================================================
    // ORDENACION Y FILTRADO
    // =========================================================================

    /**
     * Ordena publicaciones por fecha (descendente por defecto)
     * @param {Array} publicaciones - Array de publicaciones
     * @param {string} direction - 'asc' o 'desc'
     * @returns {Array} Publicaciones ordenadas
     */
    sortByDate(publicaciones, direction = 'desc') {
        return [...publicaciones].sort((a, b) => {
            const dateA = a.fecha_publicacion || '';
            const dateB = b.fecha_publicacion || '';
            const comparison = dateA.localeCompare(dateB);
            return direction === 'desc' ? -comparison : comparison;
        });
    },

    /**
     * Agrupa publicaciones por categoria
     * @param {Array} publicaciones - Array de publicaciones
     * @returns {Object} Objeto con categorias como claves
     */
    groupByCategoria(publicaciones) {
        return publicaciones.reduce((groups, pub) => {
            const cat = pub.categoria_tematica || 'Sin categoria';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(pub);
            return groups;
        }, {});
    },

    /**
     * Agrupa publicaciones por mes
     * @param {Array} publicaciones - Array de publicaciones
     * @returns {Object} Objeto con meses (YYYY-MM) como claves
     */
    groupByMonth(publicaciones) {
        return publicaciones.reduce((groups, pub) => {
            const month = this.getMonthYear(pub.fecha_publicacion);
            if (!groups[month]) groups[month] = [];
            groups[month].push(pub);
            return groups;
        }, {});
    },

    // =========================================================================
    // GENERACION DE HTML
    // =========================================================================

    /**
     * Genera HTML para enlace externo
     * @param {string} url - URL del enlace
     * @param {string} text - Texto del enlace
     * @param {string} title - Titulo (tooltip)
     * @returns {string} HTML del enlace
     */
    createExternalLink(url, text, title = '') {
        if (!url) return text || '-';
        const config = BOP_CONFIG.enlaces;
        const iconHtml = config.showIcon
            ? `<span class="material-icons-round bop-link-icon">${config.iconName}</span>`
            : '';
        return `<a href="${this.escapeHtml(url)}"
                   target="${config.target}"
                   rel="${config.rel}"
                   title="${this.escapeHtml(title || BOP_CONFIG.mensajes.enlaceExterno)}"
                   class="bop-external-link">
                    <span class="bop-link-text">${this.escapeHtml(text)}</span>
                    ${iconHtml}
                </a>`;
    },

    /**
     * Genera HTML para badge de categoria
     * @param {string} categoria - Nombre de la categoria
     * @returns {string} HTML del badge
     */
    createCategoriaBadge(categoria) {
        const config = this.getCategoriaConfig(categoria);
        return `<span class="bop-cat-badge"
                      style="background-color: ${config.bgColor}; color: ${config.color}">
                    <span class="material-icons-round bop-cat-icon">${config.icon}</span>
                    ${this.escapeHtml(categoria)}
                </span>`;
    },

    /**
     * Genera HTML para icono con Material Icons
     * @param {string} iconName - Nombre del icono
     * @param {string} className - Clase CSS adicional
     * @returns {string} HTML del icono
     */
    createIcon(iconName, className = '') {
        return `<span class="material-icons-round ${className}">${iconName}</span>`;
    },

    // =========================================================================
    // SEGURIDAD
    // =========================================================================

    /**
     * Escapa caracteres HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string} Texto escapado
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // =========================================================================
    // ESTADISTICAS
    // =========================================================================

    /**
     * Calcula estadisticas de un conjunto de publicaciones
     * @param {Array} publicaciones - Array de publicaciones
     * @returns {Object} Objeto con estadisticas
     */
    calculateStats(publicaciones) {
        const byCategoria = this.groupByCategoria(publicaciones);
        const byMonth = this.groupByMonth(publicaciones);

        // Encontrar rango de fechas
        const fechas = publicaciones
            .map(p => p.fecha_publicacion)
            .filter(f => f)
            .sort();

        return {
            total: publicaciones.length,
            porCategoria: Object.entries(byCategoria)
                .map(([cat, pubs]) => ({ categoria: cat, count: pubs.length }))
                .sort((a, b) => b.count - a.count),
            porMes: Object.entries(byMonth)
                .map(([mes, pubs]) => ({ mes, count: pubs.length }))
                .sort((a, b) => b.mes.localeCompare(a.mes)),
            fechaInicio: fechas[0] || null,
            fechaFin: fechas[fechas.length - 1] || null
        };
    }
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.BopUtils = BopUtils;
}
