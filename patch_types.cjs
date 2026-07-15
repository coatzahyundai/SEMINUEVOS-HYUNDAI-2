const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  /asesor: string;/g,
  'asesor: string;\n  color?: string;'
);

fs.writeFileSync('src/types.ts', code);
