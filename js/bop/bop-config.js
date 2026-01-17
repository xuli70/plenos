/**
 * BOP Config - Configuracion especifica del modulo BOP
 *
 * @module BopConfig
 * @description Constantes, categorias, colores e iconos para el dashboard BOP
 * @version 1.0.0
 * @date 2026-01-17
 */

const BOP_CONFIG = {
    // =========================================================================
    // METADATA
    // =========================================================================
    version: '1.0.0',
    lastUpdate: '2026-01-17',

    // =========================================================================
    // CONFIGURACION DE PESTAÑA
    // =========================================================================
    tab: {
        id: 'bop',
        fecha: '2026-01-17',
        fechaFormateada: '17 de enero de 2026',
        fechaCorta: '17/01/2026',
        titulo: 'BOP',
        subtitulo: 'Boletin Oficial de la Provincia',
        badgeText: 'BOP',
        badgeClass: 'bop'
    },

    // =========================================================================
    // RUTAS DE DATOS
    // =========================================================================
    paths: {
        dataFile: 'ResultadosBOP/resultados_bop_la_zarza_2026-01-17.json',
        // Preparado para multiples fuentes en el futuro
        alternateFiles: []
    },

    // =========================================================================
    // VISTAS DISPONIBLES
    // =========================================================================
    views: {
        resultado: {
            id: 'bop-resultado',
            label: 'Resultado',
            icon: 'article',
            active: true
        },
        debate: {
            id: 'bop-debate',
            label: 'Debate',
            icon: 'forum',
            active: false,
            dataFile: 'ResultadosBOP/INFORME_DEBATE_BOP_2025.md'
        }
    },

    // =========================================================================
    // CONFIGURACION DEL DEBATE (ANALISIS CRUZADO BOP-PLENOS)
    // =========================================================================
    debate: {
        // Actores politicos
        alcalde: {
            nombre: 'Francisco Jose Farrona Navas',
            partido: 'PSOE',
            cargo: 'Alcalde',
            concejales: 7
        },
        portavozOposicion: {
            nombre: 'Leonor Corbacho Tejada',
            partido: 'PP',
            cargo: 'Portavoz',
            concejales: 4
        },
        // Plenos analizados (fechas de las actas)
        plenos: [
            { fecha: '2024-12-26', id: '2024-12-26', tipo: 'Ordinaria' },
            { fecha: '2025-01-13', id: '2025-01-13', tipo: 'Extraordinaria Urgente' },
            { fecha: '2025-02-05', id: '2025-02-05', tipo: 'Extraordinaria Urgente' },
            { fecha: '2025-04-25', id: '2025-04-25', tipo: 'Ordinaria' },
            { fecha: '2025-05-16', id: '2025-05-16', tipo: 'Extraordinaria Urgente' },
            { fecha: '2025-06-26', id: '2025-06-26', tipo: 'Ordinaria' },
            { fecha: '2025-07-28', id: '2025-07-28', tipo: 'Ordinaria' },
            { fecha: '2025-11-24', id: '2025-11-24', tipo: 'Extraordinaria Urgente' }
        ],
        // Criterios de trazabilidad BOP-Pleno
        trazabilidad: {
            margenDias: 30,
            estados: {
                TRAZADO: { label: 'Trazado', color: '#388E3C', icon: 'check_circle' },
                PARCIAL: { label: 'Parcial', color: '#F57C00', icon: 'pending' },
                SIN_SEGUIMIENTO: { label: 'Sin seguimiento', color: '#D32F2F', icon: 'cancel' },
                NO_REQUIERE: { label: 'No requiere pleno', color: '#757575', icon: 'remove_circle_outline' }
            }
        },
        // Categorias que normalmente requieren aprobacion en pleno
        categoriasConPleno: ['Hacienda', 'Seguridad', 'Patrimonio'],
        // Categorias que son tramite administrativo (no requieren pleno)
        categoriasTramite: ['Empleo', 'Urbanismo', 'Administracion electronica']
    },

    // =========================================================================
    // CATEGORIAS Y SUS ESTILOS
    // =========================================================================
    categorias: {
        'Hacienda': {
            icon: 'account_balance',
            color: '#1976D2',
            bgColor: '#E3F2FD'
        },
        'Empleo': {
            icon: 'work',
            color: '#388E3C',
            bgColor: '#E8F5E9'
        },
        'Urbanismo': {
            icon: 'location_city',
            color: '#F57C00',
            bgColor: '#FFF3E0'
        },
        'Seguridad': {
            icon: 'security',
            color: '#D32F2F',
            bgColor: '#FFEBEE'
        },
        'Patrimonio': {
            icon: 'business',
            color: '#7B1FA2',
            bgColor: '#F3E5F5'
        },
        'Igualdad': {
            icon: 'diversity_3',
            color: '#00796B',
            bgColor: '#E0F2F1'
        },
        'Administracion electronica': {
            icon: 'computer',
            color: '#5D4037',
            bgColor: '#EFEBE9'
        },
        'Subvenciones': {
            icon: 'payments',
            color: '#0097A7',
            bgColor: '#E0F7FA'
        },
        // Categoria por defecto
        'default': {
            icon: 'description',
            color: '#757575',
            bgColor: '#F5F5F5'
        }
    },

    // =========================================================================
    // ORGANISMOS EMISORES
    // =========================================================================
    organismos: {
        'Ayuntamiento de La Zarza': {
            shortName: 'Ayto. La Zarza',
            icon: 'account_balance',
            primary: true
        },
        'Mancomunidad de Aguas Pantano de Alange': {
            shortName: 'Mancom. Aguas',
            icon: 'water_drop',
            primary: false
        },
        'Diputacion de Badajoz': {
            shortName: 'Dip. Badajoz',
            icon: 'corporate_fare',
            primary: false
        }
    },

    // =========================================================================
    // CONFIGURACION DE TABLA
    // =========================================================================
    tabla: {
        columnas: [
            { key: 'fecha', label: 'Fecha', width: '100px' },
            { key: 'boletin', label: 'Boletin', width: '80px' },
            { key: 'titulo', label: 'Titulo', width: 'auto' },
            { key: 'categoria', label: 'Categoria', width: '140px' },
            { key: 'organismo', label: 'Organismo', width: '140px' }
        ],
        ordenInicial: 'fecha',
        ordenDireccion: 'desc',
        filasPorPagina: 50
    },

    // =========================================================================
    // MENSAJES DE UI
    // =========================================================================
    mensajes: {
        cargando: 'Cargando datos del BOP...',
        error: 'Error al cargar los datos del BOP',
        sinDatos: 'No se encontraron publicaciones',
        enlaceExterno: 'Abrir edicto en el BOP'
    },

    // =========================================================================
    // CONFIGURACION DE ENLACES
    // =========================================================================
    enlaces: {
        target: '_blank',
        rel: 'noopener noreferrer',
        showIcon: true,
        iconName: 'open_in_new'
    }
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.BOP_CONFIG = BOP_CONFIG;
}
