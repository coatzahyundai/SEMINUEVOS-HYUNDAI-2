const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /body: items\.map\(i => \[i\.descripcion, `\\$\$\{i\.importe\}`\]\),\s*foot: \[\['Subtotal', `\\$\$\{subtotal\}`\]\],\s*theme: 'grid',\s*headStyles: \{ fillColor: \[0, 44, 95\] \}/g,
  `body: items.map(i => [i.descripcion, \`$\${Number(i.importe).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`]),
            foot: [['Subtotal', \`$\${Number(subtotal).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`]],
            theme: 'grid',
            headStyles: { fillColor: [0, 44, 95] },
            columnStyles: { 1: { halign: 'right' } }`
);

code = code.replace(
  /doc\.text\(`Subtotal General: \\$\$\{sub\.toFixed\(2\)\}`, 140, startY\);\s*doc\.text\(`I\.V\.A \(16%\): \\$\$\{iva\.toFixed\(2\)\}`, 140, startY \+ 5\);\s*doc\.setFont\("helvetica", "bold"\);\s*doc\.text\(`Gran Total: \\$\$\{\(valData\.gran_total \|\| 0\)\.toFixed\(2\)\}`, 140, startY \+ 10\);/,
  `doc.text(\`Subtotal General: $\${sub.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`, 140, startY);
        doc.text(\`I.V.A (16%): $\${iva.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`, 140, startY + 5);
        doc.setFont("helvetica", "bold");
        doc.text(\`Gran Total: $\${(valData.gran_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`, 140, startY + 10);
        
        if (valData.observaciones) {
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text("Observaciones:", 14, startY + 25);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          const splitObs = doc.splitTextToSize(valData.observaciones, 180);
          doc.text(splitObs, 14, startY + 30);
        }`
);

fs.writeFileSync('src/components/Section3.tsx', code);
