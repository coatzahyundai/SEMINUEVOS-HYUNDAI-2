const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /const sub = \(valData\.subtotal_mecanica \|\| 0\) \+ \(valData\.subtotal_mo \|\| 0\) \+ \(valData\.subtotal_hyp \|\| 0\);/,
  "const sub = (Number(valData.subtotal_mecanica) || 0) + (Number(valData.subtotal_mo) || 0) + (Number(valData.subtotal_hyp) || 0);"
);

code = code.replace(
  /doc\.text\(`\$\{\(valData\.gran_total \|\| 0\)\.toLocaleString\('en-US'/g,
  "doc.text(`\\${Number(valData.gran_total || 0).toLocaleString('en-US'"
);

fs.writeFileSync('src/components/Section3.tsx', code);
