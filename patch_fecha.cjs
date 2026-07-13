const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');

code = code.replace(
  /valData\.fecha_avaluo \|\| "",/,
  'valData.fecha_avaluo ? "\'" + valData.fecha_avaluo : "",'
);

fs.writeFileSync('appscript_final.js', code);
