const fs = require('fs');
let code = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');

const regex = /const formatToInput = \([\s\S]*?return dateString;\n  \};/;
const newFunc = `const formatToInput = (dateString?: any) => {
    if (!dateString) return '';
    const str = String(dateString);
    if (str.includes('T')) return str.split('T')[0];
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) return \`\${parts[2]}-\${parts[1]}-\${parts[0]}\`;
    }
    return str;
  };`;

code = code.replace(regex, newFunc);

// Also fix handleSave to convert data.fecha_avaluo to string before splitting
code = code.replace(
  /fecha_avaluo: data\.fecha_avaluo \? data\.fecha_avaluo\.split\('-'\)\.reverse\(\)\.join\('\/'\) : ''/,
  "fecha_avaluo: data.fecha_avaluo ? String(data.fecha_avaluo).split('-').reverse().join('/') : ''"
);

fs.writeFileSync('src/components/ValuationModal.tsx', code);
