const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /return \(statusFilter === 'ALL' \|\| item\.estatus === statusFilter\);/,
  `if (user.role === 'servicio' && (statusFilter === 'Avalúo Listo' || statusFilter === 'Avalúo Rechazado')) {
      // In historical view for Servicio, we check the estatus_avaluo from the Avaluos sheet, 
      // which we joined in the backend and passed down as estatus_avaluo
      return item.estatus_avaluo?.toUpperCase() === statusFilter.toUpperCase() || item.estatus === statusFilter;
    }
    return (statusFilter === 'ALL' || item.estatus === statusFilter);`
);

fs.writeFileSync('src/components/Section3.tsx', code);
