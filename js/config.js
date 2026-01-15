/* ===========================================
   CONFIG.JS - Configuración Global
   =========================================== */

const CONFIG = {
    // Nombre del sitio
    siteName: 'Plenos Municipales',
    siteSubtitle: 'Ayuntamiento de La Zarza',

    // Hash SHA-256 de la contraseña (se reemplaza en build)
    // Para generar: echo -n "tu_password" | sha256sum
    // Contraseña de desarrollo: "123" (CAMBIAR en producción via Coolify)
    passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',

    // Disqus
    disqus: {
        shortname: 'plenos-lazarza', // Cambiar por tu shortname real
        enabled: true
    },

    // Rutas
    paths: {
        informes: 'informes/',  // Ruta a los archivos INFORME_ECO_*.md
        data: 'data/',
        plenosIndex: 'data/plenos.json'
    },

    // Sesión
    session: {
        key: 'plenos_auth',
        duration: 24 * 60 * 60 * 1000  // 24 horas en ms
    },

    // Mapeo de secciones a colores e iconos
    sections: {
        'datos': {
            title: 'Datos de la Sesión',
            color: 'var(--section-datos)',
            bgColor: 'var(--section-datos-bg)',
            icon: 'event'
        },
        'resumen': {
            title: 'Resumen Ejecutivo',
            color: 'var(--section-resumen)',
            bgColor: 'var(--section-resumen-bg)',
            icon: 'summarize'
        },
        'hallazgos': {
            title: 'Hallazgos Económicos',
            color: 'var(--section-hallazgos)',
            bgColor: 'var(--section-hallazgos-bg)',
            icon: 'analytics'
        },
        'modificaciones': {
            title: 'Modificaciones Presupuestarias',
            color: 'var(--section-contratos)',
            bgColor: 'var(--section-contratos-bg)',
            icon: 'account_balance'
        },
        'contratos': {
            title: 'Contratos y Adjudicaciones',
            color: 'var(--section-contratos)',
            bgColor: 'var(--section-contratos-bg)',
            icon: 'description'
        },
        'subvenciones': {
            title: 'Subvenciones',
            color: 'var(--section-subvenciones)',
            bgColor: 'var(--section-subvenciones-bg)',
            icon: 'payments'
        },
        'indicadores': {
            title: 'Indicadores de Estabilidad',
            color: 'var(--section-hallazgos)',
            bgColor: 'var(--section-hallazgos-bg)',
            icon: 'trending_up'
        },
        'alertas': {
            title: 'Alertas Económico-Financieras',
            color: 'var(--section-alertas)',
            bgColor: 'var(--section-alertas-bg)',
            icon: 'warning'
        },
        'votaciones': {
            title: 'Votaciones Económicas',
            color: 'var(--section-votaciones)',
            bgColor: 'var(--section-votaciones-bg)',
            icon: 'how_to_vote'
        },
        'rrhh': {
            title: 'Recursos Humanos',
            color: 'var(--section-rrhh)',
            bgColor: 'var(--section-rrhh-bg)',
            icon: 'people'
        },
        'patrimonio': {
            title: 'Patrimonio Municipal',
            color: 'var(--section-patrimonio)',
            bgColor: 'var(--section-patrimonio-bg)',
            icon: 'business'
        },
        'compromisos': {
            title: 'Compromisos Económicos',
            color: 'var(--section-seguimiento)',
            bgColor: 'var(--section-seguimiento-bg)',
            icon: 'task_alt'
        },
        'seguimiento': {
            title: 'Seguimiento Pendiente',
            color: 'var(--section-seguimiento)',
            bgColor: 'var(--section-seguimiento-bg)',
            icon: 'pending_actions'
        },
        'notas': {
            title: 'Notas del Auditor',
            color: 'var(--section-datos)',
            bgColor: 'var(--section-datos-bg)',
            icon: 'note'
        },
        'glosario': {
            title: 'Glosario Técnico',
            color: 'var(--section-datos)',
            bgColor: 'var(--section-datos-bg)',
            icon: 'menu_book'
        },
        'default': {
            title: 'Información',
            color: 'var(--primary)',
            bgColor: 'var(--primary-light)',
            icon: 'info'
        }
    },

    // Palabras clave para detectar tipo de sección
    sectionKeywords: {
        'datos de la sesi': 'datos',
        'datos del pleno': 'datos',
        'resumen ejecutivo': 'resumen',
        'hallazgos econ': 'hallazgos',
        'modificacion': 'modificaciones',
        'contrato': 'contratos',
        'adjudicacion': 'contratos',
        'subvenci': 'subvenciones',
        'indicador': 'indicadores',
        'estabilidad': 'indicadores',
        'alerta': 'alertas',
        'votaci': 'votaciones',
        'recursos humanos': 'rrhh',
        'personal': 'rrhh',
        'patrimonio': 'patrimonio',
        'compromiso': 'compromisos',
        'seguimiento': 'seguimiento',
        'pendiente': 'seguimiento',
        'nota': 'notas',
        'auditor': 'notas',
        'glosario': 'glosario'
    },

    // Formato de fechas
    dateFormat: {
        locale: 'es-ES',
        options: {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }
    }
};

// Congelar configuración para evitar modificaciones
Object.freeze(CONFIG);
Object.freeze(CONFIG.disqus);
Object.freeze(CONFIG.paths);
Object.freeze(CONFIG.session);
Object.freeze(CONFIG.sections);
Object.freeze(CONFIG.sectionKeywords);
Object.freeze(CONFIG.dateFormat);
