const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

// Find the start of generateAvaluoPDF
const startIdx = code.indexOf('const generateAvaluoPDF = async (item: InventoryItem) => {');

// Find the end of generateTomaPDF
const endIdxStr = 'setCustomAlert({ message: \'Error al generar PDF\' });\n    }\n  };\n';
let endIdx = code.indexOf(endIdxStr, startIdx);
if (endIdx !== -1) {
   endIdx += endIdxStr.length;
   code = code.substring(0, startIdx) + code.substring(endIdx);
}

// Remove the old PDF buttons from the JSX
code = code.replace(/<button\s*\n\s*onClick=\{\(\) => generateAvaluoPDF\(item\)\}\n\s*className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors disabled:opacity-30"\n\s*title="Imprimir PDF Avalúo"\n\s*>\n\s*<FileDown size=\{16\} \/>\n\s*<\/button>\}/, '');

code = code.replace(/<button\s*\n\s*onClick=\{\(\) => generateTomaPDF\(item\)\}\n\s*className="p-1.5 text-pink-600 bg-pink-50 hover:bg-pink-100 rounded transition-colors disabled:opacity-30"\n\s*title="Imprimir PDF Toma"\n\s*>\n\s*<FileDown size=\{16\} \/>\n\s*<\/button>\}/, '');

fs.writeFileSync('src/components/Section3.tsx', code);
