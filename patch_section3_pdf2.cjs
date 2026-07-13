const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  "doc.text(`\\${Number(valData.gran_total || 0).toLocaleString('en-US'",
  "doc.text(`$${Number(valData.gran_total || 0).toLocaleString('en-US'"
);

fs.writeFileSync('src/components/Section3.tsx', code);
