const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /body: items\.map\(i => \[i\.descripcion, `\$\{Number/g,
  "body: items.map(i => [i.descripcion, `$${Number"
);
code = code.replace(
  /foot: \[\['Subtotal', `\$\{Number/g,
  "foot: [['Subtotal', `$${Number"
);
code = code.replace(
  /doc\.text\(`Subtotal General: \$\{sub\.toLocaleString/g,
  "doc.text(`Subtotal General: $${sub.toLocaleString"
);
code = code.replace(
  /doc\.text\(`I\.V\.A \(16%\): \$\{iva\.toLocaleString/g,
  "doc.text(`I.V.A (16%): $${iva.toLocaleString"
);
code = code.replace(
  /doc\.text\(`Gran Total: \$\{\(valData\.gran_total/g,
  "doc.text(`Gran Total: $${(valData.gran_total"
);

fs.writeFileSync('src/components/Section3.tsx', code);
