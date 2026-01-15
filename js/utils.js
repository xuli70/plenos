/* ===========================================
   UTILS.JS - Funciones Auxiliares
   =========================================== */

const Utils = {
    /**
     * Escapa caracteres HTML para prevenir XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Convierte fecha ISO a formato legible
     */
    formatDate(isoDate) {
        const [year, month, day] = isoDate.split('-');
        const months = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`;
    },

    /**
     * Convierte fecha ISO a formato corto
     */
    formatDateShort(isoDate) {
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    },

    /**
     * Extrae la fecha de un nombre de archivo
     * Ej: "INFORME_ECO_2025-01-13.md" -> "2025-01-13"
     */
    extractDateFromFilename(filename) {
        const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : null;
    },

    /**
     * Detecta y formatea importes monetarios en texto
     * Patrón: XXX.XXX,XX € o XXX.XXX,XX EUR
     */
    formatCurrency(text) {
        // Patrón para importes en formato europeo
        const currencyPattern = /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(€|EUR)/g;

        return text.replace(currencyPattern, (match, amount, currency) => {
            // Determinar si es positivo o negativo basado en contexto
            const isNegative = text.includes('-' + amount) || text.toLowerCase().includes('deficit');
            const className = isNegative ? 'currency negative' : 'currency';
            return `<span class="${className}">${amount} ${currency}</span>`;
        });
    },

    /**
     * Detecta el tipo de sección basado en el título
     */
    detectSectionType(title) {
        const titleLower = title.toLowerCase();

        for (const [keyword, sectionType] of Object.entries(CONFIG.sectionKeywords)) {
            if (titleLower.includes(keyword)) {
                return sectionType;
            }
        }

        return 'default';
    },

    /**
     * Obtiene la configuración de una sección
     */
    getSectionConfig(sectionType) {
        return CONFIG.sections[sectionType] || CONFIG.sections.default;
    },

    /**
     * Limpia el texto de caracteres especiales markdown
     */
    cleanMarkdownText(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove bold markers
            .replace(/\*(.+?)\*/g, '$1')       // Remove italic markers
            .replace(/`(.+?)`/g, '$1')         // Remove code markers
            .trim();
    },

    /**
     * Genera un ID válido para HTML a partir de texto
     */
    slugify(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')  // Eliminar acentos
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Debounce para optimizar eventos frecuentes
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Comprueba si un elemento está visible en el viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Scroll suave a un elemento
     */
    scrollToElement(element, offset = 100) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },

    /**
     * Copia texto al portapapeles
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Error al copiar:', err);
            return false;
        }
    },

    /**
     * Detecta si el texto contiene una alerta
     */
    detectAlertType(text) {
        const textLower = text.toLowerCase();

        if (textLower.includes('crítico') || textLower.includes('critico') ||
            textLower.includes('incumplimiento') || textLower.includes('déficit')) {
            return 'error';
        }
        if (textLower.includes('atención') || textLower.includes('atencion') ||
            textLower.includes('pendiente') || textLower.includes('prórroga')) {
            return 'warning';
        }
        if (textLower.includes('positivo') || textLower.includes('aprobado') ||
            textLower.includes('cumple') || textLower.includes('superávit')) {
            return 'success';
        }

        return 'info';
    },

    /**
     * Extrae metadatos del contenido markdown
     */
    extractMetadata(content) {
        const metadata = {
            titulo: '',
            fecha: '',
            tipo: 'Ordinaria',
            duracion: '',
            asistencia: ''
        };

        // Extraer título
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
            metadata.titulo = titleMatch[1].trim();
        }

        // Extraer fecha del subtítulo
        const subtitleMatch = content.match(/##\s+Pleno\s+(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i);
        if (subtitleMatch) {
            metadata.fecha = subtitleMatch[1];
        }

        // Buscar en tablas de datos
        const tipoMatch = content.match(/\*\*Tipo\*\*\s*\|\s*(.+)/);
        if (tipoMatch) {
            metadata.tipo = tipoMatch[1].trim();
        }

        const horaMatch = content.match(/\*\*Hora\*\*\s*\|\s*(.+)/);
        if (horaMatch) {
            metadata.duracion = horaMatch[1].trim();
        }

        const quorumMatch = content.match(/\*\*Quórum[^|]*\*\*\s*\|\s*(.+)/i);
        if (quorumMatch) {
            metadata.asistencia = quorumMatch[1].trim();
        }

        return metadata;
    },

    /**
     * Determina el tipo de pleno (Ordinario, Extraordinario, Urgente)
     */
    getPlenoType(tipoText) {
        const tipo = tipoText.toLowerCase();

        if (tipo.includes('urgente') || tipo.includes('urgencia')) {
            return { label: 'Urgente', class: 'urgente', color: 'error' };
        }
        if (tipo.includes('extraordinari')) {
            return { label: 'Extraordinario', class: 'extraordinario', color: 'warning' };
        }
        return { label: 'Ordinario', class: 'ordinario', color: 'info' };
    },

    /**
     * Parsea el resultado de una votación
     */
    parseVotacion(text) {
        const unanimidadMatch = text.toLowerCase().includes('unanimidad');
        if (unanimidadMatch) {
            return { tipo: 'unanimidad', label: 'Unanimidad', class: 'success' };
        }

        const mayoriaMatch = text.match(/(\d+)\s*[-–]\s*(\d+)\s*[-–]\s*(\d+)/);
        if (mayoriaMatch) {
            const [, aFavor, enContra, abstenciones] = mayoriaMatch;
            return {
                tipo: 'mayoria',
                aFavor: parseInt(aFavor),
                enContra: parseInt(enContra),
                abstenciones: parseInt(abstenciones),
                label: `${aFavor}-${enContra}-${abstenciones}`,
                class: parseInt(enContra) > 0 ? 'warning' : 'success'
            };
        }

        return { tipo: 'desconocido', label: text, class: 'info' };
    }
};

// Congelar para evitar modificaciones
Object.freeze(Utils);
