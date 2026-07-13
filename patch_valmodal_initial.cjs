const fs = require('fs');
let code = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');

code = code.replace(
  /estatus_avaluo: 'AVALUO TERMINADO',/,
  `estatus_avaluo: 'Avalúo Listo',`
);

fs.writeFileSync('src/components/ValuationModal.tsx', code);
