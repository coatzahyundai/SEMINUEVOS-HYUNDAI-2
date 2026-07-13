const fs = require('fs');
let code = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');

const formatFunc = `
  const formatToInput = (dateString?: string) => {
    if (!dateString) return '';
    if (dateString.includes('T')) return dateString.split('T')[0];
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) return \`\${parts[2]}-\${parts[1]}-\${parts[0]}\`;
    }
    return dateString;
  };
`;

code = code.replace(
  "  const isLocked = (item.estatus === 'Poliza' || item.estatus === 'Liquidación') && user?.role !== 'gerencia';",
  "  const isLocked = (item.estatus === 'Poliza' || item.estatus === 'Liquidación') && user?.role !== 'gerencia';\n" + formatFunc
);

code = code.replace(
  "setData(res.data);",
  "const d = res.data;\n        if (d.fecha_avaluo) { d.fecha_avaluo = formatToInput(d.fecha_avaluo); }\n        setData(d);"
);

fs.writeFileSync('src/components/ValuationModal.tsx', code);
