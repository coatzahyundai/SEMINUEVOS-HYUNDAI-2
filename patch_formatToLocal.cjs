const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

const regex = /const formatToLocal = \([\s\S]*?return dateString;\n  \};/;
const newFunc = `const formatToLocal = (dateString?: string) => {
    if (!dateString) return '';
    const str = String(dateString);
    if (str.includes('-') && !str.includes('/')) {
      const parts = str.split('T')[0].split('-');
      if (parts.length === 3) {
        return \`\${parts[2]}/\${parts[1]}/\${parts[0]}\`;
      }
    }
    return str;
  };`;

code = code.replace(regex, newFunc);
fs.writeFileSync('src/components/Section3.tsx', code);
