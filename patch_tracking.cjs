const fs = require('fs');
let code = fs.readFileSync('src/components/TrackingModal.tsx', 'utf8');

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
fs.writeFileSync('src/components/TrackingModal.tsx', code);
