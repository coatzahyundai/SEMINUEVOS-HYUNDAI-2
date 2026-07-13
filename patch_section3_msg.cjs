const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /setCustomAlert\(\{ message: 'No hay archivos válidos para combinar o ocurrió un error.' \}\);/,
  "setCustomAlert({ message: res.message || 'No hay archivos válidos para combinar o ocurrió un error del servidor.' });"
);

fs.writeFileSync('src/components/Section3.tsx', code);
