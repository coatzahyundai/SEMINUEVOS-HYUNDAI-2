const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

const tomaPdfCode = `
  const generateTomaPDF = async (item: InventoryItem) => {
    try {
      const valRes = await fetchAPI('getValuationData', { vin: item.vin });
      const valData = valRes.status === 'success' ? valRes.data : null;
      const granTotal = valData ? valData.gran_total : 0;

      const doc = new jsPDF('landscape'); // Landscape to fit all columns
      doc.setFontSize(10);
      doc.text("Anexo documentación para toma de unidad y formato requerido; favor de confirmar si faltase algún dato:", 14, 20);

      const formatCurrency = (val: any) => {
        if (!val) return '';
        const num = Number(val);
        if (isNaN(num)) return val.toString();
        return '$' + num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      };

      autoTable(doc, {
        startY: 30,
        head: [['Cliente', 'Marca', 'Modelo', 'Línea', 'Versión', 'Kilometraje', 'Serie', 'Precio\\nCompra', 'Precio\\nVenta', 'Precio\\nToma', 'Agencia', 'Asesor', 'Tipo de\\nCompra', 'Recompra']],
        body: [
          [
            { content: item.cliente, rowSpan: 3, styles: { valign: 'middle' } },
            { content: item.marca, rowSpan: 3, styles: { valign: 'middle' } },
            { content: item.modelo, rowSpan: 3, styles: { valign: 'middle' } },
            { content: item.linea || '', rowSpan: 3, styles: { valign: 'middle' } },
            { content: item.version || '', rowSpan: 3, styles: { valign: 'middle' } },
            { content: item.km || '', rowSpan: 3, styles: { valign: 'middle' } },
            { content: item.vin, rowSpan: 3, styles: { valign: 'middle' } },
            { content: formatCurrency(item.precio_compra), rowSpan: 3, styles: { valign: 'middle' } },
            { content: formatCurrency(item.precio_venta), rowSpan: 3, styles: { valign: 'middle' } },
            { content: formatCurrency(item.toma), rowSpan: 3, styles: { valign: 'middle' } },
            { content: '', rowSpan: 3, styles: { valign: 'middle' } }, // Agencia
            { content: item.asesor, rowSpan: 3, styles: { valign: 'middle' } },
            { content: 'DACION ' + formatCurrency(item.dacion) },
            { content: 'MARCA\\n' + (item.rec_marca || '') }
          ],
          [
            { content: 'FINANCIERA ' + formatCurrency(item.liq_financiera) },
            { content: 'MODELO\\n' + (item.rec_modelo || '') }
          ],
          [
            { content: 'DEV CLIENTE ' + formatCurrency(item.dev_cliente) },
            { content: 'SERIE\\n' + (item.rec_vin || '') }
          ]
        ],
        theme: 'grid',
        headStyles: { fillColor: [179, 0, 0], textColor: [255, 255, 255], halign: 'center', valign: 'middle', fontSize: 8 },
        bodyStyles: { textColor: [0, 0, 0], fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1 },
        styles: { cellPadding: 1, overflow: 'linebreak' },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.text(\`La unidad requiere acondicionamiento por \${formatCurrency(granTotal)}\`, 14, finalY);
      doc.text("¡Saludos!", 14, finalY + 10);

      doc.save(\`Toma_\${item.vin}.pdf\`);
    } catch(e) {
      setCustomAlert({ message: 'Error al generar PDF' });
    }
  };
`;

code = code.replace(
  /const generateAvaluoPDF = async \(item: InventoryItem\) => \{[\s\S]*?doc\.save\(\`Presupuesto_\$\{item\.vin\}\.pdf\`\);\s*\}\ catch\(e\) \{\s*setCustomAlert\(\{ message: 'Error al generar PDF' \}\);\s*\}\s*\};\s*/,
  match => match + '\n' + tomaPdfCode + '\n'
);

fs.writeFileSync('src/components/Section3.tsx', code);
