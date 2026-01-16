#!/usr/bin/env node
/**
 * generate-index.js
 *
 * Script para generar el índice de plenos (plenos.json)
 * Lee los archivos INFORME_ECO_*.md y extrae metadatos.
 *
 * Uso:
 *   node build/generate-index.js
 *   npm run build
 */

const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
    // Directorio donde están los informes MD (dentro de web/informes/)
    informesDir: path.join(__dirname, '../informes/'),
    // Archivo de salida
    outputFile: path.join(__dirname, '../data/plenos.json'),
    // Patrón de archivos
    filePattern: /^INFORME_ECO_(\d{4}-\d{2}-\d{2})\.md$/
    // NOTA: configFile eliminado - hash de password se genera en RUNTIME
};

// Meses en español
const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

/**
 * Formatea una fecha ISO a texto legible
 */
function formatDate(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${parseInt(day)} de ${MESES[parseInt(month) - 1]} de ${year}`;
}

/**
 * Formatea una fecha ISO a formato corto
 */
function formatDateShort(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Extrae metadatos de un archivo de informe
 */
function extractMetadata(content, filename) {
    const metadata = {
        titulo: '',
        fecha: '',
        tipo: 'Ordinaria',
        duracion: '',
        asistencia: '',
        secretaria: ''
    };

    // Extraer título principal
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
        metadata.titulo = titleMatch[1].trim();
    }

    // Extraer fecha del subtítulo
    const subtitleMatch = content.match(/##\s+Pleno\s+(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i);
    if (subtitleMatch) {
        metadata.fecha = subtitleMatch[1];
    }

    // Buscar datos en tablas
    const lines = content.split('\n');
    for (const line of lines) {
        // Tipo de sesión
        if (line.includes('**Tipo**')) {
            const match = line.match(/\*\*Tipo\*\*\s*\|\s*(.+)/);
            if (match) metadata.tipo = match[1].replace(/\|/g, '').trim();
        }

        // Hora
        if (line.includes('**Hora**')) {
            const match = line.match(/\*\*Hora\*\*\s*\|\s*(.+)/);
            if (match) metadata.duracion = match[1].replace(/\|/g, '').trim();
        }

        // Quórum/Asistencia
        if (line.toLowerCase().includes('quórum') || line.toLowerCase().includes('quorum')) {
            const match = line.match(/\*\*[^*]+\*\*\s*\|\s*(.+)/);
            if (match) metadata.asistencia = match[1].replace(/\|/g, '').trim();
        }

        // Secretaria
        if (line.toLowerCase().includes('secretari')) {
            const match = line.match(/\*\*[^*]+\*\*\s*\|\s*(.+)/);
            if (match) metadata.secretaria = match[1].replace(/\|/g, '').trim();
        }
    }

    return metadata;
}

/**
 * Genera el índice de plenos
 */
function generateIndex() {
    console.log('Generando índice de plenos...\n');

    // Verificar que existe el directorio de informes
    if (!fs.existsSync(CONFIG.informesDir)) {
        console.error(`Error: Directorio de informes no encontrado: ${CONFIG.informesDir}`);
        process.exit(1);
    }

    // Leer archivos del directorio
    const files = fs.readdirSync(CONFIG.informesDir);

    // Filtrar y procesar archivos de informes
    const plenos = files
        .filter(f => CONFIG.filePattern.test(f))
        .map(filename => {
            const match = filename.match(CONFIG.filePattern);
            const fecha = match[1];

            console.log(`Procesando: ${filename}`);

            // Leer contenido del archivo
            const filepath = path.join(CONFIG.informesDir, filename);
            const content = fs.readFileSync(filepath, 'utf-8');

            // Extraer metadatos
            const metadata = extractMetadata(content, filename);

            return {
                id: fecha,
                filename: filename,
                fecha: fecha,
                fechaFormateada: formatDate(fecha),
                fechaCorta: formatDateShort(fecha),
                titulo: metadata.fecha ? `Pleno ${metadata.fecha}` : `Pleno ${formatDate(fecha)}`,
                tipo: metadata.tipo,
                duracion: metadata.duracion,
                asistencia: metadata.asistencia
            };
        })
        .sort((a, b) => b.fecha.localeCompare(a.fecha)); // Más reciente primero

    console.log(`\nEncontrados ${plenos.length} plenos\n`);

    // Crear directorio de datos si no existe
    const dataDir = path.dirname(CONFIG.outputFile);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Escribir archivo JSON
    const output = {
        generatedAt: new Date().toISOString(),
        totalPlenos: plenos.length,
        plenos: plenos
    };

    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(output, null, 2));
    console.log(`Índice generado: ${CONFIG.outputFile}`);

    // Mostrar resumen
    console.log('\nResumen de plenos:');
    console.log('─'.repeat(50));
    plenos.forEach(p => {
        console.log(`  ${p.fechaCorta} - ${p.tipo}`);
    });
    console.log('─'.repeat(50));

    return plenos;
}

// NOTA: La generación de hash de password se hace en RUNTIME via entrypoint.sh
// Esto permite cambiar el password sin rebuild de la imagen Docker

// Ejecutar si es script principal
if (require.main === module) {
    console.log('='.repeat(50));
    console.log('  Build Script - Plenos La Zarza');
    console.log('='.repeat(50) + '\n');

    try {
        generateIndex();
        // Password hash se genera en RUNTIME (entrypoint.sh)
        console.log('\n¡Build completado exitosamente!');
        console.log('NOTA: El hash de password se genera al arrancar el contenedor');
    } catch (error) {
        console.error('\nError durante el build:', error);
        process.exit(1);
    }
}

module.exports = { generateIndex };
