const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /return item\.estatus_avaluo\?\.toUpperCase\(\) === statusFilter\.toUpperCase\(\) \|\| item\.estatus === statusFilter;/,
  `const aVal = (item.estatus_avaluo || '').toUpperCase();
      if (statusFilter === 'Avalúo Listo' && (aVal === 'AVALÚO LISTO' || aVal === 'AVALUO LISTO' || aVal === 'AVALUO TERMINADO' || aVal === 'AVALÚO TERMINADO')) return true;
      if (statusFilter === 'Avalúo Rechazado' && (aVal === 'AVALÚO RECHAZADO' || aVal === 'AVALUO RECHAZADO' || aVal === 'AUTO RECHAZADO')) return true;
      return item.estatus === statusFilter;`
);

fs.writeFileSync('src/components/Section3.tsx', code);
