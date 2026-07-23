const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

const generateAvaluoPDFCode = `
  const generateAvaluoPDF = async (item: InventoryItem) => {
    try {
      const valRes = await fetchAPI('getValuationData', { vin: item.vin });
      const valData = valRes.status === 'success' ? valRes.data : null;
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Presupuesto de Avalúo", 14, 20);
      
      doc.setFontSize(10);
      doc.text(\`Cliente: \${item.cliente}\`, 14, 30);
      doc.text(\`VIN: \${item.vin}\`, 14, 35);
      doc.text(\`Vehículo: \${item.marca} \${item.linea} \${item.modelo}\`, 14, 40);
      doc.text(\`Asesor: \${item.asesor}\`, 14, 45);
      
      if (valData) {
        doc.text(\`Valuador Técnico: \${valData.valuador_tecnico || 'N/A'}\`, 14, 55);
        doc.text(\`Fecha Avalúo: \${valData.fecha_avaluo || 'N/A'}\`, 14, 60);
        let startY = 70;
        const addSection = (title: string, items: any[], subtotal: number) => {
          if (!items || items.length === 0) return;
          doc.text(title, 14, startY);
          autoTable(doc, {
            startY: startY + 2,
            head: [['Descripción', 'Importe']],
            body: items.map(i => [i.descripcion, \`\${Number(i.importe).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`]),
            foot: [['Subtotal', \`\${Number(subtotal).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`]],
            theme: 'grid',
            headStyles: { fillColor: [0, 44, 95] },
            columnStyles: { 1: { halign: 'right' } }
          });
          startY = (doc as any).lastAutoTable.finalY + 10;
        };
        addSection('Mecánica', valData.mecanica, valData.subtotal_mecanica);
        addSection('Mano de Obra', valData.mano_obra, valData.subtotal_mo);
        addSection('Hojalatería y Pintura (HYP)', valData.hyp, valData.subtotal_hyp);
        const sub = (Number(valData.subtotal_mecanica) || 0) + (Number(valData.subtotal_mo) || 0) + (Number(valData.subtotal_hyp) || 0);
        const iva = sub * 0.16;
        
        doc.setFont("helvetica", "normal");
        doc.text("Subtotal General:", 140, startY);
        doc.text(\`\${sub.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`, 196, startY, { align: 'right' });
        doc.text("I.V.A (16%):", 140, startY + 5);
        doc.text(\`\${iva.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`, 196, startY + 5, { align: 'right' });
        doc.setFont("helvetica", "bold");
        doc.text("Gran Total:", 140, startY + 10);
        doc.text(\`\${Number(valData.gran_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`, 196, startY + 10, { align: 'right' });
        
        if (valData.observaciones) {
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text("Observaciones:", 14, startY + 25);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          const splitObs = doc.splitTextToSize(valData.observaciones, 180);
          doc.text(splitObs, 14, startY + 30);
        }
      } else {
        doc.text("No hay datos de presupuesto cargados.", 14, 60);
      }
      
      doc.save(\`Presupuesto_\${item.vin}.pdf\`);
    } catch(e) {
      setCustomAlert({ message: 'Error al generar PDF' });
    }
  };

  const copyTomaEmail = async`;

code = code.replace(/const copyAvaluoEmail = async[\s\S]*?const copyTomaEmail = async/, generateAvaluoPDFCode);

const oldButton = `{(user.role === 'servicio' || user.role === 'gerencia') && <button 
                            onClick={() => copyAvaluoEmail(item)}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors disabled:opacity-30"
                            title="Copiar Avalúo para Correo"
                          >
                            <Copy size={16} />
                          </button>}`;

const newButton = `{(user.role === 'servicio' || user.role === 'gerencia') && <button 
                            onClick={() => generateAvaluoPDF(item)}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors disabled:opacity-30"
                            title="Imprimir PDF Avalúo"
                          >
                            <FileDown size={16} />
                          </button>}`;

code = code.replace(oldButton, newButton);

fs.writeFileSync('src/components/Section3.tsx', code);
