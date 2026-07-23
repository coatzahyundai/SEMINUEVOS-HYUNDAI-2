const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

// Replace copyTomaEmail html
code = code.replace(
  /\$\{valData \? \`\n          <br\/>\n          <p><strong>Descuento por Avalúo Técnico:<\/strong> \$\{formatCurrency\(granTotal\)\}<\/p>\n          \` : ''\}/,
  `<br/>
          <p>La unidad requiere acondicionamiento por \${formatCurrency(granTotal)}</p>
          <br/>
          <p>¡Saludos!</p>`
);

fs.writeFileSync('src/components/Section3.tsx', code);
