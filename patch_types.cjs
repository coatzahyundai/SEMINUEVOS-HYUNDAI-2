const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  /estatus: string;/,
  `estatus: string;\n  estatus_avaluo?: string;`
);

fs.writeFileSync('src/types.ts', code);
