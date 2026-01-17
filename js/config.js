/* ===========================================
   CONFIG.JS - Configuración Global
   =========================================== */

const CONFIG = {
    // Nombre del sitio
    siteName: 'Plenos Municipales',
    siteSubtitle: 'Ayuntamiento de La Zarza',

    // Hash SHA-256 de la contraseña - generado desde PLENOS_PASSWORD durante npm run build
    // Configurar PLENOS_PASSWORD como Build Variable en Coolify
    passwordHash: '%%PASSWORD_HASH%%',

    // Isso (sistema de comentarios self-hosted)
    isso: {
        url: 'https://isso.axcsol.com',
        enabled: true
    },

    // Rutas
    paths: {
        informes: 'informes/',                     // Ruta a los archivos INFORME_ECO_*.md
        informesPoliticos: 'informesPROPUESTAS/',  // Ruta a los archivos INFORME_POLITICO_*.md
        informesDebate: 'informesPREGUNTAS/',      // Ruta a los archivos INFORME_PREGUNTAS_*.md
        pdfActas: 'pdfActas/',                     // Ruta a los archivos PDF de actas originales
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
        // === SECCIONES POLITICAS ===
        'corporacion': {
            title: 'Mapa de la Corporación',
            color: 'var(--section-corporacion)',
            bgColor: 'var(--section-corporacion-bg)',
            icon: 'groups'
        },
        'asuntos': {
            title: 'Análisis de Asuntos',
            color: 'var(--section-asuntos)',
            bgColor: 'var(--section-asuntos-bg)',
            icon: 'gavel'
        },
        'ruegos': {
            title: 'Ruegos y Preguntas',
            color: 'var(--section-ruegos)',
            bgColor: 'var(--section-ruegos-bg)',
            icon: 'help_outline'
        },
        'debates': {
            title: 'Debates Destacados',
            color: 'var(--section-debates)',
            bgColor: 'var(--section-debates-bg)',
            icon: 'forum'
        },
        'matriz': {
            title: 'Matriz por Concejal',
            color: 'var(--section-matriz)',
            bgColor: 'var(--section-matriz-bg)',
            icon: 'grid_on'
        },
        'indicadores-politicos': {
            title: 'Indicadores Cuantitativos',
            color: 'var(--section-indicadores-pol)',
            bgColor: 'var(--section-indicadores-pol-bg)',
            icon: 'analytics'
        },
        'ranking': {
            title: 'Ranking de Implicación',
            color: 'var(--section-ranking)',
            bgColor: 'var(--section-ranking-bg)',
            icon: 'leaderboard'
        },
        'silencios': {
            title: 'Análisis de Silencios',
            color: 'var(--section-silencios)',
            bgColor: 'var(--section-silencios-bg)',
            icon: 'volume_off'
        },
        'perfil': {
            title: 'Perfil del Pleno',
            color: 'var(--section-perfil)',
            bgColor: 'var(--section-perfil-bg)',
            icon: 'fingerprint'
        },
        'comparativa': {
            title: 'Comparativa con Pleno Anterior',
            color: 'var(--section-comparativa)',
            bgColor: 'var(--section-comparativa-bg)',
            icon: 'compare_arrows'
        },
        'conclusion': {
            title: 'Conclusión Técnica',
            color: 'var(--section-conclusion)',
            bgColor: 'var(--section-conclusion-bg)',
            icon: 'summarize'
        },
        'metodologia': {
            title: 'Nota Metodológica',
            color: 'var(--section-datos)',
            bgColor: 'var(--section-datos-bg)',
            icon: 'science'
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
        // === SECCIONES ECONOMICAS ===
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
        'glosario': 'glosario',
        // === SECCIONES POLITICAS ===
        'mapa de la corporaci': 'corporacion',
        'corporaci': 'corporacion',
        'análisis asunto': 'asuntos',
        'analisis asunto': 'asuntos',
        'asunto por asunto': 'asuntos',
        'ruegos y preguntas': 'ruegos',
        'debates destacados': 'debates',
        'matriz global': 'matriz',
        'matriz por concejal': 'matriz',
        'indicadores cuantitativo': 'indicadores-politicos',
        'ranking de implicaci': 'ranking',
        'ranking implicaci': 'ranking',
        'silencios significativo': 'silencios',
        'análisis de silencio': 'silencios',
        'analisis de silencio': 'silencios',
        'perfil del pleno': 'perfil',
        'comparativa con pleno': 'comparativa',
        'comparativa pleno anterior': 'comparativa',
        'conclusión técnica': 'conclusion',
        'conclusion tecnica': 'conclusion',
        'nota metodológica': 'metodologia',
        'nota metodologica': 'metodologia'
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
Object.freeze(CONFIG.isso);
Object.freeze(CONFIG.paths);
Object.freeze(CONFIG.session);
Object.freeze(CONFIG.sections);
Object.freeze(CONFIG.sectionKeywords);
Object.freeze(CONFIG.dateFormat);
