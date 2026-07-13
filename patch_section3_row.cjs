const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /const isLocked = item\.estatus === 'Poliza' && user\.role !== 'gerencia';/,
  `const isLocked = (item.estatus === 'Poliza' || item.estatus === 'Liquidación') && user.role !== 'gerencia';`
);

code = code.replace(
  /<button \s*disabled=\{isLocked\}\s*onClick=\{\(\) => handleOpenForm\(item\)\}/,
  `<button 
                            onClick={() => handleOpenForm(item)}`
);

code = code.replace(
  /<button \s*disabled=\{isLocked\}\s*onClick=\{\(\) => handleOpenUpload\(item\)\}/,
  `<button 
                          onClick={() => handleOpenUpload(item)}`
);

fs.writeFileSync('src/components/Section3.tsx', code);
