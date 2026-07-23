const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(/if \(\!val\) return '';/g, "if (val === null || val === undefined || val === '') return '';");

fs.writeFileSync('src/components/Section3.tsx', code);
