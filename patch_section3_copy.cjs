const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

const regex = /const generateAvaluoPDF = async/;

const copyFunctions = `
  const copyHTMLToClipboard = (htmlContent: string) => {
    const el = document.createElement('div');
    el.innerHTML = htmlContent;
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    selection?.removeAllRanges();
    selection?.addRange(range);
    try {
      document.execCommand('copy');
      setCustomAlert({ message: 'Formato copiado al portapapeles. ¡Listo para pegar en tu correo!' });
    } catch (e) {
      setCustomAlert({ message: 'Error al copiar al portapapeles.' });
    }
    selection?.removeAllRanges();
    document.body.removeChild(el);
  };

  const copyAvaluoEmail = async (item: InventoryItem) => {
    try {
      const valRes = await fetchAPI('getValuationData', { vin: item.vin });
      const valData = valRes.status === 'success' ? valRes.data : null;
      
      if (!valData) {
        setCustomAlert({ message: 'No hay datos de presupuesto cargados para copiar.' });
        return;
      }

      const formatCurrency = (val: any) => {
        if (!val) return '';
        const num = Number(val);
        if (isNaN(num)) return val.toString();
        return '$' + num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      };

      let tablesHtml = '';
      const addSection = (title: string, items: any[], subtotal: number) => {
        if (!items || items.length === 0) return;
        tablesHtml += \`
          <h4 style="margin: 10px 0 5px 0;">\${title}</h4>
          <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; border: 1px solid #000; font-size: 11px;">
            <thead>
              <tr style="background-color: #002c5f; color: #ffffff;">
                <th style="text-align: left;">Descripción</th>
                <th style="text-align: right;">Importe</th>
              </tr>
            </thead>
            <tbody>
              \${items.map(i => \`
                <tr>
                  <td style="text-align: left;">\${i.descripcion}</td>
                  <td style="text-align: right;">\${formatCurrency(i.importe)}</td>
                </tr>
              \`).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight: bold; background-color: #f3f4f6;">
                <td style="text-align: right;">Subtotal</td>
                <td style="text-align: right;">\${formatCurrency(subtotal)}</td>
              </tr>
            </tfoot>
          </table>
        \`;
      };

      addSection('Mecánica', valData.mecanica, valData.subtotal_mecanica);
      addSection('Mano de Obra', valData.mano_obra, valData.subtotal_mo);
      addSection('Hojalatería y Pintura (HYP)', valData.hyp, valData.subtotal_hyp);

      const sub = (Number(valData.subtotal_mecanica) || 0) + (Number(valData.subtotal_mo) || 0) + (Number(valData.subtotal_hyp) || 0);
      const iva = sub * 0.16;
      const granTotal = Number(valData.gran_total || 0);

      const html = \`
        <div style="font-family: Arial, sans-serif; font-size: 12px; color: #000; max-width: 800px;">
          <h2>Presupuesto de Avalúo</h2>
          <p>
            <strong>Cliente:</strong> \${item.cliente}<br/>
            <strong>VIN:</strong> \${item.vin}<br/>
            <strong>Vehículo:</strong> \${item.marca} \${item.linea} \${item.modelo}<br/>
            <strong>Asesor:</strong> \${item.asesor}<br/>
            <strong>Valuador Técnico:</strong> \${valData.valuador_tecnico || 'N/A'}<br/>
            <strong>Fecha Avalúo:</strong> \${valData.fecha_avaluo || 'N/A'}
          </p>
          
          \${tablesHtml}
          
          <table border="0" cellpadding="5" cellspacing="0" style="width: 100%; font-size: 12px; margin-top: 15px;">
            <tr>
              <td style="text-align: right; width: 70%;"><strong>Subtotal General:</strong></td>
              <td style="text-align: right; width: 30%;">\${formatCurrency(sub)}</td>
            </tr>
            <tr>
              <td style="text-align: right;"><strong>I.V.A (16%):</strong></td>
              <td style="text-align: right;">\${formatCurrency(iva)}</td>
            </tr>
            <tr>
              <td style="text-align: right; font-size: 14px;"><strong>Gran Total:</strong></td>
              <td style="text-align: right; font-size: 14px;"><strong>\${formatCurrency(granTotal)}</strong></td>
            </tr>
          </table>
          
          \${valData.observaciones ? \`
            <div style="margin-top: 20px;">
              <strong>Observaciones:</strong><br/>
              <p style="white-space: pre-wrap;">\${valData.observaciones}</p>
            </div>
          \` : ''}
        </div>
      \`;
      copyHTMLToClipboard(html);
    } catch (e) {
      setCustomAlert({ message: 'Error al generar formato de correo.' });
    }
  };

  const copyTomaEmail = async (item: InventoryItem) => {
    try {
      const valRes = await fetchAPI('getValuationData', { vin: item.vin });
      const valData = valRes.status === 'success' ? valRes.data : null;
      const granTotal = valData ? valData.gran_total : 0;
      
      const formatCurrency = (val: any) => {
        if (!val) return '';
        const num = Number(val);
        if (isNaN(num)) return val.toString();
        return '$' + num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      };

      const html = \`
        <div style="font-family: Arial, sans-serif; font-size: 12px; color: #000;">
          <p><strong>Anexo documentación para toma de unidad y formato requerido; favor de confirmar si faltase algún dato:</strong></p>
          <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; text-align: center; width: 100%; border: 1px solid #000;">
            <thead>
              <tr style="background-color: #b30000; color: #ffffff; font-size: 11px;">
                <th>Cliente</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Línea</th>
                <th>Versión</th>
                <th>Kilometraje</th>
                <th>Serie</th>
                <th>Precio Compra</th>
                <th>Precio Venta</th>
                <th>Precio Toma</th>
                <th>Agencia</th>
                <th>Asesor</th>
                <th>Tipo de Compra</th>
                <th>Recompra</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">\${item.cliente || ''}</td>
                <td rowspan="3">\${item.marca || ''}</td>
                <td rowspan="3">\${item.modelo || ''}</td>
                <td rowspan="3">\${item.linea || ''}</td>
                <td rowspan="3">\${item.version || ''}</td>
                <td rowspan="3">\${item.km || ''}</td>
                <td rowspan="3">\${item.vin || ''}</td>
                <td rowspan="3">\${formatCurrency(item.precio_compra)}</td>
                <td rowspan="3">\${formatCurrency(item.precio_venta)}</td>
                <td rowspan="3">\${formatCurrency(item.toma)}</td>
                <td rowspan="3">HYUNDAI COATZACOALCOS</td>
                <td rowspan="3">\${item.asesor || ''}</td>
                <td>DACION \${formatCurrency(item.dacion)}</td>
                <td>MARCA<br/>\${item.rec_marca || ''}</td>
              </tr>
              <tr>
                <td>FINANCIERA \${formatCurrency(item.liq_financiera)}</td>
                <td>MODELO<br/>\${item.rec_modelo || ''}</td>
              </tr>
              <tr>
                <td>DEV CLIENTE \${formatCurrency(item.dev_cliente)}</td>
                <td>SERIE<br/>\${item.rec_vin || ''}</td>
              </tr>
            </tbody>
          </table>
          \${valData ? \`
          <br/>
          <p><strong>Descuento por Avalúo Técnico:</strong> \${formatCurrency(granTotal)}</p>
          \` : ''}
        </div>
      \`;
      copyHTMLToClipboard(html);
    } catch (e) {
      setCustomAlert({ message: 'Error al generar formato de correo.' });
    }
  };

  const generateAvaluoPDF = async`;

code = code.replace(regex, copyFunctions);
fs.writeFileSync('src/components/Section3.tsx', code);
