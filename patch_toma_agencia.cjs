const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /\{ content: '', rowSpan: 3, styles: \{ valign: 'middle' \} \}, \/\/ Agencia/,
  `{ content: 'HYUNDAI COATZACOALCOS', rowSpan: 3, styles: { valign: 'middle' } }, // Agencia`
);

fs.writeFileSync('src/components/Section3.tsx', code);
