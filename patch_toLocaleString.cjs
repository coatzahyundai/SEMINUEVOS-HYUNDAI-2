const fs = require('fs');
let code = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');

code = code.replace(
  /data\[`subtotal_\$\{section === 'mecanica' \? 'mecanica' : section === 'mano_obra' \? 'mo' : 'hyp'\}` as keyof ValuationData\]\?\.toLocaleString\('es-MX', \{minimumFractionDigits:2, maximumFractionDigits:2\}\)/g,
  "Number(data[`subtotal_${section === 'mecanica' ? 'mecanica' : section === 'mano_obra' ? 'mo' : 'hyp'}` as keyof ValuationData] || 0).toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2})"
);

code = code.replace(
  /data\.gran_total\?\.toLocaleString\('es-MX', \{minimumFractionDigits:2, maximumFractionDigits:2\}\)/g,
  "Number(data.gran_total || 0).toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2})"
);

fs.writeFileSync('src/components/ValuationModal.tsx', code);
