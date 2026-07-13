const fs = require('fs');
let code = fs.readFileSync('src/components/TrackingModal.tsx', 'utf8');

const formatDateForInput = `const formatToInput = (dateString?: string) => {
    if (!dateString) return '';
    if (dateString.includes('T')) return dateString.split('T')[0];
    return dateString;
  };`;

code = code.replace(
  /export default function TrackingModal\(\{ item, onClose, onSaved \}: Props\) \{/,
  `export default function TrackingModal({ item, onClose, onSaved }: Props) {\n  ${formatDateForInput}`
);

code = code.replace(/fecha_contrato: item\.fecha_contrato \|\| '',/, `fecha_contrato: formatToInput(item.fecha_contrato),`);
code = code.replace(/fecha_envio_exp: item\.fecha_envio_exp \|\| '',/, `fecha_envio_exp: formatToInput(item.fecha_envio_exp),`);
code = code.replace(/fecha_poliza: item\.fecha_poliza \|\| '',/, `fecha_poliza: formatToInput(item.fecha_poliza),`);
code = code.replace(/fecha_pago_fin: item\.fecha_pago_fin \|\| '',/, `fecha_pago_fin: formatToInput(item.fecha_pago_fin),`);
code = code.replace(/fecha_dev_cliente: item\.fecha_dev_cliente \|\| ''/, `fecha_dev_cliente: formatToInput(item.fecha_dev_cliente)`);

fs.writeFileSync('src/components/TrackingModal.tsx', code);

// For ValuationModal.tsx
let valCode = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');
valCode = valCode.replace(
  /const loadValuation = async \(\) => \{/,
  `const formatToInput = (dateString?: string) => {
    if (!dateString) return '';
    if (dateString.includes('T')) return dateString.split('T')[0];
    return dateString;
  };
  const loadValuation = async () => {`
);
valCode = valCode.replace(
  /if \(res\.data\) \{([\s\S]*?)setData\(res\.data\);/,
  `if (res.data) {
        $1
        res.data.fecha_avaluo = formatToInput(res.data.fecha_avaluo);
        setData(res.data);`
);

fs.writeFileSync('src/components/ValuationModal.tsx', valCode);
