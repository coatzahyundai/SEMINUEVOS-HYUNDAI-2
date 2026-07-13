const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /<option value="Poliza">Poliza<\/option>/,
  '<option value="Poliza">Póliza</option>'
);

fs.writeFileSync('src/components/Section3.tsx', code);
