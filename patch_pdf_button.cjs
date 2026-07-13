const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /\{true && \(\s*\{\(user\.role === 'servicio' \|\| user\.role === 'gerencia'\) && <button\s*onClick=\{\(\) => generateAvaluoPDF\(item\)\}/,
  `{(user.role === 'servicio' || user.role === 'gerencia') && <button 
                            onClick={() => generateAvaluoPDF(item)}`
);

code = code.replace(
  /<FileDown size=\{16\} \/>\s*<\/button>\}\s*\)\}/,
  `<FileDown size={16} />\n                          </button>}`
);

fs.writeFileSync('src/components/Section3.tsx', code);
