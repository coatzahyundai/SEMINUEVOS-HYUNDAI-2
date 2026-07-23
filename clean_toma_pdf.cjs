const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

const startIdx = code.indexOf('const generateTomaPDF = async (item: InventoryItem) => {');
if (startIdx !== -1) {
  const endIdxStr = 'setCustomAlert({ message: \'Error al generar PDF\' });\n    }\n  };\n';
  let endIdx = code.indexOf(endIdxStr, startIdx);
  if (endIdx !== -1) {
    endIdx += endIdxStr.length;
    code = code.substring(0, startIdx) + code.substring(endIdx);
  }
}

fs.writeFileSync('src/components/Section3.tsx', code);
