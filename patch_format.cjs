const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  const regex = /const formatToInput = \([\s\S]*?return str;\n  \};/;
  const newFunc = `const formatToInput = (dateString?: any) => {
    if (!dateString) return '';
    const str = String(dateString);
    if (str.includes('T')) return str.split('T')[0];
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return \`\${year}-\${month}-\${day}\`;
      }
    }
    return str;
  };`;
  
  code = code.replace(regex, newFunc);
  fs.writeFileSync(file, code);
}

patchFile('src/components/ValuationModal.tsx');
patchFile('src/components/TrackingModal.tsx');
