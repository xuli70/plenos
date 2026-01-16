/* ===========================================
   DATA-LOADER.JS - Carga de Plenos
   =========================================== */

const DataLoader = {
    plenos: [],
    loaded: false,

    /**
     * Carga el índice de plenos y sus contenidos
     */
    async loadAll() {
        try {
            // Cargar índice de plenos
            await this.loadIndex();

            // Cargar contenido de cada pleno
            await this.loadPlenosContent();

            this.loaded = true;
            return this.plenos;

        } catch (error) {
            console.error('Error cargando datos:', error);
            throw error;
        }
    },

    /**
     * Carga el archivo de índice plenos.json
     */
    async loadIndex() {
        try {
            const response = await fetch(CONFIG.paths.plenosIndex);

            if (!response.ok) {
                // Si no existe plenos.json, escanear archivos MD directamente
                console.warn('plenos.json no encontrado, escaneando archivos...');
                await this.scanInformes();
                return;
            }

            const data = await response.json();
            this.plenos = data.plenos || [];

        } catch (error) {
            console.warn('Error cargando índice, escaneando archivos:', error);
            await this.scanInformes();
        }
    },

    /**
     * Escanea archivos INFORME_ECO_*.md directamente
     * (Fallback si no existe plenos.json)
     */
    async scanInformes() {
        // Lista de archivos conocidos (actualizar según sea necesario)
        const knownFiles = [
            'INFORME_ECO_2024-12-26.md',
            'INFORME_ECO_2025-01-13.md',
            'INFORME_ECO_2025-02-05.md',
            'INFORME_ECO_2025-04-25.md',
            'INFORME_ECO_2025-05-16.md',
            'INFORME_ECO_2025-06-26.md',
            'INFORME_ECO_2025-07-28.md',
            'INFORME_ECO_2025-11-24.md'
        ];

        this.plenos = knownFiles.map(filename => {
            const fecha = Utils.extractDateFromFilename(filename);
            return {
                id: fecha,
                filename: filename,
                fecha: fecha,
                fechaFormateada: Utils.formatDate(fecha),
                fechaCorta: Utils.formatDateShort(fecha),
                titulo: `Pleno ${Utils.formatDate(fecha)}`,
                tipo: 'Por determinar',
                content: null,
                htmlContent: null
            };
        }).sort((a, b) => b.fecha.localeCompare(a.fecha)); // Más reciente primero
    },

    /**
     * Carga el contenido MD de cada pleno (economico y politico)
     */
    async loadPlenosContent() {
        const promises = this.plenos.map(async (pleno) => {
            try {
                // Cargar informe economico
                const response = await fetch(`${CONFIG.paths.informes}${pleno.filename}`);

                if (!response.ok) {
                    console.warn(`No se pudo cargar ${pleno.filename}`);
                    return;
                }

                const content = await response.text();
                pleno.content = content;

                // Extraer metadatos
                const metadata = Utils.extractMetadata(content);
                pleno.tipo = metadata.tipo || pleno.tipo;
                pleno.duracion = metadata.duracion;
                pleno.asistencia = metadata.asistencia;

                // Parsear a HTML
                pleno.htmlContent = MarkdownParser.parse(content);

                // Obtener tipo de pleno para badge
                pleno.tipoInfo = Utils.getPlenoType(pleno.tipo);

                // Cargar informe politico (si existe)
                await this._loadPoliticalContent(pleno);

            } catch (error) {
                console.error(`Error cargando ${pleno.filename}:`, error);
            }
        });

        await Promise.all(promises);

        // Filtrar plenos que no se pudieron cargar
        this.plenos = this.plenos.filter(p => p.htmlContent !== null);
    },

    /**
     * Carga el contenido del informe politico de un pleno
     */
    async _loadPoliticalContent(pleno) {
        if (!pleno.politicalFilename) {
            pleno.politicalContent = null;
            pleno.politicalHtmlContent = null;
            return;
        }

        try {
            const politicalUrl = `${CONFIG.paths.informesPoliticos}${pleno.politicalFilename}`;
            const response = await fetch(politicalUrl);

            if (!response.ok) {
                console.warn(`No se encontro informe politico: ${pleno.politicalFilename}`);
                pleno.politicalContent = null;
                pleno.politicalHtmlContent = null;
                return;
            }

            const content = await response.text();
            pleno.politicalContent = content;
            pleno.politicalHtmlContent = MarkdownParser.parse(content);

        } catch (error) {
            console.warn(`Error cargando informe politico ${pleno.politicalFilename}:`, error);
            pleno.politicalContent = null;
            pleno.politicalHtmlContent = null;
        }
    },

    /**
     * Obtiene un pleno por su ID
     */
    getPleno(id) {
        return this.plenos.find(p => p.id === id);
    },

    /**
     * Obtiene todos los plenos
     */
    getAllPlenos() {
        return this.plenos;
    },

    /**
     * Obtiene el número total de plenos
     */
    getCount() {
        return this.plenos.length;
    },

    /**
     * Obtiene estadísticas generales
     */
    getStats() {
        return {
            total: this.plenos.length,
            ordinarios: this.plenos.filter(p => p.tipoInfo?.class === 'ordinario').length,
            extraordinarios: this.plenos.filter(p => p.tipoInfo?.class === 'extraordinario').length,
            urgentes: this.plenos.filter(p => p.tipoInfo?.class === 'urgente').length
        };
    }
};

