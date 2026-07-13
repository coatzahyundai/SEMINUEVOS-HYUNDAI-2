const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 gap-5">\s*<div>/g,
  '<div className="flex flex-col md:flex-row gap-5">\n                <div className="w-full md:w-5/12">'
);

code = code.replace(
  /<\/div>\s*<div>\s*<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full min-h-\[300px\]">/g,
  '</div>\n                <div className="w-full md:w-7/12">\n                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[300px]">'
);

fs.writeFileSync('src/components/Section3.tsx', code);
