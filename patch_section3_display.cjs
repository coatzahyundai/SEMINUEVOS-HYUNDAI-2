const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /<option value=\{item\.estatus\}>\{item\.estatus\}<\/option>/,
  "<option value={item.estatus}>{item.estatus === 'Poliza' ? 'Póliza' : item.estatus}</option>"
);

code = code.replace(
  /<option key=\{opt\} value=\{opt\}>\{opt\}<\/option>/,
  "<option key={opt} value={opt}>{opt === 'Poliza' ? 'Póliza' : opt}</option>"
);

fs.writeFileSync('src/components/Section3.tsx', code);
