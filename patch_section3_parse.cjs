const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

const regex = /const parseFromLocal = \([\s\S]*?return localString;\n  \};/;
const newFunc = `const parseFromLocal = (localString?: string) => {
    if (!localString) return '';
    if (localString.includes('/')) {
      const parts = localString.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return \`\${year}-\${month}-\${day}\`;
      }
    }
    return localString;
  };`;

code = code.replace(regex, newFunc);
fs.writeFileSync('src/components/Section3.tsx', code);
