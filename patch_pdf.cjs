const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /const generatePDF = async \(item: InventoryItem\) => \{/g,
  `const generateAvaluoPDF = async (item: InventoryItem) => {`
);

code = code.replace(
  /<button\s*onClick=\{\(\) => generatePDF\(item\)\}\s*className="p-1\.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors disabled:opacity-30"\s*title="Imprimir PDF Avalúo"\s*>\s*<FileDown size=\{16\} \/>\s*<\/button>/,
  `{(user.role === 'servicio' || user.role === 'gerencia') && <button 
                            onClick={() => generateAvaluoPDF(item)}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors disabled:opacity-30"
                            title="Imprimir PDF Avalúo"
                          >
                            <FileDown size={16} />
                          </button>}
                          {(user.role === 'asesor' || user.role === 'gerencia') && <button 
                            onClick={() => generateTomaPDF(item)}
                            className="p-1.5 text-pink-600 bg-pink-50 hover:bg-pink-100 rounded transition-colors disabled:opacity-30"
                            title="Imprimir PDF Toma"
                          >
                            <FileDown size={16} />
                          </button>}`
);

fs.writeFileSync('src/components/Section3.tsx', code);
