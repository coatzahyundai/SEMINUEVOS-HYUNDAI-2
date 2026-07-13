const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');

code = code.replace(
  /if \(nivel === "servicio" && obj\.estatus !== ESTATUS\.AVALUO_SOLICITADO && obj\.estatus !== ESTATUS\.AVALUO_LISTO && obj\.estatus !== "Avalúo Rechazado"\) continue;/,
  `// if (nivel === "servicio") we let them see all, the UI will filter by default`
);

fs.writeFileSync('appscript_final.js', code);
