const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /\{user\.role === 'gerencia' && <option value="Envío de Expediente">Envío de Expediente<\/option>\}/g,
  `<option value="Envío de Expediente">Envío de Expediente</option>`
);
code = code.replace(
  /\{user\.role === 'gerencia' && <option value="Envío de Contrato">Envío de Contrato<\/option>\}/g,
  `<option value="Envío de Contrato">Envío de Contrato</option>`
);
code = code.replace(
  /\{user\.role === 'gerencia' && <option value="Poliza">Poliza<\/option>\}/g,
  `<option value="Poliza">Poliza</option>`
);
code = code.replace(
  /\{user\.role === 'gerencia' && <option value="Liquidación">Liquidación<\/option>\}/g,
  `<option value="Liquidación">Liquidación</option>`
);

fs.writeFileSync('src/components/Section3.tsx', code);
