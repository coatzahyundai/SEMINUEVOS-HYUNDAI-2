const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /<div className="flex flex-col md:flex-row gap-5">\s*<div className="w-full md:w-5\/12">/,
  `<div className="grid grid-cols-1 md:grid-cols-2 gap-5">\n                <div>`
);
code = code.replace(
  /<\/div>\s*<div className="w-full md:w-7\/12">/,
  `</div>\n                <div>`
);

fs.writeFileSync('src/components/Section3.tsx', code);
