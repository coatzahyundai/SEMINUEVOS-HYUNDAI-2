const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /const isLocked = item\.estatus === 'Poliza'; \/\/ Lock editing and uploading once it's Poliza/,
  `const isLocked = item.estatus === 'Poliza' && user.role !== 'gerencia';`
);

fs.writeFileSync('src/components/Section3.tsx', code);
