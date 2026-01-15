/* ===========================================
   MARKDOWN-PARSER.JS - Parser de Markdown a HTML
   =========================================== */

const MarkdownParser = {
    /**
     * Parsea un documento Markdown completo a HTML
     */
    parse(markdown) {
        const lines = markdown.split('\n');
        let html = '';
        let i = 0;
        let currentSection = null;

        while (i < lines.length) {
            const line = lines[i];

            // Línea vacía
            if (line.trim() === '') {
                i++;
                continue;
            }

            // Separador horizontal
            if (line.trim() === '---') {
                if (currentSection) {
                    html += '</div></div>'; // Cerrar section-content y pleno-section
                    currentSection = null;
                }
                i++;
                continue;
            }

            // Headers H1-H4
            const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
            if (headerMatch) {
                const level = headerMatch[1].length;
                const text = this.parseInline(headerMatch[2]);

                if (level === 1) {
                    // H1 - Título principal del documento
                    html += `<h1 class="pleno-main-title">${text}</h1>`;
                } else if (level === 2) {
                    // H2 - Sección principal
                    if (currentSection) {
                        html += '</div>'; // Cerrar sección anterior
                    }
                    const sectionType = Utils.detectSectionType(headerMatch[2]);
                    const sectionConfig = Utils.getSectionConfig(sectionType);
                    currentSection = sectionType;

                    html += `
                        <div class="pleno-section" data-section="${sectionType}">
                            <div class="section-header" style="background: ${sectionConfig.bgColor}; border-left-color: ${sectionConfig.color};">
                                <h2 class="section-title">
                                    <span class="material-icons-round section-icon" style="color: ${sectionConfig.color};">${sectionConfig.icon}</span>
                                    ${text}
                                </h2>
                            </div>
                            <div class="section-content">
                    `;
                } else if (level === 3) {
                    // H3 - Subsección
                    html += `<h3 class="subsection-title">${text}</h3>`;
                } else if (level === 4) {
                    // H4 - Sub-subsección
                    html += `<h4 class="subsubsection-title">${text}</h4>`;
                }

                i++;
                continue;
            }

            // Tabla
            if (line.trim().startsWith('|')) {
                const tableResult = this.parseTable(lines, i);
                html += tableResult.html;
                i = tableResult.endIndex;
                continue;
            }

            // Lista no ordenada
            if (line.match(/^[-*]\s+/)) {
                const listResult = this.parseList(lines, i);
                html += listResult.html;
                i = listResult.endIndex;
                continue;
            }

            // Texto en cursiva (notas, referencias)
            if (line.trim().startsWith('*') && line.trim().endsWith('*') && !line.includes('**')) {
                const noteText = this.parseInline(line.trim().slice(1, -1));
                html += `<p class="note-text"><em>${noteText}</em></p>`;
                i++;
                continue;
            }

            // Párrafo normal
            const paragraphText = this.parseInline(line);
            html += `<p>${paragraphText}</p>`;
            i++;
        }

        // Cerrar última sección si existe
        if (currentSection) {
            html += '</div></div>';
        }

        return html;
    },

    /**
     * Parsea elementos inline (negrita, cursiva, código, enlaces)
     */
    parseInline(text) {
        let result = Utils.escapeHtml(text);

        // Negrita: **texto**
        result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Cursiva: *texto*
        result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Código inline: `texto`
        result = result.replace(/`(.+?)`/g, '<code>$1</code>');

        // Formatear importes monetarios
        result = this.formatCurrencyInText(result);

        // Formatear porcentajes
        result = this.formatPercentages(result);

        // Referencias normativas
        result = this.formatLegalReferences(result);

        return result;
    },

    /**
     * Parsea una tabla Markdown
     */
    parseTable(lines, startIndex) {
        let i = startIndex;
        const rows = [];

        // Recolectar todas las filas de la tabla
        while (i < lines.length && lines[i].trim().startsWith('|')) {
            rows.push(lines[i]);
            i++;
        }

        if (rows.length < 2) {
            return { html: '', endIndex: i };
        }

        // Parsear encabezados (primera fila)
        const headers = this.parseTableRow(rows[0]);

        // Saltar fila separadora (segunda fila con ---)
        let dataStartIndex = 1;
        if (rows[1] && rows[1].includes('---')) {
            dataStartIndex = 2;
        }

        // Parsear filas de datos
        const dataRows = rows.slice(dataStartIndex).map(row => this.parseTableRow(row));

        // Detectar tipo de tabla para estilos especiales
        const tableType = this.detectTableType(headers);

        // Generar HTML
        let html = `<div class="table-wrapper"><table class="data-table ${tableType}">`;

        // Thead
        html += '<thead><tr>';
        headers.forEach(header => {
            const headerText = this.parseInline(header);
            const isNumeric = this.isNumericColumn(header);
            html += `<th class="${isNumeric ? 'numeric' : ''}">${headerText}</th>`;
        });
        html += '</tr></thead>';

        // Tbody
        html += '<tbody>';
        dataRows.forEach((row, rowIndex) => {
            // Detectar si es fila de total
            const isTotal = row.some(cell =>
                cell.toLowerCase().includes('total') ||
                cell.startsWith('**')
            );

            html += `<tr class="${isTotal ? 'total-row' : ''}">`;
            row.forEach((cell, cellIndex) => {
                const cellText = this.parseInline(cell);
                const isNumeric = this.isNumericCell(cell);

                // Detectar estado para colorear
                const statusClass = this.detectCellStatus(cell);

                html += `<td class="${isNumeric ? 'numeric' : ''} ${statusClass}">${cellText}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';

        return { html, endIndex: i };
    },

    /**
     * Parsea una fila de tabla
     */
    parseTableRow(row) {
        return row
            .split('|')
            .filter((_, index, arr) => index > 0 && index < arr.length - 1)
            .map(cell => cell.trim());
    },

    /**
     * Detecta el tipo de tabla basado en los encabezados
     */
    detectTableType(headers) {
        const headerText = headers.join(' ').toLowerCase();

        if (headerText.includes('votaci') || headerText.includes('resultado')) {
            return 'table-votaciones';
        }
        if (headerText.includes('importe') || headerText.includes('presupuesto') || headerText.includes('coste')) {
            return 'table-financiera';
        }
        if (headerText.includes('indicador') || headerText.includes('cumple')) {
            return 'table-indicadores';
        }
        if (headerText.includes('alerta') || headerText.includes('nivel')) {
            return 'table-alertas';
        }

        return 'table-default';
    },

    /**
     * Detecta si una columna debería ser numérica
     */
    isNumericColumn(header) {
        const numericKeywords = ['importe', 'total', 'coste', 'valor', '%', 'cantidad', 'número', 'nº'];
        const headerLower = header.toLowerCase();
        return numericKeywords.some(keyword => headerLower.includes(keyword));
    },

    /**
     * Detecta si una celda contiene valor numérico
     */
    isNumericCell(cell) {
        // Detectar números, porcentajes o importes
        return /[\d.,]+\s*(€|EUR|%|MWh|MW|unidad)/i.test(cell) ||
               /^\d+[\d.,]*$/.test(cell.trim());
    },

    /**
     * Detecta el estado de una celda para colorearla
     */
    detectCellStatus(cell) {
        const cellLower = cell.toLowerCase();

        if (cellLower === 'sí' || cellLower === 'si' || cellLower.includes('cumple') ||
            cellLower.includes('aprobad') || cellLower.includes('unanimidad')) {
            return 'status-success';
        }
        if (cellLower === 'no' || cellLower.includes('no cumple') || cellLower.includes('incumpl')) {
            return 'status-error';
        }
        if (cellLower.includes('pendiente') || cellLower.includes('en tramit') ||
            cellLower.includes('prórroga') || cellLower.includes('prorroga')) {
            return 'status-warning';
        }
        if (cellLower.includes('crítico') || cellLower.includes('critico')) {
            return 'status-error';
        }
        if (cellLower.includes('positivo')) {
            return 'status-success';
        }
        if (cellLower.includes('atencion') || cellLower.includes('atención')) {
            return 'status-warning';
        }

        return '';
    },

    /**
     * Parsea una lista no ordenada
     */
    parseList(lines, startIndex) {
        let i = startIndex;
        let html = '<ul class="info-list">';

        while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
            const itemText = lines[i].replace(/^[-*]\s+/, '');
            html += `<li>${this.parseInline(itemText)}</li>`;
            i++;
        }

        html += '</ul>';
        return { html, endIndex: i };
    },

    /**
     * Formatea importes monetarios en el texto
     */
    formatCurrencyInText(text) {
        // Patrón para importes: XXX.XXX,XX € o EUR
        const pattern = /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(€|EUR)/g;

        return text.replace(pattern, (match, amount, currency) => {
            return `<span class="currency">${amount} ${currency}</span>`;
        });
    },

    /**
     * Formatea porcentajes
     */
    formatPercentages(text) {
        // Patrón para porcentajes: XX,X% o XX%
        const pattern = /(\d+(?:,\d+)?)\s*%/g;

        return text.replace(pattern, (match, value) => {
            return `<span class="percentage">${value}%</span>`;
        });
    },

    /**
     * Formatea referencias a legislación
     */
    formatLegalReferences(text) {
        // Patrón: Art. XX XXXX o Art. XX Ley X/XXXX
        const pattern = /Art\.?\s*(\d+(?:\.\d+)?)\s+([A-Z]{2,}(?:\s*\d+\/\d{4})?)/g;

        return text.replace(pattern, (match, article, law) => {
            return `<span class="legal-ref" title="Artículo ${article} ${law}">Art. ${article} ${law}</span>`;
        });
    },

    /**
     * Extrae un resumen del contenido para preview
     */
    extractSummary(markdown, maxLength = 200) {
        // Buscar el primer párrafo después del título
        const lines = markdown.split('\n');
        let summary = '';

        for (const line of lines) {
            // Saltar headers, tablas, listas
            if (line.startsWith('#') || line.startsWith('|') || line.startsWith('-') ||
                line.startsWith('*') || line.trim() === '---' || line.trim() === '') {
                continue;
            }

            summary = Utils.cleanMarkdownText(line);
            if (summary.length > 0) break;
        }

        if (summary.length > maxLength) {
            summary = summary.substring(0, maxLength) + '...';
        }

        return summary;
    }
};

// Congelar para evitar modificaciones
Object.freeze(MarkdownParser);
